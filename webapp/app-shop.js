// app-shop.js
// Магазин, инвентарь, экипировка, работа, бизнесы

// ══════════════════════════════════════════════════════════════
//  МАГАЗИН / ИНВЕНТАРЬ
// ══════════════════════════════════════════════════════════════
async function loadAppearance() {
  try {
    const [shop, inv] = await Promise.all([api("shop"), api("inventory")]);
    state.shopItems = shop.items;
    state.invItems = inv.items;
    renderAppearance();
  } catch(e) { toast(e.message, "error"); }
}

function renderAppearance() {
  const container = $("#appearance-list");
  const filterEl = $("#appearance-filter");

  const modeHtml = `<div class="mode-switch">
    <button class="mode-btn ${state.appearanceMode==='shop'?'active':''}" onclick="setAppearanceMode('shop')">🛒 Магазин</button>
    <button class="mode-btn ${state.appearanceMode==='inventory'?'active':''}" onclick="setAppearanceMode('inventory')">🎒 Инвентарь</button>
  </div>`;

  const filterHtml = SLOT_FILTERS.map(f=>`<button class="filter-btn ${state.shopFilter===f.id?'active':''}" onclick="setShopFilter('${f.id}')">${f.emoji} ${f.name}</button>`).join("");

  filterEl.innerHTML = modeHtml + filterHtml;

  const p = state.player;
  let listHtml = "";

  if (state.appearanceMode === "shop") {
    const items = state.shopItems.filter(i=>i.slot===state.shopFilter);
    if (items.length === 0) listHtml = '<p style="color:var(--hint);text-align:center;padding:20px">Пусто</p>';
    else listHtml = items.map(it => {
      const canAfford = p.balance >= it.price;
      return `<div class="item-card" style="border-left-color:${it.rarity_color}" onclick="showShopItem('${it.item_id}')">
        <div class="item-preview-mini">${renderCharacterSVG({...emptyOutfit(), [SLOT_KEY[it.slot]]: {item_id: it.item_id}}, {width: 40, height: 80})}</div>
        <div class="item-info">
          <div class="item-name" style="color:${it.rarity_color}">${it.name}</div>
          <div class="item-meta">${it.desc}</div>${_itemStatsHtml(it)}
        </div>
        <div class="item-price ${canAfford?'':'disabled'}">${fmtMoney(it.price)}₽</div>
      </div>`;
    }).join("");
  } else {
    const equipped = [];
    for (const [slot, item] of Object.entries(p.outfit)) {
      if (item.item_id) equipped.push({slot, item});
    }
    const inv = state.invItems.filter(it => it.slot === state.shopFilter);
    const equippedInSlot = equipped.filter(e => SLOT_KEY[state.shopFilter] === e.slot);

    if (equippedInSlot.length > 0) {
      listHtml += '<div style="font-size:11px;color:var(--hint);margin-bottom:6px;text-transform:uppercase;font-weight:700">Надето</div>';
      listHtml += equippedInSlot.map(e=>`
        <div class="item-card" style="border-left-color:var(--success)" onclick="showEquipped('${e.slot}')">
          <div class="item-preview-mini">${renderCharacterSVG({...emptyOutfit(), [e.slot]: {item_id: e.item.item_id}}, {width: 40, height: 80})}</div>
          <div class="item-info"><div class="item-name">${e.item.name}</div><div class="item-meta">✓ надето</div></div>
          <div style="color:var(--success);font-weight:700">✓</div>
        </div>`).join("");
      listHtml += '<div style="font-size:11px;color:var(--hint);margin:12px 0 6px;text-transform:uppercase;font-weight:700">Сумка</div>';
    }
    if (inv.length === 0) {
      listHtml += '<p style="color:var(--hint);text-align:center;padding:20px">Нет предметов в этом разделе</p>';
    } else {
      listHtml += inv.map(it=>`<div class="item-card" style="border-left-color:${it.rarity_color}" onclick="showInvItem('${it.item_id}')">
        <div class="item-preview-mini">${renderCharacterSVG({...emptyOutfit(), [SLOT_KEY[it.slot]]: {item_id: it.item_id}}, {width: 40, height: 80})}</div>
        <div class="item-info"><div class="item-name" style="color:${it.rarity_color}">${it.name}</div><div class="item-meta">${it.desc}</div>${_itemStatsHtml(it)}</div>
        <div class="item-price">×${it.quantity}</div>
      </div>`).join("");
    }
  }
  container.innerHTML = listHtml;
}

function setAppearanceMode(m) { state.appearanceMode = m; renderAppearance(); }
function setShopFilter(f) { state.shopFilter = f; renderAppearance(); }

