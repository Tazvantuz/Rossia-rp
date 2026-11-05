# api_pvp.py
"""PvP (Гоп-стоп)."""
import json, time
from aiohttp import web
from database import db
from game import PVP_PARTS, PVP_PARTS_NAMES, PVP_TURN_TIMEOUT, get_combat_stats
from api_core import _user, _player, _nick_tag

# ═══════════ ЧИСТКА ЗАВИСШИХ БОЁВ ═══════════
async def _cleanup_stale_pvp():
    try:
        await db.execute(
            "UPDATE pvp_battles SET status='expired' WHERE status='pending' "
            "AND (strftime('%s','now') - strftime('%s', created_at)) > 30")
        await db.execute(
            "UPDATE pvp_battles SET status='expired' WHERE status='active' "
            "AND (turn_started_at IS NULL OR turn_started_at = 0 "
            "OR (strftime('%s','now') - turn_started_at) > 300)")
    except Exception as e:
        print(f"⚠️ _cleanup_stale_pvp: {e}")

async def _ensure_pvp_columns():
    for _col_def in ["turn_started_at INTEGER DEFAULT 0", "pending_attack_part TEXT"]:
        try:
            await db.execute(f"ALTER TABLE pvp_battles ADD COLUMN {_col_def}")
        except: pass

async def _expire_user_battles(uid):
    now = int(time.time())
    try:
        await db.execute(
            "UPDATE pvp_battles SET status='expired' "
            "WHERE (attacker_id=? OR defender_id=?) AND status='pending' "
            "AND (strftime('%s','now') - strftime('%s', created_at)) > 30",
            (uid, uid))
    except Exception as e:
        print(f"⚠️ pending cleanup: {e}")
    try:
        active = await db.fetchall(
            "SELECT * FROM pvp_battles WHERE (attacker_id=? OR defender_id=?) "
            "AND status='active' AND ("
            "turn_started_at IS NULL OR turn_started_at = 0 "
            "OR (? - turn_started_at) > 30)",
            (uid, uid, now))
        for b in active:
            cur = await db.fetchone("SELECT status FROM pvp_battles WHERE battle_id=?", (b["battle_id"],))
            if not cur or cur["status"] != "active": continue
            try:
                loser_id = int(b["turn"]) if b["turn"] else int(b["defender_id"])
            except:
                loser_id = int(b["defender_id"])
            winner_id = int(b["defender_id"]) if loser_id == int(b["attacker_id"]) else int(b["attacker_id"])
            try:
                loser = await _player(loser_id)
                if loser:
                    steal = int(loser["balance"] * 0.1)
                    await db.execute("UPDATE players SET balance=balance-? WHERE user_id=?", (steal, loser_id))
                    await db.execute("UPDATE players SET balance=balance+? WHERE user_id=?", (steal, winner_id))
                await db.execute("UPDATE pvp_battles SET status='finished' WHERE battle_id=?", (b["battle_id"],))
            except Exception as e:
                print(f"⚠️ timeout resolve: {e}")
                await db.execute("UPDATE pvp_battles SET status='expired' WHERE battle_id=?", (b["battle_id"],))
    except Exception as e:
        print(f"⚠️ active cleanup: {e}")

# ═══════════ STATE ═══════════
async def _pvp_state_response(bid, uid):
    b = await db.fetchone("SELECT * FROM pvp_battles WHERE battle_id=?", (bid,))
    if not b or uid not in (b["attacker_id"], b["defender_id"]):
        return None
    att = await _player(b["attacker_id"]); dfn = await _player(b["defender_id"])
    now = int(time.time())
    turn_started = b.get("turn_started_at") or now
    secs_left = max(0, PVP_TURN_TIMEOUT - (now - turn_started))
    try: turn_int = int(b["turn"])
    except: turn_int = 0
    return {
        "battle_id": bid, "status": b["status"], "turn": turn_int,
        "attacker": {"user_id":int(att["user_id"]),"nickname":att["nickname"],
                     "gang_tag":att.get("gang_tag"),
                     "hp":int(b["attacker_hp"]),"max_hp":int(b["attacker_max_hp"])},
        "defender": {"user_id":int(dfn["user_id"]),"nickname":dfn["nickname"],
                     "gang_tag":dfn.get("gang_tag"),
                     "hp":int(b["defender_hp"]),"max_hp":int(b["defender_max_hp"])},
        "log": json.loads(b["log"] or "[]"),
        "is_attacker": int(uid) == int(b["attacker_id"]),
        "seconds_left": secs_left,
        "timeout": PVP_TURN_TIMEOUT,
    }

