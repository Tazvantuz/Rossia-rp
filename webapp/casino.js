// casino.js
// ═══════════ КАЗИНО ═══════════
state.casinoGame = 'coin';
state.coinChoice = 'Орёл';
state.diceChoice = 'Больше 3';
state.rouletteChoice = 'red';
state.rouletteNumber = null;

// ═══════════ МОНЕТКА: накопительный угол ═══════════
// Каждый бросок добавляет +1800° (5 оборотов) к текущему углу
// плюс доводит до 0° (Орёл) или 180° (Решка). Так CSS-transition
// всегда видит изменение transform и запускается заново — даже
// если два раза подряд выпал «Орёл».
state.coinAngle = 0;

// Флаг «идёт запрос/анимация» — блокирует повторные клики
state.casinoBusy = false;

// ═══════════ БЛЭКДЖЕК STATE ═══════════
state.bjGame = null;
state.bjPrevPlayer = [];
state.bjPrevDealer = [];
state.bjPrevDealerHiddenIdx = -1;
state.bjBusy = false;

// ═══════════ НЕДОСТАЮЩИЕ ФУНКЦИИ СТАВОК ═══════════
function setBet(v) {
  const inp = document.getElementById("bet-input");
  if (!inp) return;
  if (v === "max") inp.value = state.player.balance;
  else inp.value = v;
}

function doubleBet() {
  const inp = document.getElementById("bet-input");
  if (!inp) return;
  const cur = parseInt(inp.value) || 0;
  inp.value = Math.max(1, cur * 2);
}

function halveBet() {
  const inp = document.getElementById("bet-input");
  if (!inp) return;
  const cur = parseInt(inp.value) || 0;
  inp.value = Math.max(1, Math.floor(cur / 2));
}

// ═══════════ ОСНОВНАЯ ЛОГИКА ═══════════
function switchCasinoGame(game) {
  state.casinoGame = game;
  state.rouletteChoice = 'red';
  state.rouletteNumber = null;
  renderCasino();
  if (game === 'blackjack') {
    loadBlackjackState().then(() => {
      if (state.casinoGame === 'blackjack') renderCasino();
    });
  }
}

