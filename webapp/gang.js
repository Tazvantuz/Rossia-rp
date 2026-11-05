// gang.js
// ═══════════ КАРТА ГЕТТО (С ТАЙМАУТОМ И БИТВАМИ) ═══════════

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

    // Группируем захваты по территории
    const capsByTerr = {};
    (caps.captures || []).forEach(c => {
      if (!capsByTerr[c.territory_id]) capsByTerr[c.territory_id] = [];
      capsByTerr[c.territory_id].push(c);
    });

    // Баннер с активными захватами
    let capsHtml = '<div style="grid-column:1/-1; background:#1e2a38; border-radius:12px; padding:12px; margin-bottom:12px;">';
    capsHtml += '<h4 style="color:#f39c12; margin-bottom:8px; font-size:14px;">⚔️ Активные захваты</h4>';
    if (!caps.captures || caps.captures.length === 0) {
      capsHtml += '<div style="color:#8494a5; font-size:12px;">Нет активных захватов</div>';
    } else {
      caps.captures.forEach(c => {
        const terrCaps = capsByTerr[c.territory_id] || [];
        const isContested = terrCaps.length >= 2;
        const battleIcon = isContested ? '⚔️ ' : '⏳ ';
        capsHtml += `<div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:12px; border-bottom:1px solid #2c3e50; padding-bottom:4px;">
          <span>${battleIcon}${c.gang_emoji} ${c.gang_name} → ${c.territory_name}</span>
          <span style="color:${isContested ? '#e74c3c' : '#2ecc71'}; font-weight:bold;" class="cap-timer" data-left="${c.left}">${formatTime(c.left)}</span>
        </div>`;
      });
    }
    capsHtml += '</div>';
    container.innerHTML = capsHtml;

    terrs.territories.forEach(t => {
      const ownerName = t.owner ? t.owner.name : "Свободна";
      const ownerColor = t.owner ? "#e67e22" : "#2ecc71";
      const terrCaps = capsByTerr[t.id] || [];
      const isContested = terrCaps.length >= 2;
      const hasCapture = terrCaps.length >= 1;
      let statusBadge = '';
      if (isContested) {
        statusBadge = `<div style="font-size:10px;color:#e74c3c;margin-top:4px;font-weight:bold;">⚔️ БИТВА (2 претендента)</div>`;
      } else if (hasCapture) {
        const cap = terrCaps[0];
        statusBadge = `<div style="font-size:10px;color:#f39c12;margin-top:4px;">⏳ ${cap.gang_emoji} захватывает</div>`;
      }
      const borderColor = isContested ? '#e74c3c' : ownerColor;
      const animStyle = isContested ? 'animation:capturePulse 1.5s infinite;' : '';
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

    // Проверяем активные претенденты
    const caps = await api("gang/captures", {});
    const activeOnTerr = (caps.captures || []).filter(c => c.territory_id === tid);
    const isContested = activeOnTerr.length >= 1;
    const owner = await api("gang/territories", {});
    const ownerInfo = (owner.territories || []).find(t => t.id === tid);
    const isOwn = ownerInfo && ownerInfo.owner && info.gang && ownerInfo.owner.gang_id === info.gang.gang_id;

    let msg = `Начать захват территории "${name}"? (1 час)\n\n`;

    if (isOwn && activeOnTerr.length === 0) {
      toast("Это уже твоя территория", "error");
      return;
    }
    if (isContested) {
      const rival = activeOnTerr[0];
      msg += `⚠️ На территорию уже претендует банда ${rival.gang_emoji} ${rival.gang_name}\n`;
      msg += `Через 1 час произойдёт БИТВА по сумме урона банд.\nПобедитель забирает территорию.`;
    } else if (isOwn) {
      msg += `Защита своей территории. Через 1 час битва с конкурентом.`;
    } else {
      msg += `Через 1 час территория станет вашей (если никто не помешает).`;
    }

    if (!confirm(msg)) return;

    await api("territory/capture/start", { territory_id: tid });
    toast(isContested ? "⚔️ Захват начат! Будет битва." : "⚔️ Захват начат!", "success");
    renderGhetto();
  } catch(e) {
    toast(e.message, "error");
  }
}