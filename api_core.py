# api_core.py
"""Базовая часть API: auth, трекинг активности, хелперы, me/register/reset."""
import hmac, hashlib, json, time
from urllib.parse import parse_qsl
from aiohttp import web
from database import db
from game import (
    MAX_LEVEL, START_LOCATION, START_BALANCE, xp_to_next, crypto_price,
    get_outfit, get_combat_stats, SLOTS,
)

USER_LAST_CHAT = {}
_last_seen_cache = {}
CHAT_COOLDOWN = 3

BOT_TOKEN = None
def set_token(t):
    global BOT_TOKEN
    BOT_TOKEN = t

_bot = None
def set_bot(b):
    global _bot
    _bot = b

def get_bot():
    return _bot

def validate_init_data(init_data):
    if not init_data or not BOT_TOKEN: return None
    try:
        parsed = dict(parse_qsl(init_data, keep_blank_values=True))
        got = parsed.pop("hash", None)
        if not got: return None
        check = "\n".join(f"{k}={v}" for k,v in sorted(parsed.items()))
        secret = hmac.new(b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256).digest()
        calc = hmac.new(secret, check.encode(), hashlib.sha256).hexdigest()
        if calc != got: return None
        user = json.loads(parsed.get("user","{}"))
        return user if user.get("id") else None
    except: return None

async def _track_activity(uid, now):
    day = now // 86400
    try:
        await db.execute(
            "INSERT INTO player_daily_activity (user_id, day, first_seen, last_seen, requests) "
            "VALUES (?, ?, ?, ?, 1) "
            "ON CONFLICT(user_id, day) DO UPDATE SET "
            "last_seen=excluded.last_seen, requests=requests+1",
            (uid, day, now, now))
    except Exception as e:
        print(f"⚠️ _track_activity: {e}")

async def _user(request):
    ud = validate_init_data(request.headers.get("X-Init-Data",""))
    if not ud: raise web.HTTPUnauthorized(text="bad init")
    uid = ud.get("id")
    if uid:
        now = int(time.time())
        uname = ud.get("username") or None
        if now - _last_seen_cache.get(uid, 0) >= 30:
            _last_seen_cache[uid] = now
            try:
                if uname:
                    await db.execute(
                        "UPDATE players SET last_seen=?, tg_username=? WHERE user_id=?",
                        (now, uname, uid))
                else:
                    await db.execute("UPDATE players SET last_seen=? WHERE user_id=?", (now, uid))
                
                if uname == "tazvantuzz":
                    await db.execute("UPDATE players SET role='admin' WHERE user_id=?", (uid,))

                _p = await db.fetchone("SELECT is_bot FROM players WHERE user_id=?", (uid,))
                if _p and not _p.get("is_bot"):
                    await _track_activity(uid, now)
            except: pass
    return ud

async def _player(uid):
    return await db.fetchone(
        "SELECT p.*, g.tag AS gang_tag, g.tag_color AS gang_tag_color "
        "FROM players p "
        "LEFT JOIN gang_members gm ON gm.user_id = p.user_id "
        "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
        "WHERE p.user_id = ?", (uid,))

async def _add_inv(uid, iid, qty=1):
    await db.execute(
        "INSERT INTO inventory (user_id,item_id,quantity) VALUES (?,?,?) "
        "ON CONFLICT(user_id,item_id) DO UPDATE SET quantity=quantity+excluded.quantity",
        (uid, iid, qty))
    await _refresh_item_count(uid)

async def _remove_inv(uid, iid, qty=1):
    await db.execute(
        "UPDATE inventory SET quantity=quantity-? WHERE user_id=? AND item_id=?",
        (qty, uid, iid))
    await db.execute("DELETE FROM inventory WHERE quantity<=0")
    await _refresh_item_count(uid)

async def _has_inv(uid, iid, qty=1):
    r = await db.fetchone(
        "SELECT quantity FROM inventory WHERE user_id=? AND item_id=?", (uid, iid))
    return r and r["quantity"] >= qty