function renderCasino() {
  const stage = document.getElementById('casino-stage');
  if (!stage) return;

  document.querySelectorAll('.casino-menu-item').forEach(el => {
    el.classList.toggle('active', el.dataset.game === state.casinoGame);
  });

  // Управление видимостью общего bet-panel и result
  const isBJ = state.casinoGame === 'blackjack';
  const betPanel = document.querySelector('.bet-panel');
  const resultEl = document.getElementById('casino-result');
  if (betPanel) betPanel.style.display = isBJ ? 'none' : '';
  if (resultEl) {
    resultEl.style.display = isBJ ? 'none' : '';
    resultEl.textContent = '';
    resultEl.style.color = '#fff';
  }
  stage.classList.toggle('bj-stage', isBJ);

  if (state.casinoGame === 'coin') {
    // Монета НЕ кликабельна — игру запускает только кнопка «Играть».
    // Текущий угол монеты сохраняется через inline-style,
    // чтобы при возврате из другой игры монета осталась в нужной позиции.
    stage.innerHTML = `
      <div style="display:flex;gap:8px;margin-bottom:15px;width:100%;max-width:300px;">
        <button class="btn ${state.coinChoice==='Орёл'?'btn-primary':'btn-secondary'}" style="flex:1;" onclick="state.coinChoice='Орёл';renderCasino()">🦅 Орёл</button>
        <button class="btn ${state.coinChoice==='Решка'?'btn-primary':'btn-secondary'}" style="flex:1;" onclick="state.coinChoice='Решка';renderCasino()">🪙 Решка</button>
      </div>
      <div class="coin-container" style="cursor:default;">
        <div class="coin" id="coin-el" style="transform: rotateY(${state.coinAngle || 0}deg)">
          <div class="coin-side coin-front">🦅</div>
          <div class="coin-side coin-back">🪙</div>
        </div>
      </div>
    `;
  } else if (state.casinoGame === 'dice') {
    stage.innerHTML = `
      <div style="display:flex;gap:8px;margin-bottom:15px;width:100%;max-width:300px;">
        <button class="btn ${state.diceChoice==='Больше 3'?'btn-primary':'btn-secondary'}" style="flex:1;" onclick="state.diceChoice='Больше 3';renderCasino()">Больше 3</button>
        <button class="btn ${state.diceChoice==='Меньше 4'?'btn-primary':'btn-secondary'}" style="flex:1;" onclick="state.diceChoice='Меньше 4';renderCasino()">Меньше 4</button>
      </div>
      <div class="dice-container" id="dice-el" style="width:110px;height:110px;background:linear-gradient(135deg,#fafafa,#c8c8c8);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:64px;font-weight:900;color:#1a1a1a;box-shadow:0 10px 28px rgba(0,0,0,0.5), inset 0 -5px 10px rgba(0,0,0,0.15), inset 0 3px 6px rgba(255,255,255,0.7);border:3px solid #f39c12;">?</div>
    `;
  } else if (state.casinoGame === 'roulette') {
    let html = `<div class="roulette-table" id="roulette-table">`;
    html += `<div class="roulette-cell green ${state.rouletteChoice==='green'?'selected':''}" onclick="state.rouletteChoice='green';state.rouletteNumber=null;renderCasino()">ЗЕРО (x14)</div>`;
    for (let i = 1; i <= 36; i++) {
      const isRed = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(i);
      const color = isRed ? 'red' : 'black';
      const sel = (state.rouletteChoice === i || state.rouletteNumber === i) ? 'selected' : '';
      html += `<div class="roulette-cell ${color} ${sel}" onclick="state.rouletteChoice='number';state.rouletteNumber=${i};renderCasino()">${i}</div>`;
    }
    html += `</div>`;
    html += `<div style="display:flex;gap:8px;margin-top:12px;width:100%;max-width:300px;">
      <div class="roulette-cell red ${state.rouletteChoice==='red'?'selected':''}" style="flex:1;" onclick="state.rouletteChoice='red';state.rouletteNumber=null;renderCasino()">КРАСНОЕ (x2)</div>
      <div class="roulette-cell black ${state.rouletteChoice==='black'?'selected':''}" style="flex:1;" onclick="state.rouletteChoice='black';state.rouletteNumber=null;renderCasino()">ЧЕРНОЕ (x2)</div>
    </div>`;
    html += `<div style="display:flex;gap:8px;margin-top:8px;width:100%;max-width:300px;">
      <div class="roulette-cell ${state.rouletteChoice==='even'?'selected':''}" style="flex:1;" onclick="state.rouletteChoice='even';state.rouletteNumber=null;renderCasino()">ЧЁТ (x2)</div>
      <div class="roulette-cell ${state.rouletteChoice==='odd'?'selected':''}" style="flex:1;" onclick="state.rouletteChoice='odd';state.rouletteNumber=null;renderCasino()">НЕЧЁТ (x2)</div>
    </div>`;
    stage.innerHTML = html;
  } else if (state.casinoGame === 'slots') {
    stage.innerHTML = `
      <div class="slots-machine" id="slots-machine">
        <div class="slot-reel"><div class="slot-strip" id="reel1"><div class="slot-item">🍒</div></div></div>
        <div class="slot-reel"><div class="slot-strip" id="reel2"><div class="slot-item">🍋</div></div></div>
        <div class="slot-reel"><div class="slot-strip" id="reel3"><div class="slot-item">💎</div></div></div>
      </div>
      <div style="margin-top:15px;color:#f39c12;font-weight:bold;">3 💎 — ДЖЕКПОТ (x50)</div>
    `;
  } else if (state.casinoGame === 'blackjack') {
    renderBlackjackStage(stage);
  }
}