function showShopItem(iid) {
  const it = state.shopItems.find(x=>x.item_id===iid);
  if (!it) return;
  const p = state.player;
  const canAfford = p.balance >= it.price;
  const preview = {...p.outfit};
  preview[SLOT_KEY[it.slot]] = {item_id: iid, emoji: it.emoji, name: it.name};
  openModal(`
    <div class="shop-preview">${renderCharacterSVG(preview, {width: 190, height: 380})}</div>
    <h2 style="color:${it.rarity_color};text-align:center;margin-bottom:4px">${it.name}</h2>
    <div style="color:${it.rarity_color};font-size:12px;font-weight:700;text-align:center;margin-bottom:12px">${it.rarity_name} · ${SLOT_FILTERS.find(f=>f.id===it.slot)?.name || ''}</div>
    <p style="color:var(--hint);text-align:center;margin-bottom:16px">${it.desc}</p>${_itemStatsHtml(it, 'block')}
    <div style="text-align:center;font-size:20px;font-weight:800;margin-bottom:16px">💰 ${fmtMoney(it.price)}₽</div>
    ${canAfford ? `<button class="btn btn-primary" onclick="buyItem('${iid}')">✅ Купить</button>` : `<button class="btn btn-secondary" disabled>❌ Не хватает денег</button>`}
  `);
}

async function buyItem(iid) {
  try {
    const d = await api("buy", {item_id: iid});
    state.player = d.player;
    renderPlayer(); renderCharacterInto("#character-view"); loadAppearance();
    closeModal(); toast(`✅ Куплено: ${d.bought}`, "success");
    flashCharacter();
    if (d.new_achievements?.length) notifyAchievements(d.new_achievements);
    if (tg) tg.HapticFeedback?.notificationOccurred("success");
  } catch(e) { toast(e.message, "error"); }
}

function showEquipped(slot) {
  const it = state.player.outfit[slot];
  if (!it.item_id) return;
  openModal(`
    <div class="shop-preview">${renderCharacterSVG({...emptyOutfit(), [slot]: {item_id: it.item_id}}, {width: 160, height: 320})}</div>
    <h2 style="text-align:center">${it.name}</h2>
    <p style="color:var(--hint);text-align:center;margin:16px 0">Снять?</p>
    <button class="btn btn-primary" onclick="unequip('${slot}')">🚫 Снять</button>
  `);
}

async function equipItem(iid) {
  try {
    const d = await api("equip", {item_id: iid});
    state.player = d.player;
    renderPlayer(); renderCharacterInto("#character-view"); loadAppearance();
    closeModal(); toast("✅ Надето", "success"); flashCharacter();
    if (d.new_achievements?.length) notifyAchievements(d.new_achievements);
    if (tg) tg.HapticFeedback?.impactOccurred("light");
  } catch(e) { toast(e.message, "error"); }
}

async function unequip(slot) {
  try {
    const d = await api("unequip", {slot});
    state.player = d.player;
    renderPlayer(); renderCharacterInto("#character-view"); loadAppearance();
    closeModal(); toast("✅ Снято"); flashCharacter();
  } catch(e) { toast(e.message, "error"); }
}

async function sellItem(iid) {
  try {
    const d = await api("sell", {item_id: iid});
    state.player = d.player;
    renderPlayer(); loadAppearance();
    closeModal(); toast(`💰 +${d.gold}₽`, "success");
  } catch(e) { toast(e.message, "error"); }
}

async function showInvItem(iid) {
  const it = state.invItems.find(x=>x.item_id===iid);
  if (!it) return;
  openModal(`
    <div class="shop-preview">${renderCharacterSVG({...emptyOutfit(), [SLOT_KEY_MAP[it.slot]]: {item_id: iid}}, {width: 160, height: 320})}</div>
    <h2 style="color:${it.rarity_color};text-align:center">${it.name}</h2>
    <div style="color:${it.rarity_color};font-size:12px;margin:8px 0 16px;font-weight:700;text-align:center">${it.rarity_name} · ×${it.quantity}</div>
    <p style="color:var(--hint);margin-bottom:16px;text-align:center">${it.desc}</p>${_itemStatsHtml(it, 'block')}
    <button class="btn btn-primary" onclick="equipItem('${iid}')">⚡ Надеть</button>
    <button class="btn btn-secondary" onclick="confirmSellItem('${iid}')">💰 Продать</button>
  `);
}

