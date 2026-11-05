// app-pvp.js
// PvP (Гоп-стоп): вызов, принятие, бой

let pvpCurrentBattle = null;
let pvpTimerInterval = null;
let pvpMyTurnPart = null;
let pvpMyTurnAction = null;

// ══════════════════════════════════════════════════════════════
//  ВЫЗОВ НА БОЙ
// ══════════════════════════════════════════════════════════════
async function challengePvP(uid, name) {
  if (!confirm(`Вызвать ${name} на гоп-стоп?`)) return;
  try {
    const res = await api("pvp/challenge", {user_id: uid});
    closeModal();
    toast(`⚔️ Вызов отправлен ${name}`, "success");
    if (res && res.battle_id) startPvPUI(res.battle_id);
  } catch(e) {
    if (e.message && (e.message.includes("Уже есть бой") || e.message.includes("Уже в бою"))) {
      if (confirm("У тебя зависший бой. Сбросить и вызвать снова?")) {
        try {
          await api("pvp/force_cancel", {});
          const res = await api("pvp/challenge", {user_id: uid});
          closeModal();
          toast(`⚔️ Вызов отправлен ${name}`, "success");
          if (res && res.battle_id) startPvPUI(res.battle_id);
        } catch(e2) { toast(e2.message, "error"); }
      }
    } else {
      toast(e.message, "error");
    }
  }
}

// ══════════════════════════════════════════════════════════════
//  ВХОДЯЩИЕ ВЫЗОВЫ (проверка каждые 5 сек)
// ══════════════════════════════════════════════════════════════
async function checkPvPChallenges() {
  try {
    const d = await api("pvp/incoming");
    // Активные бои — сразу открываем UI
    if (d.active && d.active.length > 0) {
      const active = d.active[0];
      if (!pvpCurrentBattle || pvpCurrentBattle !== active.battle_id) {
        startPvPUI(active.battle_id);
        return;
      }
    }
    if (!d.challenges || d.challenges.length === 0) return;
    const c = d.challenges[0];
    if (window._activePvPChallenge === c.battle_id) return;
    window._activePvPChallenge = c.battle_id;

    let secondsLeft = 30;
    try {
      const created = new Date(c.created_at.replace(" ", "T") + "Z");
      secondsLeft = Math.max(0, 30 - Math.floor((Date.now() - created.getTime()) / 1000));
    } catch(_) {}

    if (secondsLeft <= 0) {
      try { await api("pvp/respond", {battle_id: c.battle_id, accept: false}); } catch(_) {}
      window._activePvPChallenge = null;
      return;
    }

    const render = (sl) => {
      openModal(`
        <h2 style="text-align:center">⚔️ Гоп-стоп</h2>
        <p style="margin:16px 0;text-align:center"><b>${formatNickWithTag(c.attacker_name, c.attacker_gang_tag)}</b> хочет напасть на тебя!</p>
        <p style="color:var(--danger);font-size:13px;margin-bottom:8px;text-align:center">При проигрыше отдашь 10% денег</p>
        <p style="text-align:center;font-size:18px;font-weight:800;color:${sl > 10 ? 'var(--success)' : 'var(--danger)'};margin:16px 0;">⏰ Осталось: ${sl} сек</p>
        <button class="btn btn-primary" style="padding:16px;font-size:16px;" onclick="respondPvP(${c.battle_id}, true)">⚔️ Принять бой</button>
        <button class="btn btn-secondary" style="padding:16px;font-size:16px;" onclick="respondPvP(${c.battle_id}, false)">❌ Отказаться</button>
      `);
    };

    render(secondsLeft);
    if (window._pvpChalTimer) clearInterval(window._pvpChalTimer);
    window._pvpChalTimer = setInterval(async () => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        clearInterval(window._pvpChalTimer);
        window._pvpChalTimer = null;
        window._activePvPChallenge = null;
        try {
          await api("pvp/respond", {battle_id: c.battle_id, accept: false});
          closeModal();
          toast("⏰ Время на ответ истекло", "error");
        } catch(_) {}
      } else {
        const timerEl = document.querySelector('#modal-body p[style*="Осталось"]');
        if (timerEl) {
          timerEl.textContent = `⏰ Осталось: ${secondsLeft} сек`;
          timerEl.style.color = secondsLeft > 10 ? 'var(--success)' : 'var(--danger)';
        }
      }
    }, 1000);
  } catch(e) {}
}

async function respondPvP(bid, accept) {
  try {
    await api("pvp/respond", {battle_id: bid, accept});
    if (window._pvpChalTimer) { clearInterval(window._pvpChalTimer); window._pvpChalTimer = null; }
    window._activePvPChallenge = null;
    closeModal();
    if (accept) startPvPUI(bid);
    else toast("Отказался");
  } catch(e) { toast(e.message, "error"); }
}