async function playCasino() {
  // Уже идёт запрос/анимация — игнорируем клик (без toast, чтобы не спамить)
  if (state.casinoBusy) return;

  // КД ещё не прошёл — показываем таймер
  if (state.casinoLocked && Date.now() - state.casinoLockTime < 5000) {
    toast(`⏳ Кд ${Math.ceil((state.casinoLockTime + 5000 - Date.now())/1000)}с`, "error");
    return;
  }

  const betInput = document.getElementById("bet-input");
  const bet = parseInt(betInput?.value) || 0;
  if (bet <= 0) { toast("Введи ставку", "error"); return; }
  if (bet > state.player.balance) { toast("Не хватает денег", "error"); return; }

  const game = state.casinoGame;
  const resEl = document.getElementById('casino-result');
  resEl.textContent = "Крутим...";
  resEl.style.color = "#fff";

  // Ставим лок СРАЗУ (как на бэкенде: last_casino = now при старте игры).
  // Кнопку не дизейблим — иначе клик по ней не проходит и toast с КД не покажется.
  state.casinoBusy = true;
  state.casinoLocked = true;
  state.casinoLockTime = Date.now();

  try {
    const payload = { game, bet };
    if (game === 'roulette') {
      payload.choice = state.rouletteChoice;
      if (state.rouletteChoice === 'number') payload.number = state.rouletteNumber;
    } else if (game === 'coin') {
      payload.choice = state.coinChoice;
    } else if (game === 'dice') {
      payload.choice = state.diceChoice;
    }

    const d = await api("casino_play", payload);

    if (game === 'coin') {
      const coin = document.getElementById('coin-el');
      if (coin) {
        const isHeads = d.result.includes("Орёл");
        // Накопительный угол: текущий + 5 оборотов + доводка до нужной стороны.
        const current = state.coinAngle || 0;
        const currentMod = ((current % 360) + 360) % 360;   // 0..359
        const targetMod = isHeads ? 0 : 180;                 // 0 = Орёл, 180 = Решка
        const delta = (targetMod - currentMod + 360) % 360;  // сколько добавить
        const target = current + 1800 + delta;               // всегда > текущего
        state.coinAngle = target;
        coin.style.transform = `rotateY(${target}deg)`;
      }
      await new Promise(r => setTimeout(r, 2000));

    } else if (game === 'dice') {
      const dEl = document.getElementById('dice-el');
      if (dEl) {
        dEl.classList.add('rolling');
        const iv = setInterval(() => {
          dEl.textContent = Math.floor(Math.random() * 6) + 1;
        }, 80);
        await new Promise(r => setTimeout(r, 1400));
        clearInterval(iv);
        dEl.classList.remove('rolling');
        const m = d.result.match(/выпало\s+(\d)/);
        const roll = m ? parseInt(m[1]) : 1;
        dEl.textContent = roll;
      } else {
        await new Promise(r => setTimeout(r, 1400));
      }

    } else if (game === 'slots') {
      document.querySelectorAll('.slot-reel').forEach(r => r.classList.add('spinning'));
      ['reel1','reel2','reel3'].forEach(id => {
        let html = '';
        for (let j = 0; j < 10; j++) html += `<div class="slot-item">${['🍒','🍋','🍊','🔔','⭐','💎'][Math.floor(Math.random()*6)]}</div>`;
        document.getElementById(id).innerHTML = html;
      });
      await new Promise(r => setTimeout(r, 2000));
      document.querySelectorAll('.slot-reel').forEach(r => r.classList.remove('spinning'));
    }

    if (d.win > 0) {
      resEl.textContent = `🎉 ВЫИГРЫШ: ${fmtMoney(d.win)}₽`;
      resEl.style.color = "#2ecc71";
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } else {
      resEl.textContent = `😢 ПРОИГРЫШ`;
      resEl.style.color = "#e74c3c";
    }

    if (d.player) {
      state.player = d.player;
      document.getElementById('money').textContent = fmtMoney(state.player.balance);
    }
  } catch(e) {
    resEl.textContent = e.message || "Ошибка сервера";
    toast("Ошибка казино: " + e.message, "error");
    // Игра не состоялась (бэкенд вернул ошибку ДО обновления last_casino) —
    // снимаем лок, чтобы можно было сразу попробовать снова.
    state.casinoLocked = false;
    state.casinoLockTime = 0;
  } finally {
    state.casinoBusy = false;
  }
}

// ══════════════════════════════════════════════════════════════
//  БЛЭКДЖЕК
// ══════════════════════════════════════════════════════════════

function renderPlayingCard(card, opts = {}) {
  const { hidden = false, animClass = '', delay = 0 } = opts;
  const styleAttr = delay > 0 ? ` style="animation-delay:${delay}ms"` : '';
  const animPart = animClass ? ` ${animClass}` : '';

  if (hidden || !card || card.hidden) {
    return `<div class="playing-card playing-card-back${animPart}"${styleAttr}>
      <div class="card-back-pattern"></div>
    </div>`;
  }
  const { rank, suit } = card;
  const isRed = suit === '♥' || suit === '♦';
  const colorClass = isRed ? 'card-red' : 'card-black';
  return `<div class="playing-card ${colorClass}${animPart}"${styleAttr}>
    <div class="card-corner tl">
      <span class="card-rank">${rank}</span>
      <span class="card-suit">${suit}</span>
    </div>
    <div class="card-center-suit">${suit}</div>
    <div class="card-corner br">
      <span class="card-rank">${rank}</span>
      <span class="card-suit">${suit}</span>
    </div>
  </div>`;
}

