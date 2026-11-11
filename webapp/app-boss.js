// app-boss.js
// Логика и UI глобальных боссов (Опасный Поцык — убит, Зелябоба — активен).

let bossTimerInterval = null;

async function loadBosses() {
  if (state.bossView === 'list') {
    await renderBossList();
  } else {
    await renderBossDetail();
  }
}

async function renderBossList() {
  const el = document.getElementById("boss-content");
  if (!el) return;
  if (bossTimerInterval) clearInterval(bossTimerInterval);

  el.innerHTML = `
    <h2 class="section-title">💀 Боссы</h2>
    <p style="color:var(--hint);margin-bottom:16px;font-size:13px">Сражайся с боссами вместе со всем сервером!</p>
    <div id="boss-list-wrap"><div style="text-align:center;padding:20px;color:var(--hint);">Загрузка...</div></div>
  `;

  try {
    const d = await api("boss/list");
    const bosses = d.bosses || [];
    const wrap = document.getElementById("boss-list-wrap");
    if (!wrap) return;

    if (bosses.length === 0) {
      wrap.innerHTML = '<div style="text-align:center;padding:20px;color:var(--hint);">Нет боссов</div>';
      return;
    }

    wrap.innerHTML = bosses.map(b => {
      let hpText = "";
      let hpColor = "#e74c3c";
      if (b.status === 'dead') {
        hpText = "💀 ПОВЕРЖЕН";
        hpColor = "#2ecc71";
      } else if (b.status === 'expired') {
        hpText = "🏃 СБЕЖАЛ";
        hpColor = "#e74c3c";
      } else {
        hpText = `${b.hp.toLocaleString('ru-RU')} / ${b.max_hp.toLocaleString('ru-RU')} HP`;
      }
      return `
        <div class="boss-list-card" onclick="openBoss('${b.id}')" style="margin-bottom:10px;">
          <div class="boss-list-img">
            <img src="/assets/${b.image}.png" style="width:100%;height:100%;object-fit:contain;">
          </div>
          <div class="boss-list-info">
            <div class="boss-list-name">${escapeHtml(b.name)}</div>
            <div class="boss-list-hp" style="color:${hpColor}">${hpText}</div>
            <div class="boss-list-reward">🏆 Эпическая награда</div>
          </div>
          <div class="boss-list-arrow">→</div>
        </div>
      `;
    }).join("");
  } catch(e) {
    const wrap = document.getElementById("boss-list-wrap");
    if (wrap) wrap.innerHTML = `<div style="color:#e74c3c;text-align:center;padding:20px;">Ошибка: ${e.message}</div>`;
  }
}

function openBoss(id) {
  state.bossView = 'detail';
  state.bossId = id;
  loadBosses();
}

