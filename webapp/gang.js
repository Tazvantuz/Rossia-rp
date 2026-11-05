// gang.js
// ═══════════ КАРТА ГЕТТО (С ТАЙМЕРОМ БИТВЫ) ═══════════

async function renderGhetto() {
  const container = document.getElementById('ghetto-map-container');
  if (!container) return;
  container.innerHTML = '<div style="color:#aaa;text-align:center;grid-column:1/-1;">Загрузка...</div>';
  try {
    const [terrs, caps] = await Promise.all([
      api("gang/territories", {}),
      api("gang/captures", {})
    ]);
    container.innerHTML = '';
    if (!terrs.territories || terrs.territories.length === 0) {
      container.innerHTML = '<div style="color:#aaa;text-align:center;grid-column:1/-1;">Территории не найдены</div>';
      return;
    }

    // Группировка захватов по территории
    const byTerr = {};
    (caps.by_territory || []).forEach(bt => {
      byTerr[bt.territory_id] = bt;
    });

    // Баннер с активными захватами
    let capsHtml = '<div style="grid-column:1/-1; background:#1e2a38; border-radius:12px; padding:12px; margin-bottom:12px;">';
    capsHtml += '<h4 style="color:#f39c12; margin-bottom:8px; font-size:14px;">⚔️ Активные захваты</h4>';
    if (!caps.by_territory || caps.by_territory.length === 0) {
      capsHtml += '<div style="color:#8494a5; font-size:12px;">Нет активных захватов</div>';
    } else {
      caps.by_territory.forEach(bt => {
        if (bt.is_contested) {
          capsHtml += `<div style="background:rgba(231,76,60,0.15); border:1px solid #e74c3c; border-radius:8px; padding:8px; margin-bottom:6px;">
            <div style="color:#e74c3c; font-weight:bold; font-size:13px; margin-bottom:4px;">⚔️ БИТВА ЗА ${bt.territory_name}</div>
            ${bt.captures.map(c => `<div style="font-size:11px; color:#fff;">${c.gang_emoji} ${c.gang_name} — урон ${c.total_damage} (осталось ${formatTime(c.left)})</div>`).join('')}
            <div style="color:#f39c12; font-weight:bold; font-size:12px; margin-top:6px;">Битва через: <span class="cap-timer" data-left="${bt.battle_left}">${formatTime(bt.battle_left)}</span></div>
          </div>`;
        } else {
          const c = bt.captures[0];
          capsHtml += `<div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:12px; border-bottom:1px solid #2c3e50; padding-bottom:4px;">
            <span>⏳ ${c.gang_emoji} ${c.gang_name} → ${bt.territory_name}</span>
            <span style="color:#2ecc71; font-weight:bold;" class="cap-timer" data-left="${c.left}">${formatTime(c.left)}</span>
          </div>`;
        }
      });
    }
    capsHtml += '</div>';
    container.innerHTML = capsHtml;

    terrs.territories.forEach(t => {
      const ownerName = t.owner ? t.owner.name : "Свободна";
      const ownerColor = t.owner ? "#e67e22" : "#2ecc71";
      const bt = byTerr[t.id];
      const isContested = bt && bt.is_contested;
      const hasCapture = bt && bt.captures.length > 0;
      
      let statusBadge = '';
      let borderColor = ownerColor;
      let animStyle = '';
      if (isContested) {
        borderColor = '#e74c3c';
        animStyle = 'animation:capturePulse 1.5s infinite;';
        statusBadge = `<div style="font-size:10px;color:#e74c3c;margin-top:4px;font-weight:bold;">⚔️ БИТВА</div>
          <div style="font-size:10px;color:#f39c12;font-weight:bold;" class="cap-timer" data-left="${bt.battle_left}">${formatTime(bt.battle_left)}</div>`;
      } else if (hasCapture) {
        const c = bt.captures[0];
        borderColor = '#f39c12';
        statusBadge = `<div style="font-size:10px;color:#f39c12;margin-top:4px;">⏳ ${c.gang_emoji} захватывает</div>
          <div style="font-size:10px;color:#f39c12;font-weight:bold;" class="cap-timer" data-left="${c.left}">${formatTime(c.left)}</div>`;
      }
      
      container.innerHTML += `
        <div class="territory-card" style="background:#1e2a38;border-radius:12px;padding:12px;text-align:center;border:2px solid ${borderColor};cursor:pointer;box-shadow:0 4px 6px rgba(0,0,0,0.3);${animStyle}" onclick="territoryAction(${t.id}, '${t.name}')">
          <div style="font-size:32px;margin-bottom:4px;">${t.emoji}</div>
          <div style="font-size:14px;font-weight:bold;color:#fff;">${t.name}</div>
          <div style="font-size:12px;color:${ownerColor};margin-top:4px;font-weight:bold;">${ownerName}</div>
          <div style="font-size:11px;color:#8494a5;margin-top:4px;">💰 ${t.income}₽/ч</div>
          ${statusBadge}
        </div>`;
    });

    if (window._capTimer) clearInterval(window._capTimer);
    window._capTimer = setInterval(() => {
      document.querySelectorAll('.cap-timer').forEach(el => {
        let left = parseInt(el.dataset.left) - 1;
        if (left < 0) left = 0;
        el.dataset.left = left;
        el.textContent = formatTime(left);
      });
    }, 1000);

  } catch(e) {
    console.error("Ghetto error:", e);
    container.innerHTML = `<div style="color:#e74c3c;text-align:center;grid-column:1/-1;padding:20px;font-size:14px;word-break:break-word;">Ошибка: ${e.message || 'Сервер недоступен'}</div>`;
  }
}

