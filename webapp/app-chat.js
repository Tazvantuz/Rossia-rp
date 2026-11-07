// app-chat.js
// Чат (общий + ЛС), друзья, уведомления

let chatInterval = null;

function startChatPolling() {
  if (chatInterval) clearInterval(chatInterval);
  const tick = () => {
    if (!state.chatWith || state.chatWith === 'global') loadChat();
    else loadPM();
  };
  tick();
  chatInterval = setInterval(tick, 2000);
  
  if (window._convPoll) clearInterval(window._convPoll);
  if (state.player) loadConversations();
  window._convPoll = setInterval(() => {
    if (state.player) loadConversations();
  }, 5000);
}

function stopChatPolling() {
  if (chatInterval) { clearInterval(chatInterval); chatInterval = null; }
  if (window._convPoll) { clearInterval(window._convPoll); window._convPoll = null; }
}

async function loadChat() {
  if (state.chatWith && state.chatWith !== 'global') return;
  try {
    const d = await api("chat/get");
    const el = $("#chat-messages");
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (!d.messages || d.messages.length === 0) {
      el.innerHTML = '<p style="color:var(--hint);text-align:center;padding:40px">Пока нет сообщений. Напиши первым!</p>';
    } else {
      el.innerHTML = d.messages.map(m => {
        let time = "";
        try {
          const iso = m.created_at.replace(" ", "T") + "Z";
          time = new Date(iso).toLocaleTimeString("ru-RU", {hour:"2-digit", minute:"2-digit"});
        } catch(e) {}
        return `<div class="chat-msg">
          <div class="chat-msg-head">
            <span class="chat-nick" onclick="viewPlayer(${m.user_id})">${formatNickWithTag(m.nickname, m.gang_tag, m.gang_tag_color, m.role)}</span>
            <span class="chat-lvl">Ур. ${m.level}</span>
            <span class="chat-time">${time}</span>
          </div>
          <div>${escapeHtml(m.message)}</div>
        </div>`;
      }).join("");
    }
    if (atBottom) el.scrollTop = el.scrollHeight;
  } catch(e) {}
}

function switchChat(mode) {
  if (mode === 'global' || mode === undefined || mode === null) {
    state.chatWith = 'global';
    loadChat();
  } else {
    state.chatWith = Number(mode);
    loadPM();
  }
  renderChatTabs();
}

function openPM(uid, name, tag, color) {
  uid = Number(uid);
  if (!state.openPMs) state.openPMs = [];
  if (!state.openPMs.find(x => Number(x.uid) === uid)) {
    state.openPMs.push({uid: uid, name: name, tag: tag || null, tag_color: color || null, _ts: Date.now()});
  } else {
    const p = state.openPMs.find(x => Number(x.uid) === uid);
    if (tag) p.tag = tag;
    if (color) p.tag_color = color;
    p._ts = Date.now();
  }
  state.chatWith = uid;
  const existing = state.openPMs.find(x => Number(x.uid) === uid);
  if (existing) existing.unread = 0;
  
  renderChatTabs();
  closeModal();
  showTab("chat");
  loadPM();
  loadConversations();
}

function renderChatTabs() {
  const tabs = document.getElementById("chat-tabs");
  if (!tabs) return;
  const isGlobal = !state.chatWith || state.chatWith === 'global';
  let html = `<button class="chat-tab ${isGlobal ? 'active' : ''}" data-chat="global" onclick="switchChat('global')">🌐 Общий</button>`;
  
  let activePm = null;

  if (Array.isArray(state.openPMs)) {
    for (const p of state.openPMs) {
      const isActive = Number(state.chatWith) === Number(p.uid);
      if (isActive) activePm = p;
      const unreadDot = (p.unread && p.unread > 0) ? `<span style="background:#e74c3c;color:#fff;border-radius:8px;padding:0 5px;font-size:10px;margin-left:4px;">${p.unread}</span>` : '';
      const tagHtml = p.tag ? `<span class="gang-tag" style="color:${escapeHtml(p.tag_color || '#f39c12')};border-color:${escapeHtml(p.tag_color || '#f39c12')}">[${escapeHtml(p.tag)}]</span> ` : '';
      html += `<button class="chat-tab ${isActive ? 'active' : ''}" data-chat="${p.uid}" onclick="switchChat(${p.uid})">👤 ${tagHtml}${escapeHtml(p.name)}${getStaffBadge(p.role)}${unreadDot}</button>`;
    }
  }
  tabs.innerHTML = html;

  const header = document.getElementById("chat-pm-header");
  if (header) {
    if (activePm) {
      header.style.display = "flex";
      const tagHtml = activePm.tag ? `<span class="gang-tag" style="color:${escapeHtml(activePm.tag_color || '#f39c12')};border-color:${escapeHtml(activePm.tag_color || '#f39c12')}">[${escapeHtml(activePm.tag)}]</span> ` : '';
      header.innerHTML = `
        <div style="flex:1; font-weight:bold; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          ✉️ ${tagHtml}${escapeHtml(activePm.name)}${getStaffBadge(activePm.role)}
        </div>
        <button onclick="deletePM()" style="background:transparent;border:none;color:#e74c3c;font-size:22px;padding:0 10px;cursor:pointer;line-height:1;" title="Удалить переписку">✕</button>
      `;
    } else {
      header.style.display = "none";
      header.innerHTML = "";
    }
  }
}

