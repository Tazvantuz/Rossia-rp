# api_social.py
"""Социалка: локации, профиль, трейды, чат, друзья, уведомления, лидерборд."""
import json, time
from aiohttp import web
from database import db
from game import (
    LOCATIONS, ITEMS, BUSINESSES, GANG_TERRITORIES,
    get_combat_stats, item_json, get_outfit, crypto_price,
)
from api_core import (
    _user, _player, _add_inv, _remove_inv, _has_inv, _player_json,
    _json_biz, _json_ach, _nick_tag, _check_achievements,
    USER_LAST_CHAT, CHAT_COOLDOWN,
    BOT_IDS_SET, bot_online_ids,
)

async def api_location(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    loc_id = None
    try:
        body = await request.json(); loc_id = body.get("location_id")
    except: pass
    if loc_id is None: loc_id = p["location_id"]
    if loc_id < 0 or loc_id >= len(LOCATIONS):
        return web.json_response({"error":"Локация"}, status=400)
    others = await db.fetchall(
        "SELECT p.user_id, p.nickname, p.level, p.balance, p.last_seen, p.tg_username, p.is_bot, "
        "g.tag AS gang_tag, g.tag_color AS gang_tag_color "
        "FROM players p "
        "LEFT JOIN gang_members gm ON gm.user_id = p.user_id "
        "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
        "WHERE p.location_id=? AND p.user_id!=?",
        (loc_id, uid))
    now_ts = int(time.time())
    online_ids = bot_online_ids(now_ts)
    for _o in others:
        if _o.get("is_bot"):
            _o["is_online"] = _o["user_id"] in online_ids
        else:
            _o["is_online"] = (_o.get("last_seen") or 0) > now_ts - 120
    return web.json_response({
        "location": LOCATIONS[loc_id],
        "locations": LOCATIONS,
        "players": others,
        "is_here": loc_id == p["location_id"],
    })

async def api_move(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    loc_id = body.get("location_id")
    if loc_id is None or loc_id < 0 or loc_id >= len(LOCATIONS):
        return web.json_response({"error":"Локация"}, status=400)
    await db.execute("UPDATE players SET location_id=? WHERE user_id=?", (loc_id, uid))
    return web.json_response({"ok": True})

async def api_player_view(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    target_id = int(body.get("user_id",0))
    t = await _player(target_id)
    if not t: return web.json_response({"error":"Нет"}, status=404)
    is_friend = bool(await db.fetchone("SELECT 1 FROM friends WHERE user_id=? AND friend_id=? AND status='accepted'", (uid, target_id)))
    friend_pending = bool(await db.fetchone("SELECT 1 FROM friends WHERE user_id=? AND friend_id=? AND status='pending'", (uid, target_id)))
    target_gang = await db.fetchone("SELECT gang_id FROM gang_members WHERE user_id=?", (target_id,))
    my_gang = await db.fetchone("SELECT gang_id, role FROM gang_members WHERE user_id=?", (uid,))
    now_ts = int(time.time())
    if t.get("is_bot"):
        is_online = target_id in bot_online_ids(now_ts)
    else:
        is_online = (t.get("last_seen") or 0) > now_ts - 120
    return web.json_response({
        "user_id": t["user_id"], "nickname": t["nickname"],
        "gang_tag": t.get("gang_tag"),
        "gang_tag_color": t.get("gang_tag_color"),
        "tg_username": t.get("tg_username"),
        "level": t["level"], "balance": t["balance"],
        "last_seen": t.get("last_seen", 0),
        "outfit": get_outfit(t),
        "businesses_count": len(_json_biz(t)),
        "achievements": _json_ach(t),
        "combat_stats": get_combat_stats(t),
        "is_friend": is_friend,
        "friend_pending": friend_pending,
        "target_in_gang": bool(target_gang),
        "my_role": my_gang["role"] if my_gang else None,
        "is_online": is_online,
    })

async def api_player_items(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    target = int(body.get("user_id",0))
    rows = await db.fetchall(
        "SELECT item_id, quantity FROM inventory WHERE user_id=? AND quantity>0 ORDER BY item_id",
        (target,))
    items = []
    for r in rows:
        ij = item_json(r["item_id"])
        if ij:
            ij["quantity"] = r["quantity"]
            items.append(ij)
    return web.json_response({"items": items})

async def api_trade_send(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    to_user = int(body.get("to_user",0))
    give_money = int(body.get("give_money",0))
    give_items = body.get("give_items",[]) or []
    want_money = int(body.get("want_money",0))
    want_items = body.get("want_items",[]) or []
    if to_user == uid or not to_user:
        return web.json_response({"error":"Нельзя"}, status=400)
    t = await _player(to_user)
    if not t: return web.json_response({"error":"Нет игрока"}, status=400)
    p = await _player(uid)
    if give_money < 0 or want_money < 0:
        return web.json_response({"error":"Сумма"}, status=400)
    if give_money > p["balance"]:
        return web.json_response({"error":"Недостаточно денег"}, status=400)
    for iid in give_items:
        if not await _has_inv(uid, iid):
            return web.json_response({"error":f"Нет {iid}"}, status=400)
    tid = await db.execute(
        "INSERT INTO trades (from_user,to_user,give_money,give_items,want_money,want_items) "
        "VALUES (?,?,?,?,?,?)",
        (uid, to_user, give_money, json.dumps(give_items), want_money, json.dumps(want_items)))
    await db.execute(
        "INSERT INTO notifications (user_id, type, text, data) VALUES (?, 'trade', ?, ?)",
        (to_user, f"Трейд от {_nick_tag(p)}", json.dumps({"trade_id": tid})))
    return web.json_response({"ok": True, "trade_id": tid})

async def api_trade_details(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    tid = int(body.get("trade_id", 0))
    if not tid:
        return web.json_response({"error": "Нет trade_id"}, status=400)
    t = await db.fetchone(
        "SELECT * FROM trades WHERE trade_id=? AND to_user=? AND status='pending'",
        (tid, uid))
    if not t:
        return web.json_response({"error": "Трейд не найден или уже обработан"}, status=404)
    from_user = t["from_user"]
    p_from = await _player(from_user)
    give_items_ids = json.loads(t.get("give_items") or "[]")
    want_items_ids = json.loads(t.get("want_items") or "[]")
    give_items_data = []
    for iid in give_items_ids:
        ij = item_json(iid)
        if ij: give_items_data.append(ij)
    want_items_data = []
    for iid in want_items_ids:
        ij = item_json(iid)
        if ij: want_items_data.append(ij)
    return web.json_response({
        "trade_id": tid,
        "from_user": from_user,
        "from_nickname": p_from["nickname"] if p_from else "?",
        "from_gang_tag": p_from.get("gang_tag") if p_from else None,
        "from_gang_tag_color": p_from.get("gang_tag_color") if p_from else None,
        "give_money": t["give_money"],
        "give_items": give_items_data,
        "want_money": t["want_money"],
        "want_items": want_items_data,
    })

async def _cleanup_trade_notifs(uid, tid):
    try:
        all_notifs = await db.fetchall(
            "SELECT id, data FROM notifications WHERE user_id=? AND type='trade'", (uid,))
        for n in all_notifs:
            try:
                if json.loads(n.get("data") or "{}").get("trade_id") == tid:
                    await db.execute("DELETE FROM notifications WHERE id=?", (n["id"],))
                    break
            except: pass
    except: pass

async def api_trades_list(request):
    ud = await _user(request); uid = ud["id"]
    incoming = await db.fetchall(
        "SELECT * FROM trades WHERE to_user=? AND status='pending' ORDER BY created_at DESC",
        (uid,))
    outgoing = await db.fetchall(
        "SELECT * FROM trades WHERE from_user=? AND status='pending' ORDER BY created_at DESC",
        (uid,))
    def enrich(t):
        t["give_items"] = json.loads(t.get("give_items") or "[]")
        t["want_items"] = json.loads(t.get("want_items") or "[]")
        return t
    inc_enriched = []
    for t in incoming:
        t2 = enrich(t)
        sender = await _player(t["from_user"])
        if sender:
            t2["other_nickname"] = sender["nickname"]
            t2["other_gang_tag"] = sender.get("gang_tag")
            t2["other_gang_tag_color"] = sender.get("gang_tag_color")
        inc_enriched.append(t2)
    out_enriched = []
    for t in outgoing:
        t2 = enrich(t)
        receiver = await _player(t["to_user"])
        if receiver:
            t2["other_nickname"] = receiver["nickname"]
            t2["other_gang_tag"] = receiver.get("gang_tag")
            t2["other_gang_tag_color"] = receiver.get("gang_tag_color")
        out_enriched.append(t2)
    return web.json_response({"incoming": inc_enriched, "outgoing": out_enriched})

async def api_trade_accept(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    tid = int(body.get("trade_id",0))
    t = await db.fetchone("SELECT * FROM trades WHERE trade_id=? AND to_user=? AND status='pending'",
                          (tid, uid))
    if not t: return web.json_response({"error":"Нет"}, status=400)
    from_user = t["from_user"]
    give_money = t["give_money"]; give_items = json.loads(t["give_items"] or "[]")
    want_money = t["want_money"]; want_items = json.loads(t["want_items"] or "[]")
    p_from = await _player(from_user); p_to = await _player(uid)
    if p_from["balance"] < give_money:
        return web.json_response({"error":"У отправителя нет денег"}, status=400)
    if p_to["balance"] < want_money:
        return web.json_response({"error":"У тебя нет денег"}, status=400)
    for iid in give_items:
        if not await _has_inv(from_user, iid):
            return web.json_response({"error":"У отправителя нет предмета"}, status=400)
    for iid in want_items:
        if not await _has_inv(uid, iid):
            return web.json_response({"error":f"У тебя нет предмета"}, status=400)
    if give_money: await db.execute("UPDATE players SET balance=balance-? WHERE user_id=?", (give_money, from_user))
    if give_money: await db.execute("UPDATE players SET balance=balance+? WHERE user_id=?", (give_money, uid))
    if want_money: await db.execute("UPDATE players SET balance=balance-? WHERE user_id=?", (want_money, uid))
    if want_money: await db.execute("UPDATE players SET balance=balance+? WHERE user_id=?", (want_money, from_user))
    for iid in give_items:
        await _remove_inv(from_user, iid, 1); await _add_inv(uid, iid, 1)
    for iid in want_items:
        await _remove_inv(uid, iid, 1); await _add_inv(from_user, iid, 1)
    await db.execute("UPDATE trades SET status='accepted' WHERE trade_id=?", (tid,))
    await db.execute("UPDATE players SET trades_done=trades_done+1 WHERE user_id IN (?,?)",
                     (from_user, uid))
    await _cleanup_trade_notifs(uid, tid)
    p_to2 = await _player(uid)
    await _check_achievements(uid, p_to2)
    await _check_achievements(from_user, await _player(from_user))
    return web.json_response({"player": _player_json(p_to2), "success": True})

async def api_trade_decline(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    tid = int(body.get("trade_id",0))
    await db.execute("UPDATE trades SET status='declined' WHERE trade_id=? AND (to_user=? OR from_user=?)",
                     (tid, uid, uid))
    await _cleanup_trade_notifs(uid, tid)
    return web.json_response({"ok": True})

async def api_leaderboard(request):
    ud = await _user(request)
    try: body = await request.json()
    except: body = {}
    category = body.get("category", "money")

    if category == "money":
        rows = await db.fetchall(
            "SELECT p.nickname, p.balance, p.level, p.businesses, "
            "g.tag AS gang_tag, g.tag_color AS gang_tag_color "
            "FROM players p "
            "LEFT JOIN gang_members gm ON gm.user_id = p.user_id "
            "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
            "ORDER BY p.balance DESC LIMIT 20")
        result = [{"rank":i+1,"nickname":r["nickname"],
                   "gang_tag":r.get("gang_tag"),
                   "gang_tag_color":r.get("gang_tag_color"),
                   "balance":r["balance"],"level":r["level"],
                   "businesses_count":len(_json_biz(r))}
                  for i,r in enumerate(rows)]
    elif category == "level":
        rows = await db.fetchall(
            "SELECT p.nickname, p.balance, p.level, p.xp, "
            "g.tag AS gang_tag, g.tag_color AS gang_tag_color "
            "FROM players p "
            "LEFT JOIN gang_members gm ON gm.user_id = p.user_id "
            "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
            "ORDER BY p.level DESC, p.xp DESC LIMIT 20")
        result = [{"rank":i+1,"nickname":r["nickname"],
                   "gang_tag":r.get("gang_tag"),
                   "gang_tag_color":r.get("gang_tag_color"),
                   "level":r["level"],"xp":r["xp"],"balance":r["balance"]}
                  for i,r in enumerate(rows)]
    elif category == "gang":
        rows = await db.fetchall(
            "SELECT g.gang_id, g.name, g.emoji, g.tag, g.tag_color, g.treasury, "
            "(SELECT COUNT(*) FROM gang_territories WHERE gang_id=g.gang_id) as terr_count "
            "FROM gangs g ORDER BY terr_count DESC, g.treasury DESC LIMIT 20")
        all_mem = await db.fetchall(
            "SELECT gm.gang_id, p.head_id, p.body_id, p.legs_id, p.right_hand_id, p.left_hand_id "
            "FROM gang_members gm JOIN players p ON p.user_id = gm.user_id"
        )
        dmg_by_gang = {}; mem_count = {}
        for m in all_mem:
            stats = get_combat_stats(m)
            dmg_by_gang[m["gang_id"]] = dmg_by_gang.get(m["gang_id"], 0) + stats.get("damage", 5)
            mem_count[m["gang_id"]] = mem_count.get(m["gang_id"], 0) + 1
        terr_incomes = {t["id"]: t["income"] for t in GANG_TERRITORIES}
        terr_rows = await db.fetchall(
            "SELECT territory_id, gang_id FROM gang_territories WHERE gang_id IS NOT NULL")
        income_by_gang = {}
        for r in terr_rows:
            gid = r["gang_id"]
            income_by_gang[gid] = income_by_gang.get(gid,0) + terr_incomes.get(r["territory_id"],0)
        result = [{"rank":i+1,"gang_id":r["gang_id"],"name":r["name"],"emoji":r["emoji"],
                   "tag":r.get("tag"),"tag_color":r.get("tag_color"),
                   "treasury":r["treasury"],"territories_count":r["terr_count"],
                   "total_damage":dmg_by_gang.get(r["gang_id"], 0),
                   "members_count":mem_count.get(r["gang_id"], 0),
                   "income":income_by_gang.get(r["gang_id"],0)}
                  for i,r in enumerate(rows)]
    else:
        result = []
    return web.json_response({"leaders": result, "category": category})

async def api_friend_search(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json(); q = body.get("query", "").strip()
    if len(q) < 2: return web.json_response({"error": "Минимум 2 символа"}, status=400)
    rows = await db.fetchall(
        "SELECT p.user_id, p.nickname, p.level, p.tg_username, p.is_bot, "
        "g.tag AS gang_tag, g.tag_color AS gang_tag_color "
        "FROM players p "
        "LEFT JOIN gang_members gm ON gm.user_id = p.user_id "
        "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
        "WHERE p.nickname LIKE ? AND p.user_id != ? LIMIT 10",
        (f"%{q}%", uid))
    now_ts = int(time.time())
    online_ids = bot_online_ids(now_ts)
    for r in rows:
        if r.get("is_bot"):
            r["is_online"] = r["user_id"] in online_ids
        else:
            r["is_online"] = (r.get("last_seen") or 0) > now_ts - 120
    return web.json_response({"results": rows})

async def api_friend_request(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json(); target_id = int(body.get("target_id", 0))
    if target_id == uid: return web.json_response({"error": "Себя нельзя"}, status=400)
    p = await _player(uid)
    target = await _player(target_id)
    if not target: return web.json_response({"error": "Игрок не найден"}, status=404)
    if await db.fetchone("SELECT * FROM friends WHERE user_id=? AND friend_id=?", (uid, target_id)):
        return web.json_response({"error": "Запрос уже отправлен"}, status=400)
    ex2 = await db.fetchone("SELECT * FROM friends WHERE user_id=? AND friend_id=? AND status='pending'", (target_id, uid))
    if ex2:
        await db.execute("UPDATE friends SET status='accepted' WHERE user_id=? AND friend_id=?", (target_id, uid))
        await db.execute("INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'accepted')", (uid, target_id))
        return web.json_response({"ok": True, "accepted": True})
    await db.execute("INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'pending')", (uid, target_id))
    await db.execute(
        "INSERT INTO notifications (user_id, type, text, data) VALUES (?, 'friend', ?, ?)",
        (target_id, f"Запрос в друзья от {_nick_tag(p)}", json.dumps({"user_id": uid})))
    return web.json_response({"ok": True})

async def _cleanup_friend_notifs(uid, target_id):
    try:
        all_notifs = await db.fetchall(
            "SELECT id, data FROM notifications WHERE user_id=? AND type='friend'", (uid,))
        for n in all_notifs:
            try:
                if json.loads(n.get("data") or "{}").get("user_id") == target_id:
                    await db.execute("DELETE FROM notifications WHERE id=?", (n["id"],))
                    break
            except: pass
    except: pass

async def api_friend_respond(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json(); target_id = int(body.get("target_id", 0)); accept = bool(body.get("accept"))
    ex = await db.fetchone("SELECT * FROM friends WHERE user_id=? AND friend_id=? AND status='pending'", (target_id, uid))
    if not ex: return web.json_response({"error": "Запрос не найден"}, status=404)
    if accept:
        await db.execute("UPDATE friends SET status='accepted' WHERE user_id=? AND friend_id=?", (target_id, uid))
        await db.execute("INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'accepted')", (uid, target_id))
    else:
        await db.execute("DELETE FROM friends WHERE user_id=? AND friend_id=?", (target_id, uid))
    await _cleanup_friend_notifs(uid, target_id)
    return web.json_response({"ok": True})

async def api_friend_remove(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    target_id = int(body.get("target_id", 0))
    if not target_id or target_id == uid:
        return web.json_response({"error": "Неверный ID"}, status=400)
    f = await db.fetchone("SELECT 1 FROM friends WHERE user_id=? AND friend_id=? AND status='accepted'", (uid, target_id))
    if not f:
        return web.json_response({"error": "Не в друзьях"}, status=400)
    await db.execute("DELETE FROM friends WHERE (user_id=? AND friend_id=?) OR (user_id=? AND friend_id=?)",
                     (uid, target_id, target_id, uid))
    return web.json_response({"ok": True})

async def api_friend_list(request):
    ud = await _user(request); uid = ud["id"]
    now = int(time.time())
    online_ids = bot_online_ids(now)
    friends = await db.fetchall(
        "SELECT f.friend_id as user_id, p.nickname, p.level, p.last_seen, p.tg_username, p.is_bot, "
        "g.tag AS gang_tag, g.tag_color AS gang_tag_color "
        "FROM friends f "
        "JOIN players p ON p.user_id=f.friend_id "
        "LEFT JOIN gang_members gm ON gm.user_id = p.user_id "
        "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
        "WHERE f.user_id=? AND f.status='accepted'", (uid,))
    for f in friends:
        if f.get("is_bot"):
            f["is_online"] = f["user_id"] in online_ids
        else:
            f["is_online"] = (f.get("last_seen") or 0) > now - 120
    reqs = await db.fetchall(
        "SELECT f.user_id, p.nickname, p.level, p.last_seen, p.tg_username, p.is_bot, "
        "g.tag AS gang_tag, g.tag_color AS gang_tag_color "
        "FROM friends f "
        "JOIN players p ON p.user_id=f.user_id "
        "LEFT JOIN gang_members gm ON gm.user_id = p.user_id "
        "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
        "WHERE f.friend_id=? AND f.status='pending'", (uid,))
    for r in reqs:
        if r.get("is_bot"):
            r["is_online"] = r["user_id"] in online_ids
        else:
            r["is_online"] = (r.get("last_seen") or 0) > now - 120
    return web.json_response({"friends": friends, "requests": reqs})

async def api_chat_pm_send(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json(); to_id = int(body.get("to_id", 0)); msg = (body.get("message") or "").strip()
    if not msg: return web.json_response({"error": "Пустое"}, status=400)
    if len(msg) > 500: msg = msg[:500]
    await db.execute("INSERT INTO private_messages (from_id, to_id, message) VALUES (?,?,?)", (uid, to_id, msg))
    return web.json_response({"ok": True})

async def api_chat_pm_unread_count(request):
    ud = await _user(request); uid = ud["id"]
    row = await db.fetchone(
        "SELECT COUNT(*) as c FROM private_messages WHERE to_id=? AND is_read=0", (uid,))
    return web.json_response({"count": row["c"] if row else 0})

async def api_chat_pm_conversations(request):
    ud = await _user(request); uid = ud["id"]
    rows = await db.fetchall(
        "SELECT pm.from_id as user_id, p.nickname, "
        "g.tag as gang_tag, g.tag_color as gang_tag_color, MAX(pm.id) as last_id, "
        "SUM(CASE WHEN pm.to_id=? AND pm.is_read=0 THEN 1 ELSE 0 END) as unread "
        "FROM private_messages pm "
        "JOIN players p ON p.user_id = pm.from_id "
        "LEFT JOIN gang_members gm ON gm.user_id = p.user_id "
        "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
        "WHERE pm.to_id=? "
        "GROUP BY pm.from_id ORDER BY last_id DESC LIMIT 30", (uid, uid))
    return web.json_response({"conversations": rows})

async def api_chat_pm_get(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json(); with_id = int(body.get("with_id", 0))
    rows = await db.fetchall(
        "SELECT * FROM private_messages WHERE (from_id=? AND to_id=?) OR (from_id=? AND to_id=?) "
        "ORDER BY id ASC LIMIT 100", (uid, with_id, with_id, uid))
    await db.execute("UPDATE private_messages SET is_read=1 WHERE to_id=? AND from_id=?", (uid, with_id))
    return web.json_response({"messages": rows})

async def api_chat_send(request):
    try:
        ud = await _user(request); uid = ud["id"]
        p = await _player(uid)
        if not p: return web.json_response({"error":"Нет игрока"}, status=400)
        body = await request.json()
        msg = (body.get("message") or "").strip()
        if not msg: return web.json_response({"error":"Пустое"}, status=400)
        if len(msg) > 200: msg = msg[:200]
        now = int(time.time())
        last = USER_LAST_CHAT.get(uid, 0)
        if now - last < CHAT_COOLDOWN:
            return web.json_response({"error": f"Кд {CHAT_COOLDOWN-(now-last)}с"}, status=400)
        USER_LAST_CHAT[uid] = now
        await db.execute(
            "INSERT INTO chat_messages (user_id, nickname, level, message) VALUES (?,?,?,?)",
            (uid, p["nickname"], p["level"], msg))
        await db.execute(
            "DELETE FROM chat_messages WHERE id NOT IN "
            "(SELECT id FROM chat_messages ORDER BY id DESC LIMIT 500)")
        return web.json_response({"ok": True})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return web.json_response({"error": f"Ошибка: {e}"}, status=500)

async def api_chat_get(request):
    await _user(request)
    rows = await db.fetchall(
        "SELECT c.user_id, c.nickname, c.level, c.message, c.created_at, "
        "g.tag AS gang_tag, g.tag_color AS gang_tag_color "
        "FROM chat_messages c "
        "LEFT JOIN gang_members gm ON gm.user_id = c.user_id "
        "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
        "ORDER BY c.id DESC LIMIT 50")
    rows.reverse()
    return web.json_response({"messages": rows})

async def api_notifications_get(request):
    from api_pvp import _cleanup_stale_pvp
    ud = await _user(request); uid = ud["id"]
    await _cleanup_stale_pvp()
    rows = await db.fetchall("SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 30", (uid,))
    now_unix = int(time.time())
    result = []
    for row in rows:
        r = dict(row)
        if r.get("type") == "pvp" and r.get("data"):
            try:
                data = json.loads(r["data"])
                bid = data.get("battle_id")
                if bid:
                    b = await db.fetchone("SELECT status FROM pvp_battles WHERE battle_id=?", (bid,))
                    if b and b["status"] == "pending":
                        try:
                            import datetime
                            dt = datetime.datetime.strptime(r["created_at"], "%Y-%m-%d %H:%M:%S")
                            created_unix = int(dt.timestamp())
                            r["seconds_left"] = max(0, 30 - (now_unix - created_unix))
                        except:
                            r["seconds_left"] = 30
                    else:
                        continue
            except: pass
        if r.get("type") == "trade" and r.get("data"):
            try:
                tid = json.loads(r["data"]).get("trade_id")
                if tid:
                    t = await db.fetchone("SELECT status FROM trades WHERE trade_id=?", (tid,))
                    if not t or t["status"] != "pending":
                        continue
            except: pass
        if r.get("type") == "friend" and r.get("data"):
            try:
                from_uid = json.loads(r["data"]).get("user_id")
                if from_uid:
                    fr = await db.fetchone(
                        "SELECT status FROM friends WHERE user_id=? AND friend_id=?",
                        (from_uid, uid))
                    if not fr or fr["status"] != "pending":
                        continue
            except: pass
        result.append(r)
    unread = sum(1 for r in result if not r.get("is_read"))
    return web.json_response({"notifications": result, "unread": unread})

async def api_notifications_delete(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    nid = int(body.get("notification_id", 0))
    if not nid:
        return web.json_response({"error": "Неверный ID"}, status=400)
    await db.execute("DELETE FROM notifications WHERE id=? AND user_id=?", (nid, uid))
    return web.json_response({"ok": True})

async def api_notifications_read(request):
    ud = await _user(request); uid = ud["id"]
    await db.execute("UPDATE notifications SET is_read=1 WHERE user_id=? AND type NOT IN ('gang_invite','pvp')", (uid,))
    return web.json_response({"ok": True})

async def api_online_count(request):
    await _user(request)
    now = int(time.time())
    human_row = await db.fetchone(
        "SELECT COUNT(*) as c FROM players WHERE last_seen > ? AND (is_bot=0 OR is_bot IS NULL)",
        (now - 120,))
    human = human_row["c"] if human_row else 0
    bots = len(bot_online_ids(now))
    return web.json_response({"count": human + bots})