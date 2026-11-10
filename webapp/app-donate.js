// app-donate.js
// Логика и UI раздела "Донат" (через DonatePay)

let _donateUrl = null;

async function loadDonate() {
  const el = document.getElementById("donate-content");
  if (!el) return;

  el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--hint);">Загрузка...</div>';

  try {
    const d = await api("donate/packages");
    const packs = d.packages || [];
    _donateUrl = d.donate_url || "";

    const myId = state.player ? state.player.user_id : "";

    let html = `
      <div class="donate-hero">
        <div class="donate-hero-title">💎 Пополнение</div>
        <div class="donate-hero-sub">Выбери пакет и получи игровую валюту на баланс.</div>
      </div>

      <div class="donate-stub-banner" style="background:rgba(231,76,60,0.12);border-color:rgba(231,76,60,0.4);">
        <p style="color:#e74c3c; margin-bottom: 8px;"><b>⚠️ Важно:</b></p>
        <ol style="text-align: left; font-size: 12px; color: var(--hint); padding-left: 20px; line-height: 1.5; margin-bottom: 12px;">
          <li>Нажми на нужный пакет ниже.</li>
          <li>На странице оплаты введи сумму вручную (если она не подставилась).</li>
          <li><b>ОБЯЗАТЕЛЬНО</b> вставь свой ID в поле «Сообщение стримеру».</li>
          <li>Оплати и подожди 1–2 минуты.</li>
        </ol>
        
        <div style="background: var(--bg-3); border-radius: 10px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
          <div style="text-align: left;">
            <div style="font-size: 11px; color: var(--hint); text-transform: uppercase;">Твой ID</div>
            <div style="font-size: 18px; font-weight: 900; color: #fff;" id="donate-my-id">${myId}</div>
          </div>
          <button onclick="copyDonateId()" style="background: var(--button); color: #fff; border: none; padding: 8px 12px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px;">Копировать</button>
        </div>
      </div>
    `;

    packs.forEach(p => {
      html += `
        <div class="donate-card" onclick="buyDonatePack('${p.id}', ${p.price_rub})">
          <div class="donate-card-icon">${p.emoji}</div>
          <div class="donate-card-info">
            <div class="donate-card-name">${p.name}</div>
            <div class="donate-card-price">${p.price_rub} ₽</div>
          </div>
          <div class="donate-card-arrow">→</div>
        </div>
      `;
    });

    el.innerHTML = html;
  } catch (e) {
    el.innerHTML = `<div style="color:var(--danger);text-align:center;padding:20px;">Ошибка: ${e.message}</div>`;
  }
}

function copyDonateId() {
  const idText = document.getElementById("donate-my-id").textContent;
  if (!idText) return;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(idText).then(() => {
      toast("✅ ID скопирован!", "success");
      if (tg) tg.HapticFeedback?.notificationOccurred("success");
    }).catch(() => fallbackCopy(idText));
  } else {
    fallbackCopy(idText);
  }
}

function fallbackCopy(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    toast("✅ ID скопирован!", "success");
    if (tg) tg.HapticFeedback?.notificationOccurred("success");
  } catch (err) {
    toast("❌ Ошибка копирования", "error");
  }
  document.body.removeChild(textArea);
}

async function buyDonatePack(packId, price) {
  if (!_donateUrl) {
    toast("Ошибка: страница донатов не настроена", "error");
    return;
  }

  // Открываем страницу донатов как есть (без параметров, чтобы не было таймаутов)
  openDonateLink(_donateUrl);
  toast("Открываю страницу оплаты...");

  const oldBalance = state.player?.balance || 0;
  let polls = 0;
  if (window._donatePollInterval) clearInterval(window._donatePollInterval);
  window._donatePollInterval = setInterval(async () => {
    polls++;
    if (polls > 24) {
      clearInterval(window._donatePollInterval);
      window._donatePollInterval = null;
      return;
    }
    try {
      const d = await api("me");
      if (d.registered && d.player.balance > oldBalance) {
        state.player = d.player;
        renderPlayer();
        toast(`✅ Баланс пополнен на ${fmtMoney(d.player.balance - oldBalance)}₽!`, "success");
        clearInterval(window._donatePollInterval);
        window._donatePollInterval = null;
        if (typeof loadDonate === 'function') loadDonate();
      }
    } catch (_) {}
  }, 5000);
}

function openDonateLink(url) {
  const wa = window.Telegram?.WebApp;
  if (wa && typeof wa.openLink === "function") {
    try { wa.openLink(url); return; } catch (_) {}
  }
  if (wa && typeof wa.openTelegramLink === "function") {
    try { wa.openTelegramLink(url); return; } catch (_) {}
  }
  window.open(url, "_blank");
}