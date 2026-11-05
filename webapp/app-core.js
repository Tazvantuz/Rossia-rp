// app-core.js
const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); tg.setHeaderColor?.('#17212b'); tg.setBackgroundColor?.('#17212b'); }
const initData = tg?.initData || "";

let state = {
  player: null, location: null, shopItems: [], invItems: [],
  shopFilter: "head", appearanceMode: "shop", casinoGame: "coin",
  casinoLocked: false, casinoLockTime: 0, openPMs: [],
  chatWith: 'global', jobsCache: null, businessesCache: null, casesData: null,
};

function formatNickWithTag(name, tag, color) {
  const safeName = escapeHtml(name || "");
  if (!tag) return safeName;
  const c = color || "#f39c12";
  return `<span class="gang-tag" style="color:${escapeHtml(c)};border-color:${escapeHtml(c)}">[${escapeHtml(tag)}]</span> ${safeName}`;
}

function formatLastSeen(ts) {
  if (!ts || Number(ts) === 0) return "давно";
  const now = Math.floor(Date.now() / 1000);
  const diff = now - Number(ts);
  if (diff < 60) return "только что";
  if (diff < 3600) return Math.floor(diff / 60) + " мин назад";
  if (diff < 86400) return Math.floor(diff / 3600) + " ч назад";
  if (diff < 604800) return Math.floor(diff / 86400) + " дн назад";
  const d = new Date(Number(ts) * 1000);
  return d.toLocaleDateString("ru-RU", {day:"numeric", month:"short"});
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text == null ? "" : text;
  return div.innerHTML;
}

function fmtMoney(n) {
  if (n >= 1e9) return (n/1e9).toFixed(2)+"B";
  if (n >= 1e6) return (n/1e6).toFixed(2)+"M";
  if (n >= 1e3) return (n/1e3).toFixed(1)+"K";
  return n.toLocaleString("ru-RU");
}

function formatTime(sec) {
  sec = Math.max(0, Math.floor(sec));
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (d > 0) return `${d}д ${h}ч`;
  if (h > 0) return `${h}ч ${m}м`;
  if (m > 0) return `${m}м ${s}с`;
  return `${s}с`;
}

function _itemStatsHtml(it, mode) {
  const hp = (it && it.hp) || 0;
  const dmg = (it && it.damage) || 0;
  if (!hp && !dmg) return '';
  const parts = [];
  if (hp) parts.push(`<span class="s-hp">❤️ +${hp} HP</span>`);
  if (dmg) parts.push(`<span class="s-dmg">⚔️ +${dmg} DMG</span>`);
  const cls = 'item-stats' + (mode && mode !== 'inline' ? ' ' + mode : '');
  return `<div class="${cls}">${parts.join(' · ')}</div>`;
}

function _onlineHtml(isOnline) {
  const cls = isOnline ? 'on' : 'off';
  const label = isOnline ? 'Онлайн' : 'Оффлайн';
  return `<span class="online-status ${cls}"><span class="online-dot ${cls}"></span>${label}</span>`;
}

async function api(method, body = {}, retry = true) {
  let res;
  try {
    res = await fetch(`/api/${method}`, {
      method: "POST",
      headers: {"Content-Type":"application/json", "X-Init-Data": initData},
      body: JSON.stringify(body),
    });
  } catch(e) { throw new Error("Нет связи"); }
  if (res.status === 511) throw new Error("Туннель требует пароль");
  if (!res.ok) {
    const err = await res.json().catch(()=>({}));
    const errMsg = err.error || `HTTP ${res.status}`;
    if (retry && method === "register" && errMsg.toLowerCase().includes("already registered")) {
      try {
        await fetch(`/api/reset`, {
          method: "POST",
          headers: {"Content-Type":"application/json", "X-Init-Data": initData},
          body: JSON.stringify({}),
        });
        return await api(method, body, false);
      } catch(e) { console.warn("Reset failed:", e); }
    }
    throw new Error(errMsg);
  }
  return res.json();
}

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function show(id) {
  $$(".screen").forEach(x=>x.classList.remove("active"));
  $(`#${id}`).classList.add("active");
  window.scrollTo(0,0);
}

