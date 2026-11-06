// casino.js
// ═══════════ КАЗИНО ═══════════
state.casinoGame = 'coin';
state.coinChoice = 'Орёл';
state.diceChoice = 'Больше 3';
state.rouletteChoice = 'red';
state.rouletteNumber = null;

// ═══════════ МОНЕТКА: накопительный угол ═══════════
state.coinAngle = state.coinAngle || 0;

// ═══════════ КОЛЕСО ФОРТУНЫ ═══════════
const WHEEL_SECTORS = [1, 3, 1, 5, 1, 3, 10, 1, 3, 5, 1, 3, 20, 1, 3, 5, 10, 1, 5, 1];
const WHEEL_MULTIPLIERS = {1: 2, 3: 4, 5: 6, 10: 11, 20: 21};
const WHEEL_COLORS = {
  1: "#4a5568",
  3: "#27ae60",
  5: "#3498db",
  10: "#9b59b6",
  20: "#f39c12",
};
state.wheelAngle = state.wheelAngle || 0;
state.wheelChoice = state.wheelChoice || 1;
state.wheelLastResult = state.wheelLastResult || null;

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

  const isBJ = state.casinoGame === 'blackjack';
  const isWheel = state.casinoGame === 'wheel';

  // bet-panel виден для всего, кроме блекджека (у него свой ввод ставки)
  const betPanel = document.querySelector('.bet-panel');
  if (betPanel) betPanel.style.display = isBJ ? 'none' : '';

  // Общий result-баннер не нужен для блекджека и колеса
  const resultEl = document.getElementById('casino-result');
  if (resultEl) {
    const hideResult = isBJ || isWheel;
    resultEl.style.display = hideResult ? 'none' : '';
    resultEl.textContent = '';
    resultEl.style.color = '#fff';
  }

  // Текст кнопки PLAY: для колеса "КРУТИТЬ"
  const playBtn = document.getElementById('btn-play-casino');
  if (playBtn) {
    playBtn.textContent = isWheel ? '🎡 КРУТИТЬ' : '🎲 ИГРАТЬ';
  }

  stage.classList.toggle('bj-stage', isBJ);
  stage.classList.toggle('wheel-stage', isWheel);

  if (state.casinoGame === 'coin') {
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
  } else if (state.casinoGame === 'wheel') {
    renderWheelStage(stage);
  }
}

async function playCasino() {
  // Для колеса — отдельная логика
  if (state.casinoGame === 'wheel') {
    return spinWheel();
  }

  if (state.casinoBusy) return;

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
        const current = state.coinAngle || 0;
        const currentMod = ((current % 360) + 360) % 360;
        const targetMod = isHeads ? 0 : 180;
        const delta = (targetMod - currentMod + 360) % 360;
        const target = current + 1800 + delta;
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
    state.casinoLocked = false;
    state.casinoLockTime = 0;
  } finally {
    state.casinoBusy = false;
  }
}

// ══════════════════════════════════════════════════════════════
//  КОЛЕСО ФОРТУНЫ
// ══════════════════════════════════════════════════════════════

