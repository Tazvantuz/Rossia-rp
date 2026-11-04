// ═══════════ КАРТА ГЕТТО (С ТАЙМАУТОМ) ═══════════
async function renderGhetto() {
  const container = document.getElementById('ghetto-map-container');
  if (!container) return;
  container.innerHTML = '<div style="color:#aaa;text-align:center;grid-column:1/-1;">Загрузка...</div>';

  try {
    // Ждём ответ максимум 5 секунд
    const d = await Promise.race([
      api("gang/territories", {}),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Таймаут запроса")), 5000))
    ]);

    container.innerHTML = '';
    if (!d.territories || d.territories.length === 0) {
      container.innerHTML = '<div style="color:#aaa;text-align:center;grid-column:1/-1;">Территории не найдены</div>';
      return;
    }

    d.territories.forEach(t => {
      const ownerName = t.owner ? t.owner.name : "Свободна";
      const ownerColor = t.owner ? "#e67e22" : "#2ecc71";
      const captureInfo = t.capture ? `<div style="font-size:10px;color:#f39c12;margin-top:4px;">⚔️ Захват...</div>` : "";
      
      container.innerHTML += `
        <div class="territory-card" style="background:#1e2a38;border-radius:12px;padding:12px;text-align:center;border:2px solid ${ownerColor};cursor:pointer;box-shadow:0 4px 6px rgba(0,0,0,0.3);" onclick="territoryAction(${t.id}, '${t.name}')">
          <div style="font-size:32px;margin-bottom:4px;">${t.emoji}</div>
          <div style="font-size:14px;font-weight:bold;color:#fff;">${t.name}</div>
          <div style="font-size:12px;color:${ownerColor};margin-top:4px;font-weight:bold;">${ownerName}</div>
          <div style="font-size:11px;color:#8494a5;margin-top:4px;">💰 ${t.income}₽/ч</div>
          ${captureInfo}
        </div>`;
    });
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