function showTab(tab) {
  if (tab === "home" && state.player) {
    setTimeout(() => renderCharacterInto("#character-view"), 0);
  }
  $$(".tab-content").forEach(c=>c.classList.remove("active"));
  $(`.tab-content[data-tab="${tab}"]`).classList.add("active");
  $$(".nav-btn").forEach(b=>b.classList.toggle("active", b.dataset.nav===tab));
  if (typeof stopChatPolling === "function") stopChatPolling();
  if (tab==="appearance" && typeof loadAppearance === 'function') loadAppearance();
  if (tab==="work" && typeof loadWork === 'function') loadWork();
  if (tab==="business" && typeof loadBusinesses === 'function') loadBusinesses();
  if (tab==="casino" && typeof renderCasino === 'function') renderCasino();
  if (tab==="people" && typeof loadPeople === 'function') loadPeople();
  if (tab==="ghetto" && typeof renderGhetto === 'function') renderGhetto();
  if (tab==="referral" && typeof renderReferral === 'function') renderReferral();
  if (tab==="chat" && typeof startChatPolling === 'function') startChatPolling();
  if (tab==="more" && typeof updateMoreBadges === 'function') { updateMoreBadges(); checkAdminAccess?.(); }
  if (tab==="cases" && typeof loadCases === 'function') loadCases();
  if (tab==="gang" && typeof loadGang === 'function') loadGang();
  if (tab==="friends" && typeof loadFriends === 'function') loadFriends();
  if (tab==="home" && typeof loadNotifications === 'function') loadNotifications();
  window.scrollTo(0,0);
}

function toast(msg, type="") {
  const el = $("#toast");
  el.textContent = msg; el.className = `toast ${type}`;
  el.classList.remove("hidden");
  clearTimeout(el._t);
  el._t = setTimeout(()=>el.classList.add("hidden"), 2500);
}

function openModal(html) {
  $("#modal-body").innerHTML = html;
  $("#modal").classList.remove("hidden");
}

function closeModal() {
  $("#modal").classList.add("hidden");
  if (typeof pvpTimerInterval !== 'undefined' && pvpTimerInterval && !pvpCurrentBattle) {
    clearInterval(pvpTimerInterval); pvpTimerInterval = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const mc = document.getElementById("modal-close");
  if (mc) mc.addEventListener("click", closeModal);
  const m = document.getElementById("modal");
  if (m) m.addEventListener("click", e=>{ if(e.target.id==="modal") closeModal(); });
  document.querySelectorAll(".nav-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{ showTab(btn.dataset.nav); if (tg) tg.HapticFeedback?.selectionChanged(); });
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && state.player) loadOnlineCount();
  });
});

const SLOT_FILTERS = [
  {id:"head", name:"Голова", emoji:"🧢"},
  {id:"body", name:"Тело", emoji:"👕"},
  {id:"legs", name:"Ноги", emoji:"👖"},
  {id:"right_hand", name:"Пр.рука", emoji:"🤚"},
  {id:"left_hand", name:"Лев.рука", emoji:"🖐"},
];
const SLOT_KEY = {head:"head_id", body:"body_id", legs:"legs_id", right_hand:"right_hand_id", left_hand:"left_hand_id"};
const SLOT_KEY_MAP = SLOT_KEY;

function emptyOutfit() {
  return {
    head_id:{item_id:null}, body_id:{item_id:null}, legs_id:{item_id:null},
    right_hand_id:{item_id:null}, left_hand_id:{item_id:null}
  };
}

