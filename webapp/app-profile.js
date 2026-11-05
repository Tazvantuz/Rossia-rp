// app-profile.js
// Кредит, достижения, лидерборд, бейджи "Ещё"

// ══════════════════════════════════════════════════════════════
//  БЕЙДЖИ В "ЕЩЁ"
// ══════════════════════════════════════════════════════════════
function updateMoreBadges() {
  const p = state.player;
  if (!p) return;
  const cb = $("#credit-badge");
  if (cb) {
    if (p.credit_amount > 0) { cb.textContent = `${fmtMoney(p.credit_amount)}₽`; cb.classList.remove("hidden"); }
    else cb.classList.add("hidden");
  }
  const cpb = $("#crypto-price-badge");
  if (cpb) cpb.textContent = `${p.crypto_price}₽`;
  renderCreditBanner();
}

// ══════════════════════════════════════════════════════════════
//  КРЕДИТ
// ══════════════════════════════════════════════════════════════
function showCredit() {
  const p = state.player;
  if (p.credit_amount > 0) {
    const now = Math.floor(Date.now()/1000);
    const left = (p.credit_due || 0) - now;
    const overdue = left <= 0;
    const timerText = overdue
      ? `🔴 <b style="color:var(--danger)">ПРОСРОЧЕН</b> · банк списывает всё автоматически`
      : `⏳ Осталось: <b>${formatTime(left)}</b>`;
    openModal(`
      <h2>💸 Кредит банку</h2>
      <div style="margin:16px 0;padding:16px;background:var(--bg-3);border-radius:12px;text-align:center">
        <div style="font-size:12px;color:var(--hint);text-transform:uppercase;letter-spacing:.5px">Долг</div>
        <div style="font-size:32px;font-weight:900;color:var(--danger);margin:6px 0">${fmtMoney(p.credit_amount)}₽</div>
        <div style="font-size:13px;margin-top:8px">${timerText}</div>
      </div>
      <button class="btn btn-primary" onclick="payCredit()">💰 Погасить полностью</button>
    `);
    return;
  }
  let termsHtml = "";
  for (const t of [
    {hours:1, pct:5, label:"1 час"},
    {hours:3, pct:8, label:"3 часа"},
    {hours:6, pct:12, label:"6 часов"},
    {hours:12, pct:18, label:"12 часов"},
    {hours:24, pct:25, label:"1 день"},
    {hours:48, pct:35, label:"2 дня"},
  ]) {
    termsHtml += `<div class="credit-term" data-hours="${t.hours}" data-pct="${t.pct}" onclick="selectCreditTerm(this)">
      <div style="flex:1">
        <div style="font-weight:700;font-size:13px">${t.label}</div>
        <div style="font-size:11px;color:var(--hint);margin-top:2px">процент ${t.pct}%</div>
      </div>
      <div class="credit-term-check" style="color:var(--success);font-weight:900;font-size:20px;display:none">✓</div>
    </div>`;
  }
  openModal(`
    <h2>💸 Взять кредит</h2>
    <p style="color:var(--hint);margin:12px 0;font-size:13px">Лимит: <b style="color:var(--money)">15 000₽</b></p>
    <label style="font-size:12px;color:var(--hint)">Сумма (₽)</label>
    <input id="credit-amt" type="number" min="1" max="15000" placeholder="Например 5000" style="width:100%;padding:12px;background:var(--bg-3);border:none;border-radius:10px;color:#fff;margin-top:4px;font-size:16px" oninput="updateCreditPreview()">
    <label style="font-size:12px;color:var(--hint);display:block;margin-top:16px;margin-bottom:6px">Срок возврата</label>
    <div style="display:flex;flex-direction:column;gap:6px">${termsHtml}</div>
    <div id="credit-preview" style="margin-top:16px;padding:14px;background:var(--bg-3);border-radius:12px;text-align:center;display:none">
      <div style="font-size:12px;color:var(--hint)">К возврату через <span id="cp-term">—</span></div>
      <div style="font-size:24px;font-weight:900;color:var(--danger);margin-top:4px" id="cp-total">0₽</div>
      <div style="font-size:11px;color:var(--hint);margin-top:4px">(проценты: <span id="cp-pct">0₽</span>)</div>
    </div>
    <button class="btn btn-primary" id="credit-take-btn" disabled onclick="takeCredit()" style="margin-top:16px">💸 Взять кредит</button>
  `);
  document.querySelectorAll(".credit-term").forEach(el => {
    el.style.cssText = "display:flex;align-items:center;gap:8px;padding:12px;background:var(--bg-3);border-radius:10px;cursor:pointer;border:2px solid transparent;transition:all .2s";
  });
}