async function deletePM() {
  if (!state.chatWith || state.chatWith === 'global') return;
  if (!confirm("Удалить всю переписку с этим игроком? Это действие нельзя отменить.")) return;
  try {
    await api("chat/pm/delete", { with_id: state.chatWith });
    toast("❌ Переписка удалена");
    
    if (state.openPMs) {
      state.openPMs = state.openPMs.filter(x => Number(x.uid) !== Number(state.chatWith));
    }
    state.chatWith = 'global';
    switchChat('global');
    loadConversations();
  } catch(e) {
    toast(e.message, "error");
  }
}

async function loadPM() {
  if (!state.chatWith || state.chatWith === 'global') return;
  try {
    const d = await api("chat/pm/get", { with_id: state.chatWith });
    const el = document.getElementById("chat-messages");
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    el.innerHTML = d.messages.map(m => `
      <div class="chat-msg ${m.from_id === state.player.user_id ? 'my-msg' : ''}">
        <div>${escapeHtml(m.message)}</div>
      </div>
    `).join("");
    if (atBottom) el.scrollTop = el.scrollHeight;
  } catch(e) {}
}

async function sendChat() {
  const inp = document.getElementById("chat-input");
  if (!inp) return;
  const msg = inp.value.trim();
  if (!msg) return;
  try {
    if (!state.chatWith || state.chatWith === 'global') {
      await api("chat/send", { message: msg });
      loadChat();
    } else {
      await api("chat/pm/send", { to_id: state.chatWith, message: msg });
      loadPM();
      updateChatBadge();
      loadConversations();
    }
    inp.value = "";
    if (tg) tg.HapticFeedback?.impactOccurred("light");
  } catch(e) { toast(e.message, "error"); }
}

async function searchFriends() {
  const q = document.getElementById("friend-search-input").value.trim();
  if (q.length < 2) return toast("Минимум 2 символа", "error");
  try {
    const d = await api("friend/search", { query: q });
    const el = document.getElementById("friend-search-results");
    if (d.results.length === 0) el.innerHTML = '<p style="color:var(--hint)">Никого не найдено</p>';
    else {
      el.innerHTML = d.results.map(u => `
        <div class="player-card">
          <div class="player-avatar">👤</div>
          <div class="player-info"><div class="player-name">${formatNickWithTag(u.nickname, u.gang_tag, u.gang_tag_color, u.role)}</div><div class="player-meta">Ур. ${u.level}</div></div>
          <button class="btn btn-primary" style="width:auto;padding:6px 12px;margin:0;font-size:12px;" onclick="sendFriendRequest(${u.user_id})">Добавить</button>
        </div>
      `).join("");
    }
  } catch(e) { toast(e.message, "error"); }
}

async function sendFriendRequest(uid) {
  try {
    await api("friend/request", { target_id: uid });
    toast("Запрос отправлен", "success");
  } catch(e) { toast(e.message, "error"); }
}