async def api_pvp_state(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    bid = int(body.get("battle_id",0))
    b = await db.fetchone("SELECT * FROM pvp_battles WHERE battle_id=?", (bid,))
    if b and b["status"] == "active":
        now = int(time.time())
        turn_started = b.get("turn_started_at") or now
        if now - turn_started > 30:
            try: loser_id = int(b["turn"])
            except: loser_id = int(b["defender_id"])
            winner_id = int(b["attacker_id"]) if loser_id == int(b["defender_id"]) else int(b["defender_id"])
            loser = await _player(loser_id)
            steal = int(loser["balance"] * 0.1)
            await db.execute("UPDATE players SET balance=balance-? WHERE user_id=?", (steal, loser_id))
            await db.execute("UPDATE players SET balance=balance+? WHERE user_id=?", (steal, winner_id))
            await db.execute("UPDATE pvp_battles SET status='finished' WHERE battle_id=?", (bid,))
            return web.json_response({"status": "finished", "winner_id": winner_id, "timeout": True})
    state = await _pvp_state_response(bid, uid)
    if not state: return web.json_response({"error":"Бой не найден"}, status=400)
    state["pending_attack_part"] = b.get("pending_attack_part") if b else None
    return web.json_response(state)

# ═══════════ ACTION ═══════════
async def api_pvp_action(request):
    try:
        await _ensure_pvp_columns()
        ud = await _user(request); uid = int(ud["id"])
        body = await request.json()
        bid = int(body.get("battle_id", 0))
        action = body.get("action")
        part = body.get("part")
        if action not in ("attack", "defend"):
            return web.json_response({"error": "action: attack/defend"}, status=400)
        if part not in ("head", "torso", "legs"):
            return web.json_response({"error": "part: head/torso/legs"}, status=400)
        b = await db.fetchone("SELECT * FROM pvp_battles WHERE battle_id=?", (bid,))
        if not b:
            return web.json_response({"error": "Бой не найден"}, status=400)
        if b["status"] != "active":
            return web.json_response({"error": "Бой не активен"}, status=400)
        try: cur_turn = int(b["turn"])
        except: cur_turn = 0
        if cur_turn != uid:
            return web.json_response({"error": "Не твой ход"}, status=400)
        now = int(time.time())
        try: turn_started = int(b["turn_started_at"] or now)
        except: turn_started = now
        if now - turn_started > 30:
            return web.json_response({"error": "Время вышло"}, status=400)
        if action == "attack":
            try: attacker_id = int(b["attacker_id"])
            except: attacker_id = 0
            try: defender_id = int(b["defender_id"])
            except: defender_id = 0
            next_turn = defender_id if uid == attacker_id else attacker_id
            await db.execute(
                "UPDATE pvp_battles SET pending_attack_part=?, turn=?, turn_started_at=? WHERE battle_id=?",
                (part, next_turn, now, bid))
            return web.json_response({"ok": True})
        else:
            attack_part = b.get("pending_attack_part")
            if not attack_part:
                return web.json_response({"error": "Нет атаки для защиты"}, status=400)
            try: attacker_id = int(b["defender_id"]) if uid == int(b["attacker_id"]) else int(b["attacker_id"])
            except: return web.json_response({"error": "Ошибка данных боя"}, status=500)
            att_p = await _player(attacker_id)
            if not att_p:
                return web.json_response({"error": "Атакующий не найден"}, status=400)
            stats = get_combat_stats(att_p)
            dmg = int(stats.get("damage", 5))
            if attack_part == part: dmg = 0
            hp_field = "attacker_hp" if uid == int(b["attacker_id"]) else "defender_hp"
            cur_hp = int(b.get(hp_field) or 0)
            new_hp = max(0, cur_hp - dmg)
            await db.execute(
                f"UPDATE pvp_battles SET {hp_field}=?, pending_attack_part=NULL, turn=?, turn_started_at=? WHERE battle_id=?",
                (new_hp, uid, now, bid))
            if new_hp <= 0:
                winner_id = attacker_id
                loser_id = uid
                loser = await _player(loser_id)
                steal = int((loser["balance"] if loser else 0) * 0.1)
                await db.execute("UPDATE players SET balance=balance-? WHERE user_id=?", (steal, loser_id))
                await db.execute("UPDATE players SET balance=balance+? WHERE user_id=?", (steal, winner_id))
                await db.execute("UPDATE pvp_battles SET status='finished' WHERE battle_id=?", (bid,))
                return web.json_response({"ok": True, "finished": True, "winner_id": winner_id, "steal": steal})
            return web.json_response({"ok": True, "damage": dmg, "hp_left": new_hp})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return web.json_response({"error": f"Сервер: {e}"}, status=500)

# ═══════════ CHALLENGE ═══════════
async def api_pvp_challenge(request):
    await _cleanup_stale_pvp()
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    target_id = int(body.get("user_id", 0))
    if target_id == uid: return web.json_response({"error":"На себя нельзя"}, status=400)
    p1 = await _player(uid); p2 = await _player(target_id)
    if not p1 or not p2: return web.json_response({"error":"Нет игрока"}, status=400)
    if p1["location_id"] != p2["location_id"]:
        return web.json_response({"error":"Не на одной локации"}, status=400)
    await _expire_user_battles(uid)
    await _expire_user_battles(target_id)
    existing = await db.fetchone(
        "SELECT * FROM pvp_battles WHERE (attacker_id=? OR defender_id=?) AND status IN ('pending','active')",
        (uid, uid))
    if existing: return web.json_response({"error":"Уже есть бой"}, status=400)
    existing2 = await db.fetchone(
        "SELECT * FROM pvp_battles WHERE (attacker_id=? OR defender_id=?) AND status IN ('pending','active')",
        (target_id, target_id))
    if existing2: return web.json_response({"error":"У игрока уже бой"}, status=400)
    s1 = get_combat_stats(p1); s2 = get_combat_stats(p2)
    bid = await db.execute(
        """INSERT INTO pvp_battles
        (attacker_id,defender_id,attacker_hp,defender_hp,attacker_max_hp,defender_max_hp,
         attacker_damage,defender_damage,turn,status)
        VALUES (?,?,?,?,?,?,?,?,?,'pending')""",
        (uid, target_id, s1["hp"], s2["hp"], s1["hp"], s2["hp"],
         s1["damage"], s2["damage"], uid))
    await db.execute("INSERT INTO notifications (user_id, type, text, data) VALUES (?, 'pvp', ?, ?)",
                     (target_id, f"Вызов на гоп-стоп от {_nick_tag(p1)}", json.dumps({"battle_id": bid})))
    return web.json_response({"ok":True,"battle_id":bid,"attacker":p1["nickname"],"defender":p2["nickname"]})

# ═══════════ INCOMING ═══════════
async def api_pvp_incoming(request):
    await _cleanup_stale_pvp()
    ud = await _user(request); uid = ud["id"]
    rows = await db.fetchall(
        "SELECT b.*, p.nickname as attacker_name, g.tag as attacker_gang_tag "
        "FROM pvp_battles b "
        "JOIN players p ON b.attacker_id = p.user_id "
        "LEFT JOIN gang_members gm ON gm.user_id = p.user_id "
        "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
        "WHERE b.defender_id=? AND b.status='pending'", (uid,))
    active = await db.fetchall(
        "SELECT battle_id, attacker_id, defender_id FROM pvp_battles "
        "WHERE (attacker_id=? OR defender_id=?) AND status='active'", (uid, uid))
    return web.json_response({"challenges": rows, "active": active})

# ═══════════ RESPOND ═══════════
async def api_pvp_respond(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    bid = int(body.get("battle_id",0))
    accept = bool(body.get("accept"))
    await _cleanup_stale_pvp()
    b = await db.fetchone(
        "SELECT * FROM pvp_battles WHERE battle_id=? AND defender_id=? AND status='pending'",
        (bid, uid))
    if not b:
        return web.json_response({"error":"Бой не найден или истёк"}, status=400)
    fresh = await db.fetchone(
        "SELECT 1 FROM pvp_battles WHERE battle_id=? AND status='pending' "
        "AND (strftime('%s','now') - strftime('%s', created_at)) <= 30", (bid,))
    if not fresh:
        await db.execute("UPDATE pvp_battles SET status='expired' WHERE battle_id=?", (bid,))
        return web.json_response({"error":"Время на ответ истекло"}, status=400)
    if not accept:
        await db.execute("UPDATE pvp_battles SET status='declined' WHERE battle_id=?", (bid,))
        return web.json_response({"ok":True,"declined":True})
    await db.execute("UPDATE pvp_battles SET status='active', turn_started_at=? WHERE battle_id=?",
                     (int(time.time()), bid))
    return web.json_response({"ok":True})

# ═══════════ FORCE CANCEL ═══════════
async def api_pvp_force_cancel(request):
    ud = await _user(request); uid = ud["id"]
    try:
        await db.execute(
            "UPDATE pvp_battles SET status='cancelled' "
            "WHERE (attacker_id=? OR defender_id=?) AND status IN ('pending','active')",
            (uid, uid))
        return web.json_response({"ok": True})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

# ═══════════ PVP START (legacy — не используется фронтом) ═══════════
async def api_pvp_start(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    target_id = int(body.get("target_id", 0))
    if target_id == uid:
        return web.json_response({"error": "Себя бить нельзя"}, status=400)
    target = await _player(target_id)
    if not target:
        return web.json_response({"error": "Игрок не найден"}, status=404)
    active = await db.fetchone(
        "SELECT battle_id FROM pvp_battles WHERE (attacker_id=? OR defender_id=?) AND status='active'",
        (uid, uid))
    if active:
        return web.json_response({"error": "Ты уже в бою"}, status=400)
    battle_id = await db.execute(
        "INSERT INTO pvp_battles (attacker_id, defender_id, status, turn, created_at) "
        "VALUES (?,?, 'pending', 1, ?)",
        (uid, target_id, int(time.time())))
    return web.json_response({"battle_id": battle_id, "status": "pending"})