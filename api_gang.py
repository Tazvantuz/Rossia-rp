# api_gang.py
"""Банды, территории (гетто), лог захватов, семечки."""
import random, re, time, json
from aiohttp import web
from database import db
from game import (
    GANG_TERRITORIES, GANG_CREATE_COST, GANG_MAX_MEMBERS, CAPTURE_HOURS,
    GANG_SEEDS_PER_TERR_PER_HOUR, GANG_TAG_COLORS, get_combat_stats,
)
from api_core import _user, _player, _nick_tag

async def _trim_territory_log(gid):
    try:
        rows = await db.fetchall(
            "SELECT id, gang_a_id, gang_b_id FROM territory_log "
            "WHERE gang_a_id=? OR gang_b_id=? ORDER BY id DESC",
            (gid, gid))
        if len(rows) <= 10:
            return
        for r in rows[10:]:
            rid = r["id"]
            can_delete = True
            for other_gid in [r["gang_a_id"], r["gang_b_id"]]:
                if other_gid is None:
                    continue
                cnt = await db.fetchone(
                    "SELECT COUNT(*) as c FROM territory_log "
                    "WHERE (gang_a_id=? OR gang_b_id=?) AND id > ?",
                    (other_gid, other_gid, rid))
                if cnt and cnt["c"] < 10:
                    can_delete = False
                    break
            if can_delete:
                await db.execute("DELETE FROM territory_log WHERE id=?", (rid,))
    except Exception as e:
        print(f"⚠️ _trim_territory_log: {e}")

async def _log_territory_event(tid, tname, event_type,
                                g_a_id=None, g_a_name=None, g_a_dmg=None,
                                g_b_id=None, g_b_name=None, g_b_dmg=None,
                                winner_gid=None):
    try:
        await db.execute(
            "INSERT INTO territory_log "
            "(territory_id, territory_name, event_type, "
            " gang_a_id, gang_a_name, gang_a_dmg, "
            " gang_b_id, gang_b_name, gang_b_dmg, winner_gang_id) "
            "VALUES (?,?,?,?,?,?,?,?,?,?)",
            (tid, tname, event_type,
             g_a_id, g_a_name, g_a_dmg,
             g_b_id, g_b_name, g_b_dmg, winner_gid))
        if g_a_id:
            await _trim_territory_log(g_a_id)
        if g_b_id and g_b_id != g_a_id:
            await _trim_territory_log(g_b_id)
    except Exception as e:
        print(f"⚠️ _log_territory_event: {e}")