function confirmSellItem(iid) {
  const it = state.invItems.find(x=>x.item_id===iid);
  if (!it) return;
  openModal(`
    <h2 style="text-align:center">💰 Продать?</h2>
    <div style="text-align:center;margin:24px 0;padding:20px;background:var(--bg-3);border-radius:12px">
      <div style="font-size:48px">${it.emoji}</div>
      <div style="font-weight:800;margin-top:8px;color:${it.rarity_color}">${it.name}</div>
      <div style="color:var(--hint);font-size:12px;margin-top:4px">${it.desc}</div>
      <div style="margin-top:16px;padding:12px;background:rgba(243,156,18,.15);border-radius:8px">
        <div style="font-size:12px;color:var(--hint)">Цена продажи (50% от магазина)</div>
        <div style="font-size:24px;font-weight:900;color:var(--money);margin-top:4px">${fmtMoney(it.sell_price)}₽</div>
      </div>
    </div>
    <button class="btn btn-primary" onclick="sellItem('${iid}')">✅ Да, продать</button>
    <button class="btn btn-secondary" onclick="showInvItem('${iid}')">❌ Нет, назад</button>
  `);
}

// ══════════════════════════════════════════════════════════════
//  РАБОТА
// ══════════════════════════════════════════════════════════════
const JOBS_DATA = {
  courier:{name:"Курьер",emoji:"🚴",salary:100,xp:5,cooldown:60},
  loader:{name:"Грузчик",emoji:"📦",salary:250,xp:10,cooldown:120},
  taxi:{name:"Таксист",emoji:"🚕",salary:500,xp:20,cooldown:180},
  programmer:{name:"Программист",emoji:"💻",salary:1200,xp:40,cooldown:240},
  blogger:{name:"Блогер",emoji:"📹",salary:3000,xp:80,cooldown:300},
};

async function loadWork() {
  try {
    const d = await api("jobs", {});
    state.jobsCache = d;
    renderJobs(d);
  } catch(e) { toast(e.message, "error"); }
}

function renderJobs(data) {
  const cur = data.current; const now = Math.floor(Date.now()/1000);
  const box = $("#job-current-box");
  if (cur && JOBS_DATA[cur]) {
    const j = JOBS_DATA[cur];
    const cd = Math.max(0, j.cooldown - (now - (data.last_work||0)));
    box.innerHTML = `<div class="current-job-box">
      <div class="label">Текущая работа</div>
      <div class="name">${j.emoji} ${j.name}</div>
      <div style="font-size:13px;opacity:.9;margin-top:6px">${j.salary}₽ · ${j.xp} XP</div>
      ${cd>0 ? `<button class="btn" disabled>⏳ ${cd}с</button>` : `<button class="btn" onclick="doWork()">💼 Работать (+${j.salary}₽)</button>`}
    </div>`;
  } else box.innerHTML = `<div class="current-job-box"><div class="name">💼 Выбери работу</div></div>`;
  $("#jobs-list").innerHTML = data.jobs.map(j=>`
    <div class="job-card ${cur===j.id?'selected':''} ${j.unlocked?'':'locked'}" onclick="selectJob('${j.id}', ${j.unlocked})">
      <div class="job-icon">${j.emoji}</div>
      <div class="job-info"><div class="job-name">${j.name}</div><div class="job-desc">${j.desc} · ур.${j.level}</div></div>
      <div class="job-salary">${j.salary}₽</div>
    </div>`).join("");
}

async function selectJob(jid, unlocked) {
  if (!unlocked) { toast("Низкий уровень", "error"); return; }
  try { await api("set_job", {job_id: jid}); loadWork(); toast(`💼 ${JOBS_DATA[jid].name}`); }
  catch(e) { toast(e.message, "error"); }
}

async function doWork() {
  try {
    const d = await api("work");
    state.player = d.player; renderPlayer(); loadWork();
    checkCreditPaid(d);
    toast(`💼 +${d.earned}₽ · +${d.xp} XP`, "success");
    if (d.levels) toast(`🎉 Уровень ${d.player.level}!`, "success");
    if (d.new_achievements?.length) notifyAchievements(d.new_achievements);
    if (tg) tg.HapticFeedback?.notificationOccurred("success");
  } catch(e) { toast(e.message, "error"); loadWork(); }
}

// ══════════════════════════════════════════════════════════════
//  БИЗНЕСЫ
// ══════════════════════════════════════════════════════════════
async function loadBusinesses() {
  try {
    const d = await api("businesses", {});
    state.businessesCache = d;
    renderBusinesses(d);
  } catch(e) { toast(e.message, "error"); }
}

