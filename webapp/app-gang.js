// app-gang.js
// Банды, гетто, кейсы, рефералы, магазин банды

// ═══ FALLBACK на случай если бэкенд не пришлёт is_limited ═══
const LIMITED_CASES_FALLBACK = {
  "anime_girls": 15,
  "basic":       50,
  "rare":        50,
  "legendary":   50,
  "top1":        50,
  "top2":        50,
};

async function loadCases() {
  try {
    const d = await api("cases/list");
    const el = $("#cases-list");
    el.innerHTML = d.cases.map(c => {
        const fbLimit = LIMITED_CASES_FALLBACK[c.case_id];
        const isLimited = c.is_limited === true || (c.is_limited === undefined && !!fbLimit);
        const totalLimit = c.limit || fbLimit || 0;
        const openedCount = c.opened || 0;
        const leftCount = (c.left !== undefined) ? c.left : Math.max(0, totalLimit - openedCount);
        const soldOut = isLimited && leftCount <= 0;

        let limitBadge = "";
        if (isLimited) {
            const pct = totalLimit > 0 ? Math.min(100, (openedCount / totalLimit) * 100) : 0;
            limitBadge = `
              <div style="margin-top:8px;padding:6px 8px;background:rgba(231,76,60,0.12);border:1px solid #e74c3c;border-radius:8px;">
                <div style="font-size:12px;color:#e74c3c;font-weight:900;text-align:center;letter-spacing:0.5px;">🔥 ЛИМИТИРОВАННЫЙ</div>
                <div style="width:100%;height:5px;background:#222;border-radius:3px;margin-top:5px;overflow:hidden;">
                  <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#e74c3c,#ff6b6b);min-width:${pct>0?'3px':'0'};"></div>
                </div>
                <div style="font-size:11px;color:#fff;text-align:center;margin-top:4px;">Осталось: <b style="color:#e74c3c;">${leftCount}/${totalLimit}</b></div>
              </div>
            `;
        }

        return `<div class="case-preview-card" onclick="showCaseDetail('${c.case_id}')" style="${soldOut ? 'opacity:0.5;filter:grayscale(1);' : ''}">
          <div class="case-preview-emoji">${c.emoji}</div>
          <div class="case-preview-info">
            <div class="case-preview-name">${c.name}</div>
            <div class="case-preview-sub">${c.items.length} уникальных предметов</div>
            ${limitBadge}
          </div>
          <div class="case-preview-price">${fmtMoney(c.price)}₽</div>
        </div>`;
    }).join("");
    state.casesData = d;
  } catch(e) { toast(e.message, "error"); }
}

function showCaseDetail(cid) {
  const c = state.casesData.cases.find(x => x.case_id === cid);
  if (!c) return;
  const bal = state.casesData.balance;

  const fbLimit = LIMITED_CASES_FALLBACK[c.case_id];
  const isLimited = c.is_limited === true || (c.is_limited === undefined && !!fbLimit);
  const totalLimit = c.limit || fbLimit || 0;
  const openedCount = c.opened || 0;
  const leftCount = (c.left !== undefined) ? c.left : Math.max(0, totalLimit - openedCount);
  const isSoldOut = isLimited && leftCount <= 0;

  const itemsHtml = c.items.map(it => {
    const preview = {...emptyOutfit()};
    const slotKey = SLOT_KEY[it.slot];
    preview[slotKey] = {item_id: it.item_id};
    const stats = [];
    if (it.hp) stats.push(`❤️ +${it.hp} HP`);
    if (it.damage) stats.push(`⚔️ +${it.damage} DMG`);
    if (!stats.length) stats.push("—");
    return `<div class="case-modal-item" style="border-color:${it.rarity_color}">
      <div class="case-modal-item-svg">${renderCharacterSVG(preview, {width: 80, height: 160})}</div>
      <div class="case-modal-item-name" style="color:${it.rarity_color}">${it.name}</div>
      <div class="case-modal-item-rarity" style="color:${it.rarity_color};font-size:11px;font-weight:700;margin-bottom:4px;">${it.rarity_name}</div>
      <div class="case-modal-item-chance">${it.chance}%</div>
      <div class="case-modal-item-stats">${stats.join("<br>")}</div>
    </div>`;
  }).join("");

  let limitHtml = "";
  if (isLimited) {
      const pct = totalLimit > 0 ? Math.min(100, (openedCount / totalLimit) * 100) : 0;
      limitHtml = `
        <div style="margin: 12px 0; padding: 12px; background: rgba(231,76,60,0.12); border: 1px solid #e74c3c; border-radius: 10px;">
          <div style="font-weight:900;color:#e74c3c;text-align:center;letter-spacing:0.5px;">🔥 ЛИМИТИРОВАННЫЙ 🔥</div>
          <div style="font-size:12px;color:var(--hint);text-align:center;margin-top:6px;">Глобальный лимит: ${totalLimit} шт. на всю игру</div>
          <div style="width:100%;height:8px;background:#222;border-radius:4px;margin-top:8px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#e74c3c,#ff6b6b);min-width:${pct>0?'4px':'0'};"></div>
          </div>
          <div style="font-size:16px;color:#fff;text-align:center;font-weight:900;margin-top:8px;">Осталось: <span style="color:#e74c3c;">${leftCount} / ${totalLimit}</span></div>
        </div>
      `;
  }

  openModal(`
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:56px">${c.emoji}</div>
      <h2>${c.name}</h2>
      <div style="font-size:20px;font-weight:900;color:var(--money);margin-top:4px">${fmtMoney(c.price)}₽</div>
    </div>
    <div class="case-modal-items">${itemsHtml}</div>
    ${limitHtml}
    <button class="btn btn-primary" onclick="openCase('${cid}')" ${bal < c.price || isSoldOut ? 'disabled' : ''}>
      ${isSoldOut ? '❌ ЛИМИТ ИСЧЕРПАН' : (bal < c.price ? '❌ Не хватает денег' : `🎁 Открыть за ${fmtMoney(c.price)}₽`)}
    </button>
  `);
}

