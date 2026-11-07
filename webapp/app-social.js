// app-social.js
// Люди, локации, трейды, профиль игрока, быстрые действия

async function claimDaily() {
  try {
    const d = await api("daily");
    state.player = d.player;
    renderPlayer();
    toast(`🎁 +${fmtMoney(d.reward)}₽`, "success");
    checkCreditPaid(d);
  }
  catch(e) { toast(e.message, "error"); }
}

async function claimRoulette() {
  try {
    const d = await api("roulette");
    state.player = d.player;
    renderPlayer();
    toast(`🎡 ${fmtMoney(d.prize)}₽!`, "success");
    checkCreditPaid(d);
  } catch(e) { toast(e.message, "error"); }
}

const TG_BONUS_CHANNEL_URL = "https://t.me/russiarpbot1";

function claimTgBonus() {
  const p = state.player;
  if (!p) return;
  if (p.tg_bonus_claimed) {
    toast("Бонус уже получен", "error");
    return;
  }
  openModal(`
    <h2 style="text-align:center;margin-bottom:8px;">📢 Бонус за подписку</h2>
    <div style="text-align:center;padding:16px 0;">
      <div style="font-size:64px;line-height:1;margin-bottom:8px;">🎁</div>
      <div style="font-size:32px;font-weight:900;color:var(--money);">10 000₽</div>
      <div style="color:var(--hint);margin-top:10px;font-size:13px;line-height:1.5;">
        Подпишись на нашу Telegram-группу<br>и получи бонус на баланс
      </div>
    </div>
    <a href="${TG_BONUS_CHANNEL_URL}" rel="noopener"
       onclick="event.preventDefault(); openTgLink('${TG_BONUS_CHANNEL_URL}');"
       class="btn btn-primary"
       style="display:block;text-align:center;text-decoration:none;background:linear-gradient(135deg,#0088cc,#00a8e8);color:#fff;font-weight:800;">
      📢 Открыть группу
    </a>
    <button class="btn btn-primary" style="margin-top:8px;background:linear-gradient(135deg,#27ae60,#229954);" onclick="claimTgBonusConfirm()">
      ✅ Я подписался — получить бонус
    </button>
    <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
  `);
}

async function claimTgBonusConfirm() {
  try {
    const d = await api("tg_bonus/claim");
    state.player = d.player;
    renderPlayer();
    closeModal();
    toast(`🎉 +${fmtMoney(d.bonus)}₽ за подписку!`, "success");
    checkCreditPaid(d);
    if (tg) tg.HapticFeedback?.notificationOccurred("success");
  } catch(e) {
    toast(e.message, "error");
    if (tg) tg.HapticFeedback?.notificationOccurred("error");
  }
}

async function doCrime() {
  try { const d = await api("crime"); state.player = d.player; renderPlayer(); toast(d.result, d.success?"success":"error"); }
  catch(e) { toast(e.message, "error"); }
}

async function loadPeople() {
  try {
    const [loc, trades] = await Promise.all([api("location"), api("trade/list")]);
    state.location = loc;
    renderLocationTabs(loc); renderLocationInfo(loc);
    renderPlayersList(loc.players); renderTrades(trades);
  } catch(e) { toast(e.message, "error"); }
}

function renderLocationTabs(loc) {
  const locations = [
    {id:0, name:"Мухосранск", emoji:"🏚"},
    {id:1, name:"Черёмушки", emoji:"🏢"},
    {id:2, name:"Барвиха", emoji:"🏰"},
  ];
  $("#location-tabs").innerHTML = locations.map(l=>`
    <div class="loc-tab ${state.player.location_id===l.id?'active':''}" onclick="moveTo(${l.id})">
      <div class="loc-emoji">${l.emoji}</div>
      <div class="loc-name">${l.name}</div>
    </div>`).join("");
}

function renderLocationInfo(loc) {
  const l = loc.location;
  const here = state.player.location_id === l.id;
  $("#location-info").innerHTML = `<div class="loc-info-emoji">${l.emoji}</div>
    <div class="loc-info-name">${l.name}</div>
    <div class="loc-info-desc">${l.desc}</div>
    <div style="margin-top:8px;font-size:12px;color:${here?'var(--success)':'var(--hint)'}">${here ? "📍 Ты здесь" : "🚶 Не здесь"}</div>`;
}