function renderHandCards(cards, opts = {}) {
  const { key = 'player' } = opts;
  const prevCards = key === 'player' ? state.bjPrevPlayer : state.bjPrevDealer;
  const prevHiddenIdx = key === 'dealer' ? state.bjPrevDealerHiddenIdx : -1;

  let hiddenIdx = -1;
  cards.forEach((c, i) => { if (c && c.hidden) hiddenIdx = i; });

  const html = cards.map((card, idx) => {
    const isHidden = !!card.hidden;
    const wasExisting = idx < prevCards.length;
    const wasHiddenBefore = idx === prevHiddenIdx && prevHiddenIdx >= 0;

    let animClass = '';
    let delay = 0;
    if (!wasExisting) {
      animClass = 'card-deal';
      delay = Math.max(0, idx - prevCards.length) * 120;
    } else if (wasHiddenBefore && !isHidden) {
      animClass = 'card-flip-in';
    }

    return renderPlayingCard(card, { hidden: isHidden, animClass, delay });
  }).join('');

  if (key === 'player') {
    state.bjPrevPlayer = cards.map(c => ({...c}));
  } else {
    state.bjPrevDealer = cards.map(c => ({...c}));
    state.bjPrevDealerHiddenIdx = hiddenIdx;
  }
  return html;
}

function renderBlackjackStage(stage) {
  const g = state.bjGame;

  if (!g) {
    stage.innerHTML = `
      <div class="bj-start">
        <div class="bj-title">🃏 БЛЭКДЖЕК</div>
        <div class="bj-subtitle">Классический 21 · Блэкджек платит 3:2</div>
        <div class="bj-subtitle">Дилер останавливается на 18</div>
        <div class="bj-bet-row">
          <input id="bj-bet-input" type="number" placeholder="Ставка ₽" min="1" value="1000">
        </div>
        <div class="bj-quick-bets">
          <button onclick="bjSetBet(100)">100</button>
          <button onclick="bjSetBet(1000)">1К</button>
          <button onclick="bjSetBet(5000)">5К</button>
          <button onclick="bjSetBet('max')">MAX</button>
        </div>
        <button class="bj-start-btn" onclick="bjStart()">🃏 РАЗДАТЬ</button>
      </div>
    `;
    return;
  }

  const dealerHtml = renderHandCards(g.dealer_cards, { key: 'dealer' });
  const playerHtml = renderHandCards(g.player_cards, { key: 'player' });

  const dealerLabel = (g.reveal_dealer || g.finished)
    ? `ДИЛЕР · ${g.dealer_total}`
    : `ДИЛЕР · ${g.dealer_total} + 🂠`;
  const playerLabel = `ТЫ · ${g.player_total}${g.player_soft && g.player_total < 21 ? ' · мягкие' : ''}`;

  let bottomHtml = '';
  if (g.finished) {
    const resultClass = ['win','blackjack','dealer_bust'].includes(g.result) ? 'win'
      : g.result === 'push' ? 'push' : 'lose';
    const payoutStr = g.payout > 0 ? ` · выплата ${fmtMoney(g.payout)}₽` : '';
    bottomHtml = `
      <div class="bj-result ${resultClass}">${g.message || 'Игра окончена'}${payoutStr}</div>
      <div class="bj-controls">
        <button class="bj-btn bj-new" onclick="bjNewGame()">🔄 НОВАЯ ИГРА</button>
      </div>
    `;
  } else {
    const btns = [];
    if (g.can_hit) btns.push(`<button class="bj-btn bj-hit" onclick="bjHit()">🃏 ВЗЯТЬ</button>`);
    if (g.can_stand) btns.push(`<button class="bj-btn bj-stand" onclick="bjStand()">✋ ХВАТИТ</button>`);
    if (g.can_double) btns.push(`<button class="bj-btn bj-double" onclick="bjDouble()">✖️ x2</button>`);
    bottomHtml = `<div class="bj-controls">${btns.join('')}</div>`;
  }

  stage.innerHTML = `
    <div class="bj-table">
      <div class="bj-dealer-area">
        <div class="bj-area-label">${dealerLabel}</div>
        <div class="bj-hand">${dealerHtml}</div>
      </div>
      <div class="bj-divider"></div>
      <div class="bj-player-area">
        <div class="bj-hand">${playerHtml}</div>
        <div class="bj-area-label">${playerLabel}</div>
      </div>
      ${bottomHtml}
    </div>
  `;
}

