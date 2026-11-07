// app-admin.js
// Админ-панель, аналитика, промокоды, модерация, boot

function checkAdminAccess() {
  const user = tg?.initDataUnsafe?.user;
  if (state.player && (state.player.role === 'admin' || user?.username === "tazvantuzz")) {
    const sec = document.getElementById("more-admin-section");
    if (sec) sec.classList.remove("hidden");
  }
}

async function adminSearch() {
  const q = document.getElementById("admin-search-input").value;
  if (!q) return;
  const res = await api("admin/search", { query: q });
  const list = document.getElementById("admin-results");
  list.innerHTML = "";
  document.getElementById("admin-player-details").style.display = "none";

  if (res.players.length === 0) {
    list.innerHTML = "<div style='color:#888; text-align:center;'>Никого не найдено</div>";
    return;
  }

  res.players.forEach(p => {
    list.innerHTML += `
      <div onclick="adminSelectPlayer(${p.user_id})" style="background:#222; padding:12px; border-radius:8px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
        <div style="font-weight:bold; color:#fff;">${escapeHtml(p.nickname)}</div>
        <div style="color:#f39c12; font-size:14px;">${fmtMoney(p.balance)}₽</div>
      </div>
    `;
  });
}

async function adminSelectPlayer(id) {
  const res = await api("admin/player_info", { target_id: id });
  if (res.error) return toast(res.error, "error");
  const p = res.player;
  const s = res.stats;
  const details = document.getElementById("admin-player-details");
  details.style.display = "block";
  details.innerHTML = `
    <h4 style="color:#fff; margin-bottom:8px;">${escapeHtml(p.nickname)} (ID: ${p.user_id})</h4>
    <div style="font-size:13px; color:#aaa; margin-bottom:12px;">
      Ур. ${p.level} | Баланс: <b style="color:#2ecc71;">${fmtMoney(p.balance)}₽</b><br>
      Банда: ${s.gang} | Казино: ${s.casino_plays} игр<br>
      Бизнесы: ${s.businesses}
    </div>
    <div style="margin-bottom:12px;">
      <div style="font-size:12px; color:#aaa; margin-bottom:4px;">Изменить баланс:</div>
      <div style="display:flex; gap:8px;">
        <input type="number" id="admin-amount" value="1000" style="flex:1; background:#111; border:1px solid #333; color:#fff; padding:10px; border-radius:8px;">
        <button class="btn btn-primary" onclick="adminChangeBalance(${p.user_id}, 1)">+</button>
        <button class="btn btn-secondary" onclick="adminChangeBalance(${p.user_id}, -1)">-</button>
      </div>
    </div>
    <div style="margin-bottom:16px;">
      <div style="font-size:12px; color:#aaa; margin-bottom:4px;">Установить уровень (сбросит XP):</div>
      <div style="display:flex; gap:8px;">
        <input type="number" id="admin-level" value="${p.level}" min="1" max="100" style="flex:1; background:#111; border:1px solid #333; color:#fff; padding:10px; border-radius:8px;">
        <button class="btn btn-primary" onclick="adminSetLevel(${p.user_id})">OK</button>
      </div>
    </div>
    <button onclick='adminDeletePlayer(${p.user_id}, ${jsAttr(p.nickname)})' style="width:100%; background:#c0392b; color:#fff; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;">
      🗑 УДАЛИТЬ АККАУНТ
    </button>
  `;
}

async function adminChangeBalance(id, sign) {
  const amount = parseInt(document.getElementById("admin-amount").value) * sign;
  await api("admin/change_balance", { target_id: id, amount: amount });
  toast(`Баланс изменен на ${amount > 0 ? '+' : ''}${amount}₽`, "success");
  adminSelectPlayer(id);
}

async function adminSetLevel(id) {
  const lvl = parseInt(document.getElementById("admin-level").value);
  if (!lvl || lvl < 1) return toast("Некорректный уровень", "error");
  try {
    await api("admin/set_level", { target_id: id, level: lvl });
    toast(`Уровень изменен на ${lvl}`, "success");
    adminSelectPlayer(id);
  } catch(e) { toast(e.message, "error"); }
}

async function adminDeletePlayer(id, nick) {
  if (!confirm(`Ты уверен, что хочешь ПОЛНОСТЬЮ УДАЛИТЬ аккаунт "${nick}"?`)) return;
  await api("admin/delete", { target_id: id });
  toast("Аккаунт удален", "success");
  document.getElementById("admin-player-details").style.display = "none";
  adminSearch();
}

