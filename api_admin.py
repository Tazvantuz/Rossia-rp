# api_admin.py
"""Админ-панель + аналитика игроков + управление промокодами (боты исключены)."""
import json, time
from urllib.parse import parse_qsl
from aiohttp import web
from database import db
from game import MAX_LEVEL
from api_core import _user, _player, _player_json, _json_biz

ADMIN_USERNAME = "tazvantuzz"

async def _is_admin(request):
    try:
        init_data = request.headers.get("X-Init-Data")
        if not init_data:
            body_bytes = await request.read()
            body = json.loads(body_bytes)
            init_data = body.get("initData")
        if not init_data:
            return False
        parsed = dict(parse_qsl(init_data))
        user_str = parsed.get("user")
        if user_str:
            user = json.loads(user_str)
            return user.get("username") == ADMIN_USERNAME
    except: pass
    return False

async def api_admin_search(request):
    if not await _is_admin(request):
        return web.json_response({"error": "Доступ запрещен"}, status=403)
    body = await request.json()
    query = body.get("query", "").strip()
    if not query:
        return web.json_response({"players": []})
    rows = await db.fetchall(
        "SELECT user_id, nickname, balance, level FROM players "
        "WHERE nickname LIKE ? AND is_bot=0 LIMIT 20",
        (f"%{query}%",))
    return web.json_response({"players": [dict(r) for r in rows]})

async def api_admin_player_info(request):
    if not await _is_admin(request):
        return web.json_response({"error": "Доступ запрещен"}, status=403)
    body = await request.json()
    target_id = int(body.get("target_id"))
    p = await _player(target_id)
    if not p: return web.json_response({"error": "Игрок не найден"}, status=404)
    if p.get("is_bot"):
        return web.json_response({"error": "Это бот-игрок, нельзя редактировать"}, status=400)
    biz = _json_biz(p)
    biz_str = ", ".join([f"{b['id']} (ур.{b.get('level', 1)})" for b in biz]) if biz else "Нет"
    return web.json_response({
        "player": _player_json(p),
        "stats": {
            "gang": "Есть" if await db.fetchone("SELECT gang_id FROM gang_members WHERE user_id=?", (target_id,)) else "Нет",
            "businesses": biz_str,
            "casino_plays": p.get("casino_plays", 0),
            "crimes_won": p.get("crimes_won", 0)
        }
    })

async def api_admin_change_balance(request):
    if not await _is_admin(request):
        return web.json_response({"error": "Доступ запрещен"}, status=403)
    body = await request.json()
    target_id = int(body.get("target_id"))
    amount = int(body.get("amount"))
    p = await _player(target_id)
    if p and p.get("is_bot"):
        return web.json_response({"error": "Это бот-игрок"}, status=400)
    await db.execute("UPDATE players SET balance = balance + ? WHERE user_id = ?", (amount, target_id))
    return web.json_response({"success": True})

async def api_admin_delete(request):
    if not await _is_admin(request):
        return web.json_response({"error": "Доступ запрещен"}, status=403)
    body = await request.json()
    target_id = int(body.get("target_id"))
    p = await _player(target_id)
    if p and p.get("is_bot"):
        return web.json_response({"error": "Ботов удалять нельзя через панель"}, status=400)
    await db.execute("DELETE FROM players WHERE user_id = ?", (target_id,))
    await db.execute("DELETE FROM gang_members WHERE user_id = ?", (target_id,))
    await db.execute("DELETE FROM trades WHERE from_user = ? OR to_user = ?", (target_id, target_id))
    return web.json_response({"success": True})

async def api_admin_set_level(request):
    if not await _is_admin(request):
        return web.json_response({"error": "Доступ запрещен"}, status=403)
    body = await request.json()
    target_id = int(body.get("target_id"))
    new_level = int(body.get("level", 1))
    p = await _player(target_id)
    if p and p.get("is_bot"):
        return web.json_response({"error": "Это бот-игрок"}, status=400)
    if new_level < 1: new_level = 1
    if new_level > MAX_LEVEL: new_level = MAX_LEVEL
    await db.execute("UPDATE players SET level = ?, xp = 0 WHERE user_id = ?", (new_level, target_id))
    return web.json_response({"success": True})