async function openCase(cid) {
  const c = state.casesData.cases.find(x => x.case_id === cid);
  if (!c) return;

  try {
    const d = await api("cases/open", {case_id: cid});
    state.player = d.player;
    renderPlayer();

    if (d.is_limited && d.opened !== undefined) {
        c.opened = d.opened;
        c.left = d.left;
        c.is_limited = true;
        c.limit = d.limit;
    }

    const wonItem = d.won;
    const allItems = c.items;
    const WIN_INDEX = 45;
    const ITEM_WIDTH = 100;

    let stripHtml = "";
    for (let i = 0; i < 60; i++) {
        let it;
        if (i === WIN_INDEX) {
            it = wonItem;
        } else {
            let totalChance = allItems.reduce((sum, item) => sum + item.chance, 0);
            let r = Math.random() * totalChance;
            let acc = 0;
            it = allItems[0];
            for (let item of allItems) {
                acc += item.chance;
                if (r <= acc) { it = item; break; }
            }
        }

        const preview = {...emptyOutfit()};
        preview[SLOT_KEY[it.slot]] = {item_id: it.item_id};

        stripHtml += `<div class="case-roll-item" style="border-bottom: 4px solid ${it.rarity_color}">
            <div class="case-roll-svg">${renderCharacterSVG(preview, {width: 60, height: 120})}</div>
        </div>`;
    }

    openModal(`
        <div style="text-align:center; padding: 20px 0;">
            <h2 style="margin-bottom: 20px;">🎁 Крутим ${c.name}...</h2>
            <div class="case-roll-container" id="case-roll-container">
                <div class="case-roll-marker"></div>
                <div class="case-roll-strip" id="case-roll-strip">
                    ${stripHtml}
                </div>
            </div>
        </div>
    `);

    setTimeout(() => {
        const containerWidth = document.getElementById("case-roll-container").offsetWidth;
        const strip = document.getElementById("case-roll-strip");

        const targetOffset = (WIN_INDEX * ITEM_WIDTH) + (ITEM_WIDTH / 2) - (containerWidth / 2);
        const randomOffset = Math.floor(Math.random() * 60) - 30;
        const finalTranslate = -(targetOffset + randomOffset);

        strip.style.transition = 'transform 5s cubic-bezier(0.1, 0.7, 0.1, 1)';
        strip.style.transform = `translateX(${finalTranslate}px)`;

        setTimeout(() => {
            if (tg) tg.HapticFeedback?.notificationOccurred("success");

            const preview = {...emptyOutfit()};
            preview[SLOT_KEY[wonItem.slot]] = {item_id: wonItem.item_id};

            openModal(`
              <div style="text-align:center;padding:24px 0">
                <div style="font-size:80px;animation:bounce 1s;display:flex;justify-content:center;align-items:center;height:150px;">
                    ${renderCharacterSVG(preview, {width: 100, height: 200})}
                </div>
                <h2 style="color:${wonItem.rarity_color};margin-top:16px">${wonItem.name}</h2>
                <div style="color:${wonItem.rarity_color};font-size:13px;font-weight:800;margin-top:4px">${wonItem.rarity_name}</div>
                <p style="color:var(--hint);margin-top:12px">${wonItem.desc || ''}</p>
                ${_itemStatsHtml(wonItem, 'block')}
                <button class="btn btn-primary" onclick="closeModal();loadCases()" style="margin-top:16px">Забрать</button>
              </div>`);
        }, 5200);
    }, 50);

  } catch(e) {
    toast(e.message, "error");
    loadCases();
  }
}