// ══════════════════════════════════════════════════════════════
//  МОДЕРАЦИЯ (админ)
// ══════════════════════════════════════════════════════════════
async function showAdminModeration() {
  const el = document.getElementById('admin-player-details');
  if (el) el.style.display = 'none';
  const results = document.getElementById('admin-results');
  if (results) results.innerHTML = '';

  openModal(`
    <h2 style="margin-bottom:16px;">🛡 Модерация</h2>

    <div class="promo-admin-form">
      <input id="mod-new-nick" type="text" placeholder="Ник игрока для назначения" maxlength="20">
      <button class="promo-admin-create" onclick="adminAssignMod()" style="background:linear-gradient(135deg,#3498db,#2980b9);">➕ Назначить модератора</button>
    </div>

    <h3 style="color:#fff;margin:16px 0 8px;font-size:14px;">📋 Текущий персонал</h3>
    <div id="mod-staff-list" class="promo-admin-list">
      <div class="promo-admin-empty">Загрузка...</div>
    </div>

    <button class="btn btn-secondary" style="margin-top:16px" onclick="closeModal()">Закрыть</button>
  `);

  await refreshModerationList();
}

async function refreshModerationList() {
  const box = document.getElementById('mod-staff-list');
  if (!box) return;
  try {
    const d = await api("admin/staff/list", {});
    const list = d.staff || [];
    if (list.length === 0) {
      box.innerHTML = '<div class="promo-admin-empty">Пока нет модераторов</div>';
      return;
    }
    box.innerHTML = list.map(p => {
      const roleName = p.role === 'admin' ? 'ADM' : 'MOD';
      const roleColor = p.role === 'admin' ? '#c0392b' : '#2980b9';
      return `<div class="promo-admin-item" style="border-left-color:${roleColor}">
        <div style="flex:1;min-width:0;">
          <div class="promo-admin-code">${escapeHtml(p.nickname)}</div>
          <div class="promo-admin-info">
            <span style="color:${roleColor};font-weight:900;">${roleName}</span>
          </div>
        </div>
        ${p.role === 'admin' ? '' : `<button class="promo-admin-delete" onclick='adminRemoveMod(${p.user_id})' title="Снять должность">✕</button>`}
      </div>`;
    }).join('');
  } catch(e) {
    box.innerHTML = `<div class="promo-admin-empty" style="color:#e74c3c;">${escapeHtml(e.message)}</div>`;
  }
}

async function adminAssignMod() {
  const nickEl = document.getElementById('mod-new-nick');
  if (!nickEl) return;
  const nick = (nickEl.value || '').trim();
  if (!nick) { toast("Введи ник", "error"); return; }
  try {
    const searchRes = await api("admin/search", { query: nick });
    if (!searchRes.players || searchRes.players.length === 0) {
      toast("Игрок не найден", "error");
      return;
    }
    const target = searchRes.players[0];
    await api("admin/staff/set", { target_id: target.user_id, role: "moderator" });
    toast(`✅ ${target.nickname} назначен модератором`, "success");
    nickEl.value = '';
    await refreshModerationList();
  } catch(e) {
    toast(e.message, "error");
  }
}

async function adminRemoveMod(uid) {
  if (!confirm("Снять с должности модератора?")) return;
  try {
    await api("admin/staff/set", { target_id: uid, role: "player" });
    toast("❌ Снят с должности", "success");
    await refreshModerationList();
  } catch(e) {
    toast(e.message, "error");
  }
}

// ══════════════════════════════════════════════════════════════
//  ПРОМОКОДЫ (админ)
// ══════════════════════════════════════════════════════════════
async function showAdminPromos() {
  const el = document.getElementById('admin-player-details');
  if (el) el.style.display = 'none';
  const results = document.getElementById('admin-results');
  if (results) results.innerHTML = '';

  openModal(`
    <h2 style="margin-bottom:16px;">🎁 Промокоды</h2>

    <div class="promo-admin-form">
      <input id="promo-new-code" type="text" placeholder="КОД (например PARTNER_50K)"
             maxlength="64" style="text-transform:uppercase" autocapitalize="characters">
      <div class="promo-admin-form-row">
        <input id="promo-new-bonus" type="number" placeholder="Бонус ₽" min="1" value="50000">
        <input id="promo-new-uses" type="number" placeholder="Использований" min="1" value="100">
      </div>
      <button class="promo-admin-create" onclick="adminCreatePromo()">➕ Создать промокод</button>
    </div>

    <h3 style="color:#fff;margin:16px 0 8px;font-size:14px;">📋 Все промокоды</h3>
    <div id="promo-admin-list" class="promo-admin-list">
      <div class="promo-admin-empty">Загрузка...</div>
    </div>

    <button class="btn btn-secondary" style="margin-top:16px" onclick="closeModal()">Закрыть</button>
  `);

  await refreshAdminPromos();
}