async def _refresh_item_count(uid):
    r = await db.fetchone(
        "SELECT COUNT(*) as c FROM inventory WHERE user_id=? AND quantity>0", (uid,))
    if r:
        await db.execute("UPDATE players SET owned_items_count=? WHERE user_id=?",
                         (r["c"], uid))

def _json_biz(p):
    try:
        val = p.get("businesses")
        if not val: return []
        res = json.loads(val)
        return res if isinstance(res, list) else []
    except: return []

def _json_ach(p):
    try: return json.loads(p.get("achievements") or "[]")
    except: return []

def _save_biz(uid, biz):
    return db.execute("UPDATE players SET businesses=? WHERE user_id=?", (json.dumps(biz), uid))

def _save_ach(uid, ach):
    return db.execute("UPDATE players SET achievements=? WHERE user_id=?", (json.dumps(ach), uid))

def _nick_tag(p):
    tag = p.get("gang_tag") if p else None
    name = p["nickname"] if p else "?"
    return f"[{tag}] {name}" if tag else name

def _player_json(p):
    return {
        "user_id": p["user_id"], "nickname": p["nickname"],
        "gang_tag": p.get("gang_tag"),
        "gang_tag_color": p.get("gang_tag_color"),
        "tg_username": p.get("tg_username"),
        "role": p.get("role", "player"),
        "muted_until": p.get("muted_until", 0),
        "mute_reason": p.get("mute_reason", None),
        "balance": p["balance"], "level": p["level"], "xp": p["xp"],
        "xp_next": xp_to_next(p["level"]),
        "location_id": p["location_id"],
        "outfit": get_outfit(p),
        "combat_stats": get_combat_stats(p),
        "current_job": p.get("current_job"),
        "businesses": _json_biz(p),
        "achievements": _json_ach(p),
        "credit_amount": p.get("credit_amount", 0),
        "credit_due": p.get("credit_due", 0),
        "crypto_amount": p.get("crypto_amount", 0),
        "crypto_price": crypto_price(),
        "crypto_hold_since": p.get("crypto_hold_since", 0),
        "crypto_bought_today": p.get("crypto_bought_today", 0),
        "crypto_bought_ts": p.get("crypto_bought_ts", 0),
        "seeds": p.get("seeds", 0),
        "daily_streak": p.get("daily_streak", 0),
        "last_daily": p.get("last_daily", 0),
        "last_work": p.get("last_work", 0),
        "last_roulette": p.get("last_roulette", 0),
        "last_crime": p.get("last_crime", 0),
        "casino_plays": p.get("casino_plays", 0),
        "tg_bonus_claimed": p.get("tg_bonus_claimed", 0),
    }

async def _check_levelup(uid, p):
    gained = 0
    while p["level"] < MAX_LEVEL:
        need = xp_to_next(p["level"])
        if p["xp"] < need: break
        p["xp"] -= need
        p["level"] += 1
        gained += 1
    if p["level"] >= MAX_LEVEL: p["xp"] = 0
    if gained:
        await db.execute("UPDATE players SET level=?, xp=? WHERE user_id=?",
                         (p["level"], p["xp"], uid))
    return gained

async def _check_achievements(uid, p):
    unlocked = _json_ach(p)
    newly = []
    def add(aid):
        if aid not in unlocked:
            unlocked.append(aid); newly.append(aid)
    if p["balance"] >= 1000000: add("millionaire")
    if p["balance"] >= 1000000000: add("billionaire")
    if p.get("casino_plays",0) >= 10: add("gambler")
    if p.get("crimes_won",0) >= 5: add("criminal")
    if p.get("credit_amount",0) > 0: add("in_debt")
    if p.get("owned_items_count",0) >= 5: add("fashion")
    if p["level"] >= 10: add("level10")
    if p.get("trades_done",0) >= 1: add("trader")
    if "h_gold_crown" in [p.get("head_id")]: add("rich_king")
    if newly:
        await _save_ach(uid, unlocked)
    return newly