async function loadFriends() {
  try {
    const d = await api("friend/list");
    const reqBox = document.getElementById("friend-requests-box");
    if (d.requests.length > 0) {
      const sortedReqs = [...d.requests].sort((a, b) => {
        if (a.is_online !== b.is_online) return b.is_online ? 1 : -1;
        return (b.last_seen || 0) - (a.last_seen || 0);
      });
      reqBox.innerHTML = `<h3 class="section-subtitle" style="color:#f39c12">Запросы (${d.requests.length})</h3>` + sortedReqs.map(r => `
        <div class="player-card">
          <div class="player-info">
            <div class="player-name">${formatNickWithTag(r.nickname, r.gang_tag, r.gang_tag_color, r.role)}</div>
            <div class="player-meta">${_onlineHtml(r.is_online)}${!r.is_online ? ` · <span class="last-seen">${formatLastSeen(r.last_seen)}</span>` : ''}</div>
          </div>
          <button class="btn btn-primary" style="width:auto;padding:6px 12px;margin:0;font-size:12px;" onclick="respondFriend(${r.user_id}, true)">✅</button>
          <button class="btn btn-secondary" style="width:auto;padding:6px 12px;margin:0;font-size:12px;margin-left:4px;" onclick="respondFriend(${r.user_id}, false)">❌</button>
        </div>
      `).join("");
    } else reqBox.innerHTML = "";

    const list = document.getElementById("friend-list");
    if (d.friends.length === 0) list.innerHTML = '<p style="color:var(--hint);text-align:center;">Пока нет друзей</p>';
    else {
      const sortedFriends = [...d.friends].sort((a, b) => {
        if (a.is_online !== b.is_online) return b.is_online ? 1 : -1;
        return (b.last_seen || 0) - (a.last_seen || 0);
      });
      list.innerHTML = sortedFriends.map(f => {
        const nickJs = jsAttr(f.nickname);
        const tagJs  = jsAttr(f.gang_tag || '');
        const colJs  = jsAttr(f.gang_tag_color || '');
        return `
        <div class="player-card" onclick="viewPlayer(${f.user_id})">
          <div class="player-avatar">👤</div>
          <div class="player-info">
            <div class="player-name">${formatNickWithTag(f.nickname, f.gang_tag, f.gang_tag_color, f.role)}</div>
            <div class="player-meta">Ур. ${f.level} · ${_onlineHtml(f.is_online)}${!f.is_online ? ` · <span class="last-seen">${formatLastSeen(f.last_seen)}</span>` : ''}</div>
          </div>
          <button class="btn btn-secondary" style="width:auto;padding:6px 12px;margin:0;font-size:12px;" onclick='event.stopPropagation(); openPM(${f.user_id}, ${nickJs}, ${tagJs}, ${colJs})'>✉️ ЛС</button>
          <button class="btn btn-secondary" style="width:auto;padding:6px 8px;margin:0 0 0 4px;font-size:12px;color:var(--danger);" onclick='event.stopPropagation(); removeFriend(${f.user_id}, ${nickJs})'>✕</button>
        </div>
      `;
      }).join("");
    }
  } catch(e) { toast(e.message, "error"); }
}

async function removeFriend(uid, nickname) {
  if (!confirm(`Удалить ${nickname || 'игрока'} из друзей?`)) return;
  try {
    await api("friend/remove", {target_id: uid});
    toast("❌ Удалён из друзей");
    closeModal();
    const ft = document.querySelector('.tab-content[data-tab="friends"]');
    if (ft && ft.classList.contains('active')) loadFriends();
  } catch(e) { toast(e.message, "error"); }
}

async function respondFriend(uid, accept) {
  try {
    await api("friend/respond", { target_id: uid, accept });
    loadFriends();
  } catch(e) { toast(e.message, "error"); }
}

async function loadNotifications() {
  try {
    const d = await api("notifications/get");
    const badge = document.getElementById("bell-badge");
    if (badge) {
      if (d.unread > 0) { badge.textContent = d.unread; badge.classList.remove("hidden"); }
      else { badge.classList.add("hidden"); }
    }
  } catch(e) {}
}