function renderBusinesses(data) {
  const list = document.getElementById("businesses-list");
  if (!list) return;
  const arr = Array.isArray(data) ? data : (data.businesses || []);
  let totalPending = 0;
  list.innerHTML = "";

  if (arr.length === 0) {
    list.innerHTML = '<div style="color:var(--hint);text-align:center;padding:20px;">Нет доступных бизнесов</div>';
    const totalEl = document.getElementById("business-total-pending");
    if (totalEl) totalEl.textContent = "0₽";
    return;
  }

  arr.forEach(b => {
    const pending = b.pending || 0;
    totalPending += pending;
    const income = b.income || 0;
    const name = b.name || 'Бизнес';
    const emoji = b.emoji || '🏢';
    const level = b.level || 1;

    let actionHtml = "";
    if (!b.owned) {
      actionHtml = `<button class="btn btn-primary" style="width:100%;margin-top:10px;" onclick="buyBusiness('${b.id}')">Купить за ${fmtMoney(b.price)}₽</button>`;
    } else {
      let upgradeHtml = "";
      if (level < 3) {
        const cost = Math.floor(b.price * (level === 1 ? 1.3 : 1.7));
        upgradeHtml = `<button class="btn btn-secondary" style="flex:1;margin-right:8px;font-size:12px;padding:8px;" onclick="upgradeBusiness('${b.id}')">⭐ Улучшить (${fmtMoney(cost)}₽)</button>`;
      } else {
        upgradeHtml = `<button class="btn btn-secondary" style="flex:1;margin-right:8px;font-size:12px;padding:8px;" disabled>⭐ Макс. уровень</button>`;
      }
      actionHtml = `
        <div style="display:flex;margin-top:10px;">
          ${upgradeHtml}
          <button class="btn btn-primary" style="flex:1;font-size:12px;padding:8px;" onclick="collectBusiness()">💰 Забрать</button>
        </div>
      `;
    }

    list.innerHTML += `
      <div class="business-card" style="background:var(--bg-2);border-radius:16px;padding:16px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.05);box-shadow:0 4px 6px rgba(0,0,0,0.1);">
         <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div style="font-weight:900;font-size:16px;color:#fff;">${emoji} ${name}</div>
            ${b.owned ? `<div style="background:rgba(243,156,18,0.15);color:#f39c12;padding:4px 8px;border-radius:8px;font-size:12px;font-weight:bold;">Ур. ${level}</div>` : ''}
         </div>
         <div style="font-size:12px;color:var(--hint);margin-top:4px;">Доход: ${fmtMoney(income)}₽/ч</div>
         ${b.owned ? `
         <div style="margin-top:12px;background:#111;padding:12px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;border:1px solid #222;">
            <div>
              <div style="font-size:10px;color:var(--hint);text-transform:uppercase;letter-spacing:0.5px;">Накоплено</div>
              <div style="font-size:18px;font-weight:900;color:#2ecc71;">${fmtMoney(pending)}₽</div>
            </div>
         </div>` : ''}
         ${actionHtml}
      </div>
    `;
  });

  const totalEl = document.getElementById("business-total-pending");
  if (totalEl) totalEl.textContent = fmtMoney(totalPending) + "₽";
}

async function buyBusiness(id) {
  try {
    const d = await api("buy_business", { business_id: id });
    if (d.error) {
      if (d.required !== undefined && d.balance !== undefined) {
        throw new Error(`Не хватает денег! Цена: ${fmtMoney(d.required)}₽, у тебя: ${fmtMoney(d.balance)}₽`);
      }
      throw new Error(d.error);
    }
    toast("🏢 Бизнес куплен!", "success");
    if (d.player) { state.player = d.player; renderPlayer(); }
    loadBusinesses();
  } catch(e) {
    toast(e.message, "error");
    try {
      const me = await api("me");
      if (me.player) { state.player = me.player; renderPlayer(); }
    } catch(_) {}
  }
}

async function upgradeBusiness(id) {
  try {
    const d = await api("upgrade_business", { business_id: id });
    if (d.error) {
      if (d.required !== undefined && d.balance !== undefined) {
        throw new Error(`Не хватает денег! Цена: ${fmtMoney(d.required)}₽, у тебя: ${fmtMoney(d.balance)}₽`);
      }
      throw new Error(d.error);
    }
    toast("⭐ Бизнес улучшен!", "success");
    if (d.player) { state.player = d.player; renderPlayer(); }
    loadBusinesses();
  } catch(e) {
    toast(e.message, "error");
    try {
      const me = await api("me");
      if (me.player) { state.player = me.player; renderPlayer(); }
    } catch(_) {}
  }
}

async function collectBusiness() {
  try {
    const d = await api("collect_business", {});
    if (d.error) throw new Error(d.error);
    const collected = d.collected || d.pending || 0;
    if (collected > 0) toast(`💰 Собрано: ${fmtMoney(collected)}₽`, "success");
    else toast("Нечего собирать", "error");
    if (d.player) {
      state.player = d.player;
      document.getElementById("money").textContent = fmtMoney(state.player.balance);
    }
    loadBusinesses();
  } catch(e) {
    toast(e.message, "error");
  }
}