function buildWheelSVG(chosenValue) {
  const cx = 150, cy = 150, r = 138;
  const N = WHEEL_SECTORS.length;
  const sectorAngle = 360 / N;
  const half = sectorAngle / 2;

  let svg = `<svg viewBox="0 0 300 300" width="300" height="300" class="wheel-svg">`;

  // Градиенты
  svg += `<defs>
    <radialGradient id="wheelHub" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e74c3c"/>
      <stop offset="100%" stop-color="#8b0000"/>
    </radialGradient>
    <linearGradient id="wheelRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f39c12"/>
      <stop offset="50%" stop-color="#ffd700"/>
      <stop offset="100%" stop-color="#b8860b"/>
    </linearGradient>
  </defs>`;

  // Внешний золотой обод
  svg += `<circle cx="${cx}" cy="${cy}" r="${r + 9}" fill="url(#wheelRim)"/>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${r + 2}" fill="#1a0f2e"/>`;

  // Сектора
  WHEEL_SECTORS.forEach((val, i) => {
    const centerDeg = -90 + i * sectorAngle;
    const startDeg = centerDeg - half;
    const endDeg = centerDeg + half;
    const startRad = startDeg * Math.PI / 180;
    const endRad = endDeg * Math.PI / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const color = WHEEL_COLORS[val];
    const isChosen = (chosenValue !== null && val === chosenValue);
    const strokeColor = isChosen ? '#fff' : '#0a0a0a';
    const strokeWidth = isChosen ? 2.5 : 1.2;
    const fillOpacity = (i % 2 === 0) ? 1 : 0.88;

    svg += `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 0,1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${color}" fill-opacity="${fillOpacity}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
    if (isChosen) {
      svg += `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 0,1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="rgba(255,255,255,0.15)" pointer-events="none"/>`;
    }
  });

  // Метки (без поворота — читаются горизонтально)
  WHEEL_SECTORS.forEach((val, i) => {
    const centerDeg = -90 + i * sectorAngle;
    const centerRad = centerDeg * Math.PI / 180;
    const labelR = r * 0.76;
    const lx = cx + labelR * Math.cos(centerRad);
    const ly = cy + labelR * Math.sin(centerRad);
    svg += `<text x="${lx.toFixed(2)}" y="${ly.toFixed(2)}" text-anchor="middle" dominant-baseline="central" font-size="18" font-weight="900" font-family="Arial, sans-serif" fill="#fff" stroke="#000" stroke-width="2.5" paint-order="stroke fill">${val}</text>`;
    const multR = r * 0.52;
    const mx = cx + multR * Math.cos(centerRad);
    const my = cy + multR * Math.sin(centerRad);
    svg += `<text x="${mx.toFixed(2)}" y="${my.toFixed(2)}" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="700" font-family="Arial, sans-serif" fill="#fff" opacity="0.85">x${WHEEL_MULTIPLIERS[val]}</text>`;
  });

  // Центральный хаб
  svg += `<circle cx="${cx}" cy="${cy}" r="34" fill="url(#wheelHub)" stroke="url(#wheelRim)" stroke-width="3"/>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="26" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>`;
  svg += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="900" fill="#fff" letter-spacing="0.5">21</text>`;
  svg += `<text x="${cx}" y="${cy + 11}" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="700" fill="#ffd700" letter-spacing="0.5">★</text>`;

  svg += `</svg>`;
  return svg;
}

function renderWheelStage(stage) {
  const choiceButtonsHtml = Object.keys(WHEEL_MULTIPLIERS).map(valStr => {
    const v = parseInt(valStr);
    const color = WHEEL_COLORS[v];
    const isActive = state.wheelChoice === v;
    return `<button class="wheel-choice ${isActive ? 'active' : ''}" style="--wc:${color}" onclick="pickWheelChoice(${v})">
      <div class="wc-val">${v}</div>
      <div class="wc-mult">x${WHEEL_MULTIPLIERS[v]}</div>
    </button>`;
  }).join('');

  let resultHtml = '';
  if (state.wheelLastResult) {
    const r = state.wheelLastResult;
    const cls = r.won ? 'win' : 'lose';
    const msg = r.won
      ? `🎉 ПОБЕДА! Выпало ${r.sector_value} — выплата ${fmtMoney(r.win)}₽ (x${r.multiplier})`
      : `😢 Выпало ${r.sector_value}. Ты ставил на ${r.choice} (x${WHEEL_MULTIPLIERS[r.choice]})`;
    resultHtml = `<div class="wheel-result ${cls}">${msg}</div>`;
  }

  stage.innerHTML = `
    <div class="wheel-wrap">
      <div class="wheel-pointer"></div>
      <div class="wheel-rotator" id="wheel-rotator" style="transform: rotate(${state.wheelAngle || 0}deg)">
        ${buildWheelSVG(state.wheelChoice)}
      </div>
    </div>
    <div class="wheel-choices">${choiceButtonsHtml}</div>
    ${resultHtml}
  `;
}

function pickWheelChoice(val) {
  state.wheelChoice = val;
  state.wheelLastResult = null;
  renderCasino();
}

async function spinWheel() {
  if (state.casinoBusy) {
    toast("🎡 Уже крутится...", "error");
    return;
  }
  if (state.casinoLocked && Date.now() - state.casinoLockTime < 5000) {
    toast(`⏳ Кд ${Math.ceil((state.casinoLockTime + 5000 - Date.now())/1000)}с`, "error");
    return;
  }
  if (!state.wheelChoice) {
    toast("Выбери сектор", "error");
    return;
  }
  const betInput = document.getElementById("bet-input");
  const bet = parseInt(betInput?.value) || 0;
  if (bet <= 0) { toast("Введи ставку", "error"); return; }
  if (bet > state.player.balance) { toast("Не хватает денег", "error"); return; }

  state.casinoBusy = true;
  state.casinoLocked = true;
  state.casinoLockTime = Date.now();
  state.wheelLastResult = null;

  // Убираем прошлый баннер результата, если был
  const prevResult = document.querySelector('#casino-stage .wheel-result');
  if (prevResult) prevResult.remove();

  try {
    const d = await api("casino/wheel/play", { bet, choice: state.wheelChoice });

    // Анимация: вычисляем угол так, чтобы сектор i (с центра в -90+i*18)
    // оказался под указателем (на -90°). Требуемый поворот = -i*18°.
    // Добавляем 6 полных оборотов и доводку от текущего угла.
    const i = d.sector_index;
    const N = WHEEL_SECTORS.length;
    const sectorAngle = 360 / N;
    const targetMod = (((-i * sectorAngle) % 360) + 360) % 360;
    const current = state.wheelAngle || 0;
    const currentMod = ((current % 360) + 360) % 360;
    const delta = (targetMod - currentMod + 360) % 360;
    const finalAngle = current + 360 * 6 + delta;
    state.wheelAngle = finalAngle;

    const rotator = document.getElementById('wheel-rotator');
    if (rotator) {
      rotator.style.transition = 'transform 4.5s cubic-bezier(0.15, 0.8, 0.25, 1)';
      rotator.style.transform = `rotate(${finalAngle}deg)`;
    }

    await new Promise(r => setTimeout(r, 4600));

    if (d.player) {
      state.player = d.player;
      document.getElementById('money').textContent = fmtMoney(state.player.balance);
    }

    state.wheelLastResult = {
      won: d.won,
      sector_value: d.sector_value,
      choice: d.choice,
      win: d.win,
      multiplier: d.multiplier,
    };

    // Показываем результат под колесом (без полной перерисовки — сохраняем позицию)
    if (state.casinoGame === 'wheel') {
      const stage = document.getElementById('casino-stage');
      if (stage) {
        const old = stage.querySelector('.wheel-result');
        if (old) old.remove();
        const cls = d.won ? 'win' : 'lose';
        const msg = d.won
          ? `🎉 ПОБЕДА! Выпало ${d.sector_value} — выплата ${fmtMoney(d.win)}₽ (x${d.multiplier})`
          : `😢 Выпало ${d.sector_value}. Ты ставил на ${d.choice} (x${WHEEL_MULTIPLIERS[d.choice]})`;
        const div = document.createElement('div');
        div.className = `wheel-result ${cls}`;
        div.textContent = msg;
        const choices = stage.querySelector('.wheel-choices');
        if (choices) choices.after(div);
        else stage.appendChild(div);
      }
    }

    if (d.won) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      if (tg) tg.HapticFeedback?.notificationOccurred("success");
    } else {
      if (navigator.vibrate) navigator.vibrate(200);
      if (tg) tg.HapticFeedback?.notificationOccurred("error");
    }
  } catch(e) {
    toast(e.message, "error");
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
        <div class="bj-quick-bets">
          <button onclick="bjHalveBet()">➗ ÷2</button>
          <button onclick="bjDoubleBet()">✖️ x2</button>
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

function bjDoubleBet() {
  const inp = document.getElementById('bj-bet-input');
  if (!inp) return;
  const cur = parseInt(inp.value) || 0;
  inp.value = Math.max(1, cur * 2);
}

function bjHalveBet() {
  const inp = document.getElementById('bj-bet-input');
  if (!inp) return;
  const cur = parseInt(inp.value) || 0;
  inp.value = Math.max(1, Math.floor(cur / 2));
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