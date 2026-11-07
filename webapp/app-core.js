// app-core.js
const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); tg.setHeaderColor?.('#17212b'); tg.setBackgroundColor?.('#17212b'); }
const initData = tg?.initData || "";

let state = {
  player: null, location: null, shopItems: [], invItems: [],
  shopFilter: "hair", appearanceMode: "shop", casinoGame: "coin",
  casinoLocked: false, casinoLockTime: 0, openPMs: [],
  chatWith: 'global', jobsCache: null, businessesCache: null, casesData: null,
  bossView: 'list',
};

const MAIN_TABS = ['home', 'casino', 'cases', 'bosses', 'chat', 'more'];
const SUB_TAB_TITLES = {
  appearance: '👕 Шмот',
  work: '💼 Работа',
  business: '🏢 Бизнес',
  people: '👥 Люди',
  friends: '🤝 Друзья',
  referral: '🎁 Рефералы',
  gang: '🚬 Банда',
  ghetto: '🗺️ Гетто',
  promo: '🎁 Промокоды',
  bosses: '💀 Боссы',
};

function getStaffBadge(role) {
  if (role === 'admin') {
    return `<span style="display:inline-flex;align-items:center;gap:2px;margin-left:4px;vertical-align:middle;"><img src="assets/personal.png" style="width:14px;height:14px;object-fit:contain;"><span style="background:#c0392b;color:#fff;font-size:10px;font-weight:900;padding:1px 4px;border-radius:4px;line-height:1;">ADM</span></span>`;
  }
  if (role === 'moderator') {
    return `<span style="display:inline-flex;align-items:center;gap:2px;margin-left:4px;vertical-align:middle;"><img src="assets/personal.png" style="width:14px;height:14px;object-fit:contain;"><span style="background:#2980b9;color:#fff;font-size:10px;font-weight:900;padding:1px 4px;border-radius:4px;line-height:1;">MOD</span></span>`;
  }
  return '';
}

function formatNickWithTag(name, tag, color, role) {
  const safeName = escapeHtml(name || "");
  const badge = getStaffBadge(role);
  if (!tag) return safeName + badge;
  const c = color || "#f39c12";
  return `<span class="gang-tag" style="color:${escapeHtml(c)};border-color:${escapeHtml(c)}">[${escapeHtml(tag)}]</span> ${safeName}${badge}`;
}

function formatLastSeen(ts) {
  if (!ts || Number(ts) === 0) return "давно";
  const now = Math.floor(Date.now() / 1000);
  const diff = now - Number(ts);
  if (diff < 60) return "только что";
  if (diff < 3600) return Math.floor(diff / 60) + " мин назад";
  if (diff < 86400) return Math.floor(diff / 3600) + " ч назад";
  return "давно";
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text == null ? "" : text;
  return div.innerHTML;
}

