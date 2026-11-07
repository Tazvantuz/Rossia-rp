// app-boss.js

let bossTimerInterval = null;

async function loadBosses() {
  if (state.bossView === 'list') {
    renderBossList();
  } else {
    await renderBossDetail();
  }
}

function renderBossList() {
  const el = document.getElementById("boss-content");
  if (!el) return;
  if (bossTimerInterval) clearInterval(bossTimerInterval);
  
  el.innerHTML = `
    <h2 class="section-title">💀 Боссы</h2>
    <p style="color:var(--hint);margin-bottom:16px;font-size:13px">Сражайся с боссами вместе со всем сервером!</p>
    
    <div class="boss-list-card" onclick="openBoss('pocyk')">
      <div class="boss-list-img">
        <img src="/assets/pocyk.png" style="width:100%;height:100%;object-fit:contain;">
      </div>
      <div class="boss-list-info">
        <div class="boss-list-name">Опасный Поцык</div>
        <div class="boss-list-hp" id="list-boss-hp">Загрузка...</div>
        <div class="boss-list-reward">🏆 Эпическая награда</div>
      </div>
      <div class="boss-list-arrow">→</div>
    </div>
  `;
  
  api("boss/get").then(d => {
    const hpEl = document.getElementById("list-boss-hp");
    if (hpEl) {
      const hpStr = d.boss.hp.toLocaleString('ru-RU');
      const maxStr = d.boss.max_hp.toLocaleString('ru-RU');
      hpEl.textContent = `${hpStr} / ${maxStr} HP`;
    }
  }).catch(()=>{});
}

function openBoss(id) {
  state.bossView = 'detail';
  state.bossId = id;
  loadBosses();
}

function closeBoss() {
  state.bossView = 'list';
  loadBosses();
}

function formatBossTime(seconds) {
  if (seconds <= 0) return "Время вышло";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  let parts = [];
  if (d > 0) parts.push(`${d}дн`);
  if (h > 0) parts.push(`${h} часов`);
  if (m > 0) parts.push(`${m} минут`);
  parts.push(`${s} секунд`);
  return parts.join(', ');
}