function showCreateGang() {
  openModal(`
    <h2>🚬 Создать банду</h2>
    <input id="gang-name-input" type="text" maxlength="20" placeholder="Название банды" style="width:100%;padding:12px;background:var(--bg-3);border:none;border-radius:10px;color:#fff;margin:12px 0;font-size:16px">
    <p style="font-size:12px;color:var(--hint);margin-bottom:8px">Эмодзи (1 шт):</p>
    <input id="gang-emoji-input" type="text" maxlength="2" value="🚬" style="width:100%;padding:12px;background:var(--bg-3);border:none;border-radius:10px;color:#fff;font-size:24px;text-align:center;margin-bottom:12px">
    <button class="btn btn-primary" onclick="createGang()">Создать за 50 000₽</button>
  `);
}

async function createGang() {
  const name = $("#gang-name-input").value.trim();
  const emoji = $("#gang-emoji-input").value.trim() || "🚬";
  try {
    await api("gang/create", {name, emoji});
    closeModal(); loadGang();
    toast("🚬 Банда создана!", "success");
  } catch(e) { toast(e.message, "error"); }
}

async function leaveGang() {
  if (!confirm("Покинуть банду?")) return;
  try {
    await api("gang/leave");
    loadGang(); toast("Покинул банду");
  } catch(e) { toast(e.message, "error"); }
}

async function kickMember(uid, nickname) {
  if (!confirm(`Кикнуть ${nickname} из банды?`)) return;
  try {
    await api("gang/kick", {target_id: uid});
    toast(`👢 ${nickname} кикнут`, "success");
    loadGang();
  } catch(e) { toast(e.message, "error"); }
}

async function disbandGang() {
  if (!confirm("УДАЛИТЬ БАНДУ?\n\nВсе территории станут нейтральными, все участники будут выгнаны. Это нельзя отменить.")) return;
  if (!confirm("Точно уверен? Банда будет удалена навсегда.")) return;
  try {
    await api("gang/disband");
    toast("🗑 Банда удалена", "success");
    loadGang();
    refreshPlayer();
  } catch(e) { toast(e.message, "error"); }
}

function showGangDeposit() {
  const amt = prompt("Сколько вложить в казну? (есть: " + fmtMoney(state.player.balance) + "₽)");
  if (!amt) return;
  api("gang/deposit", {amount: parseInt(amt)}).then(() => {
    refreshPlayer().then(() => loadGang());
    toast("💰 Вложено", "success");
  }).catch(e => toast(e.message, "error"));
}

function showGangWithdraw() {
  const amt = prompt("Сколько вывести из казны?");
  if (!amt) return;
  api("gang/withdraw", {amount: parseInt(amt)}).then(() => {
    refreshPlayer().then(() => loadGang());
    toast("💸 Выведено", "success");
  }).catch(e => toast(e.message, "error"));
}

async function showGangShop() {
  try {
    const d = await api("gang/shop/items", {});
    if (d.error) { toast(d.error, "error"); return; }
    const seeds = d.seeds || 0;
    const items = d.items || [];

    const bySlot = {};
    items.forEach(it => {
      if (!bySlot[it.slot]) bySlot[it.slot] = [];
      bySlot[it.slot].push(it);
    });
    const slotOrder = ["head", "body", "legs", "right_hand", "left_hand"];
    const slotNames = {head:"🧢 Голова", body:"👕 Тело", legs:"👖 Ноги", right_hand:"🤚 Пр.рука", left_hand:"🖐 Лев.рука"};

    let html = `<h2>🌻 Магазин банды</h2>
      <div style="background:linear-gradient(135deg,#8b6914,#d4ac0d);border-radius:12px;padding:14px;text-align:center;margin:12px 0;">
        <div style="font-size:11px;color:rgba(0,0,0,.6);text-transform:uppercase;letter-spacing:0.5px;font-weight:700">Твой баланс семечек</div>
        <div style="font-size:32px;font-weight:900;color:#fff;margin-top:4px;text-shadow:0 2px 4px rgba(0,0,0,.3)">${seeds} 🌻</div>
        <div style="font-size:11px;color:rgba(255,255,255,.8);margin-top:4px;">10 🌻/час за каждую территорию клана</div>
      </div>`;

    for (const slot of slotOrder) {
      const list = bySlot[slot];
      if (!list || list.length === 0) continue;
      html += `<h3 class="section-subtitle">${slotNames[slot]}</h3>`;
      list.sort((a,b) => (a.seeds_price || 0) - (b.seeds_price || 0));
      html += list.map(it => {
        const canBuy = seeds >= (it.seeds_price || 0);
        const preview = {...emptyOutfit()};
        preview[SLOT_KEY[it.slot]] = {item_id: it.item_id};
        const stats = [];
        if (it.hp) stats.push(`❤️ +${it.hp} HP`);
        if (it.damage) stats.push(`⚔️ +${it.damage} DMG`);
        return `<div class="item-card" style="border-left-color:${it.rarity_color}">
          <div class="item-preview-mini">${renderCharacterSVG(preview, {width: 40, height: 80})}</div>
          <div class="item-info">
            <div class="item-name" style="color:${it.rarity_color}">${it.name}</div>
            <div class="item-meta" style="color:${it.rarity_color};font-size:10px;font-weight:700">${it.rarity_name}</div>
            <div class="item-meta">${stats.join(" · ") || "—"}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:14px;font-weight:900;color:${canBuy ? '#f39c12' : '#8494a5'}">${it.seeds_price} 🌻</div>
            <button class="btn ${canBuy ? 'btn-primary' : 'btn-secondary'}" style="width:auto;padding:6px 10px;margin:4px 0 0;font-size:11px;" ${canBuy ? `onclick="buyGangShopItem('${it.item_id}')"` : 'disabled'}>
              ${canBuy ? 'Купить' : 'Мало 🌻'}
            </button>
          </div>
        </div>`;
      }).join("");
    }

    html += `<button class="btn btn-secondary" style="margin-top:16px;" onclick="closeModal()">Закрыть</button>`;
    openModal(html);
  } catch(e) { toast(e.message, "error"); }
}

