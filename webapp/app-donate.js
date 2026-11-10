// app-donate.js
// Логика и UI раздела "Донат"

async function loadDonate() {
  const el = document.getElementById("donate-content");
  if (!el) return;

  el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--hint);">Загрузка паков...</div>';

  try {
    const d = await api("donate/packages");
    const packs = d.packages || [];

    let html = `
      <div class="donate-hero">
        <div class="donate-hero-title">💎 Пополнение</div>
        <div class="donate-hero-sub">Выбери пакет и получи игровую валюту на баланс.</div>
      </div>
    `;

    packs.forEach(p => {
      html += `
        <div class="donate-card" onclick="buyDonatePack('${p.id}')">
          <div class="donate-card-icon">${p.emoji}</div>
          <div class="donate-card-info">
            <div class="donate-card-name">${p.name}</div>
            <div class="donate-card-price">${p.price_rub} ₽</div>
          </div>
          <div class="donate-card-arrow">→</div>
        </div>
      `;
    });

    html += `
      <div class="donate-info-box">
        <p>💡 Оплата скоро будет доступна. Мы подключаем платёжную систему.</p>
      </div>
    `;

    el.innerHTML = html;
  } catch (e) {
    el.innerHTML = `<div style="color:var(--danger);text-align:center;padding:20px;">Ошибка: ${e.message}</div>`;
  }
}

async function buyDonatePack(packId) {
  try {
    await api("donate/create_invoice", { pack_id: packId });
    // Сюда мы попадём только когда платёжка реально подключена
    // и вернёт invoice_url — но сейчас этого не будет.
    toast("Оплата недоступна", "error");
  } catch (e) {
    toast(e.message, "error");
  }
}