async function loadBlackjackState() {
  try {
    const d = await api("casino/blackjack/state");
    if (d.active && d.game && !d.game.finished) {
      state.bjGame = d.game;
      state.bjPrevPlayer = [];
      state.bjPrevDealer = [];
      state.bjPrevDealerHiddenIdx = -1;
    } else {
      state.bjGame = null;
    }
  } catch(e) {
    state.bjGame = null;
  }
}

function bjSetBet(v) {
  const inp = document.getElementById('bj-bet-input');
  if (!inp) return;
  if (v === 'max') inp.value = state.player.balance;
  else inp.value = v;
}

async function bjStart() {
  if (state.bjBusy) return;
  const inp = document.getElementById('bj-bet-input');
  const bet = parseInt(inp?.value) || 0;
  if (bet <= 0) { toast("Введи ставку", "error"); return; }
  if (bet > state.player.balance) { toast("Не хватает денег", "error"); return; }
  state.bjBusy = true;
  try {
    const d = await api("casino/blackjack/start", { bet });
    state.player = d.player;
    document.getElementById('money').textContent = fmtMoney(state.player.balance);
    state.bjPrevPlayer = [];
    state.bjPrevDealer = [];
    state.bjPrevDealerHiddenIdx = -1;
    state.bjGame = d.game;
    renderCasino();
    if (d.game.finished) bjAfterFinish(d.game);
  } catch(e) {
    if (e.message && e.message.includes("активная")) {
      await loadBlackjackState();
      renderCasino();
    } else {
      toast(e.message, "error");
    }
  } finally {
    state.bjBusy = false;
  }
}

async function bjHit() {
  if (state.bjBusy) return;
  state.bjBusy = true;
  try {
    const d = await api("casino/blackjack/hit");
    state.player = d.player;
    document.getElementById('money').textContent = fmtMoney(state.player.balance);
    state.bjGame = d.game;
    renderCasino();
    if (d.game.finished) bjAfterFinish(d.game);
  } catch(e) { toast(e.message, "error"); }
  finally { state.bjBusy = false; }
}

async function bjStand() {
  if (state.bjBusy) return;
  state.bjBusy = true;
  try {
    const d = await api("casino/blackjack/stand");
    state.player = d.player;
    document.getElementById('money').textContent = fmtMoney(state.player.balance);
    state.bjGame = d.game;
    renderCasino();
    bjAfterFinish(d.game);
  } catch(e) { toast(e.message, "error"); }
  finally { state.bjBusy = false; }
}

async function bjDouble() {
  if (state.bjBusy) return;
  state.bjBusy = true;
  try {
    const d = await api("casino/blackjack/double");
    state.player = d.player;
    document.getElementById('money').textContent = fmtMoney(state.player.balance);
    state.bjGame = d.game;
    renderCasino();
    bjAfterFinish(d.game);
  } catch(e) { toast(e.message, "error"); }
  finally { state.bjBusy = false; }
}

function bjNewGame() {
  state.bjGame = null;
  state.bjPrevPlayer = [];
  state.bjPrevDealer = [];
  state.bjPrevDealerHiddenIdx = -1;
  api("casino/blackjack/cancel").catch(()=>{});
  renderCasino();
}

function bjAfterFinish(g) {
  if (!g) return;
  if (g.message) {
    const win = ['win','blackjack','dealer_bust','push'].includes(g.result);
    setTimeout(() => toast(g.message, win ? "success" : "error"), 400);
  }
  if (tg) {
    try {
      if (['win','blackjack','dealer_bust'].includes(g.result)) {
        tg.HapticFeedback?.notificationOccurred("success");
      } else if (g.result === 'lose' || g.result === 'bust') {
        tg.HapticFeedback?.notificationOccurred("error");
      }
    } catch(_) {}
  }
  if (navigator.vibrate) {
    if (['win','blackjack','dealer_bust'].includes(g.result)) navigator.vibrate([100, 50, 100]);
    else navigator.vibrate(200);
  }
}