async function refreshAdminPromos() {
  const box = document.getElementById('promo-admin-list');
  if (!box) return;
  try {
    const d = await api("admin/promo/list", {});
    const list = d.promo_codes || [];
    if (list.length === 0) {
      box.innerHTML = '<div class="promo-admin-empty">Пока нет промокодов. Создай первый!</div>';
      return;
    }
    box.innerHTML = list.map(p => {
      const left = p.uses_left;
      const total = p.uses_total;
      const inactive = left <= 0;
      return `<div class="promo-admin-item" style="border-left-color:${inactive ? '#555' : '#9b59b6'};${inactive ? 'opacity:0.55;' : ''}">
        <div style="flex:1;min-width:0;">
          <div class="promo-admin-code">${escapeHtml(p.code)}</div>
          <div class="promo-admin-info">
            <span class="promo-admin-bonus">+${fmtMoney(p.bonus)}₽</span>
            · использовано ${total - left} из ${total}
            ${inactive ? ' · <b style="color:#e74c3c;">исчерпан</b>' : ''}
          </div>
        </div>
        <button class="promo-admin-delete" onclick='adminDeletePromo(${jsAttr(p.code)})' title="Удалить">✕</button>
      </div>`;
    }).join('');
  } catch(e) {
    box.innerHTML = `<div class="promo-admin-empty" style="color:#e74c3c;">${escapeHtml(e.message)}</div>`;
  }
}

async function adminCreatePromo() {
  const codeEl = document.getElementById('promo-new-code');
  const bonusEl = document.getElementById('promo-new-bonus');
  const usesEl = document.getElementById('promo-new-uses');
  if (!codeEl || !bonusEl || !usesEl) return;
  const code = (codeEl.value || '').trim().toUpperCase();
  const bonus = parseInt(bonusEl.value) || 0;
  const uses = parseInt(usesEl.value) || 0;
  if (!code) { toast("Введи код", "error"); return; }
  if (bonus <= 0) { toast("Бонус должен быть > 0", "error"); return; }
  if (uses <= 0) { toast("Количество использований > 0", "error"); return; }
  try {
    await api("admin/promo/create", { code, bonus, uses });
    toast(`✅ Промокод ${code} создан`, "success");
    codeEl.value = '';
    await refreshAdminPromos();
  } catch(e) {
    toast(e.message, "error");
  }
}

async function adminDeletePromo(code) {
  if (!confirm(`Удалить промокод ${code}? Все активации этого кода будут потеряны.`)) return;
  try {
    await api("admin/promo/delete", { code });
    toast("❌ Удалён", "success");
    await refreshAdminPromos();
  } catch(e) {
    toast(e.message, "error");
  }
}