async function renderBossDetail() {
  const el = document.getElementById("boss-content");
  if (!el) return;
  if (bossTimerInterval) clearInterval(bossTimerInterval);
  
  try {
    const d = await api("boss/get");
    const b = d.boss;
    
    const hpPct = Math.min(100, (b.hp / b.max_hp) * 100);
    const hpStr = b.hp.toLocaleString('ru-RU');
    const maxStr = b.max_hp.toLocaleString('ru-RU');
    
    let topHtml = '<div style="color:var(--hint);text-align:center;padding:20px;font-size:12px;">Пока никто не нанес урон</div>';
    if (d.top && d.top.length > 0) {
      topHtml = d.top.map((p, i) => `
        <div class="boss-top-item" onclick="viewPlayer(${p.user_id})">
          <div class="boss-top-rank">${i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</div>
          <div class="boss-top-info">
            <div class="boss-top-name">${formatNickWithTag(p.nickname, p.gang_tag, p.gang_tag_color)}</div>
            <div class="boss-top-lvl">Ур. ${p.level}</div>
          </div>
          <div class="boss-top-dmg">${p.damage.toLocaleString('ru-RU')} DMG</div>
        </div>
      `).join("");
    }
    
    const claimedSet = new Set(d.claimed);
    
    const reward1k = claimedSet.has('dmg1k');
    const reward10k = claimedSet.has('dmg10k');
    const rewardTop1 = claimedSet.has('top1');
    const rewardTop2 = claimedSet.has('top2');
    const rewardTop3 = claimedSet.has('top3');
    
    const check1k = d.my_damage >= 1000 ? (reward1k ? '✅' : '🔓') : '🔒';
    const check10k = d.my_damage >= 10000 ? (reward10k ? '✅' : '🔓') : '🔒';
    
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <button class="btn btn-secondary" style="width:auto;padding:8px 12px;margin:0;" onclick="closeBoss()">← Назад</button>
        <h2 style="margin:0;">💀 Опасный Поцык</h2>
      </div>
      
      <div class="boss-timer-box">
        ⏳ До конца ивента: <span id="boss-timer" style="color:#e74c3c;font-weight:900;">${formatBossTime(b.ends_at - d.now)}</span>
      </div>
      
      <div class="boss-image-wrap">
        <img src="/assets/pocyk.png" class="boss-main-img">
      </div>
      
      <div class="boss-hp-wrap">
        <div class="boss-hp-text"><span>${hpStr}</span> / ${maxStr} HP</div>
        <div class="boss-hp-bar">
          <div class="boss-hp-fill" style="width:${hpPct}%"></div>
        </div>
      </div>
      
      <button class="btn btn-primary boss-attack-btn" onclick="attackBoss()" id="btn-attack-boss">
        ⚔️ Атаковать (${d.my_stats.damage} DMG)
      </button>
      
      <h3 class="section-subtitle" style="margin-top:24px;">🏆 Топ по урону</h3>
      <div class="boss-top-list">
        ${topHtml}
      </div>
      
      <h3 class="section-subtitle" style="margin-top:24px;">🎁 Награды</h3>
      <div class="boss-rewards">
        <div class="boss-reward-card ${d.my_damage >= 1000 ? (reward1k ? 'claimed' : 'unlocked') : 'locked'}">
          <div class="boss-reward-icon">${check1k}</div>
          <div class="boss-reward-info">
            <div class="boss-reward-title">Опасный Поцык (в руку)</div>
            <div class="boss-reward-desc">Нанеси 1,000 урона</div>
            <div class="boss-reward-stats" style="color:#a155cf;font-weight:700;">⚔️ +350 DMG</div>
          </div>
        </div>
        
        <div class="boss-reward-card ${d.my_damage >= 10000 ? (reward10k ? 'claimed' : 'unlocked') : 'locked'}">
          <div class="boss-reward-icon">${check10k}</div>
          <div class="boss-reward-info">
            <div class="boss-reward-title">50,000 ₽</div>
            <div class="boss-reward-desc">Нанеси 10,000 урона</div>
          </div>
        </div>
        
        <div class="boss-reward-card ${d.top.some(t => t.user_id === state.player.user_id && t.damage > 0) ? 'unlocked' : 'locked'}" style="border-color:#f1c40f;">
          <div class="boss-reward-icon">🥇</div>
          <div class="boss-reward-info">
            <div class="boss-reward-title">Топ 1</div>
            <div class="boss-reward-desc">500,000 ₽</div>
          </div>
        </div>
        
        <div class="boss-reward-card ${d.top.some(t => t.user_id === state.player.user_id && t.damage > 0) ? 'unlocked' : 'locked'}" style="border-color:#bdc3c7;">
          <div class="boss-reward-icon">🥈</div>
          <div class="boss-reward-info">
            <div class="boss-reward-title">Топ 2</div>
            <div class="boss-reward-desc">250,000 ₽</div>
          </div>
        </div>
        
        <div class="boss-reward-card ${d.top.some(t => t.user_id === state.player.user_id && t.damage > 0) ? 'unlocked' : 'locked'}" style="border-color:#cd7f32;">
          <div class="boss-reward-icon">🥉</div>
          <div class="boss-reward-info">
            <div class="boss-reward-title">Топ 3</div>
            <div class="boss-reward-desc">100,000 ₽</div>
          </div>
        </div>
      </div>
    `;
    
    if (d.my_cooldown > 0) {
      disableBossBtn(d.my_cooldown);
    }
    
    bossTimerInterval = setInterval(() => {
      const tEl = document.getElementById("boss-timer");
      if (!tEl) { clearInterval(bossTimerInterval); return; }
      const left = b.ends_at - Math.floor(Date.now() / 1000);
      tEl.textContent = formatBossTime(left);
      if (left <= 0) clearInterval(bossTimerInterval);
    }, 1000);
    
  } catch(e) {
    el.innerHTML = `<div style="color:#e74c3c;text-align:center;padding:20px;">Ошибка: ${e.message}</div>`;
  }
}

async function attackBoss() {
  const btn = document.getElementById("btn-attack-boss");
  if (!btn || btn.disabled) return;
  
  btn.disabled = true;
  btn.textContent = "⏳ Атака...";
  
  try {
    const d = await api("boss/attack");
    toast(`💥 Удар на ${d.damage} DMG!`, "success");
    
    if (d.new_hp <= 0) {
      toast("🎉 БОСС ПОВЕРЖЕН! Награды распределены!", "success");
      closeBoss();
      return;
    }
    
    const hpEl = document.querySelector(".boss-hp-text span");
    const hpBar = document.querySelector(".boss-hp-fill");
    if (hpEl && hpBar) {
      const maxHp = parseInt(hpEl.parentElement.textContent.split('/')[1].replace(/[^0-9]/g, ''));
      hpEl.textContent = d.new_hp.toLocaleString('ru-RU');
      const pct = Math.min(100, (d.new_hp / maxHp) * 100);
      hpBar.style.width = pct + "%";
    }
    
    setTimeout(() => renderBossDetail(), 500); // Перезагружаем топ
  } catch(e) {
    toast(e.message, "error");
    if (e.message.includes("Кд")) {
      const cd = parseInt(e.message.replace(/[^0-9]/g, ''));
      disableBossBtn(cd);
    } else {
      btn.disabled = false;
      btn.textContent = `⚔️ Атаковать (${state.player.combat_stats.damage} DMG)`;
    }
  }
}

function disableBossBtn(seconds) {
  const btn = document.getElementById("btn-attack-boss");
  if (!btn) return;
  btn.disabled = true;
  let left = seconds;
  btn.textContent = `⏳ Кд ${left} сек`;
  const iv = setInterval(() => {
    left--;
    if (left <= 0) {
      clearInterval(iv);
      btn.disabled = false;
      btn.textContent = `⚔️ Атаковать (${state.player.combat_stats.damage} DMG)`;
    } else {
      btn.textContent = `⏳ Кд ${left} сек`;
    }
  }, 1000);
}