function jsAttr(s) {
  const json = JSON.stringify(String(s == null ? "" : s));
  return json.replace(/'/g, "\\'");
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
  const isMain = MAIN_TABS.includes(tab);

  if (tab === "home" && state.player) {
    setTimeout(() => renderCharacterInto("#character-view"), 0);
  }
  $$(".tab-content").forEach(c=>c.classList.remove("active"));
  const section = $(`.tab-content[data-tab="${tab}"]`);
  if (section) section.classList.add("active");

  const navTab = isMain ? tab : 'more';
  $$(".nav-btn").forEach(b=>b.classList.toggle("active", b.dataset.nav===navTab));

  const subHeader = document.getElementById("subtab-header");
  const subTitle = document.getElementById("subtab-title");
  if (subHeader && subTitle) {
    if (!isMain) {
      subHeader.classList.remove("hidden");
      subTitle.textContent = SUB_TAB_TITLES[tab] || '';
    } else {
      subHeader.classList.add("hidden");
    }
  }

  if (typeof stopChatPolling === "function") stopChatPolling();
  if (tab==="appearance" && typeof loadAppearance === 'function') loadAppearance();
  if (tab==="work" && typeof loadWork === 'function') loadWork();
  if (tab==="business" && typeof loadBusinesses === 'function') loadBusinesses();
  if (tab==="casino" && typeof renderCasino === 'function') renderCasino();
  if (tab==="people" && typeof loadPeople === 'function') loadPeople();
  if (tab==="ghetto" && typeof renderGhetto === 'function') renderGhetto();
  if (tab==="referral" && typeof renderReferral === 'function') renderReferral();
  if (tab==="chat" && typeof startChatPolling === 'function') startChatPolling();
  if (tab==="bosses" && typeof loadBosses === 'function') loadBosses();
  if (tab==="more" && typeof updateMoreBadges === 'function') { updateMoreBadges(); checkAdminAccess?.(); }
  if (tab==="cases" && typeof loadCases === 'function') loadCases();
  if (tab==="gang" && typeof loadGang === 'function') loadGang();
  if (tab==="friends" && typeof loadFriends === 'function') loadFriends();
  if (tab==="home" && typeof loadNotifications === 'function') loadNotifications();
  if (tab==="promo") {
    const resultBox = document.getElementById('promo-result-box');
    if (resultBox) resultBox.classList.add('hidden');
  }
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
  if (window._notifRefresh) { clearInterval(window._notifRefresh); window._notifRefresh = null; }
  if (window._cryptoRefresh) { clearInterval(window._cryptoRefresh); window._cryptoRefresh = null; }
}

function openTgLink(url) {
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openTelegramLink) {
    window.Telegram.WebApp.openTelegramLink(url);
  } else {
    window.open(url, '_blank');
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
  {id:"hair", name:"Причёска", emoji:"💇"},
  {id:"head", name:"Голова", emoji:"🧢"},
  {id:"body", name:"Тело", emoji:"👕"},
  {id:"legs", name:"Ноги", emoji:"👖"},
  {id:"shoes", name:"Обувь", emoji:"👟"},
  {id:"right_hand", name:"Пр.рука", emoji:"🤚"},
  {id:"left_hand", name:"Лев.рука", emoji:"🖐"},
];
const SLOT_KEY = {
  head:"head_id", body:"body_id", legs:"legs_id",
  right_hand:"right_hand_id", left_hand:"left_hand_id",
  hair:"hair_id", shoes:"shoes_id"
};
const SLOT_KEY_MAP = SLOT_KEY;

function emptyOutfit() {
  return {
    head_id:{item_id:null}, body_id:{item_id:null}, legs_id:{item_id:null},
    right_hand_id:{item_id:null}, left_hand_id:{item_id:null},
    hair_id:{item_id:null}, shoes_id:{item_id:null}
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
    const serverConvs = d.conversations || [];
    if (!state.openPMs) state.openPMs = [];

    const serverUids = new Set(serverConvs.map(c => Number(c.user_id)));
    
    state.openPMs = state.openPMs.filter(p => {
      if (serverUids.has(Number(p.uid))) return true;
      if (Number(p.uid) === Number(state.chatWith) && p._ts && Date.now() - p._ts < 15000) return true;
      return false;
    });

    if (state.chatWith && state.chatWith !== 'global' && !serverUids.has(Number(state.chatWith))) {
      const activePm = state.openPMs.find(p => Number(p.uid) === Number(state.chatWith));
      if (!activePm) {
        state.chatWith = 'global';
        if (typeof loadChat === 'function') loadChat();
      }
    }

    for (const c of serverConvs) {
      const existing = state.openPMs.find(x => Number(x.uid) === Number(c.user_id));
      if (existing) {
        existing.name = c.nickname;
        existing.tag = c.gang_tag;
        existing.tag_color = c.gang_tag_color;
        existing.role = c.role;
        existing.unread = c.unread;
        existing._ts = Date.now();
      } else {
        state.openPMs.push({
          uid: c.user_id,
          name: c.nickname,
          tag: c.gang_tag,
          tag_color: c.gang_tag_color,
          role: c.role,
          unread: c.unread,
          _ts: Date.now()
        });
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
  el.innerHTML = renderCharacterSVG(state.player.outfit);
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

async function applyPromo() {
  const inp = document.getElementById('promo-input');
  const btn = document.getElementById('btn-apply-promo');
  const box = document.getElementById('promo-result-box');
  if (!inp || !btn) return;
  const code = (inp.value || '').trim().toUpperCase();
  if (!code) { toast("Введи промокод", "error"); return; }
  btn.disabled = true;
  if (box) box.classList.add('hidden');
  try {
    const d = await api("promo/apply", { code });
    if (d.player) {
      state.player = d.player;
      renderPlayer();
    }
    if (box) {
      box.className = 'promo-result success';
      box.textContent = d.message || `✅ +${fmtMoney(d.bonus)}₽ на баланс!`;
      box.classList.remove('hidden');
    }
    inp.value = '';
    if (tg) tg.HapticFeedback?.notificationOccurred("success");
    checkCreditPaid(d);
  } catch(e) {
    if (box) {
      box.className = 'promo-result error';
      box.textContent = e.message || "Ошибка";
      box.classList.remove('hidden');
    }
    if (tg) tg.HapticFeedback?.notificationOccurred("error");
  } finally {
    btn.disabled = false;
  }
}

// ══════════════════════════════════════════════════════════════
//  ONBOARDING
// ══════════════════════════════════════════════════════════════
let _onbStep = 0;
const ONB_STEPS = [
  { emoji: '👋', title: 'Добро пожаловать!', text: 'Ты начинаешь с 1000₽ и старой майки. Цель — стать олигархом. Погнали!' },
  { emoji: '💼', title: 'Шаг 1: работа', text: 'Найди работу — курьер, грузчик, дальше больше. Каждый клик приносит деньги и опыт.' },
  { emoji: '🏢', title: 'Шаг 2: бизнесы', text: 'Накопи на первый бизнес — шаурмечная приносит доход даже когда ты оффлайн.' },
  { emoji: '🎁', title: 'И это только начало', text: 'Казино, банды, войны за территории, кейсы с лимитками, PvP-гоп-стоп. Дальше — сам.' },
];

function showOnboarding() {
  if (!state.player) return;
  const key = 'onb_done_' + state.player.user_id;
  try { if (localStorage.getItem(key)) return; } catch(_) {}
  _onbStep = 0;
  renderOnboarding();
  const el = document.getElementById('onboarding');
  if (el) el.classList.remove('hidden');
}

function renderOnboarding() {
  const s = ONB_STEPS[_onbStep];
  const emoji = document.getElementById('onb-emoji');
  const title = document.getElementById('onb-title');
  const text = document.getElementById('onb-text');
  const dots = document.getElementById('onb-dots');
  const nextBtn = document.getElementById('onb-next');
  if (emoji) emoji.textContent = s.emoji;
  if (title) title.textContent = s.title;
  if (text) text.textContent = s.text;
  if (dots) dots.innerHTML = ONB_STEPS.map((_, i) =>
    `<span class="${i === _onbStep ? 'active' : ''}"></span>`).join('');
  if (nextBtn) nextBtn.textContent = _onbStep === ONB_STEPS.length - 1 ? 'Погнали! 🚀' : 'Дальше →';
}

function onbNext() {
  if (_onbStep < ONB_STEPS.length - 1) {
    _onbStep++;
    renderOnboarding();
  } else {
    onbSkip();
  }
}

function onbSkip() {
  if (state.player) {
    try { localStorage.setItem('onb_done_' + state.player.user_id, '1'); } catch(_) {}
  }
  const el = document.getElementById('onboarding');
  if (el) el.classList.add('hidden');
  updateNextStepBanner();
}

// ══════════════════════════════════════════════════════════════
//  NEXT STEP BANNER
// ══════════════════════════════════════════════════════════════
const NEXT_STEPS = [
  {
    id: 'no_job',
    test: p => !p.current_job,
    icon: '💼',
    title: 'Найди работу',
    text: 'Курьер зарабатывает 100₽ за клик. Это первый шаг к богатству.',
    action: 'work',
  },
  {
    id: 'low_balance',
    test: p => p.current_job && p.balance < 5000,
    icon: '💰',
    title: 'Накопи на бизнес',
    text: `Нужно ещё ${5000 - (state.player?.balance || 0)}₽ до первой шаурмечной.`,
    action: 'work',
  },
  {
    id: 'no_first_biz',
    test: p => p.balance >= 5000 && (!p.businesses || p.businesses.length === 0),
    icon: '🏢',
    title: 'Купи первый бизнес',
    text: 'Шаурмечная Ашота приносит 100₽/ч даже в оффлайне.',
    action: 'business',
  },
  {
    id: 'no_gang_lv5',
    test: p => p.level >= 5 && !p.gang_tag,
    icon: '🚬',
    title: 'Вступи в банду',
    text: 'Вместе прибыльнее: войны за территории, клановый магазин, семечки.',
    action: 'gang',
  },
  {
    id: 'no_case_lv3',
    test: p => p.level >= 3,
    icon: '🎁',
    title: 'Открой первый кейс',
    text: 'В кейсах — эксклюзивные шмотки, которых нет в магазине.',
    action: 'cases',
  },
];

let _lastNextStepAction = null;

function updateNextStepBanner() {
  const p = state.player;
  if (!p) return;
  const banner = document.getElementById('next-step-banner');
  if (!banner) return;

  let step = null;
  for (const s of NEXT_STEPS) {
    try { if (s.test(p)) { step = s; break; } } catch(_) {}
  }

  if (!step) {
    banner.classList.add('hidden');
    return;
  }

  _lastNextStepAction = step.action;
  const iconEl = document.getElementById('nsb-icon');
  const titleEl = document.getElementById('nsb-title');
  const textEl = document.getElementById('nsb-text');
  if (iconEl) iconEl.textContent = step.icon;
  if (titleEl) titleEl.textContent = step.title;
  if (textEl) textEl.textContent = step.text;
  banner.classList.remove('hidden');
}

function nextStepGo() {
  if (_lastNextStepAction) showTab(_lastNextStepAction);
}

// ══════════════════════════════════════════════════════════════
//  PLAYER RENDER
// ══════════════════════════════════════════════════════════════
function renderPlayer() {
  const p = state.player; if (!p) return;
  $("#nick").innerHTML = formatNickWithTag(p.nickname, p.gang_tag, p.gang_tag_color, p.role);
  const hasClothes = p.outfit.head_id.item_id || p.outfit.body_id.item_id || p.outfit.legs_id.item_id;
  $("#subtitle").textContent = `Ур. ${p.level} · ${hasClothes ? "модник" : "голый бомж"}`;
  $("#money").textContent = fmtMoney(p.balance);
  $("#char-name").innerHTML = formatNickWithTag(p.nickname, p.gang_tag, p.gang_tag_color, p.role);
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
  updateNextStepBanner();

  const tgBtn = document.getElementById("tg-bonus-btn");
  if (tgBtn) {
    if (p.tg_bonus_claimed) {
      tgBtn.disabled = true;
      tgBtn.style.opacity = "0.5";
      tgBtn.style.cursor = "not-allowed";
      tgBtn.textContent = "✅ Бонус за ТГ получен";
    } else {
      tgBtn.disabled = false;
      tgBtn.style.opacity = "1";
      tgBtn.style.cursor = "pointer";
      tgBtn.innerHTML = '📢 Бонус за Telegram <span class="badge" style="background:#2ecc71;color:#fff;">10 000₽</span>';
    }
  }
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
      if (d.credit_paid) checkCreditPaid(d);
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
        showOnboarding();
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
      showOnboarding();
    }
  } catch(e) {
    console.error("boot error:", e);
    toast("Ошибка загрузки: " + e.message, "error");
    show("register"); renderRegister();
  }
}