let creditSelectedTerm = null;

function selectCreditTerm(el) {
  document.querySelectorAll(".credit-term").forEach(x => {
    x.style.borderColor = "transparent";
    x.style.background = "var(--bg-3)";
    x.querySelector(".credit-term-check").style.display = "none";
  });
  el.style.borderColor = "var(--success)";
  el.style.background = "rgba(46,204,113,.1)";
  el.querySelector(".credit-term-check").style.display = "block";
  creditSelectedTerm = {hours: parseInt(el.dataset.hours), pct: parseInt(el.dataset.pct)};
  updateCreditPreview();
}

function updateCreditPreview() {
  const amt = parseInt($("#credit-amt")?.value) || 0;
  const preview = $("#credit-preview");
  const btn = $("#credit-take-btn");
  if (!preview || !btn) return;
  if (!creditSelectedTerm || amt < 1 || amt > 15000) {
    preview.style.display = "none";
    btn.disabled = true;
    return;
  }
  preview.style.display = "block";
  const total = Math.floor(amt * (1 + creditSelectedTerm.pct/100));
  const pct = total - amt;
  $("#cp-term").textContent = creditSelectedTerm.hours + (creditSelectedTerm.hours === 1 ? " час" : creditSelectedTerm.hours < 5 ? " часа" : " часов");
  $("#cp-total").textContent = fmtMoney(total) + "₽";
  $("#cp-pct").textContent = fmtMoney(pct) + "₽";
  btn.disabled = false;
}

async function takeCredit() {
  const amt = parseInt($("#credit-amt")?.value) || 0;
  if (!creditSelectedTerm) { toast("Выбери срок", "error"); return; }
  try {
    const d = await api("credit/take", {amount: amt, term_hours: creditSelectedTerm.hours});
    state.player = d.player;
    renderPlayer(); closeModal(); updateMoreBadges();
    toast(`💸 Взято ${amt}₽. Вернуть ${fmtMoney(d.total_debt)}₽ через ${creditSelectedTerm.hours}ч`, "success");
    creditSelectedTerm = null;
  } catch(e) { toast(e.message, "error"); }
}

async function payCredit() {
  try {
    const d = await api("credit/pay");
    state.player = d.player;
    renderPlayer(); closeModal(); updateMoreBadges();
    toast(`✅ Кредит погашен (${fmtMoney(d.paid)}₽)`, "success");
  } catch(e) { toast(e.message, "error"); }
}

// ══════════════════════════════════════════════════════════════
//  ДОСТИЖЕНИЯ
// ══════════════════════════════════════════════════════════════
function showAchievements() {
  const p = state.player;
  const all = ["first_job","first_business","millionaire","billionaire","gambler","big_winner","criminal","in_debt","fashion","level10","rich_king","trader"];
  openModal(`<h2>🏆 Достижения</h2><div style="margin-top:16px">
    ${all.map(id=>{ const a = ACH_MAP[id]; const owned = p.achievements.includes(id);
      return `<div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg-3);border-radius:8px;margin-bottom:6px;${owned?'':'opacity:.4'}">
        <div style="font-size:24px">${a.emoji}</div>
        <div><div style="font-weight:700;font-size:13px">${a.name}</div><div style="font-size:11px;color:var(--hint)">${owned?'✅':'🔒'}</div></div>
      </div>`; }).join("")}
  </div>`);
}

// ══════════════════════════════════════════════════════════════
//  ЛИДЕРБОРД
// ══════════════════════════════════════════════════════════════
let lbCategory = "money";