function renderPlayersList(players) {
  if (players.length === 0) { $("#players-list").innerHTML = '<p style="color:var(--hint);text-align:center;padding:20px">Никого нет</p>'; return; }
  players = [...players].sort((a, b) => {
    if (a.is_online !== b.is_online) return b.is_online ? 1 : -1;
    return (b.last_seen || 0) - (a.last_seen || 0);
  });
  $("#players-list").innerHTML = players.map(p=>`
    <div class="player-card" onclick="viewPlayer(${p.user_id})">
      <div class="player-avatar">👤</div>
      <div class="player-info">
        <div class="player-name">${formatNickWithTag(p.nickname, p.gang_tag, p.gang_tag_color)}</div>
        <div class="player-meta">Ур. ${p.level} · ${_onlineHtml(p.is_online)}${!p.is_online ? ` · <span class="last-seen">${formatLastSeen(p.last_seen)}</span>` : ''}</div>
      </div>
      <div class="player-money">${fmtMoney(p.balance)}₽</div>
    </div>`).join("");
}

async function moveTo(locId) {
  try { await api("move", {location_id: locId}); state.player.location_id = locId; loadPeople(); toast("📍 Перемещён"); }
  catch(e) { toast(e.message, "error"); }
}

const ACH_MAP = {
  first_job:{name:"Работяга",emoji:"💼"}, first_business:{name:"Бизнесмен",emoji:"💼"},
  millionaire:{name:"Миллионер",emoji:"💰"}, billionaire:{name:"Миллиардер",emoji:"💎"},
  gambler:{name:"Азартный",emoji:"🎲"}, big_winner:{name:"Джекпот",emoji:"🎰"},
  criminal:{name:"Авторитет",emoji:"🕶"}, in_debt:{name:"Должник",emoji:"💸"},
  fashion:{name:"Модник",emoji:"👔"}, level10:{name:"Опытный",emoji:"⭐"},
  rich_king:{name:"Император",emoji:"👑"}, trader:{name:"Барыга",emoji:"🤝"},
};

async function viewPlayer(uid) {
  try {
    const d = await api("player_view", {user_id: uid});
    const ach = d.achievements.length > 0 ? d.achievements.map(id=>ACH_MAP[id]?.emoji||"🏆").join(" ") : "нет";
    const isMe = uid === state.player.user_id;
    const stats = d.combat_stats || {hp: 100, damage: 5};
    const onlineInfo = d.is_online
      ? _onlineHtml(true)
      : `${_onlineHtml(false)} · <span class="last-seen">🕐 Был(а) в сети: ${formatLastSeen(d.last_seen)}</span>`;
    const nickJs = jsAttr(d.nickname);
    const tagJs  = jsAttr(d.gang_tag || '');
    const colJs  = jsAttr(d.gang_tag_color || '');
    openModal(`
      <div class="shop-preview">${renderCharacterSVG(d.outfit, {width: 170, height: 340})}</div>
      <h2 style="text-align:center;margin-bottom:4px">${formatNickWithTag(d.nickname, d.gang_tag, d.gang_tag_color)}</h2>
      <div style="text-align:center;margin-bottom:8px;">${onlineInfo}</div>
      <div style="text-align:center;margin:12px 0">
        <div style="font-size:16px;font-weight:700">Ур. ${d.level}</div>
        <div style="color:var(--money);font-weight:700;margin-top:4px">💰 ${fmtMoney(d.balance)}₽</div>
        <div style="color:var(--hint);font-size:13px;margin-top:4px">Бизнесов: ${d.businesses_count}</div>
        <div style="font-size:12px;margin-top:8px;padding:6px 12px;background:var(--bg-3);border-radius:8px;display:inline-block">
          ❤️ ${stats.hp} HP · ⚔️ ${stats.damage} DMG
        </div>
        <div style="font-size:20px;margin-top:8px">${ach}</div>
      </div>
      ${!isMe ? `<button class="btn btn-primary" style="background:linear-gradient(135deg,#c0392b,#e74c3c);margin-bottom:8px" onclick='challengePvP(${uid}, ${nickJs})'>⚔️ Гоп-стоп</button>` : ''}
      ${!isMe ? `<button class="btn btn-primary" onclick='showTradeOffer(${uid}, ${nickJs})'>🤝 Трейд</button>` : ''}
      ${(!isMe && !d.is_friend && !d.friend_pending) ? `<button class="btn btn-secondary" onclick="sendFriendRequest(${uid})">➕ В друзья</button>` : ''}
      ${(!isMe && d.friend_pending) ? `<button class="btn btn-secondary" disabled>⏳ Заявка отправлена</button>` : ''}
      ${(!isMe) ? `<button class="btn btn-secondary" onclick='openPM(${uid}, ${nickJs}, ${tagJs}, ${colJs})'>✉️ Написать ЛС</button>` : ''}
      ${(!isMe && d.is_friend) ? `<button class="btn btn-secondary" style="background:rgba(231,76,60,.15);color:var(--danger);border:1px solid rgba(231,76,60,.3);" onclick='removeFriend(${uid}, ${nickJs})'>❌ Удалить из друзей</button>` : ''}
      ${(!isMe && d.my_role && ['leader','deputy'].includes(d.my_role) && !d.target_in_gang) ? `<button class="btn btn-secondary" onclick='inviteToGang(${uid}, ${nickJs})'>📨 Пригласить в банду</button>` : ''}
      ${(!isMe && d.tg_username) ? `<a href="https://t.me/${escapeHtml(d.tg_username)}" target="_blank" rel="noopener" class="btn btn-secondary" style="text-decoration:none;text-align:center;display:block;background:linear-gradient(135deg,#0088cc,#005f8f);border:none;color:#fff;font-weight:700;margin-top:8px;">✈️ Telegram @${escapeHtml(d.tg_username)}</a>` : ''}
    `);
  } catch(e) { toast(e.message, "error"); }
}