function showNotifications() {
  api("notifications/get").then(d => {
    let html = '<h2>🔔 Уведомления</h2>';
    if (d.notifications.length === 0) {
      html += '<p style="color:var(--hint);text-align:center;padding:20px;">Пусто</p>';
    } else {
      html += d.notifications.map(n => {
        const hideBtn = `<button class="btn btn-secondary" style="width:auto;padding:6px 10px;margin:0;font-size:14px;float:right;color:var(--hint);" onclick="hideNotification(${n.id})">✕</button>`;
        let actions = "";
        let notifData = {};
        try { notifData = JSON.parse(n.data || '{}'); } catch(_) {}

        if (n.type === 'gang_invite' && !n.is_read) {
          actions = `<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
            <button class="btn btn-primary" style="margin:0;width:100%;padding:14px;font-size:15px;" onclick="acceptGangInvite(${n.id})">✅ Принять приглашение</button>
            <button class="btn btn-secondary" style="margin:0;width:100%;padding:14px;font-size:15px;" onclick="declineGangInvite(${n.id})">❌ Отклонить</button>
          </div>`;
        }
        if (n.type === 'pvp' && n.seconds_left !== undefined) {
          const sl = n.seconds_left || 0;
          const timerText = sl > 0 ? `<span style="color:var(--danger);font-weight:700;">⏰ ${sl} сек на ответ</span>` : '<span style="color:var(--danger);">⏰ Время истекло</span>';
          if (notifData.battle_id && sl > 0) {
            actions = `<div style="margin-top:8px;font-size:12px;">${timerText}</div>
              <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
                <button class="btn btn-primary" style="margin:0;width:100%;padding:14px;font-size:15px;background:linear-gradient(135deg,#c0392b,#e74c3c);" onclick="respondPvPFromNotif(${notifData.battle_id}, true, ${n.id})">⚔️ Принять бой</button>
                <button class="btn btn-secondary" style="margin:0;width:100%;padding:14px;font-size:15px;" onclick="respondPvPFromNotif(${notifData.battle_id}, false, ${n.id})">❌ Отказаться</button>
              </div>`;
          } else {
            actions = `<div style="margin-top:8px;font-size:12px;">${timerText}</div>`;
          }
        }
        if (n.type === 'trade') {
          actions = `<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
            <button class="btn btn-primary" style="margin:0;width:100%;padding:12px;font-size:14px;" onclick="showTradeDetailsModal(${notifData.trade_id})">👀 Посмотреть трейд</button>
          </div>`;
        }
        if (n.type === 'friend') {
          actions = `<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
            <button class="btn btn-primary" style="margin:0;width:100%;padding:12px;font-size:14px;" onclick="respondFriendFromNotif(${notifData.user_id}, true, ${n.id})">✅ Принять заявку</button>
            <button class="btn btn-secondary" style="margin:0;width:100%;padding:12px;font-size:14px;" onclick="respondFriendFromNotif(${notifData.user_id}, false, ${n.id})">❌ Отклонить</button>
          </div>`;
        }
        if (n.type === 'mute') {
          actions = `<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
            <button class="btn btn-secondary" style="margin:0;width:100%;padding:12px;font-size:14px;background:var(--bg-3);color:#fff;" onclick="hideNotification(${n.id})">Прочитано</button>
          </div>`;
        }

        return `<div style="padding:12px; background:var(--bg-3); border-radius:10px; margin-bottom:8px; font-size:13px; ${n.is_read ? 'opacity:0.6' : ''}; overflow:hidden;">
          ${hideBtn}
          <div style="padding-right:40px;">${n.text}</div>
          ${actions}
        </div>`;
      }).join("");
    }
    openModal(html);
    api("notifications/read");
    const badge = document.getElementById("bell-badge");
    if (badge) badge.classList.add("hidden");

    if (window._notifRefresh) clearInterval(window._notifRefresh);
    if (d.notifications.some(n => n.type === 'pvp' && n.seconds_left > 0)) {
      window._notifRefresh = setInterval(() => {
        const modal = document.getElementById("modal");
        if (!modal || modal.classList.contains("hidden")) {
          clearInterval(window._notifRefresh);
          window._notifRefresh = null;
          return;
        }
        showNotificationsSilent();
      }, 3000);
    }
  });
}

async function showNotificationsSilent() {
  try {
    const d = await api("notifications/get");
    if (!d.notifications.some(n => n.type === 'pvp' && n.seconds_left > 0)) {
      if (window._notifRefresh) { clearInterval(window._notifRefresh); window._notifRefresh = null; }
    }
  } catch(_) {}
}

async function respondPvPFromNotif(bid, accept, nid) {
  try {
    await api("pvp/respond", {battle_id: bid, accept});
    await api("notifications/delete", {notification_id: nid});
    closeModal();
    if (accept) startPvPUI(bid);
    else toast("❌ Отказался");
  } catch(e) { toast(e.message, "error"); }
}

async function respondFriendFromNotif(uid, accept, nid) {
  try {
    await api("friend/respond", {target_id: uid, accept});
    await api("notifications/delete", {notification_id: nid});
    toast(accept ? "✅ Добавлен в друзья" : "❌ Отклонено");
    closeModal();
    loadFriends();
  } catch(e) { toast(e.message, "error"); }
}

async function hideNotification(nid) {
  try {
    await api("notifications/delete", {notification_id: nid});
    showNotifications();
  } catch(e) { toast(e.message, "error"); }
}

async function acceptGangInvite(nid) {
  try {
    await api("gang/invite/accept", {notification_id: nid});
    toast("✅ Вступил в банду!", "success");
    closeModal();
    refreshPlayer();
  } catch(e) { toast(e.message, "error"); }
}

async function declineGangInvite(nid) {
  try {
    await api("gang/invite/decline", {notification_id: nid});
    toast("❌ Приглашение отклонено");
    showNotifications();
  } catch(e) { toast(e.message, "error"); }
}

async function inviteToGang(uid, nickname) {
  try {
    await api("gang/invite", {target_id: uid});
    toast(`✅ Приглашение отправлено ${nickname}`, "success");
    closeModal();
  } catch(e) { toast(e.message, "error"); }
}