// ══════════════════════════════════════════════════════════════
//  PVP UI
// ══════════════════════════════════════════════════════════════
async function startPvPUI(bid) {
  if (pvpTimerInterval) { clearInterval(pvpTimerInterval); pvpTimerInterval = null; }
  pvpCurrentBattle = bid;
  pvpMyTurnPart = null;
  pvpMyTurnAction = null;
  loadPvPState(bid);
  // Авто-обновление каждые 3 сек
  pvpTimerInterval = setInterval(() => {
    if (pvpCurrentBattle) loadPvPState(pvpCurrentBattle, true);
    else { clearInterval(pvpTimerInterval); pvpTimerInterval = null; }
  }, 3000);
}

async function loadPvPState(bid, silent = false) {
  try {
    const d = await api("pvp/state", {battle_id: bid});
    if (d.status === "finished") {
      if (pvpTimerInterval) { clearInterval(pvpTimerInterval); pvpTimerInterval = null; }
      pvpCurrentBattle = null;
      closeModal();
      toast(d.timeout ? "⏰ Время вышло! Бой окончен." : "⚔️ Бой окончен!", d.timeout ? "error" : "success");
      refreshPlayer();
      return;
    }
    if (d.status === "expired" || d.status === "declined") {
      if (pvpTimerInterval) { clearInterval(pvpTimerInterval); pvpTimerInterval = null; }
      pvpCurrentBattle = null;
      closeModal();
      toast(d.status === "expired" ? "⏰ Вызов истёк" : "❌ Вызов отклонён", "error");
      return;
    }
    if (d.status === "pending") {
      if (!silent) toast("Ждём ответа соперника...");
      return;
    }
    const isMyTurn = Number(d.turn) === Number(state.player.user_id);
    const mustAttack = isMyTurn && !d.pending_attack_part;
    const mustDefend = isMyTurn && d.pending_attack_part;

    const logHtml = (d.log || []).slice(-5).map(l => {
      if (l.type === "hit") return `💥 ${l.attacker} → ${l.part}: -${l.damage}`;
      if (l.type === "block") return `🛡 ${l.attacker}: блок ${l.part}`;
      if (l.type === "defend") return `🛡 ${l.player}: защита ${l.part}`;
      return "";
    }).join("<br>");

    const myPart = d.is_attacker ? "attacker" : "defender";
    const enemyPart = d.is_attacker ? "defender" : "attacker";
    const me = d[myPart]; const enemy = d[enemyPart];

    openModal(`
      <h2 style="text-align:center;margin-bottom:12px">⚔️ Гоп-стоп</h2>
      <div class="pvp-card">
        <div class="pvp-hp-row"><span>${formatNickWithTag(enemy.nickname, enemy.gang_tag)}</span><span>${enemy.hp}/${enemy.max_hp}</span></div>
        <div class="pvp-hp-bar"><div class="pvp-hp-fill" style="width:${enemy.hp/enemy.max_hp*100}%"></div></div>
        <div class="pvp-hp-row" style="margin-top:12px"><span>${formatNickWithTag(me.nickname, me.gang_tag)} (ты)</span><span>${me.hp}/${me.max_hp}</span></div>
        <div class="pvp-hp-bar"><div class="pvp-hp-fill" style="width:${me.hp/me.max_hp*100}%"></div></div>
      </div>
      ${logHtml ? `<div class="pvp-log">${logHtml}</div>` : ''}
      ${isMyTurn ? `
        <p style="font-weight:700;margin:16px 0 8px">${mustAttack ? 'Твой ход — куда бьём?' : 'Твой ход — что защищаем?'}</p>
        <button class="pvp-part-btn" onclick="pvpDoAction('${mustAttack ? 'attack' : 'defend'}', 'head')">🎯 Голова</button>
        <button class="pvp-part-btn" onclick="pvpDoAction('${mustAttack ? 'attack' : 'defend'}', 'torso')">🎯 Торс</button>
        <button class="pvp-part-btn" onclick="pvpDoAction('${mustAttack ? 'attack' : 'defend'}', 'legs')">🎯 Ноги</button>
      ` : `<p style="text-align:center;padding:20px;color:var(--hint)">⏳ Ход противника...</p>`}
    `);
  } catch(e) {
    if (!silent) toast(e.message, "error");
  }
}

async function pvpDoAction(action, part) {
  try {
    const d = await api("pvp/action", {battle_id: pvpCurrentBattle, action, part});
    if (d.finished) {
      openModal(`
        <div style="text-align:center;padding:20px 0">
          <div style="font-size:80px">${d.winner_id === state.player.user_id ? '🏆' : '💀'}</div>
          <h2 style="margin-top:16px">${d.winner_id === state.player.user_id ? 'ПОБЕДА!' : 'Поражение'}</h2>
          <p style="margin-top:12px">${d.winner_id === state.player.user_id ? `Ты отжал ${fmtMoney(d.steal)}₽` : `У тебя отжали ${fmtMoney(d.steal)}₽`}</p>
          <button class="btn btn-primary" onclick="closeModal();refreshPlayer()" style="margin-top:16px">OK</button>
        </div>`);
      refreshPlayer();
      return;
    }
    loadPvPState(pvpCurrentBattle);
  } catch(e) { toast(e.message, "error"); }
}

// ══════════════════════════════════════════════════════════════
//  СТАРТ polling — как только DOM готов
// ══════════════════════════════════════════════════════════════
setInterval(checkPvPChallenges, 5000);