function renderTrades(trades) {
  const incEl = $("#trades-incoming"), outEl = $("#trades-outgoing");
  if (trades.incoming.length === 0 && trades.outgoing.length === 0) {
    incEl.innerHTML = '<p style="color:var(--hint);text-align:center;padding:20px">Нет трейдов</p>';
    outEl.innerHTML = ""; return;
  }
  incEl.innerHTML = trades.incoming.map(t=>{
    return `<div class="trade-card" onclick="showTradeDetailsModal(${t.trade_id})" style="cursor:pointer;">
      <div class="trade-title">📥 От ${formatNickWithTag(t.other_nickname, t.other_gang_tag, t.other_gang_tag_color)}</div>
      <div class="trade-content">Нажми, чтобы посмотреть детали и принять решение</div>
    </div>`;
  }).join("");
  outEl.innerHTML = trades.outgoing.length > 0
    ? '<div style="font-size:12px;color:var(--hint);margin-top:8px;margin-bottom:4px">📤 Отправленные</div>'
      + trades.outgoing.map(t=>`<div class="trade-card" style="border-left-color:var(--hint)">
        <div class="trade-title">К ${formatNickWithTag(t.other_nickname, t.other_gang_tag, t.other_gang_tag_color)}</div>
        <div class="trade-content">Ожидает ответа...</div>
        <div class="trade-actions"><button class="trade-decline" onclick="declineTrade(${t.trade_id})">Отменить</button></div>
      </div>`).join("")
    : "";
}

async function showTradeDetailsModal(tid) {
  try {
    const d = await api("trade/details", {trade_id: tid});
    const giveItemsHtml = d.give_items.map(it => `
      <div class="trade-item selected" style="border-color:${it.rarity_color};cursor:default;">
        <div class="trade-item-emoji">${it.emoji}</div>
        <div class="trade-item-name">${it.name}</div>
      </div>`).join('');
    const wantItemsHtml = d.want_items.map(it => `
      <div class="trade-item selected" style="border-color:${it.rarity_color};cursor:default;">
        <div class="trade-item-emoji">${it.emoji}</div>
        <div class="trade-item-name">${it.name}</div>
      </div>`).join('');

    openModal(`
      <h2 style="text-align:center;margin-bottom:16px">🤝 Трейд от ${formatNickWithTag(d.from_nickname, d.from_gang_tag, d.from_gang_tag_color)}</h2>

      <div style="background:var(--bg-3);padding:12px;border-radius:10px;margin-bottom:12px;">
        <p style="font-weight:700;margin-bottom:6px;color:var(--success);">📥 Он даёт тебе:</p>
        ${d.give_money > 0 ? `<div style="font-size:16px;font-weight:900;color:var(--money);margin-bottom:8px;">💰 ${fmtMoney(d.give_money)}₽</div>` : ''}
        <div class="trade-inventory" style="margin-bottom:0;">${giveItemsHtml || '<span style="color:var(--hint);text-align:center;width:100%;">Пусто</span>'}</div>
      </div>

      <div style="background:var(--bg-3);padding:12px;border-radius:10px;margin-bottom:16px;">
        <p style="font-weight:700;margin-bottom:6px;color:var(--danger);">📤 Ты отдаёшь:</p>
        ${d.want_money > 0 ? `<div style="font-size:16px;font-weight:900;color:var(--money);margin-bottom:8px;">💰 ${fmtMoney(d.want_money)}₽</div>` : ''}
        <div class="trade-inventory" style="margin-bottom:0;">${wantItemsHtml || '<span style="color:var(--hint);text-align:center;width:100%;">Пусто</span>'}</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <button class="btn btn-primary" onclick="acceptTrade(${tid})" style="background:var(--success);border:none;">✅ Принять</button>
        <button class="btn btn-secondary" onclick="declineTrade(${tid})" style="background:var(--danger);color:#fff;border:none;">❌ Отклонить</button>
      </div>
    `);
  } catch(e) { toast(e.message, "error"); }
}