async function buyGangShopItem(iid) {
  try {
    const d = await api("gang/shop/buy", {item_id: iid});
    if (d.error) { toast(d.error, "error"); return; }
    state.player = d.player;
    renderPlayer();
    toast(`✅ Куплено: ${d.bought} (-${d.seeds_spent} 🌻)`, "success");
    showGangShop();
    if (tg) tg.HapticFeedback?.notificationOccurred("success");
  } catch(e) { toast(e.message, "error"); }
}

function formatTerritoryLog(entry, myGid) {
  const tname = entry.territory_name || "территория";
  const etype = entry.event_type;
  const aIsMe = entry.gang_a_id === myGid;
  const bIsMe = entry.gang_b_id === myGid;

  if (etype === "capture_started") {
    if (aIsMe) return { icon: "⏳", text: `Мы начали захват «${tname}»`, color: "#f39c12" };
    return { icon: "⚠️", text: `${entry.gang_a_name} начали захват «${tname}»`, color: "#e74c3c" };
  }
  if (etype === "defense_started") {
    if (aIsMe) return { icon: "🛡", text: `Мы защищаем «${tname}» от ${entry.gang_b_name || "врага"}`, color: "#3498db" };
    return { icon: "⚠️", text: `${entry.gang_a_name} атакуют нашу «${tname}»`, color: "#e74c3c" };
  }
  if (etype === "battle") {
    const myDmg = aIsMe ? entry.gang_a_dmg : entry.gang_b_dmg;
    const enemyDmg = aIsMe ? entry.gang_b_dmg : entry.gang_a_dmg;
    const enemyName = aIsMe ? entry.gang_b_name : entry.gang_a_name;
    const won = entry.winner_gang_id === myGid;
    const result = won ? "ПОБЕДА" : "поражение";
    const icon = won ? "🏆" : "💀";
    const color = won ? "#2ecc71" : "#e74c3c";
    return { icon, text: `Битва за «${tname}»: мы ${myDmg || 0} урона vs ${enemyName} ${enemyDmg || 0} — ${result}`, color };
  }
  if (etype === "capture_complete") {
    if (aIsMe) return { icon: "✅", text: `Захват «${tname}» завершён без боя (урон: ${entry.gang_a_dmg || 0})`, color: "#2ecc71" };
    return { icon: "⚠️", text: `${entry.gang_a_name} захватили «${tname}» без боя`, color: "#e74c3c" };
  }
  if (etype === "disbanded") {
    return { icon: "🗑", text: `Банда ${entry.gang_a_name || ""} расформирована`, color: "#8494a5" };
  }
  return { icon: "•", text: `${etype}: ${tname}`, color: "#8494a5" };
}

