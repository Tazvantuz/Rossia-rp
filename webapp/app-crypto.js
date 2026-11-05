// app-crypto.js
// Крипто-биржа (Вариант A)

async function showCrypto() {
  let d;
  try { d = await api("crypto/price", {}); }
  catch(e) { toast("Не удалось загрузить цену", "error"); return; }

  const p = state.player;
  const price = d.price;
  const fullHistory = d.history || [];
  const history = fullHistory.length > 8 ? fullHistory.slice(-8) : fullHistory;

  const buyFeePct = d.buy_fee_pct ?? 3;
  const sellFeePct = d.sell_fee_pct ?? 5;
  const sellFeeBasePct = d.sell_fee_base_pct ?? 5;
  const maxPerTx = d.max_per_tx || 10000;
  const maxPerDay = d.max_per_day || 50000;
  const boughtToday = d.bought_today || 0;
  const leftToday = Math.max(0, maxPerDay - boughtToday);
  const maxHold = d.max_hold || 100000;
  const coins = Number(d.coins || 0);
  const coinsValue = Number(d.coins_value || 0);
  const holdSeconds = Number(d.hold_seconds || 0);
  const holdHours = holdSeconds / 3600;

  let holdMsg = "";
  if (coins > 0) {
    if (holdHours < 1) {
      holdMsg = `<div style="color:#e74c3c;font-weight:700;">⏱ Держишь ${holdHours.toFixed(1)}ч — комиссия ${sellFeePct}% (штраф за <1ч). Продай через ${(1-holdHours).toFixed(1)}ч → будет 5%</div>`;
    } else if (holdHours < 3) {
      holdMsg = `<div style="color:#f39c12;font-weight:700;">⏱ ${holdHours.toFixed(1)}ч — комиссия ${sellFeePct}%. Через ${(3-holdHours).toFixed(1)}ч → 4%</div>`;
    } else if (holdHours < 6) {
      holdMsg = `<div style="color:#f39c12;font-weight:700;">⏱ ${holdHours.toFixed(1)}ч — комиссия ${sellFeePct}%. Через ${(6-holdHours).toFixed(1)}ч → 3%</div>`;
    } else if (holdHours < 12) {
      holdMsg = `<div style="color:#2ecc71;font-weight:700;">⏱ ${holdHours.toFixed(1)}ч — комиссия ${sellFeePct}%. Через ${(12-holdHours).toFixed(1)}ч → 2%</div>`;
    } else {
      holdMsg = `<div style="color:#2ecc71;font-weight:700;">🏆 ${holdHours.toFixed(1)}ч — минимальная комиссия ${sellFeePct}%</div>`;
    }
  }

  const w = 300, h = 120, pad = 16;
  let chartHtml = '<div style="color:var(--hint);text-align:center;padding:20px;">Нет данных</div>';
  if (history.length > 1) {
    const minP = Math.min(...history);
    const maxP = Math.max(...history);
    const range = Math.max(1, maxP - minP);
    const pts = history.map((v, i) => {
      const x = pad + (w - 2*pad) * i / (history.length - 1);
      const y = h - pad - (h - 2*pad) * (v - minP) / range;
      return {x, y, v};
    });
    const poly = pts.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(" ");
    const area = `${pad},${h-pad} ${poly} ${w-pad},${h-pad}`;

    const first = history[0];
    const last = history[history.length - 1];
    const change = last - first;
    const changePct = first ? ((change / first) * 100) : 0;
    const trendColor = change >= 0 ? "#2ecc71" : "#e74c3c";
    const trendArrow = change >= 0 ? "▲" : "▼";
    const trendSign = change >= 0 ? "+" : "";

    const nowHour = new Date().getHours();
    const hourLabels = [];
    for (let i = 0; i < history.length; i++) {
      const hour = (nowHour - (history.length - 1) + i + 24) % 24;
      hourLabels.push(hour);
    }

    const gridLines = hourLabels.map((_, i) => {
      if (i === 0 || i === history.length - 1) return "";
      const x = pad + (w - 2*pad) * i / (history.length - 1);
      return `<line x1="${x}" y1="${pad}" x2="${x}" y2="${h-pad}" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="2,2"/>`;
    }).join("");

    const timeLabelsHtml = hourLabels.map((hr, i) => {
      const xPercent = ((pad + (w - 2*pad) * i / (history.length - 1)) / w) * 100;
      const isNow = i === history.length - 1;
      const text = `${String(hr).padStart(2,'0')}:00`;
      let transform = 'translateX(-50%)';
      if (i === 0) transform = 'translateX(0)';
      if (i === history.length - 1) transform = 'translateX(-100%)';
      const style = isNow
        ? `font-weight:900;color:${trendColor};font-size:11px;`
        : `font-weight:700;color:var(--text);font-size:10px;opacity:0.85;`;
      return `<span style="position:absolute;left:${xPercent}%;transform:${transform};${style}white-space:nowrap;top:0;">${text}</span>`;
    }).join("");

    chartHtml = `
      <div style="background:var(--bg-3);border-radius:12px;padding:12px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:11px;color:var(--hint);font-weight:700;">8 ЧАСОВ</span>
          <span style="font-size:13px;font-weight:800;color:${trendColor};">${trendArrow} ${trendSign}${change}₽ (${trendSign}${changePct.toFixed(1)}%)</span>
        </div>
        <svg viewBox="0 0 ${w} ${h}" width="100%" height="120" preserveAspectRatio="none">
          <polygon points="${area}" fill="rgba(82,136,193,0.15)"/>
          ${gridLines}
          <polyline points="${poly}" fill="none" stroke="${trendColor}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
          <circle cx="${pts[pts.length-1].x}" cy="${pts[pts.length-1].y}" r="3.5" fill="${trendColor}"/>
        </svg>
        <div style="position:relative;height:16px;margin-top:6px;">
          ${timeLabelsHtml}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--hint);margin-top:4px;">
          <span>Мин: ${minP}₽</span>
          <span>Макс: ${maxP}₽</span>
        </div>
      </div>
    `;
  }

  openModal(`
    <h2>🪙 Крипто-биржа</h2>
    <p style="color:var(--hint);margin:8px 0 12px;text-align:center;font-size:12px;">Цена обновляется раз в час у всех игроков</p>

    <div style="background:var(--bg-3);border-radius:12px;padding:14px;margin-bottom:12px;text-align:center;">
      <div style="font-size:11px;color:var(--hint);text-transform:uppercase;letter-spacing:.5px;">Текущая цена</div>
      <div style="font-size:32px;font-weight:900;color:var(--money);margin-top:4px;">${price}₽</div>
      <div style="font-size:11px;color:var(--hint);margin-top:2px;">за 1 коин</div>
    </div>

    ${chartHtml}

    <div style="background:var(--bg-3);border-radius:12px;padding:14px;margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="color:var(--hint);font-size:12px;">У тебя коинов:</span>
        <b>${coins.toFixed(4)}</b>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="color:var(--hint);font-size:12px;">Стоимость:</span>
        <b style="color:var(--money);">${fmtMoney(coinsValue)}₽</b>
      </div>
      ${holdMsg}
    </div>

    <div style="background:rgba(82,136,193,0.08);border:1px solid rgba(82,136,193,0.3);border-radius:10px;padding:10px;margin-bottom:12px;font-size:11px;color:var(--hint);line-height:1.5;">
      💰 <b style="color:#e74c3c;">Комиссия покупки: ${buyFeePct}%</b><br>
      💸 <b style="color:#e74c3c;">Комиссия продажи: ${sellFeePct}%</b> (базовая ${sellFeeBasePct}%, снижается при долгом держании)<br>
      📊 Лимит покупки: <b>${fmtMoney(maxPerTx)}₽/операция</b>, <b>${fmtMoney(maxPerDay)}₽/сутки</b><br>
      📊 Максимум во владении: <b>${fmtMoney(maxHold)}₽</b><br>
      💡 Сегодня куплено: <b>${fmtMoney(boughtToday)}₽</b>, свободно: <b style="color:#2ecc71;">${fmtMoney(leftToday)}₽</b>
    </div>

    <div style="margin-bottom:12px;">
      <label style="font-size:12px;color:var(--hint);">Купить на сумму (₽)</label>
      <input id="crypto-buy-amt" type="number" placeholder="Например 5000" style="width:100%;padding:10px;background:var(--bg-3);border:none;border-radius:8px;color:#fff;margin-top:4px;">
      <div style="display:flex;gap:6px;margin-top:6px;">
        <button class="btn btn-secondary" onclick="document.getElementById('crypto-buy-amt').value=1000" style="flex:1;margin:0;padding:8px;font-size:12px;">1К</button>
        <button class="btn btn-secondary" onclick="document.getElementById('crypto-buy-amt').value=5000" style="flex:1;margin:0;padding:8px;font-size:12px;">5К</button>
        <button class="btn btn-secondary" onclick="document.getElementById('crypto-buy-amt').value=${maxPerTx}" style="flex:1;margin:0;padding:8px;font-size:12px;">MAX</button>
      </div>
      <button class="btn btn-primary" onclick="buyCrypto()" style="margin-top:6px;">💰 Купить коины (комиссия ${buyFeePct}%)</button>
    </div>

    ${coins > 0 ? `
    <div style="margin-bottom:8px;">
      <label style="font-size:12px;color:var(--hint);">Продать коины (шт.)</label>
      <input id="crypto-sell-amt" type="number" step="0.0001" placeholder="Например 5" style="width:100%;padding:10px;background:var(--bg-3);border:none;border-radius:8px;color:#fff;margin-top:4px;">
      <div style="display:flex;gap:6px;margin-top:6px;">
        <button class="btn btn-secondary" onclick="document.getElementById('crypto-sell-amt').value=${coins.toFixed(4)}" style="flex:1;margin:0;padding:8px;font-size:12px;">ПРОДАТЬ ВСЁ</button>
      </div>
      <button class="btn btn-secondary" onclick="sellCrypto()" style="margin-top:6px;border:1px solid var(--danger);">💸 Продать (комиссия ${sellFeePct}%)</button>
    </div>
    ` : ''}
  `);

  if (window._cryptoRefresh) clearInterval(window._cryptoRefresh);
  window._cryptoRefresh = setInterval(() => {
    const modal = document.getElementById("modal");
    if (!modal || modal.classList.contains("hidden")) {
      clearInterval(window._cryptoRefresh);
      window._cryptoRefresh = null;
      return;
    }
    api("crypto/price", {}).then(nd => {
      if (nd.price !== price) {
        const el = document.querySelector('#modal-body div[style*="Текущая цена"] + div');
        if (el) el.textContent = nd.price + "₽";
      }
    }).catch(()=>{});
  }, 60000);
}

async function buyCrypto() {
  const amt = parseInt($("#crypto-buy-amt").value) || 0;
  if (amt <= 0) { toast("Введи сумму", "error"); return; }
  try {
    const d = await api("crypto/buy", {amount: amt});
    state.player = d.player;
    renderPlayer();
    closeModal();
    toast(`✅ Куплено ${d.coins.toFixed(4)} коинов по ${d.price}₽ (комиссия ${d.buy_fee}₽)`, "success");
  } catch(e) { toast(e.message, "error"); }
}

async function sellCrypto() {
  const amt = parseFloat($("#crypto-sell-amt").value) || 0;
  if (amt <= 0) { toast("Введи количество", "error"); return; }
  try {
    const d = await api("crypto/sell", {amount: amt});
    state.player = d.player;
    renderPlayer();
    closeModal();
    toast(`💰 +${fmtMoney(d.rub)}₽ (комиссия ${d.fee_pct}%, держал ${d.hold_hours}ч)`, "success");
  } catch(e) { toast(e.message, "error"); }
}