async function updateChatBadge() {
  try {
    const d = await api("chat/pm/unread_count", {});
    let badge = document.getElementById("chat-nav-badge");
    const navBtn = document.querySelector('.nav-btn[data-nav="chat"]');
    if (!navBtn) return;
    if (!badge) {
      badge = document.createElement("span");
      badge.id = "chat-nav-badge";
      badge.className = "nav-badge";
      navBtn.style.position = "relative";
      navBtn.appendChild(badge);
    }
    if (d.count > 0) {
      badge.textContent = d.count > 99 ? "99+" : d.count;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  } catch(_) {}
}

async function loadConversations() {
  try {
    const d = await api("chat/pm/conversations", {});
    if (!state.openPMs) state.openPMs = [];
    for (const c of (d.conversations || [])) {
      if (!state.openPMs.find(x => Number(x.uid) === Number(c.user_id))) {
        state.openPMs.push({uid: c.user_id, name: c.nickname, tag: c.gang_tag, tag_color: c.gang_tag_color, unread: c.unread});
      } else {
        const existing = state.openPMs.find(x => Number(x.uid) === Number(c.user_id));
        existing.unread = c.unread;
        existing.tag = c.gang_tag;
        existing.tag_color = c.gang_tag_color;
      }
    }
    if (typeof renderChatTabs === 'function') renderChatTabs();
  } catch(_) {}
}

async function loadOnlineCount() {
  try {
    const d = await api("online_count", {});
    const el = document.getElementById("online-count");
    if (el) el.textContent = d.count;
    const dot = document.querySelector(".online-badge .online-dot");
    if (dot) { dot.classList.remove("off"); dot.classList.add("on"); }
  } catch(_) {
    const dot = document.querySelector(".online-badge .online-dot");
    if (dot) { dot.classList.remove("on"); dot.classList.add("off"); }
  }
}

let _onlinePollInterval = null;
function startOnlinePolling() {
  if (_onlinePollInterval) clearInterval(_onlinePollInterval);
  _onlinePollInterval = setInterval(() => {
    if (document.hidden) return;
    loadOnlineCount();
  }, 15000);
}

function stopOnlinePolling() {
  if (_onlinePollInterval) { clearInterval(_onlinePollInterval); _onlinePollInterval = null; }
}

function renderCharacterInto(selector) {
  const el = $(selector);
  if (!el || !state.player) return;
  el.innerHTML = renderCharacterSVG(state.player.outfit, {width: 150, height: 300});
}

function flashCharacter() {
  const el = $("#character-view");
  el.classList.add("equip-flash");
  setTimeout(()=>el.classList.remove("equip-flash"), 600);
}

function checkCreditPaid(d) {
  if (d && d.credit_paid && d.credit_paid > 0) {
    setTimeout(() => toast(`💸 Банк списал ${fmtMoney(d.credit_paid)}₽ в счёт долга`, "error"), 600);
  }
}

function notifyAchievements(list) {
  const names = list.map(id=>({
    first_job:"Работяга",first_business:"Бизнесмен",millionaire:"Миллионер",
    billionaire:"Миллиардер",gambler:"Азартный",big_winner:"Джекпот",
    criminal:"Авторитет",in_debt:"Должник",fashion:"Модник",
    level10:"Опытный",rich_king:"Император",trader:"Барыга"
  }[id]||id));
  toast("🏆 Достижение: "+names.join(", "), "success");
}

function renderPlayer() {
  const p = state.player; if (!p) return;
  $("#nick").innerHTML = p.gang_tag
    ? formatNickWithTag(p.nickname, p.gang_tag, p.gang_tag_color)
    : escapeHtml(p.nickname);
  const hasClothes = p.outfit.head_id.item_id || p.outfit.body_id.item_id || p.outfit.legs_id.item_id;
  $("#subtitle").textContent = `Ур. ${p.level} · ${hasClothes ? "модник" : "голый бомж"}`;
  $("#money").textContent = fmtMoney(p.balance);
  $("#char-name").innerHTML = p.gang_tag
    ? formatNickWithTag(p.nickname, p.gang_tag, p.gang_tag_color)
    : escapeHtml(p.nickname);
  $("#char-level").textContent = p.level;
  (function(){
    const cs = p.combat_stats || {};
    const parts = [];
    if (cs.hp) parts.push(`<span class="s-hp">\u2764\ufe0f ${cs.hp} HP</span>`);
    if (cs.damage) parts.push(`<span class="s-dmg">\u2694\ufe0f ${cs.damage} DMG</span>`);
    const csEl = document.getElementById("char-stats");
    if (csEl) csEl.innerHTML = parts.join(" \u00b7 ");
  })();
  const pct = p.xp_next > 0 ? Math.min(100, p.xp/p.xp_next*100) : 0;
  $("#xp-fill").style.width = pct+"%";
  $("#xp-text").textContent = `${p.xp}/${p.xp_next} XP`;
  $("#avatar").textContent = p.outfit.head_id.item_id ? p.outfit.head_id.emoji : "👤";
  startTimers();
  renderCreditBanner();
}

let timerInterval = null;
function startTimers() {
  if (timerInterval) clearInterval(timerInterval);
  updateTimers();
  timerInterval = setInterval(updateTimers, 1000);
}

function updateTimers() {
  if (state.jobsCache && document.querySelector('.tab-content[data-tab="work"]') &&
      document.querySelector('.tab-content[data-tab="work"]').classList.contains('active')) {
    if (typeof renderJobs === 'function') renderJobs(state.jobsCache);
  }
  const p = state.player;
  if (!p) return;
  const dailyBtn = $("#daily-btn");
  const dailyTimer = $("#daily-timer");
  if (dailyBtn && dailyTimer) {
    const now = Math.floor(Date.now()/1000);
    const cd = p.last_daily ? (p.last_daily + 86400) - now : 0;
    if (cd <= 0) {
      dailyBtn.style.opacity = "1";
      dailyBtn.style.cursor = "pointer";
      dailyTimer.textContent = "✅";
      dailyTimer.classList.remove("hidden");
    } else {
      dailyBtn.style.opacity = "0.6";
      dailyTimer.textContent = formatTime(cd);
      dailyTimer.classList.remove("hidden");
    }
  }
  const rouletteTimer = $("#roulette-timer");
  if (rouletteTimer && p.last_roulette !== undefined) {
    const nowR = Math.floor(Date.now()/1000);
    const cdR = p.last_roulette ? (p.last_roulette + 21600) - nowR : 0;
    if (cdR <= 0) {
      rouletteTimer.textContent = "✅";
      rouletteTimer.classList.add("ready");
    } else {
      rouletteTimer.textContent = formatTime(cdR);
      rouletteTimer.classList.remove("ready");
    }
  }
  renderCreditBanner();
}

function renderCreditBanner() {
  const p = state.player;
  const banner = $("#credit-banner");
  if (!banner || !p) return;
  const debt = p.credit_amount || 0;
  if (debt <= 0) { banner.classList.add("hidden"); return; }
  banner.classList.remove("hidden");
  const now = Math.floor(Date.now()/1000);
  const due = p.credit_due || 0;
  const left = due - now;
  $("#cb-amount").textContent = fmtMoney(debt) + "₽";
  if (left <= 0) {
    banner.classList.add("overdue");
    $("#cb-timer").textContent = "🔴 ПРОСРОЧЕН · списывается автоматически";
  } else {
    banner.classList.remove("overdue");
    $("#cb-timer").textContent = `⏳ Вернуть через ${formatTime(left)}`;
  }
}

async function refreshPlayer() {
  try {
    const d = await api("me");
    if (d.registered) {
      state.player = d.player;
      renderPlayer();
      renderCharacterInto("#character-view");
      if (typeof loadWork === 'function') loadWork();
      if (typeof loadBusinesses === 'function') loadBusinesses();
    }
  } catch(e) { console.error("refreshPlayer error:", e); }
}

let registerSetup = false;
function renderRegister() {
  const nick = $("#nickname"), btn = $("#btn-register");
  if (!nick || !btn) return;
  btn.disabled = nick.value.trim().length < 2;
  if (!registerSetup) {
    nick.addEventListener("input", () => btn.disabled = nick.value.trim().length < 2);
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      try {
        const startParam = tg?.initDataUnsafe?.start_param;
        const urlParams = new URLSearchParams(window.location.search);
        const refFromUrl = urlParams.get('ref');
        let referrer_id = startParam || refFromUrl;
        if (referrer_id && String(referrer_id).startsWith("ref_")) {
          referrer_id = String(referrer_id).slice(4);
        }
        const d = await api("register", { nickname: nick.value.trim(), referrer_id });
        state.player = d.player;
        renderPlayer(); renderCharacterInto("#character-view");
        show("main"); showTab("home");
        if (tg) tg.HapticFeedback?.notificationOccurred("success");
        toast("🎉 Добро пожаловать!", "success");
      } catch (e) {
        toast(e.message, "error");
        btn.disabled = false;
      }
    });
    registerSetup = true;
  }
}

async function boot() {
  if (!initData) {
    document.body.innerHTML = '<div style="padding:40px;text-align:center;color:#fff;">Открой через Telegram-бота</div>';
    return;
  }
  try {
    const d = await api("me");
    if (!d.registered) { show("register"); renderRegister(); }
    else {
      state.player = d.player;
      show("main"); renderPlayer();
      showTab("home"); checkAdminAccess?.();
      updateChatBadge();
      loadOnlineCount();
      startOnlinePolling();
      if (d.new_achievements?.length) notifyAchievements(d.new_achievements);
      if (d.credit_paid) setTimeout(() => toast(`💸 Банк списал ${fmtMoney(d.credit_paid)}₽`, "error"), 800);
    }
  } catch(e) {
    console.error("boot error:", e);
    toast("Ошибка загрузки: " + e.message, "error");
    show("register"); renderRegister();
  }
}