async function showTerritoryCapture(tid) {
  try {
    const d = await api("gang/get");
    if (!d.in_gang) { toast("Ты не в банде", "error"); return; }
    const t = d.territories.find(x => x.id === tid);
    if (!t) { toast("Территория не найдена", "error"); return; }
    const g = d.gang;
    const myGid = g.gang_id;
    const isLeader = d.is_leader_or_deputy;

    let statusText = "Ничейная территория";
    if (t.is_contested) statusText = "🔴 Идёт БИТВА (2 претендента)";
    else if (t.capturing_by_us) statusText = "⏳ Мы захватываем";
    else if (t.has_capture) statusText = `⏳ ${t.captures[0].gang_emoji} ${t.captures[0].gang_name} захватывают`;
    else if (t.is_ours) statusText = "🟢 Наша территория";
    else if (t.gang_id) statusText = "🔴 Чужая территория";

    let buttonsHtml = "";
    if (!isLeader) {
      buttonsHtml = `<p style="color:var(--hint);text-align:center;font-size:12px;margin-top:12px">Захват доступен только лидеру и замам</p>`;
    } else if (t.is_contested) {
      buttonsHtml = `<p style="color:var(--danger);text-align:center;font-weight:700;margin-top:12px">⚔️ Битва уже началась</p>`;
    } else if (t.capturing_by_us) {
      buttonsHtml = `<p style="color:var(--success);text-align:center;font-weight:700;margin-top:12px">⏳ Вы уже захватываете</p>`;
    } else if (t.has_capture && t.captures[0].gang_id !== myGid) {
      if (t.is_ours) {
        buttonsHtml = `<button class="btn btn-primary" onclick="captureTerritory(${tid})" style="background:linear-gradient(135deg,#3498db,#2980b9)">🛡 Защитить</button>`;
      } else {
        buttonsHtml = `<button class="btn btn-primary" onclick="captureTerritory(${tid})">⚔️ Помешать захвату</button>`;
      }
    } else if (t.is_ours) {
      buttonsHtml = `<p style="color:var(--success);text-align:center;font-weight:700;margin-top:12px">🟢 Территория под контролем</p>`;
    } else {
      buttonsHtml = `<button class="btn btn-primary" onclick="captureTerritory(${tid})">⚔️ Начать захват (1 час)</button>`;
    }

    openModal(`
      <h2 style="text-align:center">${t.emoji} ${t.name}</h2>
      <p style="margin:16px 0;text-align:center">Доход: <b style="color:var(--money)">+${t.income}₽/ч</b> + <b style="color:#f39c12">10 🌻/ч</b></p>
      <p style="color:var(--hint);margin-bottom:8px;text-align:center">${statusText}</p>
      ${t.has_capture ? `
        <div style="background:rgba(243,156,18,0.1);border:1px solid rgba(243,156,18,0.3);border-radius:10px;padding:10px;margin-bottom:12px;">
          <div style="font-size:11px;color:var(--hint);text-transform:uppercase;margin-bottom:6px;text-align:center">Активные претенденты</div>
          ${t.captures.map(c => `
            <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
              <span>${c.gang_emoji} <b>${escapeHtml(c.gang_name)}</b>${c.gang_id === myGid ? ' (мы)' : ''}</span>
              <span style="color:#f39c12;font-weight:700;">${c.total_damage} урона · ${formatTime(c.left)}</span>
            </div>
          `).join('')}
          ${t.is_contested ? `<div style="text-align:center;font-size:11px;color:#e74c3c;font-weight:700;margin-top:8px;">⚔️ Битва через ${formatTime(t.battle_left)}</div>` : ''}
        </div>` : ''}
      ${buttonsHtml}
      <button class="btn btn-secondary" style="margin-top:8px" onclick="closeModal()">Закрыть</button>
    `);
  } catch(e) { toast(e.message, "error"); }
}

async function captureTerritory(tid) {
  try {
    const d = await api("gang/capture", {territory_id: tid});
    closeModal(); loadGang();
    if (d.battle_pending) toast("⚔️ Битва! Твой урон зафиксирован", "success");
    else if (d.is_defense) toast("🛡 Защита начата!", "success");
    else toast("⚔️ Захват начат! Жди 1 час", "success");
  } catch(e) { toast(e.message, "error"); }
}

