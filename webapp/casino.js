// casino.js
// ═══════════ КАЗИНО ═══════════
state.casinoGame = 'coin';
state.coinChoice = 'Орёл';
state.diceChoice = 'Больше 3';
state.rouletteChoice = 'red';
state.rouletteNumber = null;

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
}

function renderCasino() {
  const stage = document.getElementById('casino-stage');
  if (!stage) return;

  document.querySelectorAll('.casino-menu-item').forEach(el => {
    el.classList.toggle('active', el.dataset.game === state.casinoGame);
  });

  if (state.casinoGame === 'coin') {
    stage.innerHTML = `
      <div style="display:flex;gap:8px;margin-bottom:15px;width:100%;max-width:300px;">
        <button class="btn ${state.coinChoice==='Орёл'?'btn-primary':'btn-secondary'}" style="flex:1;" onclick="state.coinChoice='Орёл';renderCasino()">🦅 Орёл</button>
        <button class="btn ${state.coinChoice==='Решка'?'btn-primary':'btn-secondary'}" style="flex:1;" onclick="state.coinChoice='Решка';renderCasino()">🪙 Решка</button>
      </div>
      <div class="coin-container" onclick="playCasino()">
        <div class="coin" id="coin-el">
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
  }

  const res = document.getElementById('casino-result');
  if (res) { res.textContent = ''; res.style.color = '#fff'; }
}

async function playCasino() {
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
  const btn = document.getElementById('btn-play-casino');
  if (btn) btn.disabled = true;

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
        coin.classList.remove('flip-heads', 'flip-tails');
        void coin.offsetWidth;
        const isHeads = d.result.includes("Орёл");
        coin.classList.add(isHeads ? 'flip-heads' : 'flip-tails');
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

    state.casinoLocked = true;
    state.casinoLockTime = Date.now();
    setTimeout(() => { if (btn) btn.disabled = false; }, 5000);
  } catch(e) {
    resEl.textContent = e.message || "Ошибка сервера";
    toast("Ошибка казино: " + e.message, "error");
    if (btn) btn.disabled = false;
  }
}