# ═══════════ АНАЛИТИКА ═══════════
async def api_admin_analytics(request):
    if not await _is_admin(request):
        return web.json_response({"error": "Доступ запрещен"}, status=403)

    now = int(time.time())
    today_day = now // 86400

    total = (await db.fetchone(
        "SELECT COUNT(*) as c FROM players WHERE is_bot=0"))["c"]
    online = (await db.fetchone(
        "SELECT COUNT(*) as c FROM players WHERE last_seen > ? AND is_bot=0",
        (now - 120,)))["c"]
    
    # ИСПРАВЛЕНО: используем локальное время
    new_today = (await db.fetchone(
        "SELECT COUNT(*) as c FROM players WHERE date(created_at, 'localtime') = date('now', 'localtime') AND is_bot=0"
    ))["c"]

    # ИСПРАВЛЕНО: активные сегодня (локальное время)
    active_today = (await db.fetchone(
        "SELECT COUNT(DISTINCT pda.user_id) as c FROM player_daily_activity pda "
        "JOIN players p ON p.user_id = pda.user_id "
        "WHERE date(pda.day * 86400, 'unixepoch', 'localtime') = date('now', 'localtime') AND p.is_bot=0"
    ))["c"]

    # ИСПРАВЛЕНО: активные за неделю (локальное время)
    active_week = (await db.fetchone(
        "SELECT COUNT(DISTINCT pda.user_id) as c FROM player_daily_activity pda "
        "JOIN players p ON p.user_id = pda.user_id "
        "WHERE date(pda.day * 86400, 'unixepoch', 'localtime') >= date('now', 'localtime', '-6 days') AND p.is_bot=0"
    ))["c"]

    sessions_rows = await db.fetchall(
        "SELECT pda.user_id, pda.day, pda.requests, pda.first_seen, pda.last_seen "
        "FROM player_daily_activity pda "
        "JOIN players p ON p.user_id = pda.user_id "
        "WHERE pda.requests > 0 AND p.is_bot=0")
    sessions_sec = []
    for s in sessions_rows:
        est = min(s["requests"] * 30, 8 * 3600)
        sessions_sec.append(est)
    sessions_sec.sort()
    n = len(sessions_sec)
    if n > 0:
        avg_sec = sum(sessions_sec) / n
        median_sec = sessions_sec[n // 2]
        total_hours = sum(sessions_sec) / 3600
    else:
        avg_sec = median_sec = total_hours = 0

    players_first = await db.fetchall(
        "SELECT pda.user_id, MIN(pda.day) as first_day "
        "FROM player_daily_activity pda "
        "JOIN players p ON p.user_id = pda.user_id "
        "WHERE p.is_bot=0 "
        "GROUP BY pda.user_id")
    total_with_activity = len(players_first)
    returned = 0
    first_day_counts = {}
    for pf in players_first:
        fd = pf["first_day"]
        if fd not in first_day_counts:
            first_day_counts[fd] = {"total": 0, "returned": 0}
        first_day_counts[fd]["total"] += 1
        later = await db.fetchone(
            "SELECT 1 FROM player_daily_activity WHERE user_id=? AND day > ? LIMIT 1",
            (pf["user_id"], fd))
        if later:
            returned += 1
            first_day_counts[fd]["returned"] += 1

    overall_retention = (returned / total_with_activity * 100) if total_with_activity else 0

    retention_by_day = []
    for i in range(6, -1, -1):
        d = today_day - i
        if d in first_day_counts:
            c = first_day_counts[d]
            pct = (c["returned"] / c["total"] * 100) if c["total"] else 0
            retention_by_day.append({
                "day": d,
                "date": time.strftime("%d.%m", time.gmtime(d * 86400)),
                "new": c["total"],
                "returned": c["returned"],
                "pct": round(pct, 1),
            })

    top_rows = await db.fetchall(
        "SELECT pda.user_id, p.nickname, "
        "SUM(MIN(pda.requests * 30, 28800)) as total_sec "
        "FROM player_daily_activity pda "
        "JOIN players p ON p.user_id = pda.user_id "
        "WHERE p.is_bot=0 "
        "GROUP BY pda.user_id ORDER BY total_sec DESC LIMIT 10")
    top_players = []
    for r in top_rows:
        sec = r["total_sec"] or 0
        hours = int(sec // 3600)
        mins = int((sec % 3600) // 60)
        top_players.append({
            "user_id": r["user_id"],
            "nickname": r["nickname"],
            "total_sec": int(sec),
            "total_str": f"{hours}ч {mins}м" if hours > 0 else f"{mins}м",
        })

    # ИСПРАВЛЕНО: график активности по локальным дням
    daily_activity = []
    rows = await db.fetchall(
        "SELECT date(pda.day * 86400, 'unixepoch', 'localtime') as local_date, COUNT(DISTINCT pda.user_id) as c "
        "FROM player_daily_activity pda JOIN players p ON p.user_id=pda.user_id "
        "WHERE pda.day >= ? AND p.is_bot=0 GROUP BY local_date", (today_day - 6,))
    counts = {r['local_date']: r['c'] for r in rows}
    for i in range(6, -1, -1):
        d = time.localtime(time.time() - i * 86400)
        date_str = time.strftime("%Y-%m-%d", d)
        label = time.strftime("%d.%m", d)
        daily_activity.append({"date": label, "count": counts.get(date_str, 0)})

    recent_rows = await db.fetchall(
        "SELECT user_id, nickname, strftime('%s', created_at) as created_ts "
        "FROM players WHERE is_bot=0 "
        "ORDER BY created_at DESC, user_id DESC LIMIT 10")
    recent_players = []
    for r in recent_rows:
        try:
            ts = int(r["created_ts"]) if r.get("created_ts") else 0
        except Exception:
            ts = 0
        recent_players.append({
            "user_id": r["user_id"],
            "nickname": r["nickname"] or "?",
            "created_ts": ts,
        })

    return web.json_response({
        "total_players": total,
        "online_now": online,
        "new_today": new_today,
        "active_today": active_today,
        "active_week": active_week,
        "avg_session_sec": int(avg_sec),
        "avg_session_str": _fmt_duration(int(avg_sec)),
        "median_session_sec": int(median_sec),
        "median_session_str": _fmt_duration(int(median_sec)),
        "total_hours_played": round(total_hours, 1),
        "retention_pct": round(overall_retention, 1),
        "returned_count": returned,
        "players_with_activity": total_with_activity,
        "retention_by_day": retention_by_day,
        "top_players": top_players,
        "daily_activity": daily_activity,
        "recent_players": recent_players,
    })

def _fmt_duration(sec):
    if sec < 60: return f"{sec}с"
    if sec < 3600: return f"{sec // 60}м"
    h = sec // 3600
    m = (sec % 3600) // 60
    return f"{h}ч {m}м" if m > 0 else f"{h}ч"

# ═══════════ ПРОМОКОДЫ (админ) ═══════════
async def api_admin_promo_list(request):
    if not await _is_admin(request):
        return web.json_response({"error": "Доступ запрещен"}, status=403)
    rows = await db.fetchall(
        "SELECT code, bonus, uses_left, uses_total, created_at "
        "FROM promo_codes ORDER BY created_at DESC LIMIT 200")
    return web.json_response({"promo_codes": rows})

async def api_admin_promo_create(request):
    if not await _is_admin(request):
        return web.json_response({"error": "Доступ запрещен"}, status=403)
    body = await request.json()
    code = (body.get("code") or "").strip().upper()
    if not code:
        return web.json_response({"error": "Введи код"}, status=400)
    if len(code) > 64:
        return web.json_response({"error": "Код длиннее 64 символов"}, status=400)
    if not all(c.isalnum() or c in "_-" for c in code):
        return web.json_response({"error": "Только латиница, цифры, _ и -"}, status=400)
    try: bonus = int(body.get("bonus", 0))
    except: bonus = 0
    try: uses = int(body.get("uses", 1))
    except: uses = 1
    if bonus <= 0:
        return web.json_response({"error": "Бонус должен быть > 0"}, status=400)
    if bonus > 100000000:
        return web.json_response({"error": "Слишком большой бонус"}, status=400)
    if uses <= 0:
        return web.json_response({"error": "Количество использований > 0"}, status=400)
    if uses > 100000:
        return web.json_response({"error": "Слишком много использований"}, status=400)
    existing = await db.fetchone("SELECT code FROM promo_codes WHERE code=?", (code,))
    if existing:
        return web.json_response({"error": "Такой код уже существует"}, status=400)
    await db.execute(
        "INSERT INTO promo_codes (code, bonus, uses_left, uses_total) VALUES (?,?,?,?)",
        (code, bonus, uses, uses))
    row = await db.fetchone(
        "SELECT code, bonus, uses_left, uses_total, created_at FROM promo_codes WHERE code=?",
        (code,))
    return web.json_response({"ok": True, "promo": row})

async def api_admin_promo_delete(request):
    if not await _is_admin(request):
        return web.json_response({"error": "Доступ запрещен"}, status=403)
    body = await request.json()
    code = (body.get("code") or "").strip().upper()
    if not code:
        return web.json_response({"error": "Не указан код"}, status=400)
    await db.execute("DELETE FROM promo_codes WHERE code=?", (code,))
    await db.execute("DELETE FROM promo_used WHERE code=?", (code,))
    return web.json_response({"ok": True})