async function loadGang() {
  try {
    const d = await api("gang/get");
    const el = $("#gang-content");
    if (!d.in_gang) {
      // Свободное вступление закрыто — показываем только список банд без кнопки "Вступить"
      let listHtml = d.gangs.length > 0 ? d.gangs.map(g => {
        const tagHtml = g.tag ? ` <span class="gang-tag" style="color:${g.tag_color || '#f39c12'};border-color:${g.tag_color || '#f39c12'}">[${escapeHtml(g.tag)}]</span>` : '';
        return `
        <div class="member-row">
          <div style="font-size:22px">${g.emoji}</div>
          <div style="flex:1">
            <div style="font-weight:700">${escapeHtml(g.name)}${tagHtml}</div>
            <div style="font-size:11px;color:var(--hint)">${g.members_count}/10 · казна ${fmtMoney(g.treasury)}₽</div>
          </div>
        </div>`;
      }).join("") : '<p style="color:var(--hint);text-align:center;padding:20px">Банд пока нет</p>';
      el.innerHTML = `
        <h2 class="section-title">🚬 Банды</h2>
        <div style="background:var(--bg-2);border-radius:16px;padding:16px;margin-bottom:16px">
          <p style="margin-bottom:12px">Создай свою банду за <b style="color:var(--money)">50 000₽</b></p>
          <button class="btn btn-primary" onclick="showCreateGang()">🚬 Создать банду</button>
        </div>
        <div style="background:rgba(82,136,193,.08);border:1px solid rgba(82,136,193,.3);border-radius:12px;padding:12px;margin-bottom:16px;font-size:12px;color:var(--hint);line-height:1.5;">
          💡 Вступить в банду можно только по приглашению. Лидер или зам должны пригласить тебя через профиль — приглашение придёт в уведомления (🔔).
        </div>
        <h3 class="section-subtitle">Существующие банды</h3>
        ${listHtml}`;
      return;
    }
    const g = d.gang;
    const myGid = g.gang_id;
    const mySeeds = d.my_seeds || 0;

    const terrHtml = d.territories.map(t => {
      let cls = "neutral", label = "Ничейная", subLine = "";
      if (t.is_contested) {
        cls = "enemy"; label = "⚔️ БИТВА";
        subLine = `<div style="font-size:9px;color:#f39c12;font-weight:900;margin-top:2px;" class="terr-timer" data-left="${t.battle_left}">${formatTime(t.battle_left)}</div>`;
      } else if (t.capturing_by_us) {
        cls = "capturing"; const left = t.captures[0].left; label = "Наш захват";
        subLine = `<div style="font-size:9px;color:#f39c12;font-weight:900;margin-top:2px;" class="terr-timer" data-left="${left}">${formatTime(left)}</div>`;
      } else if (t.has_capture) {
        cls = "capturing"; const c = t.captures[0]; label = `${c.gang_emoji} атакует`;
        subLine = `<div style="font-size:9px;color:#f39c12;font-weight:900;margin-top:2px;" class="terr-timer" data-left="${c.left}">${formatTime(c.left)}</div>`;
      } else if (t.is_ours) { cls = "mine"; label = "Наша"; }
      else if (t.gang_id) { cls = "enemy"; label = "Чужая"; }
      return `<div class="territory ${cls}" onclick="showTerritoryCapture(${t.id})">
        <div class="territory-emoji">${t.emoji}</div>
        <div class="territory-name">${t.name}</div>
        <div class="territory-income">+${t.income}₽ +10🌻/ч</div>
        <div style="font-size:9px;margin-top:2px;font-weight:700">${label}</div>
        ${subLine}
      </div>`;
    }).join("");

    const myRole = d.my_role;
    const membersHtml = d.members.map(m => {
      const roleClass = `role-${m.role}`;
      const roleName = {leader:"Лидер",deputy:"Зам",member:"Боец"}[m.role];
      const isMe = m.user_id === state.player.user_id;

      let actionBtns = "";

      // Для лидера: promote/demote у не-лидера
      if (myRole === "leader" && m.role !== "leader") {
        if (m.role === "member") {
          actionBtns += `<button class="btn btn-secondary" style="width:auto;padding:4px 8px;font-size:10px;margin:0 0 0 4px" onclick="setDeputy(${m.user_id}, 'promote')">Зам</button>`;
        } else if (m.role === "deputy") {
          actionBtns += `<button class="btn btn-secondary" style="width:auto;padding:4px 8px;font-size:10px;margin:0 0 0 4px" onclick="setDeputy(${m.user_id}, 'demote')">-Зам</button>`;
        }
      }

      // Кнопка «Кикнуть»
      // Лидер может кикнуть любого кроме себя (и кроме другого лидера — но лидер один)
      // Зам может кикнуть только member (не лидера, не зама)
      const canKick =
        (myRole === "leader" && m.role !== "leader") ||
        (myRole === "deputy" && m.role === "member");

      if (canKick && !isMe) {
        const nickForJs = jsAttr(m.nickname);
        actionBtns += `<button class="btn btn-secondary" style="width:auto;padding:4px 8px;font-size:10px;margin:0 0 0 4px;color:var(--danger);border-color:rgba(231,76,60,.4);" onclick='kickMember(${m.user_id}, ${nickForJs})'>👢 Кик</button>`;
      }

      return `<div class="member-row">
        <div style="flex:1;min-width:0"><b>${formatNickWithTag(m.nickname, m.gang_tag, m.gang_tag_color)}</b> · ур. ${m.level}</div>
        <span class="member-role ${roleClass}">${roleName}</span>
        ${actionBtns}
      </div>`;
    }).join("");

    const logs = d.territory_log || [];
    let logHtml = "";
    if (logs.length === 0) {
      logHtml = `<div style="background:var(--bg-2);border-radius:12px;padding:16px;text-align:center;color:var(--hint);font-size:12px;">Пока нет событий (макс. 10)</div>`;
    } else {
      logHtml = logs.slice(0, 10).map(entry => {
        const f = formatTerritoryLog(entry, myGid);
        let timeStr = "";
        try {
          const iso = entry.created_at.replace(" ", "T") + "Z";
          timeStr = new Date(iso).toLocaleString("ru-RU", {day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit"});
        } catch(_) {}
        return `<div style="display:flex;gap:8px;padding:10px;background:var(--bg-2);border-radius:10px;margin-bottom:6px;border-left:3px solid ${f.color};">
          <div style="font-size:18px;flex-shrink:0;">${f.icon}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:12px;color:#fff;font-weight:600;line-height:1.3;">${f.text}</div>
            <div style="font-size:10px;color:var(--hint);margin-top:3px;">${timeStr}</div>
          </div>
        </div>`;
      }).join("");
    }

    const tagBanner = g.tag
      ? `<div style="text-align:center;font-weight:900;font-size:18px;margin-top:4px;"><span class="gang-tag" style="color:${g.tag_color || '#f39c12'};border-color:${g.tag_color || '#f39c12'};font-size:1em;padding:2px 8px;">[${escapeHtml(g.tag)}]</span></div>`
      : '';
    const tagEditBtn = myRole === "leader"
      ? `<button class="btn btn-secondary" onclick="showSetTag()" style="margin:8px 0">🏷 ${g.tag ? `Изменить тег [${escapeHtml(g.tag)}]` : 'Установить тег банды'}</button>`
      : '';

    // Нижняя кнопка: лидер → удалить банду, остальные → покинуть
    let bottomBtn = "";
    if (myRole === "leader") {
      bottomBtn = `<button class="btn btn-secondary" style="margin-top:12px;background:rgba(231,76,60,.15);color:var(--danger);border:1px solid rgba(231,76,60,.4);font-weight:800;" onclick="disbandGang()">🗑 Удалить банду</button>`;
    } else {
      bottomBtn = `<button class="btn btn-secondary" style="margin-top:12px" onclick="leaveGang()">🚪 Покинуть банду</button>`;
    }

    el.innerHTML = `
      <div class="gang-banner">
        <div style="font-size:64px">${g.emoji}</div>
        <div class="gang-name">${escapeHtml(g.name)}</div>
        ${tagBanner}
        <div class="gang-treasury">💰 Казна: ${fmtMoney(g.treasury)}₽</div>
        <div style="margin-top:8px;display:inline-block;background:linear-gradient(135deg,#8b6914,#d4ac0d);padding:6px 14px;border-radius:20px;font-weight:900;color:#fff;font-size:14px;">
          🌻 ${mySeeds} семечек
        </div>
      </div>
      <button class="btn btn-secondary" onclick="showGangShop()" style="margin-bottom:8px;background:linear-gradient(135deg,#8b6914,#d4ac0d);color:#fff;border:none;font-weight:700;">🌻 Магазин банды (${mySeeds} 🌻)</button>
      ${tagEditBtn}
      ${d.is_leader_or_deputy ? `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
          <button class="btn btn-primary" onclick="showGangDeposit()" style="margin:0">💰 Вложить</button>
          <button class="btn btn-secondary" onclick="showGangWithdraw()" style="margin:0">💸 Вывести</button>
        </div>
      ` : ''}

      <h3 class="section-subtitle">🗺 Территории (ГЕТТО)</h3>
      <div class="gang-map">${terrHtml}</div>

      <h3 class="section-subtitle">📜 Лог захватов <span style="font-size:11px;color:var(--hint);font-weight:400;">(${logs.length}/10)</span></h3>
      <div style="margin-bottom:16px;">${logHtml}</div>

      <h3 class="section-subtitle">👥 Участники (${d.members.length}/10)</h3>
      ${membersHtml}
      ${bottomBtn}
    `;

    if (window._gangTimer) clearInterval(window._gangTimer);
    window._gangTimer = setInterval(() => {
      document.querySelectorAll('.terr-timer').forEach(el => {
        let left = parseInt(el.dataset.left) - 1;
        if (left < 0) left = 0;
        el.dataset.left = left;
        el.textContent = formatTime(left);
      });
    }, 1000);

  } catch(e) { toast(e.message, "error"); }
}

function showSetTag() {
  const colors = ["#f39c12", "#e74c3c", "#e91e63", "#9b59b6", "#3498db", "#1abc9c", "#2ecc71", "#f1c40f", "#ecf0f1", "#95a5a6"];
  const currentTag = state.player && state.player.gang_tag ? state.player.gang_tag : "";
  let currentColor = "#f39c12";

  const gangs = document.querySelector(".gang-banner");
  if (gangs) {
      const tagSpan = gangs.querySelector(".gang-tag");
      if (tagSpan && tagSpan.style.color) currentColor = tagSpan.style.color;
  }

  window._selectedTagColor = currentColor;

  const colorsHtml = colors.map(c => `
    <div onclick="window._selectedTagColor='${c}'; document.querySelectorAll('.tag-color-swatch').forEach(el=>el.style.borderColor='transparent'); this.style.borderColor='#fff';"
         class="tag-color-swatch" style="width:42px;height:42px;border-radius:50%;background:${c};border:3px solid ${c === currentColor ? '#fff' : 'transparent'};cursor:pointer;transition:transform 0.1s;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
  `).join('');

  openModal(`
    <h2>🏷 Тег банды</h2>
    <p style="color:var(--hint);font-size:13px;margin:12px 0">Ровно 3 буквы (A-Z или А-Я)</p>
    <input id="gang-tag-input" type="text" maxlength="3" placeholder="XXX" value="${currentTag}" style="width:100%;padding:14px;background:var(--bg-3);border:none;border-radius:10px;color:#fff;font-size:22px;text-align:center;letter-spacing:8px;text-transform:uppercase;font-weight:900;">

    <p style="color:var(--hint);font-size:13px;margin:16px 0 8px;">Цвет тега:</p>
    <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:16px;">
      ${colorsHtml}
    </div>

    <button class="btn btn-primary" onclick="setGangTag()" style="margin-top:8px">✅ Сохранить</button>
  `);
}

async function setGangTag() {
  const tag = document.getElementById("gang-tag-input").value.trim().toUpperCase();
  const color = window._selectedTagColor || "#f39c12";
  if (!/^[A-ZА-ЯЁ]{3}$/.test(tag)) {
    toast("Ровно 3 буквы", "error");
    return;
  }
  try {
    await api("gang/set_tag", { tag, color });
    closeModal();
    toast(`🏷 Тег установлен: [${tag}]`, "success");
    refreshPlayer().then(() => loadGang());
  } catch(e) { toast(e.message, "error"); }
}

async function setDeputy(uid, action) {
  try {
    await api("gang/set_deputy", {user_id: uid, action});
    toast(action === "promote" ? "✅ Зам" : "✅ Снят", "success");
    loadGang();
  } catch(e) { toast(e.message, "error"); }
}

async function renderReferral() {
  const countEl = document.getElementById("ref-count");
  const earnedEl = document.getElementById("ref-earned");
  const linkEl = document.getElementById("ref-link-input");
  const milestonesContainer = document.getElementById("ref-milestones");
  if (!countEl) return;

  try {
    const d = await api("referral/info", {});
    if (!d || d.error) throw new Error(d?.error || "Пустой ответ сервера");
    countEl.textContent = d.count;
    earnedEl.textContent = fmtMoney(d.earned);
    linkEl.value = d.link;

    const milestones = [
      { count: 3, reward: 15000, icon: "🎁" },
      { count: 5, reward: 30000, icon: "💰" },
      { count: 10, reward: 100000, icon: "👑" }
    ];
    milestonesContainer.innerHTML = "";

    milestones.forEach(m => {
      const isClaimed = d.claims.includes(m.count);
      const isReady = d.count >= m.count;
      let btnHtml = "";
      if (isClaimed) btnHtml = `<button class="ref-mile-btn" disabled>✅ Получено</button>`;
      else if (isReady) btnHtml = `<button class="ref-mile-btn" onclick="claimRefReward(${m.count})">🎁 Забрать ${fmtMoney(m.reward)}₽</button>`;
      else btnHtml = `<button class="ref-mile-btn" disabled>Нужно еще ${m.count - d.count} чел.</button>`;
      milestonesContainer.innerHTML += `
        <div class="ref-mile-card ${isClaimed ? 'claimed' : ''}">
          <div class="ref-mile-icon">${m.icon}</div>
          <div class="ref-mile-info">
            <div class="ref-mile-title">Пригласи ${m.count} друзей</div>
            <div class="ref-mile-desc">Награда: <span class="ref-mile-reward">${fmtMoney(m.reward)}₽</span></div>
            ${btnHtml}
          </div>
        </div>`;
    });
  } catch(e) {
    linkEl.value = "Ошибка сервера";
    milestonesContainer.innerHTML = `<div style="color:#e74c3c;text-align:center;padding:20px;background:rgba(231,76,60,0.1);border-radius:12px;">Не удалось: ${e.message}</div>`;
  }
}

function copyRefLink() {
  const inp = document.getElementById("ref-link-input");
  inp.select(); inp.setSelectionRange(0, 99999);
  document.execCommand("copy");
  toast("Скопировано!", "success");
}

async function claimRefReward(milestone) {
  try {
    const d = await api("referral/claim", { milestone });
    toast(`🎉 +${d.reward}₽!`, "success");
    state.player.balance += d.reward;
    document.getElementById("money").textContent = fmtMoney(state.player.balance);
    checkCreditPaid(d);
    renderReferral();
  } catch(e) { toast(e.message, "error"); }
}