// ══════════════════════════════════════════════════════════════
//  АНАЛИТИКА
// ══════════════════════════════════════════════════════════════
function _fmtRegTime(ts) {
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  const now = new Date();
  const sameDay = d.getFullYear() === now.getFullYear()
                && d.getMonth() === now.getMonth()
                && d.getDate() === now.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.getFullYear() === yesterday.getFullYear()
                    && d.getMonth() === yesterday.getMonth()
                    && d.getDate() === yesterday.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  if (sameDay) return `сегодня, ${hh}:${mm}`;
  if (isYesterday) return `вчера, ${hh}:${mm}`;
  const dd = String(d.getDate()).padStart(2, "0");
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mo}, ${hh}:${mm}`;
}

async function showAdminAnalytics() {
  try {
    const d = await api("admin/analytics", {});
    const statCard = (icon, label, value, color) => `
      <div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:14px;text-align:center;">
        <div style="font-size:24px;">${icon}</div>
        <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px;">${label}</div>
        <div style="font-size:20px;font-weight:900;color:${color || '#fff'};margin-top:4px;">${value}</div>
      </div>
    `;
    const retentionColor = d.retention_pct >= 30 ? '#2ecc71' : d.retention_pct >= 15 ? '#f39c12' : '#e74c3c';

    let recentHtml = "";
    if (d.recent_players && d.recent_players.length > 0) {
      recentHtml = d.recent_players.map((p, i) => {
        const timeStr = _fmtRegTime(p.created_ts);
        const medal = i === 0 ? "🆕" : (i + 1);
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:#111;border-radius:8px;margin-bottom:4px;border-left:3px solid ${i === 0 ? '#2ecc71' : '#333'};">
          <div style="display:flex;align-items:center;gap:8px;min-width:0;">
            <div style="font-size:11px;color:#666;min-width:20px;text-align:center;">${medal}</div>
            <div style="font-weight:700;color:#fff;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(p.nickname)}</div>
          </div>
          <div style="font-size:11px;color:#888;white-space:nowrap;margin-left:8px;font-variant-numeric:tabular-nums;">${timeStr}</div>
        </div>`;
      }).join("");
    } else {
      recentHtml = '<div style="color:#888;text-align:center;padding:20px;font-size:12px;">Пока никто не регистрировался</div>';
    }

    let actChart = "";
    if (d.daily_activity && d.daily_activity.length > 0) {
      const maxC = Math.max(...d.daily_activity.map(x => x.count), 1);
      actChart = d.daily_activity.map(x => {
        const pct = (x.count / maxC) * 100;
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">
          <div style="font-size:10px;font-weight:700;color:#fff;">${x.count}</div>
          <div style="width:100%;height:60px;background:#111;border-radius:4px;display:flex;align-items:flex-end;">
            <div style="width:100%;height:${pct}%;background:linear-gradient(180deg,#3498db,#2980b9);border-radius:4px 4px 0 0;min-height:2px;"></div>
          </div>
          <div style="font-size:9px;color:#888;margin-top:2px;">${x.date}</div>
        </div>`;
      }).join("");
    }

    let retHtml = "";
    if (d.retention_by_day && d.retention_by_day.length > 0) {
      retHtml = d.retention_by_day.map(r => {
        const color = r.pct >= 50 ? '#2ecc71' : r.pct >= 25 ? '#f39c12' : '#e74c3c';
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:#111;border-radius:8px;margin-bottom:4px;">
          <div><div style="font-weight:700;color:#fff;font-size:13px;">${r.date}</div>
          <div style="font-size:11px;color:#888;">${r.new} новых → ${r.returned} вернулось</div></div>
          <div style="font-size:16px;font-weight:900;color:${color};">${r.pct}%</div>
        </div>`;
      }).join("");
    } else {
      retHtml = `<div style="color:#888;text-align:center;padding:20px;font-size:12px;">Данных пока нет. Появятся через 2+ дня работы</div>`;
    }

    let topHtml = "";
    if (d.top_players && d.top_players.length > 0) {
      topHtml = d.top_players.map((p, i) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:#111;border-radius:8px;margin-bottom:4px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="font-size:14px;width:24px;">${i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</div>
            <div style="font-weight:700;color:#fff;font-size:13px;">${escapeHtml(p.nickname)}</div>
          </div>
          <div style="font-size:13px;font-weight:800;color:#3498db;">${p.total_str}</div>
        </div>`).join("");
    } else {
      topHtml = `<div style="color:#888;text-align:center;padding:20px;font-size:12px;">Данных пока нет</div>`;
    }

    openModal(`
      <h2 style="margin-bottom:16px;">📊 Аналитика игроков</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
        ${statCard("👥", "Всего игроков", d.total_players)}
        ${statCard("🟢", "Онлайн сейчас", d.online_now, "#2ecc71")}
        ${statCard("🆕", "Новых сегодня", d.new_today, "#3498db")}
        ${statCard("🔥", "Активных сегодня", d.active_today, "#f39c12")}
      </div>
      <h3 style="color:#fff;margin:16px 0 8px;font-size:14px;">🆕 Последние регистрации</h3>
      <div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:10px;margin-bottom:16px;">
        ${recentHtml}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
        ${statCard("📅", "За неделю", d.active_week, "#9b59b6")}
        ${statCard("⏱", "Ср. сессия", d.avg_session_str, "#3498db")}
        ${statCard("📊", "Медиана", d.median_session_str, "#3498db")}
        ${statCard("🕐", "Всего часов", d.total_hours_played + "ч", "#f39c12")}
      </div>
      <div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:14px;margin-bottom:16px;text-align:center;">
        <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">🔄 Возвращаемость (retention)</div>
        <div style="font-size:36px;font-weight:900;color:${retentionColor};margin:8px 0;">${d.retention_pct}%</div>
        <div style="font-size:12px;color:#888;">${d.returned_count} из ${d.players_with_activity} игроков вернулись хотя бы раз</div>
      </div>
      <h3 style="color:#fff;margin:16px 0 8px;font-size:14px;">📈 Активность 7 дней</h3>
      <div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:12px;margin-bottom:16px;">
        <div style="display:flex;gap:4px;align-items:flex-end;height:100px;">
          ${actChart || '<div style="color:#888;width:100%;text-align:center;font-size:12px;align-self:center;">Данных нет</div>'}
        </div>
      </div>
      <h3 style="color:#fff;margin:16px 0 8px;font-size:14px;">📊 Retention по дням (7 дней)</h3>
      <div style="margin-bottom:16px;">${retHtml}</div>
      <h3 style="color:#fff;margin:16px 0 8px;font-size:14px;">🏆 Топ-10 игроков по времени</h3>
      <div style="margin-bottom:16px;">${topHtml}</div>
      <div style="font-size:11px;color:#666;text-align:center;padding:8px;line-height:1.4;">
        💡 Данные собираются с момента деплоя аналитики.<br>
        Retention первых дней = 0%, потому что "вернуться" можно только на следующий день.
      </div>
      <button class="btn btn-secondary" style="margin-top:8px" onclick="closeModal()">Закрыть</button>
    `);
  } catch(e) {
    toast("Ошибка аналитики: " + e.message, "error");
  }
}

boot();