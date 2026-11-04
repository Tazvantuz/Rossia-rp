// ═══════════ КАРТА ГЕТТО (С ТАЙМАУТОМ) ═══════════

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
    
    let capsHtml = '<div style="grid-column:1/-1; background:#1e2a38; border-radius:12px; padding:12px; margin-bottom:12px;">';
    capsHtml += '<h4 style="color:#f39c12; margin-bottom:8px; font-size:14px;">⚔️ Активные захваты</h4>';
    if (!caps.captures || caps.captures.length === 0) {
      capsHtml += '<div style="color:#8494a5; font-size:12px;">Нет активных захватов</div>';
    } else {
      caps.captures.forEach(c => {
        capsHtml += `<div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:12px; border-bottom:1px solid #2c3e50; padding-bottom:4px;">
          <span>${c.gang_emoji} ${c.gang_name} → ${c.territory_name}</span>
          <span style="color:#2ecc71; font-weight:bold;" class="cap-timer" data-left="${c.left}">${formatTime(c.left)}</span>
        </div>`;
      });
    }
    capsHtml += '</div>';
    container.innerHTML = capsHtml;

    terrs.territories.forEach(t => {
      const ownerName = t.owner ? t.owner.name : "Свободна";
      const ownerColor = t.owner ? "#e67e22" : "#2ecc71";
      container.innerHTML += `
        <div class="territory-card" style="background:#1e2a38;border-radius:12px;padding:12px;text-align:center;border:2px solid ${ownerColor};cursor:pointer;box-shadow:0 4px 6px rgba(0,0,0,0.3);" onclick="territoryAction(${t.id}, '${t.name}')">
          <div style="font-size:32px;margin-bottom:4px;">${t.emoji}</div>
          <div style="font-size:14px;font-weight:bold;color:#fff;">${t.name}</div>
          <div style="font-size:12px;color:${ownerColor};margin-top:4px;font-weight:bold;">${ownerName}</div>
          <div style="font-size:11px;color:#8494a5;margin-top:4px;">💰 ${t.income}₽/ч</div>
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
    container.innerHTML = `<div style="color:#e74c3c;text-align:center;grid-column:1/-1;">Ошибка: ${e.message}</div>`;
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
    if (!confirm(`Начать захват территории "${name}"? (Длится 1 час)`)) return;
    
    await api("territory/capture/start", { territory_id: tid });
    toast("⚔️ Захват начат!", "success");
    renderGhetto();
  } catch(e) {
    toast(e.message, "error");
  }
}