async function showLeaderboard(category = null) {
  if (category) lbCategory = category;
  try {
    const d = await api("leaderboard", {category: lbCategory});
    const tabsHtml = `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:16px">
        <button class="lb-cat ${lbCategory==='money'?'active':''}" onclick="showLeaderboard('money')">💰 Деньги</button>
        <button class="lb-cat ${lbCategory==='level'?'active':''}" onclick="showLeaderboard('level')">⭐ Уровень</button>
        <button class="lb-cat ${lbCategory==='gang'?'active':''}" onclick="showLeaderboard('gang')">🚬 Банды</button>
      </div>`;
    let listHtml = "";
    if (d.leaders.length === 0) {
      listHtml = '<p style="color:var(--hint);text-align:center;padding:30px">Пусто</p>';
    } else if (lbCategory === "money") {
      listHtml = d.leaders.map(l => `
        <div class="lb-row ${l.rank<=3?'top-'+l.rank:''}">
          <div class="lb-rank">${l.rank===1?'🥇':l.rank===2?'🥈':l.rank===3?'🥉':'#'+l.rank}</div>
          <div class="lb-info"><div class="lb-name">${formatNickWithTag(l.nickname, l.gang_tag)}</div><div class="lb-meta">Ур. ${l.level} · ${l.businesses_count} бизнесов</div></div>
          <div class="lb-level">${fmtMoney(l.balance)}₽</div>
        </div>`).join("");
    } else if (lbCategory === "level") {
      listHtml = d.leaders.map(l => `
        <div class="lb-row ${l.rank<=3?'top-'+l.rank:''}">
          <div class="lb-rank">${l.rank===1?'🥇':l.rank===2?'🥈':l.rank===3?'🥉':'#'+l.rank}</div>
          <div class="lb-info"><div class="lb-name">${formatNickWithTag(l.nickname, l.gang_tag)}</div><div class="lb-meta">${fmtMoney(l.balance)}₽ · ${l.xp} XP</div></div>
          <div class="lb-level">Ур. ${l.level}</div>
        </div>`).join("");
    } else {
      listHtml = d.leaders.map(l => {
        const nameWithTag = l.tag ? `${l.emoji} <span class="gang-tag">[${escapeHtml(l.tag)}]</span> ${escapeHtml(l.name)}` : `${l.emoji} ${escapeHtml(l.name)}`;
        return `
        <div class="lb-row ${l.rank<=3?'top-'+l.rank:''}" style="flex-direction:column;align-items:stretch;gap:6px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="lb-rank">${l.rank===1?'🥇':l.rank===2?'🥈':l.rank===3?'🥉':'#'+l.rank}</div>
            <div class="lb-info">
              <div class="lb-name">${nameWithTag}</div>
              <div class="lb-meta">${l.members_count || 0} чел · ${l.territories_count} территорий</div>
            </div>
            <div class="lb-level">+${fmtMoney(l.income)}₽/ч</div>
          </div>
          <div style="display:flex;gap:8px;padding-left:44px;">
            <div style="flex:1;background:rgba(231,76,60,0.12);border:1px solid rgba(231,76,60,0.3);border-radius:8px;padding:6px 10px;text-align:center;">
              <div style="font-size:9px;color:var(--hint);text-transform:uppercase;letter-spacing:0.5px;">⚔️ Урон</div>
              <div style="font-size:15px;font-weight:900;color:#e74c3c;">${l.total_damage || 0}</div>
            </div>
            <div style="flex:1;background:rgba(243,156,18,0.12);border:1px solid rgba(243,156,18,0.3);border-radius:8px;padding:6px 10px;text-align:center;">
              <div style="font-size:9px;color:var(--hint);text-transform:uppercase;letter-spacing:0.5px;">💰 Казна</div>
              <div style="font-size:14px;font-weight:900;color:#f39c12;">${fmtMoney(l.treasury)}</div>
            </div>
          </div>
        </div>`;
      }).join("");
    }
    openModal(`<h2>📊 Лидерборд</h2>${tabsHtml}<div class="lb-list">${listHtml}</div>`);
  } catch(e) { toast(e.message, "error"); }
}