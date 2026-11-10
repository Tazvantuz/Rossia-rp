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
      <div style="text-align:center;margin-bottom:24px;">
        <h2 style="font-size:22px;font-weight:900;color:#fff;margin-bottom:8px;">💎 Пополнение</h2>
        <p style="color:var(--hint);font-size:13px;line-height:1.5;">Выбери пакет и мгновенно получи игровую валюту на баланс.</p>
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
      <div style="margin-top:24px;padding:12px;background:rgba(82,136,193,0.1);border:1px solid rgba(82,136,193,0.2);border-radius:12px;text-align:center;">
        <p style="font-size:11px;color:var(--hint);line-height:1.5;">
          💡 Это демо-режим. Реальная оплата будет добавлена после подключения платежной системы.
        </p>
      </div>
    `;
    
    el.innerHTML = html;
  } catch (e) {
    el.innerHTML = `<div style="color:var(--danger);text-align:center;padding:20px;">Ошибка: ${e.message}</div>`;
  }
}

async function buyDonatePack(packId) {
  if (!confirm("Это тестовый режим. Начислить валюту бесплатно?")) return;
  
  try {
    const d = await api("donate/create_invoice", { pack_id: packId });
    
    if (d.is_stub) {
      toast("✅ Тестовое начисление прошло! (Демо-режим)", "success");
      await refreshPlayer(); // Обновляем баланс в шапке
    } else if (d.invoice_url) {
      // Здесь будет редирект на оплату
      openTgLink(d.invoice_url);
    }
  } catch (e) {
    toast(e.message, "error");
  }
}