async def api_gang_create(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    name = (body.get("name") or "").strip()
    emoji = body.get("emoji") or "\U0001F6AC"
    if not (2 <= len(name) <= 20):
        return web.json_response({"error":"Название 2-20 символов"}, status=400)
    p = await _player(uid)
    member = await db.fetchone("SELECT * FROM gang_members WHERE user_id=?", (uid,))
    if member: return web.json_response({"error":"Ты уже в банде"}, status=400)
    ex = await db.fetchone("SELECT * FROM gangs WHERE name=?", (name,))
    if ex: return web.json_response({"error":"Название занято"}, status=400)
    if p["balance"] < GANG_CREATE_COST:
        return web.json_response({"error":f"Нужно {GANG_CREATE_COST}₽"}, status=400)
    await db.execute("UPDATE players SET balance=balance-? WHERE user_id=?", (GANG_CREATE_COST, uid))
    gid = await db.execute(
        "INSERT INTO gangs (name, emoji, leader_id) VALUES (?,?,?)",
        (name, emoji, uid))
    await db.execute(
        "INSERT INTO gang_members (gang_id, user_id, role) VALUES (?, ?, 'leader')",
        (gid, uid))
    return web.json_response({"ok":True,"gang_id":gid})

async def api_gang_join(request):
    """Свободное вступление закрыто — только по приглашению лидера/зама."""
    await _user(request)
    return web.json_response(
        {"error": "Вступить в банду можно только по приглашению от лидера или зама"},
        status=403)

async def api_gang_leave(request):
    ud = await _user(request); uid = ud["id"]
    member = await db.fetchone("SELECT * FROM gang_members WHERE user_id=?", (uid,))
    if not member: return web.json_response({"error":"Не в банде"}, status=400)
    if member["role"] == "leader":
        return web.json_response({"error":"Лидер не может выйти — удали банду"}, status=400)
    await db.execute("DELETE FROM gang_members WHERE user_id=?", (uid,))
    return web.json_response({"ok":True})

async def api_gang_kick(request):
    """Кик участника лидером или замом. Лидера кикнуть нельзя, зам не может кикнуть зама."""
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    try:
        target_id = int(body.get("target_id", 0))
    except:
        target_id = 0
    if not target_id:
        return web.json_response({"error": "Не указан игрок"}, status=400)
    if target_id == uid:
        return web.json_response({"error": "Себя кикнуть нельзя"}, status=400)

    my = await db.fetchone("SELECT gang_id, role FROM gang_members WHERE user_id=?", (uid,))
    if not my or my["role"] not in ("leader", "deputy"):
        return web.json_response({"error": "Только лидер или зам может кикать"}, status=403)

    target = await db.fetchone(
        "SELECT gang_id, role FROM gang_members WHERE user_id=? AND gang_id=?",
        (target_id, my["gang_id"]))
    if not target:
        return web.json_response({"error": "Этот игрок не в твоей банде"}, status=404)
    if target["role"] == "leader":
        return web.json_response({"error": "Лидера кикнуть нельзя"}, status=400)
    if target["role"] == "deputy" and my["role"] != "leader":
        return web.json_response({"error": "Зам не может кикнуть другого зама"}, status=403)

    await db.execute("DELETE FROM gang_members WHERE user_id=? AND gang_id=?",
                     (target_id, my["gang_id"]))
    return web.json_response({"ok": True, "kicked": target_id})

async def api_gang_disband(request):
    """Удаление банды лидером: территории → нейтральные, участники → выгнать."""
    ud = await _user(request); uid = ud["id"]
    my = await db.fetchone("SELECT gang_id, role FROM gang_members WHERE user_id=?", (uid,))
    if not my:
        return web.json_response({"error": "Ты не в банде"}, status=400)
    if my["role"] != "leader":
        return web.json_response({"error": "Только лидер может удалить банду"}, status=403)
    gid = my["gang_id"]

    gang = await db.fetchone("SELECT name FROM gangs WHERE gang_id=?", (gid,))
    gang_name = gang["name"] if gang else f"#{gid}"

    try:
        await db.execute("UPDATE gang_territories SET gang_id=NULL WHERE gang_id=?", (gid,))
    except Exception as e:
        print(f"⚠️ disband territories: {e}")

    try:
        await db.execute(
            "UPDATE territory_captures SET status='cancelled' WHERE gang_id=? AND status='active'",
            (gid,))
    except Exception as e:
        print(f"⚠️ disband captures: {e}")

    try:
        await db.execute("DELETE FROM gang_members WHERE gang_id=?", (gid,))
    except Exception as e:
        print(f"⚠️ disband members: {e}")

    try:
        rows = await db.fetchall(
            "SELECT id, data FROM notifications WHERE type='gang_invite'")
        for n in rows:
            try:
                data = json.loads(n.get("data") or "{}")
                if int(data.get("gang_id", 0)) == int(gid):
                    await db.execute("DELETE FROM notifications WHERE id=?", (n["id"],))
            except Exception:
                pass
    except Exception as e:
        print(f"⚠️ disband invites: {e}")

    await db.execute("DELETE FROM gangs WHERE gang_id=?", (gid,))

    try:
        await _log_territory_event(
            0, f"Банда {gang_name}", "disbanded",
            g_a_id=None, g_a_name=gang_name)
    except Exception:
        pass

    return web.json_response({"ok": True, "disbanded": gid, "name": gang_name})

async def api_gang_set_tag(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    tag = (body.get("tag") or "").strip().upper()
    color = (body.get("color") or "").strip()
    if not re.fullmatch(r"[A-ZА-ЯЁ]{3}", tag):
        return web.json_response({"error": "Тег: ровно 3 буквы A-Z или А-Я"}, status=400)
    member = await db.fetchone("SELECT * FROM gang_members WHERE user_id=?", (uid,))
    if not member or member["role"] != "leader":
        return web.json_response({"error": "Только лидер может менять тег"}, status=403)
    if color and color not in GANG_TAG_COLORS:
        return web.json_response({"error": "Неверный цвет"}, status=400)
    if color:
        await db.execute("UPDATE gangs SET tag=?, tag_color=? WHERE gang_id=?",
                         (tag, color, member["gang_id"]))
    else:
        await db.execute("UPDATE gangs SET tag=? WHERE gang_id=?",
                         (tag, member["gang_id"]))
    return web.json_response({"ok": True, "tag": tag, "tag_color": color or None})

async def api_gang_set_deputy(request):
    ud = await _user(request); uid = ud["id"]
    member = await db.fetchone("SELECT * FROM gang_members WHERE user_id=?", (uid,))
    if not member or member["role"] != "leader":
        return web.json_response({"error": "Только лидер"}, status=403)
    body = await request.json()
    target_id = int(body.get("user_id", 0))
    action = body.get("action", "promote")
    target = await db.fetchone("SELECT * FROM gang_members WHERE user_id=? AND gang_id=?",
                               (target_id, member["gang_id"]))
    if not target: return web.json_response({"error": "Игрок не в банде"}, status=404)
    if target["role"] == "leader": return web.json_response({"error": "Нельзя менять лидера"}, status=400)
    new_role = "deputy" if action == "promote" else "member"
    await db.execute("UPDATE gang_members SET role=? WHERE user_id=?", (new_role, target_id))
    return web.json_response({"ok": True})

async def api_gang_deposit(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    amount = int(body.get("amount",0))
    if amount <= 0: return web.json_response({"error":"Сумма"}, status=400)
    member = await db.fetchone("SELECT * FROM gang_members WHERE user_id=?", (uid,))
    if not member: return web.json_response({"error":"Не в банде"}, status=400)
    p = await _player(uid)
    if p["balance"] < amount:
        return web.json_response({"error": "Не хватает", "required": amount, "balance": p["balance"]}, status=400)
    await db.execute("UPDATE players SET balance=balance-? WHERE user_id=?", (amount, uid))
    await db.execute("UPDATE gangs SET treasury=treasury+? WHERE gang_id=?", (amount, member["gang_id"]))
    return web.json_response({"ok":True})

async def api_gang_withdraw(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    amount = int(body.get("amount",0))
    member = await db.fetchone("SELECT * FROM gang_members WHERE user_id=?", (uid,))
    if not member or member["role"] not in ("leader","deputy"):
        return web.json_response({"error":"Только лидер/зам"}, status=400)
    gang = await db.fetchone("SELECT * FROM gangs WHERE gang_id=?", (member["gang_id"],))
    if amount <= 0 or amount > gang["treasury"]:
        return web.json_response({"error":"Недостаточно в казне"}, status=400)
    await db.execute("UPDATE gangs SET treasury=treasury-? WHERE gang_id=?", (amount, gang["gang_id"]))
    await db.execute("UPDATE players SET balance=balance+? WHERE user_id=?", (amount, uid))
    return web.json_response({"ok":True})

async def api_gang_invite(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    target_id = int(body.get("target_id", 0))
    if target_id == uid: return web.json_response({"error": "Себя нельзя"}, status=400)
    my = await db.fetchone("SELECT gang_id, role FROM gang_members WHERE user_id=?", (uid,))
    if not my or my["role"] not in ("leader", "deputy"):
        return web.json_response({"error": "Только лидер или зам"}, status=403)
    target = await _player(target_id)
    if not target: return web.json_response({"error": "Игрок не найден"}, status=404)
    if await db.fetchone("SELECT 1 FROM gang_members WHERE user_id=?", (target_id,)):
        return web.json_response({"error": "Уже в банде"}, status=400)
    cnt = await db.fetchone("SELECT COUNT(*) as c FROM gang_members WHERE gang_id=?", (my["gang_id"],))
    if cnt["c"] >= GANG_MAX_MEMBERS:
        return web.json_response({"error": "Банда заполнена"}, status=400)
    # Не дублировать приглашение
    existing = await db.fetchall(
        "SELECT id, data FROM notifications WHERE user_id=? AND type='gang_invite'",
        (target_id,))
    for n in existing:
        try:
            data = json.loads(n.get("data") or "{}")
            if int(data.get("gang_id", 0)) == int(my["gang_id"]):
                return web.json_response({"ok": True, "already": True})
        except Exception:
            pass
    gang = await db.fetchone("SELECT name, emoji FROM gangs WHERE gang_id=?", (my["gang_id"],))
    me = await _player(uid)
    await db.execute(
        "INSERT INTO notifications (user_id, type, text, data) VALUES (?, 'gang_invite', ?, ?)",
        (target_id, f"Приглашение в банду {gang['emoji']} {gang['name']} от {_nick_tag(me)}",
         json.dumps({"gang_id": my["gang_id"]})))
    return web.json_response({"ok": True})

async def api_gang_invite_accept(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    notif_id = int(body.get("notification_id", 0))
    notif = await db.fetchone(
        "SELECT * FROM notifications WHERE id=? AND user_id=? AND type='gang_invite'",
        (notif_id, uid))
    if not notif:
        return web.json_response({"error": "Приглашение не найдено или уже обработано"}, status=404)

    # Уже в банде — приглашение неактуально, удаляем и говорим об этом
    if await db.fetchone("SELECT 1 FROM gang_members WHERE user_id=?", (uid,)):
        await db.execute("DELETE FROM notifications WHERE id=?", (notif_id,))
        return web.json_response({"error": "Ты уже состоишь в банде"}, status=400)

    try:
        gid = int(json.loads(notif.get("data") or "{}").get("gang_id", 0))
    except Exception:
        gid = 0

    if gid <= 0:
        # Битое приглашение — удаляем
        await db.execute("DELETE FROM notifications WHERE id=?", (notif_id,))
        return web.json_response({"error": "Повреждённое приглашение"}, status=400)

    gang = await db.fetchone("SELECT * FROM gangs WHERE gang_id=?", (gid,))
    if not gang:
        # Банда распущена — удаляем
        await db.execute("DELETE FROM notifications WHERE id=?", (notif_id,))
        return web.json_response({"error": "Банда была распущена"}, status=404)

    cnt = await db.fetchone("SELECT COUNT(*) as c FROM gang_members WHERE gang_id=?", (gid,))
    if cnt["c"] >= GANG_MAX_MEMBERS:
        # Банда переполнена — удаляем приглашение
        await db.execute("DELETE FROM notifications WHERE id=?", (notif_id,))
        return web.json_response({"error": "Банда уже заполнена"}, status=400)

    await db.execute(
        "INSERT INTO gang_members (gang_id, user_id, role) VALUES (?, ?, 'member')",
        (gid, uid))

    # Удалить ВСЕ приглашения этого игрока (и в эту банду, и от других — они больше неактуальны)
    await db.execute(
        "DELETE FROM notifications WHERE user_id=? AND type='gang_invite'", (uid,))

    return web.json_response({"ok": True, "gang_id": gid})

async def api_gang_invite_decline(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    notif_id = int(body.get("notification_id", 0))
    await db.execute("DELETE FROM notifications WHERE id=? AND user_id=? AND type='gang_invite'",
                     (notif_id, uid))
    return web.json_response({"ok": True})

async def api_gang_get(request):
    try: await _process_territories()
    except Exception as _e: print(f"⚠️ _process_territories: {_e}")
    ud = await _user(request); uid = ud["id"]
    member = await db.fetchone("SELECT * FROM gang_members WHERE user_id=?", (uid,))
    if not member:
        gangs = await db.fetchall(
            "SELECT g.*, (SELECT COUNT(*) FROM gang_members WHERE gang_id=g.gang_id) as members_count "
            "FROM gangs g ORDER BY g.treasury DESC LIMIT 20")
        return web.json_response({"in_gang":False,"gangs":gangs})
    await _process_gang_income(member["gang_id"])
    gang = await db.fetchone("SELECT * FROM gangs WHERE gang_id=?", (member["gang_id"],))
    if not gang:
        return web.json_response({"error": "Банда не найдена"}, status=404)
    members = await db.fetchall(
        "SELECT gm.user_id, gm.role, p.nickname, p.level FROM gang_members gm "
        "JOIN players p ON gm.user_id = p.user_id WHERE gm.gang_id=?", (gang["gang_id"],))
    for m in members:
        m["gang_tag"] = gang.get("tag")
        m["gang_tag_color"] = gang.get("tag_color")
    now = int(time.time())
    my_gid = gang["gang_id"]
    active_caps = await db.fetchall(
        "SELECT tc.*, g.name as gang_name, g.emoji as gang_emoji "
        "FROM territory_captures tc JOIN gangs g ON g.gang_id=tc.gang_id "
        "WHERE tc.status='active'")
    caps_by_terr = {}
    for c in active_caps:
        caps_by_terr.setdefault(c["territory_id"], []).append(c)
    owned_rows = await db.fetchall("SELECT territory_id, gang_id FROM gang_territories")
    owner_by_terr = {r["territory_id"]: r["gang_id"] for r in owned_rows}
    terr_status = []
    for t in GANG_TERRITORIES:
        tid = t["id"]
        owner_gid = owner_by_terr.get(tid)
        caps = caps_by_terr.get(tid, [])
        info = dict(t)
        info["gang_id"] = owner_gid
        info["is_ours"] = (owner_gid == my_gid)
        info["captures"] = [{
            "gang_id": c["gang_id"],
            "gang_name": c["gang_name"],
            "gang_emoji": c["gang_emoji"],
            "total_damage": c["total_damage"],
            "left": max(0, (c["started_at"] + CAPTURE_HOURS*3600) - now),
        } for c in caps]
        info["has_capture"] = len(caps) > 0
        info["is_contested"] = len(caps) >= 2
        info["battle_left"] = min((c["left"] for c in info["captures"]), default=0)
        info["capturing_by_us"] = any(c["gang_id"] == my_gid for c in caps)
        terr_status.append(info)
    logs = await db.fetchall(
        "SELECT * FROM territory_log WHERE gang_a_id=? OR gang_b_id=? "
        "ORDER BY id DESC LIMIT 10",
        (my_gid, my_gid))
    my_p = await _player(uid)
    return web.json_response({
        "in_gang": True, "gang": gang, "members": members, "my_role": member["role"],
        "is_leader_or_deputy": member["role"] in ("leader","deputy"),
        "territories": terr_status,
        "territory_log": logs,
        "my_seeds": my_p.get("seeds", 0),
        "tag_colors": GANG_TAG_COLORS,
        "notifications": [],
    })

async def api_gang_info(request):
    ud = await _user(request); uid = ud["id"]
    row = await db.fetchone("SELECT gang_id, role FROM gang_members WHERE user_id=?", (uid,))
    if not row: return web.json_response({"in_gang": False})
    gid, role = row["gang_id"], row["role"]
    gang = await db.fetchone("SELECT * FROM gangs WHERE gang_id=?", (gid,))
    members = await db.fetchall(
        "SELECT gm.user_id, gm.role, p.nickname FROM gang_members gm "
        "JOIN players p ON p.user_id=gm.user_id WHERE gm.gang_id=?", (gid,))
    return web.json_response({"in_gang": True, "gang": dict(gang), "role": role,
                              "members": [dict(m) for m in members]})

async def api_gang_territories(request):
    await _user(request)
    territories = []
    for t in GANG_TERRITORIES:
        owner = await db.fetchone(
            "SELECT g.gang_id, g.name FROM gang_territories gt "
            "JOIN gangs g ON g.gang_id=gt.gang_id WHERE gt.territory_id=?",
            (t["id"],))
        territories.append({
            "id": t["id"], "name": t["name"], "emoji": t.get("emoji", "🏙️"),
            "income": t.get("income", 1000),
            "owner": {"gang_id": owner["gang_id"], "name": owner["name"]} if owner else None
        })
    return web.json_response({"territories": territories})

async def _gang_total_damage(gid):
    members = await db.fetchall("SELECT user_id FROM gang_members WHERE gang_id=?", (gid,))
    total = 0
    for m in members:
        p = await _player(m["user_id"])
        if p:
            stats = get_combat_stats(p)
            total += stats.get("damage", 5)
    return total

async def _process_territories():
    now = int(time.time())
    active = await db.fetchall("SELECT * FROM territory_captures WHERE status='active'")
    for cap in active:
        cur = await db.fetchone("SELECT status FROM territory_captures WHERE capture_id=?", (cap["capture_id"],))
        if not cur or cur["status"] != "active": continue
        if now < cap["started_at"] + CAPTURE_HOURS * 3600: continue
        terr = next((t for t in GANG_TERRITORIES if t["id"] == cap["territory_id"]), None)
        tname = terr["name"] if terr else f"#{cap['territory_id']}"
        rival = await db.fetchone(
            "SELECT * FROM territory_captures WHERE territory_id=? AND status='active' AND capture_id!=?",
            (cap["territory_id"], cap["capture_id"]))
        if rival:
            dmg_a = max(1, int(cap["total_damage"]))
            dmg_b = max(1, int(rival["total_damage"]))
            pow_a = dmg_a ** 1.2
            pow_b = dmg_b ** 1.2
            chance_a = pow_a / (pow_a + pow_b)
            if random.random() < chance_a:
                winner, loser = cap, rival
            else:
                winner, loser = rival, cap
            await db.execute("UPDATE territory_captures SET status='lost' WHERE capture_id=?", (loser["capture_id"],))
            await db.execute("UPDATE territory_captures SET status='won' WHERE capture_id=?", (winner["capture_id"],))
            await db.execute(
                "INSERT OR REPLACE INTO gang_territories (territory_id, gang_id, updated_at) VALUES (?,?,?)",
                (winner["territory_id"], winner["gang_id"], now))
            ga = await db.fetchone("SELECT name FROM gangs WHERE gang_id=?", (cap["gang_id"],))
            gb = await db.fetchone("SELECT name FROM gangs WHERE gang_id=?", (rival["gang_id"],))
            await _log_territory_event(
                cap["territory_id"], tname, "battle",
                g_a_id=cap["gang_id"], g_a_name=(ga["name"] if ga else "?"), g_a_dmg=dmg_a,
                g_b_id=rival["gang_id"], g_b_name=(gb["name"] if gb else "?"), g_b_dmg=dmg_b,
                winner_gid=winner["gang_id"])
        else:
            await db.execute("UPDATE territory_captures SET status='won' WHERE capture_id=?", (cap["capture_id"],))
            await db.execute(
                "INSERT OR REPLACE INTO gang_territories (territory_id, gang_id, updated_at) VALUES (?,?,?)",
                (cap["territory_id"], cap["gang_id"], now))
            ga = await db.fetchone("SELECT name FROM gangs WHERE gang_id=?", (cap["gang_id"],))
            await _log_territory_event(
                cap["territory_id"], tname, "capture_complete",
                g_a_id=cap["gang_id"], g_a_name=(ga["name"] if ga else "?"),
                g_a_dmg=int(cap["total_damage"]),
                winner_gid=cap["gang_id"])
    try:
        all_gangs = await db.fetchall("SELECT gang_id FROM gangs")
        for g in all_gangs:
            try:
                await _process_gang_income(g["gang_id"])
            except Exception as e:
                print(f"⚠️ _process_gang_income gang {g['gang_id']}: {e}")
    except Exception as e:
        print(f"⚠️ _process_territories gang income batch: {e}")

async def _ensure_gang_columns():
    try: await db.execute("ALTER TABLE gangs ADD COLUMN last_income_at INTEGER DEFAULT 0")
    except: pass

async def _process_gang_income(gid):
    await _ensure_gang_columns()
    gang = await db.fetchone("SELECT * FROM gangs WHERE gang_id=?", (gid,))
    if not gang: return
    now = int(time.time())
    last = gang.get("last_income_at") or 0
    if last == 0:
        await db.execute("UPDATE gangs SET last_income_at=? WHERE gang_id=?", (now, gid))
        return
    hours = (now - last) // 3600
    if hours <= 0: return
    terrs = await db.fetchone("SELECT COUNT(*) as c FROM gang_territories WHERE gang_id=?", (gid,))
    count = terrs["c"] if terrs else 0
    income = count * 1000 * hours
    if income > 0:
        await db.execute("UPDATE gangs SET treasury=treasury+?, last_income_at=last_income_at+? WHERE gang_id=?",
                         (income, hours*3600, gid))
    else:
        await db.execute("UPDATE gangs SET last_income_at=? WHERE gang_id=?", (now, gid))
        return
    seeds_per_member = count * GANG_SEEDS_PER_TERR_PER_HOUR * hours
    if seeds_per_member > 0:
        members = await db.fetchall("SELECT user_id FROM gang_members WHERE gang_id=?", (gid,))
        for m in members:
            is_bot_row = await db.fetchone("SELECT is_bot FROM players WHERE user_id=?", (m["user_id"],))
            if is_bot_row and is_bot_row.get("is_bot"):
                continue
            await db.execute("UPDATE players SET seeds=seeds+? WHERE user_id=?",
                             (seeds_per_member, m["user_id"]))

async def api_gang_capture(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    tid = int(body.get("territory_id", 0))
    member = await db.fetchone("SELECT * FROM gang_members WHERE user_id=?", (uid,))
    if not member or member["role"] not in ("leader", "deputy"):
        return web.json_response({"error": "Только лидер/зам"}, status=400)
    now = int(time.time())
    try: await _process_territories()
    except Exception as _e: print(f"⚠️ _process_territories: {_e}")
    my_gid = member["gang_id"]
    my_active = await db.fetchone(
        "SELECT capture_id, territory_id FROM territory_captures WHERE gang_id=? AND status='active'",
        (my_gid,))
    if my_active:
        terr = next((t for t in GANG_TERRITORIES if t["id"] == my_active["territory_id"]), None)
        tname = terr["name"] if terr else f"#{my_active['territory_id']}"
        return web.json_response({"error": f"У банды уже идёт захват: {tname}"}, status=400)
    last_any = await db.fetchone(
        "SELECT started_at FROM territory_captures WHERE gang_id=? ORDER BY started_at DESC LIMIT 1",
        (my_gid,))
    if last_any and now - last_any["started_at"] < 1800:
        left = 1800 - (now - last_any["started_at"])
        return web.json_response({"error": f"КД захвата: {left//60}м {left%60}с"}, status=400)
    territory = next((t for t in GANG_TERRITORIES if t["id"] == tid), None)
    if not territory:
        return web.json_response({"error": "Территория не найдена"}, status=404)
    active_on_terr = await db.fetchall(
        "SELECT * FROM territory_captures WHERE territory_id=? AND status='active'", (tid,))
    if len(active_on_terr) >= 2:
        return web.json_response({"error": "На эту территорию уже 2 претендента"}, status=400)
    current_owner = await db.fetchone("SELECT gang_id FROM gang_territories WHERE territory_id=?", (tid,))
    is_defense = bool(current_owner and current_owner["gang_id"] == my_gid)
    if is_defense and len(active_on_terr) == 0:
        return web.json_response({"error": "Это твоя территория и её никто не атакует"}, status=400)
    total_dmg = await _gang_total_damage(my_gid)
    cap_id = await db.execute(
        "INSERT INTO territory_captures (territory_id, gang_id, status, started_at, total_damage) "
        "VALUES (?,?, 'active', ?, ?)", (tid, my_gid, now, total_dmg))
    my_gang_row = await db.fetchone("SELECT name FROM gangs WHERE gang_id=?", (my_gid,))
    my_gname = my_gang_row["name"] if my_gang_row else "?"
    opp_gid = None
    if active_on_terr:
        opp_gid = active_on_terr[0]["gang_id"]
    elif current_owner and current_owner["gang_id"] != my_gid:
        opp_gid = current_owner["gang_id"]
    opp_gname = None
    if opp_gid:
        og = await db.fetchone("SELECT name FROM gangs WHERE gang_id=?", (opp_gid,))
        opp_gname = og["name"] if og else "?"
    await _log_territory_event(
        tid, territory["name"], ("defense_started" if is_defense else "capture_started"),
        g_a_id=my_gid, g_a_name=my_gname, g_a_dmg=total_dmg,
        g_b_id=opp_gid, g_b_name=opp_gname)
    rival = active_on_terr[0] if active_on_terr else None
    return web.json_response({
        "ok": True, "capture_id": cap_id,
        "ends_at": now + CAPTURE_HOURS * 3600,
        "my_damage": total_dmg,
        "rival_damage": rival["total_damage"] if rival else None,
        "rival_gang_id": rival["gang_id"] if rival else None,
        "battle_pending": bool(rival),
        "is_defense": is_defense,
    })

async def api_territory_capture_start(request):
    return await api_gang_capture(request)

async def api_gang_captures(request):
    try: await _process_territories()
    except Exception as _e: print(f"⚠️ _process_territories: {_e}")
    rows = await db.fetchall("""
        SELECT tc.*, g.name as gang_name, g.emoji as gang_emoji
        FROM territory_captures tc JOIN gangs g ON g.gang_id = tc.gang_id
        WHERE tc.status='active'
    """)
    now = int(time.time())
    by_terr = {}
    for r in rows:
        terr = next((t for t in GANG_TERRITORIES if t["id"] == r["territory_id"]), None)
        if not terr: continue
        tid = r["territory_id"]
        left = max(0, (r["started_at"] + CAPTURE_HOURS * 3600) - now)
        if tid not in by_terr:
            by_terr[tid] = {
                "territory_id": tid, "territory_name": terr["name"],
                "territory_emoji": terr.get("emoji", "🏙️"),
                "captures": [], "battle_left": left, "is_contested": False,
            }
        by_terr[tid]["captures"].append({
            "capture_id": r["capture_id"], "gang_id": r["gang_id"],
            "gang_name": r["gang_name"], "gang_emoji": r["gang_emoji"],
            "total_damage": r["total_damage"], "left": left,
        })
        if left < by_terr[tid]["battle_left"]:
            by_terr[tid]["battle_left"] = left
    for v in by_terr.values():
        v["is_contested"] = len(v["captures"]) >= 2
    return web.json_response({"captures": rows, "by_territory": list(by_terr.values())})

async def api_territory_capture_resolve(request):
    await _user(request)
    body = await request.json()
    cap_id = int(body.get("capture_id", 0))
    cap = await db.fetchone("SELECT * FROM territory_captures WHERE capture_id=?", (cap_id,))
    if not cap or cap["status"] != "active":
        return web.json_response({"error": "Нет активного захвата"}, status=404)
    other = await db.fetchone(
        "SELECT * FROM territory_captures WHERE territory_id=? AND status='active' AND capture_id!=?",
        (cap["territory_id"], cap_id))
    if other:
        dmg_a = max(1, cap["total_damage"]); dmg_b = max(1, other["total_damage"])
        pow_a = dmg_a ** 1.2; pow_b = dmg_b ** 1.2
        chance_a = pow_a / (pow_a + pow_b)
        if random.random() < chance_a: winner, loser = cap, other
        else: winner, loser = other, cap
        await db.execute("UPDATE territory_captures SET status='lost' WHERE capture_id=?", (loser["capture_id"],))
        await db.execute("UPDATE territory_captures SET status='won' WHERE capture_id=?", (winner["capture_id"],))
        await db.execute("UPDATE gang_territories SET gang_id=? WHERE territory_id=?",
                         (winner["gang_id"], winner["territory_id"]))
        return web.json_response({"ok": True, "winner": winner["gang_id"], "battle": True})
    else:
        await db.execute("UPDATE territory_captures SET status='won' WHERE capture_id=?", (cap_id,))
        await db.execute("UPDATE gang_territories SET gang_id=? WHERE territory_id=?",
                         (cap["gang_id"], cap["territory_id"]))
        return web.json_response({"ok": True, "winner": cap["gang_id"], "battle": False})