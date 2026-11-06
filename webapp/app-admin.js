// app-admin.js
// Админ-панель, аналитика, финальная инициализация (boot)

// ══════════════════════════════════════════════════════════════
//  ПРОВЕРКА ДОСТУПА
// ══════════════════════════════════════════════════════════════
function checkAdminAccess() {
  const user = tg?.initDataUnsafe?.user;
  if (user && user.username === "tazvantuzz") {
    const btn = document.getElementById("btn-admin-panel");
    if (btn) btn.style.display = "block";
  }
}

// ══════════════════════════════════════════════════════════════
//  ПОИСК ИГРОКА
// ══════════════════════════════════════════════════════════════
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
  } catch(e) {
    toast(e.message, "error");
  }
}

async function adminDeletePlayer(id, nick) {
  if (!confirm(`Ты уверен, что хочешь ПОЛНОСТЬЮ УДАЛИТЬ аккаунт "${nick}"?`)) return;
  await api("admin/delete", { target_id: id });
  toast("Аккаунт удален", "success");
  document.getElementById("admin-player-details").style.display = "none";
  adminSearch();
}

// ══════════════════════════════════════════════════════════════
//  АНАЛИТИКА
// ══════════════════════════════════════════════════════════════
async function showAdminAnalytics() {
  try {
    const d = await api("admin/analytics", {});

    // Карточки с общими цифрами
    const statCard = (icon, label, value, color) => `
      <div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:14px;text-align:center;">
        <div style="font-size:24px;">${icon}</div>
        <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px;">${label}</div>
        <div style="font-size:20px;font-weight:900;color:${color || '#fff'};margin-top:4px;">${value}</div>
      </div>
    `;

    const retentionColor = d.retention_pct >= 30 ? '#2ecc71' : d.retention_pct >= 15 ? '#f39c12' : '#e74c3c';

    // График активности 7 дней
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

    // Retention по дням
    let retHtml = "";
    if (d.retention_by_day && d.retention_by_day.length > 0) {
      retHtml = d.retention_by_day.map(r => {
        const color = r.pct >= 50 ? '#2ecc71' : r.pct >= 25 ? '#f39c12' : '#e74c3c';
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:#111;border-radius:8px;margin-bottom:4px;">
          <div>
            <div style="font-weight:700;color:#fff;font-size:13px;">${r.date}</div>
            <div style="font-size:11px;color:#888;">${r.new} новых → ${r.returned} вернулось</div>
          </div>
          <div style="font-size:16px;font-weight:900;color:${color};">${r.pct}%</div>
        </div>`;
      }).join("");
    } else {
      retHtml = `<div style="color:#888;text-align:center;padding:20px;font-size:12px;">Данных пока нет. Появятся через 2+ дня работы</div>`;
    }

    // Топ игроков
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

// ══════════════════════════════════════════════════════════════
//  BOOT — ФИНАЛЬНЫЙ ЗАПУСК (всё загружено)
// ══════════════════════════════════════════════════════════════
boot();