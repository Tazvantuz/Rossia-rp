// ═══════════ КАРТА ГЕТТО ═══════════
async function showGangTerritories() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  const content = document.getElementById('modal-content');
  content.innerHTML = `<h3>🗺️ Карта Гетто</h3><div id="ghetto-map" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:16px;"></div>`;
  modal.classList.add('active');

  try {
    const d = await api("gang/territories", {});
    const map = document.getElementById('ghetto-map');
    d.territories.forEach(t => {
      const ownerName = t.owner ? t.owner.name : "Свободна";
      const ownerColor = t.owner ? "#e67e22" : "#2ecc71";
      const captureInfo = t.capture ? `<div style="font-size:10px;color:#f39c12;">⚔️ Захват...</div>` : "";
      map.innerHTML += `
        <div class="territory-card" style="background:#1e2a38;border-radius:10px;padding:10px;text-align:center;border:2px solid ${ownerColor};cursor:pointer;" onclick="territoryAction(${t.id}, '${ownerName}')">
          <div style="font-size:24px;">${t.emoji}</div>
          <div style="font-size:12px;font-weight:bold;">${t.name}</div>
          <div style="font-size:10px;color:${ownerColor};">${ownerName}</div>
          <div style="font-size:10px;color:#8494a5;">💰 ${t.income}₽/ч</div>
          ${captureInfo}
        </div>`;
    });
  } catch(e) {
    content.innerHTML += `<p style="color:#e74c3c;">Ошибка: ${e.message}</p>`;
  }
}

async function territoryAction(tid, ownerName) {
  const action = prompt(`Территория "${ownerName}". Действие: capture (захват) / info`, "capture");
  if (action === "capture") {
    try {
      const d = await api("territory/capture/start", { territory_id: tid });
      toast(`⚔️ Захват начат! ID: ${d.capture_id}`, "success");
      showGangTerritories();
    } catch(e) {
      toast(e.message, "error");
    }
  }
}
