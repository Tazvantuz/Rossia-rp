# api_admin.py
"""Админ-панель + аналитика игроков."""
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

# ═══════════ СУЩЕСТВУЮЩИЕ ЭНДПОИНТЫ ═══════════
async def api_admin_search(request):
    if not await _is_admin(request):
        return web.json_response({"error": "Доступ запрещен"}, status=403)
    body = await request.json()
    query = body.get("query", "").strip()
    if not query:
        return web.json_response({"players": []})
    rows = await db.fetchall(
        "SELECT user_id, nickname, balance, level FROM players WHERE nickname LIKE ? LIMIT 20",
        (f"%{query}%",))
    return web.json_response({"players": [dict(r) for r in rows]})

async def api_admin_player_info(request):
    if not await _is_admin(request):
        return web.json_response({"error": "Доступ запрещен"}, status=403)
    body = await request.json()
    target_id = int(body.get("target_id"))
    p = await _player(target_id)
    if not p: return web.json_response({"error": "Игрок не найден"}, status=404)
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
    await db.execute("UPDATE players SET balance = balance + ? WHERE user_id = ?", (amount, target_id))
    return web.json_response({"success": True})

async def api_admin_delete(request):
    if not await _is_admin(request):
        return web.json_response({"error": "Доступ запрещен"}, status=403)
    body = await request.json()
    target_id = int(body.get("target_id"))
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
    if new_level < 1: new_level = 1
    if new_level > MAX_LEVEL: new_level = MAX_LEVEL
    await db.execute("UPDATE players SET level = ?, xp = 0 WHERE user_id = ?", (new_level, target_id))
    return web.json_response({"success": True})

# ═══════════ 🆕 АНАЛИТИКА ═══════════
async def api_admin_analytics(request):
    if not await _is_admin(request):
        return web.json_response({"error": "Доступ запрещен"}, status=403)

    now = int(time.time())
    today_day = now // 86400

    # ═══ 1. ОБЩИЕ ЦИФРЫ ═══
    total = (await db.fetchone("SELECT COUNT(*) as c FROM players"))["c"]
    online = (await db.fetchone("SELECT COUNT(*) as c FROM players WHERE last_seen > ?", (now - 120,)))["c"]
    new_today = (await db.fetchone(
        "SELECT COUNT(*) as c FROM players WHERE strftime('%s', created_at) > ?",
        (today_day * 86400,)))["c"]

    # ═══ 2. АКТИВНЫЕ СЕГОДНЯ / ЗА НЕДЕЛЮ ═══
    active_today = (await db.fetchone(
        "SELECT COUNT(DISTINCT user_id) as c FROM player_daily_activity WHERE day=?", (today_day,)))["c"]
    week_start = today_day - 6
    active_week = (await db.fetchone(
        "SELECT COUNT(DISTINCT user_id) as c FROM player_daily_activity WHERE day>=?", (week_start,)))["c"]

    # ═══ 3. СРЕДНЕЕ ВРЕМЯ СЕССИИ ═══
    # Сессия = requests * 30 сек (throttle в _user), cap на 8ч на день
    sessions_rows = await db.fetchall(
        "SELECT user_id, day, requests, first_seen, last_seen FROM player_daily_activity "
        "WHERE requests > 0")
    sessions_sec = []
    for s in sessions_rows:
        est = min(s["requests"] * 30, 8 * 3600)  # не больше 8ч на день
        sessions_sec.append(est)
    sessions_sec.sort()
    n = len(sessions_sec)
    if n > 0:
        avg_sec = sum(sessions_sec) / n
        median_sec = sessions_sec[n // 2]
        total_hours = sum(sessions_sec) / 3600
    else:
        avg_sec = median_sec = total_hours = 0

    # ═══ 4. RETENTION (возвращаемость) ═══
    # Игрок "вернулся" = есть активность на день > первый день его активности
    players_first = await db.fetchall(
        "SELECT user_id, MIN(day) as first_day FROM player_daily_activity GROUP BY user_id")
    total_with_activity = len(players_first)
    returned = 0
    first_day_counts = {}  # {first_day: {total, returned}}
    for pf in players_first:
        fd = pf["first_day"]
        if fd not in first_day_counts:
            first_day_counts[fd] = {"total": 0, "returned": 0}
        first_day_counts[fd]["total"] += 1
        # Ищем активность позже первого дня
        later = await db.fetchone(
            "SELECT 1 FROM player_daily_activity WHERE user_id=? AND day > ? LIMIT 1",
            (pf["user_id"], fd))
        if later:
            returned += 1
            first_day_counts[fd]["returned"] += 1

    overall_retention = (returned / total_with_activity * 100) if total_with_activity else 0

    # Retention по когортам за последние 7 дней
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

    # ═══ 5. ТОП-10 ИГРОКОВ ПО ВРЕМЕНИ ═══
    top_rows = await db.fetchall(
        "SELECT pda.user_id, p.nickname, "
        "SUM(MIN(pda.requests * 30, 28800)) as total_sec "
        "FROM player_daily_activity pda "
        "JOIN players p ON p.user_id = pda.user_id "
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

    # ═══ 6. АКТИВНОСТЬ ПО ДНЯМ (график 7 дней) ═══
    daily_activity = []
    for i in range(6, -1, -1):
        d = today_day - i
        cnt = (await db.fetchone(
            "SELECT COUNT(DISTINCT user_id) as c FROM player_daily_activity WHERE day=?", (d,)))["c"]
        daily_activity.append({
            "date": time.strftime("%d.%m", time.gmtime(d * 86400)),
            "count": cnt,
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
    })

def _fmt_duration(sec):
    if sec < 60: return f"{sec}с"
    if sec < 3600: return f"{sec // 60}м"
    h = sec // 3600
    m = (sec % 3600) // 60
    return f"{h}ч {m}м" if m > 0 else f"{h}ч"