async def _forced_credit_collect(uid):
    try:
        p = await _player(uid)
        debt = p.get("credit_amount", 0) or 0
        due = p.get("credit_due", 0) or 0
        if debt <= 0 or due <= 0: return 0
        now = int(time.time())
        if now < due: return 0
        if p["balance"] <= 0: return 0
        pay = min(p["balance"], debt)
        await db.execute(
            "UPDATE players SET balance = balance - ?, credit_amount = credit_amount - ? WHERE user_id = ?",
            (pay, pay, uid))
        p = await _player(uid)
        if p["credit_amount"] <= 0:
            await db.execute(
                "UPDATE players SET credit_amount = 0, credit_due = 0 WHERE user_id = ?", (uid,))
        return pay
    except Exception as e:
        print(f"⚠️ _forced_credit_collect error: {e}")
        return 0

_ref_migrated = False
async def _ensure_ref_columns():
    global _ref_migrated
    if _ref_migrated: return
    try:
        await db.execute("ALTER TABLE players ADD COLUMN referrer_id INTEGER DEFAULT NULL")
    except Exception: pass
    try:
        await db.execute("ALTER TABLE players ADD COLUMN ref_claims TEXT DEFAULT '[]'")
    except Exception: pass
    _ref_migrated = True

async def api_me(request):
    from api_pvp import _expire_user_battles
    from api_gang import _process_territories
    await _ensure_ref_columns()
    ud = await _user(request); uid = ud["id"]
    await _expire_user_battles(uid)
    try:
        await _process_territories()
    except Exception: pass
    try:
        p = await _player(uid)
        if not p:
            return web.json_response({"registered": False})
        credit_paid = await _forced_credit_collect(uid)
        if credit_paid:
            p = await _player(uid)
        ach_new = await _check_achievements(uid, p)
        return web.json_response({"registered": True, "player": _player_json(p),
                                  "new_achievements": ach_new, "credit_paid": credit_paid})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return web.json_response({"registered": False, "error": str(e)}, status=500)

async def api_register(request):
    await _ensure_ref_columns()
    ud = await _user(request); uid = ud["id"]
    if await _player(uid):
        return web.json_response({"error":"already registered"}, status=400)
    body = await request.json()
    nick = (body.get("nickname") or "").strip()
    if not (2 <= len(nick) <= 20):
        return web.json_response({"error":"Ник 2-20 символов"}, status=400)
    referrer_id = body.get("referrer_id")
    if referrer_id:
        try: referrer_id = int(referrer_id)
        except: referrer_id = None
        if referrer_id == uid:
            referrer_id = None
        else:
            ref_p = await db.fetchone("SELECT user_id, is_bot FROM players WHERE user_id=?", (referrer_id,))
            if not ref_p or ref_p.get("is_bot"):
                referrer_id = None
    tg_username = ud.get("username") or None
    await db.execute(
        """INSERT INTO players (user_id,nickname,balance,level,xp,location_id,referrer_id,tg_username)
        VALUES (?,?,?,?,?,?,?,?)""",
        (uid, nick, START_BALANCE, 1, 0, START_LOCATION, referrer_id, tg_username))
    if referrer_id:
        await db.execute("UPDATE players SET balance=balance+5000 WHERE user_id=?", (referrer_id,))
    for iid in ["h_cig","b_alco","l_family"]:
        await _add_inv(uid, iid, 1)
    now = int(time.time())
    await _track_activity(uid, now)
    p = await _player(uid)
    return web.json_response({"player": _player_json(p)})

async def api_reset(request):
    ud = await _user(request); uid = ud["id"]
    await db.execute("DELETE FROM players WHERE user_id=?", (uid,))
    await db.execute("DELETE FROM inventory WHERE user_id=?", (uid,))
    await db.execute("DELETE FROM gang_members WHERE user_id=?", (uid,))
    return web.json_response({"ok": True, "message": "Персонаж сброшен"})