async function acceptTrade(tid) {
  try {
    const d = await api("trade/accept", {trade_id: tid});
    state.player = d.player;
    renderPlayer();
    toast("✅ Трейд принят", "success");
    closeModal();
    loadPeople();
    if (typeof showNotificationsSilent === 'function') showNotificationsSilent();
    const modal = document.getElementById("modal");
    if (modal && !modal.classList.contains("hidden")) showNotifications();
  }
  catch(e) { toast(e.message, "error"); }
}

async function declineTrade(tid) {
  try {
    await api("trade/decline", {trade_id: tid});
    toast("❌ Отклонён");
    closeModal();
    loadPeople();
    if (typeof showNotificationsSilent === 'function') showNotificationsSilent();
    const modal = document.getElementById("modal");
    if (modal && !modal.classList.contains("hidden")) showNotifications();
  }
  catch(e) { toast(e.message, "error"); }
}

let tradeGiveItems = new Set();
let tradeWantItems = new Set();

async function showTradeOffer(uid, name) {
  try {
    const [myInv, theirInv] = await Promise.all([api("inventory"), api("player_items", {user_id: uid})]);
    tradeGiveItems = new Set();
    tradeWantItems = new Set();
    const myItemsHtml = myInv.items.map(i => `
      <div class="trade-item" data-iid="${i.item_id}" onclick="toggleTradeItem(this, 'give')">
        <div class="trade-item-emoji">${i.emoji}</div>
        <div class="trade-item-name">${i.name}</div>${_itemStatsHtml(i, 'mini')}
      </div>`).join("");
    const theirItemsHtml = theirInv.items.length > 0 ? theirInv.items.map(i => `
      <div class="trade-item" data-iid="${i.item_id}" onclick="toggleTradeItem(this, 'want')">
        <div class="trade-item-emoji">${i.emoji}</div>
        <div class="trade-item-name">${i.name}</div>${_itemStatsHtml(i, 'mini')}
      </div>`).join("") : '<p style="color:var(--hint);padding:20px;text-align:center">У них пусто</p>';
    openModal(`
      <h2 style="text-align:center;margin-bottom:16px">🤝 Трейд с ${escapeHtml(name)}</h2>
      <p style="font-weight:700;margin-bottom:6px">📤 Я даю</p>
      <input id="give-money" type="number" placeholder="Деньги ₽" style="width:100%;padding:10px;background:var(--bg-3);border:none;border-radius:8px;color:#fff;margin-bottom:6px" value="0">
      <div class="trade-inventory" id="give-inv">${myItemsHtml || '<p style="color:var(--hint);text-align:center;padding:10px">Твой инвентарь пуст</p>'}</div>
      <p style="font-weight:700;margin:12px 0 6px">📥 Я хочу</p>
      <input id="want-money" type="number" placeholder="Деньги ₽" style="width:100%;padding:10px;background:var(--bg-3);border:none;border-radius:8px;color:#fff;margin-bottom:6px" value="0">
      <div class="trade-inventory" id="want-inv">${theirItemsHtml}</div>
      <div class="trade-summary" id="trade-summary">Выбери предметы</div>
      <button class="btn btn-primary" style="margin-top:12px" onclick="sendTradeOffer(${uid})">🤝 Отправить предложение</button>
    `);
  } catch(e) { toast(e.message, "error"); }
}

function toggleTradeItem(el, kind) {
  const iid = el.dataset.iid;
  el.classList.toggle("selected");
  if (kind === "give") {
    if (el.classList.contains("selected")) tradeGiveItems.add(iid);
    else tradeGiveItems.delete(iid);
  } else {
    if (el.classList.contains("selected")) tradeWantItems.add(iid);
    else tradeWantItems.delete(iid);
  }
  const giveMoney = parseInt($("#give-money")?.value) || 0;
  const wantMoney = parseInt($("#want-money")?.value) || 0;
  $("#trade-summary").innerHTML = `
    <b>Ты даёшь:</b> ${giveMoney > 0 ? fmtMoney(giveMoney)+"₽ " : ""}${tradeGiveItems.size > 0 ? tradeGiveItems.size+" предмет(ов)" : "ничего"}<br>
    <b>Ты хочешь:</b> ${wantMoney > 0 ? fmtMoney(wantMoney)+"₽ " : ""}${tradeWantItems.size > 0 ? tradeWantItems.size+" предмет(ов)" : "ничего"}
  `;
}

async function sendTradeOffer(uid) {
  const give_money = parseInt($("#give-money").value) || 0;
  const want_money = parseInt($("#want-money").value) || 0;
  if (!give_money && !want_money && !tradeGiveItems.size && !tradeWantItems.size) {
    toast("Пустой трейд", "error"); return;
  }
  try {
    await api("trade/send", {
      to_user: uid, give_money,
      give_items: [...tradeGiveItems],
      want_money,
      want_items: [...tradeWantItems]
    });
    closeModal();
    toast("✅ Предложение отправлено", "success");
  } catch(e) { toast(e.message, "error"); }
}