async function territoryAction(tid, name) {
  try {
    const info = await api("gang/info", {});
    if (!info.in_gang) {
      toast("Ты не в банде, чтобы захватывать территории", "error");
      return;
    }
    if (info.role !== "leader" && info.role !== "deputy") {
      toast("Только глава или зам могут захватывать", "error");
      return;
    }

    const caps = await api("gang/captures", {});
    const bt = (caps.by_territory || []).find(x => x.territory_id === tid);
    const owner = await api("gang/territories", {});
    const ownerInfo = (owner.territories || []).find(t => t.id === tid);
    const isOwn = ownerInfo && ownerInfo.owner && info.gang && ownerInfo.owner.gang_id === info.gang.gang_id;
    const myGid = info.gang ? info.gang.gang_id : null;

    let msg = `Начать захват территории "${name}"? (1 час)\n\n`;

    if (isOwn && !bt) {
      toast("Это уже твоя территория", "error");
      return;
    }
    if (bt && bt.is_contested) {
      toast("На эту территорию уже 2 претендента — захват невозможен", "error");
      return;
    }
    if (bt) {
      const rival = bt.captures[0];
      if (rival.gang_id === myGid) {
        toast("Вы уже захватываете эту территорию", "error");
        return;
      }
      msg += `⚠️ На территорию уже претендует банда ${rival.gang_emoji} ${rival.gang_name}\n`;
      msg += `Через ${formatTime(bt.battle_left)} произойдёт БИТВА.\n`;
      msg += `Ваш урон будет зафиксирован на момент старта. Победитель определится по формуле dmg^1.2.\n`;
    } else if (isOwn) {
      toast("Это уже твоя территория и её никто не атакует", "error");
      return;
    } else if (ownerInfo && ownerInfo.owner) {
      msg += `Территория принадлежит ${ownerInfo.owner.name}. Через 1 час станет вашей (если они не защитятся).`;
    } else {
      msg += `Через 1 час территория станет вашей (если никто не помешает).`;
    }

    if (!confirm(msg)) return;

    await api("territory/capture/start", { territory_id: tid });
    toast(bt ? "⚔️ Защита начата! Будет битва." : "⚔️ Захват начат!", "success");
    renderGhetto();
  } catch(e) {
    toast(e.message, "error");
  }
}