function closeBoss() {
  state.bossView = 'list';
  state.bossId = null;
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

  const bossId = state.bossId || 'zelya';

  try {
    const d = await api("boss/get", { boss_id: bossId });
    const b = d.boss;
    const rc = d.rewards_config || {};

    const isDead = b.status === 'dead' || b.hp <= 0;
    const isExpired = b.status === 'expired';
    const isActive = !isDead && !isExpired;

    const hpPct = Math.min(100, (b.hp / b.max_hp) * 100);
    const hpStr = b.hp.toLocaleString('ru-RU');
    const maxStr = b.max_hp.toLocaleString('ru-RU');

    let topHtml = '<div style="color:var(--hint);text-align:center;padding:20px;font-size:12px;">Пока никто не нанес урон</div>';
    if (d.top && d.top.length > 0) {
      topHtml = d.top.map((p, i) => `
        <div class="boss-top-item" onclick="viewPlayer(${p.user_id})">
          <div class="boss-top-rank">${i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</div>
          <div class="boss-top-info">
            <div class="boss-top-name">${formatNickWithTag(p.nickname, p.gang_tag, p.gang_tag_color, p.role)}</div>
            <div class="boss-top-lvl">Ур. ${p.level}</div>
          </div>
          <div class="boss-top-dmg">${p.damage.toLocaleString('ru-RU')} DMG</div>
        </div>
      `).join("");
    }

    const claimed = new Set(d.claimed || []);
    const itemClaimed = claimed.has(rc.item_claim);
    const highClaimed = claimed.has(rc.dmg_high_claim);

    const checkItem = d.my_damage >= rc.item_threshold ? (itemClaimed ? '✅' : '🔓') : '🔒';
    const checkHigh = d.my_damage >= rc.dmg_high_threshold ? (highClaimed ? '✅' : '🔓') : '🔒';

    let actionBtnHtml = '';
    if (isDead) {
      actionBtnHtml = `<div style="text-align:center;padding:16px;background:rgba(46,204,113,0.1);border:1px solid #2ecc71;border-radius:12px;color:#2ecc71;font-weight:900;font-size:16px;">🏆 БОСС ПОВЕРЖЕН!<br><span style="font-size:12px;font-weight:normal;">Награды распределены</span></div>`;
    } else if (isExpired) {
      actionBtnHtml = `<div style="text-align:center;padding:16px;background:rgba(231,76,60,0.1);border:1px solid #e74c3c;border-radius:12px;color:#e74c3c;font-weight:900;font-size:16px;">💀 БОСС СБЕЖАЛ!<br><span style="font-size:12px;font-weight:normal;">Время истекло</span></div>`;
    } else {
      actionBtnHtml = `<button class="btn btn-primary boss-attack-btn" onclick="attackBoss()" id="btn-attack-boss">
        ⚔️ Атаковать (${d.my_stats.damage} DMG)
      </button>`;
    }

    const rewardItems = [
      `<div class="boss-reward-card ${d.my_damage >= rc.item_threshold ? (itemClaimed ? 'claimed' : 'unlocked') : 'locked'}" onclick="showBossRewardPreview('${rc.item_id}', '${escapeHtml(rc.item_name)}')" style="cursor:pointer;">
        <div class="boss-reward-icon">${checkItem}</div>
        <div class="boss-reward-info">
          <div class="boss-reward-title">${escapeHtml(rc.item_name)} (в руку)</div>
          <div class="boss-reward-desc">Нанеси ${rc.item_threshold.toLocaleString('ru-RU')} урона</div>
        </div>
      </div>`,
      `<div class="boss-reward-card ${d.my_damage >= rc.dmg_high_threshold ? (highClaimed ? 'claimed' : 'unlocked') : 'locked'}">
        <div class="boss-reward-icon">${checkHigh}</div>
        <div class="boss-reward-info">
          <div class="boss-reward-title">${rc.dmg_high_money.toLocaleString('ru-RU')} ₽</div>
          <div class="boss-reward-desc">Нанеси ${rc.dmg_high_threshold.toLocaleString('ru-RU')} урона</div>
        </div>
      </div>`,
    ];

    if (rc.top_rewards) {
      const topColors = ['#f1c40f', '#bdc3c7', '#cd7f32'];
      rc.top_rewards.forEach(tr => {
        rewardItems.push(`
          <div class="boss-reward-card ${d.top.some(t => t.user_id === state.player.user_id && t.damage > 0) ? 'unlocked' : 'locked'}" style="border-color:${topColors[tr.rank - 1]}">
            <div class="boss-reward-icon">${tr.rank === 1 ? '🥇' : tr.rank === 2 ? '🥈' : '🥉'}</div>
            <div class="boss-reward-info">
              <div class="boss-reward-title">${tr.label}</div>
              <div class="boss-reward-desc">${tr.money.toLocaleString('ru-RU')} ₽</div>
            </div>
          </div>
        `);
      });
    }

    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <button class="btn btn-secondary" style="width:auto;padding:8px 12px;margin:0;" onclick="closeBoss()">← Назад</button>
        <h2 style="margin:0;">💀 ${escapeHtml(b.name)}</h2>
      </div>

      <div class="boss-timer-box" style="${isActive ? '' : 'display:none;'}">
        ⏳ До конца ивента: <span id="boss-timer" style="color:#e74c3c;font-weight:900;">${formatBossTime(b.ends_at - d.now)}</span>
      </div>

      <div class="boss-image-wrap" style="${isDead ? 'filter:grayscale(1) brightness(0.5);' : ''}">
        <img src="/assets/${b.image}.png" class="boss-main-img">
      </div>

      <div class="boss-hp-wrap">
        <div class="boss-hp-text"><span>${hpStr}</span> / ${maxStr} HP</div>
        <div class="boss-hp-bar">
          <div class="boss-hp-fill" style="width:${hpPct}%"></div>
        </div>
      </div>

      <div style="text-align:center;margin-bottom:14px;">
        <div style="font-size:11px;color:var(--hint);text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">Твой урон по боссу</div>
        <div style="font-size:26px;font-weight:900;color:#e74c3c;line-height:1.1;margin-top:2px;">${d.my_damage.toLocaleString('ru-RU')} <span style="font-size:14px;color:var(--hint);font-weight:700;">DMG</span></div>
      </div>

      ${actionBtnHtml}

      <h3 class="section-subtitle" style="margin-top:24px;">🏆 Топ по урону</h3>
      <div class="boss-top-list">
        ${topHtml}
      </div>

      <h3 class="section-subtitle" style="margin-top:24px;">🎁 Награды</h3>
      <div class="boss-rewards">
        ${rewardItems.join("")}
      </div>
    `;

    if (isActive && d.my_cooldown > 0) {
      disableBossBtn(d.my_cooldown);
    }

    if (isActive) {
      bossTimerInterval = setInterval(() => {
        const tEl = document.getElementById("boss-timer");
        if (!tEl) { clearInterval(bossTimerInterval); return; }
        const left = b.ends_at - Math.floor(Date.now() / 1000);
        tEl.textContent = formatBossTime(left);
        if (left <= 0) {
          clearInterval(bossTimerInterval);
          renderBossDetail();
        }
      }, 1000);
    }

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
    const d = await api("boss/attack", { boss_id: state.bossId || 'zelya' });
    toast(`💥 Удар на ${d.damage} DMG!`, "success");

    if (d.new_hp <= 0) {
      toast("🎉 БОСС ПОВЕРЖЕН! Награды распределены!", "success");
      setTimeout(() => renderBossDetail(), 800);
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

    setTimeout(() => renderBossDetail(), 500);
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

function showBossRewardPreview(iid, name) {
  const preview = {...state.player.outfit};
  preview.right_hand_id = {item_id: iid};
  openModal(`
    <div class="shop-preview">${renderCharacterSVG(preview, {width: 190, height: 380})}</div>
    <h2 style="text-align:center;margin-bottom:4px;">${escapeHtml(name || 'Награда')}</h2>
    <p style="text-align:center;color:var(--hint);margin-bottom:16px;font-size:13px;">Награда за урон по боссу</p>
    <button class="btn btn-primary" onclick="closeModal()">Закрыть</button>
  `);
}