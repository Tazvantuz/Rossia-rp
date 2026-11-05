# api.py
import asyncio
import os
"""REST API для РП Россия Mini App."""
import hmac, hashlib, json, random, time, re
from urllib.parse import parse_qsl
from aiohttp import web
from database import db
from game import (
        LOCATIONS, ITEMS, JOBS, BUSINESSES, CASINO_GAMES, ACHIEVEMENTS,
    DAILY_REWARDS, SLOTS, SLOT_NAMES, SLOT_CATEGORY, SLOT_BY_CATEGORY,
    CATEGORY_NAMES, CATEGORY_EMOJI, RARITIES, MAX_LEVEL, START_LOCATION,
    CREDIT_MAX, CREDIT_TERMS, CASES, GANG_TERRITORIES, GANG_CREATE_COST,
    GANG_MAX_MEMBERS, CAPTURE_HOURS, PVP_PARTS, PVP_PARTS_NAMES,
    get_combat_stats,
    START_BALANCE, xp_to_next, crypto_price, crypto_price_at_hour, crypto_history_24h, item_json, item_sell_price,
    get_outfit, roulette_color, ROULETTE_NUMBERS, crypto_price_old_at_hour,
)

try:
    from game import PVP_TURN_TIMEOUT
except ImportError:
    PVP_TURN_TIMEOUT = 30

USER_LAST_CHAT = {}
_last_seen_cache = {}
CHAT_COOLDOWN = 3

# ═══════════ КРИПТО-БАЛАНСИРОВКА (Вариант A) ═══════════
CRYPTO_BUY_FEE = 0.03           # 3% с покупки
CRYPTO_SELL_FEE_BASE = 0.05     # 5% базовая с продажи
CRYPTO_MAX_PER_TX = 10000       # макс за 1 операцию покупки
CRYPTO_MAX_PER_DAY = 50000      # макс покупок в сутки
CRYPTO_MAX_HOLD = 100000        # макс во владении (по текущей цене)
# Стейкинг-бонус за долгое держание: (min_hours, fee_modifier)
CRYPTO_HOLD_BONUS = [
    (12, -0.03),   # >12ч → 5% -3% = 2%
    (6,  -0.02),   # 6-12ч → 3%
    (3,  -0.01),   # 3-6ч → 4%
    (1,   0.00),   # 1-3ч → 5% (базовая)
    (0,  +0.05),   # <1ч → 10% (штраф за скальпинг)
]

def _crypto_hold_fee(hold_seconds):
    """Итоговая комиссия продажи с учётом стейкинга."""
    hours = hold_seconds / 3600
    for min_h, modifier in CRYPTO_HOLD_BONUS:
        if hours >= min_h:
            return max(0.01, CRYPTO_SELL_FEE_BASE + modifier)
    return CRYPTO_SELL_FEE_BASE + 0.05

BOT_TOKEN = None
def set_token(t):
    global BOT_TOKEN
    BOT_TOKEN = t

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
            except: pass
    return ud

async def _player(uid):
    return await db.fetchone(
        "SELECT p.*, g.tag AS gang_tag FROM players p "
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
def _save_biz(uid, biz): return db.execute(
    "UPDATE players SET businesses=? WHERE user_id=?", (json.dumps(biz), uid))
def _save_ach(uid, ach): return db.execute(
    "UPDATE players SET achievements=? WHERE user_id=?", (json.dumps(ach), uid))

def _nick_tag(p):
    tag = p.get("gang_tag") if p else None
    name = p["nickname"] if p else "?"
    return f"[{tag}] {name}" if tag else name

def _player_json(p):
    from game import get_combat_stats
    return {
        "user_id": p["user_id"], "nickname": p["nickname"],
        "gang_tag": p.get("gang_tag"),
        "tg_username": p.get("tg_username"),
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
        "daily_streak": p.get("daily_streak", 0),
        "last_daily": p.get("last_daily", 0),
        "last_work": p.get("last_work", 0),
        "last_roulette": p.get("last_roulette", 0),
        "last_crime": p.get("last_crime", 0),
        "casino_plays": p.get("casino_plays", 0),
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

# ═══════════ МИГРАЦИЯ КРИПТЫ (одноразовая) ═══════════
_migration_lock = False
async def migrate_crypto_v1():
    """Одноразовая миграция: старые коины → рубли по СТАРОЙ цене."""
    global _migration_lock
    if _migration_lock:
        return
    _migration_lock = True
    try:
        row = await db.fetchone("SELECT COUNT(*) as c FROM players WHERE crypto_migrated=0 AND crypto_amount>0")
        if not row or row["c"] == 0:
            await db.execute("UPDATE players SET crypto_migrated=1 WHERE crypto_migrated=0")
            print("✅ Миграция крипты: нечего мигрировать (нет коинов у игроков)")
            return
        now_hour = int(time.time() / 3600)
        old_price = crypto_price_old_at_hour(now_hour)
        players = await db.fetchall(
            "SELECT user_id, crypto_amount FROM players WHERE crypto_migrated=0 AND crypto_amount>0")
        total_converted = 0
        for p in players:
            uid = p["user_id"]
            coins = p["crypto_amount"]
            rub = int(coins * old_price)
            await db.execute(
                "UPDATE players SET balance=balance+?, crypto_amount=0, crypto_migrated=1 WHERE user_id=?",
                (rub, uid))
            total_converted += rub
            print(f"💰 Миграция: user {uid}, {coins:.4f} коинов → {rub}₽ (старая цена {old_price})")
        await db.execute("UPDATE players SET crypto_migrated=1 WHERE crypto_migrated=0")
        print(f"✅ Миграция крипты завершена. Всего: {len(players)} игроков, {total_converted}₽. Старая цена: {old_price}₽")
    finally:
        _migration_lock = False

# ═══════════ TERRITORY LOG (с обрезкой до 10) ═══════════
async def _trim_territory_log(gid):
    """Оставляет только 10 последних записей для банды gid.
    Не удаляет записи, которые нужны другой банде в её топ-10."""
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
        # Обрезаем лог у обеих затронутых банд до 10 записей
        if g_a_id:
            await _trim_territory_log(g_a_id)
        if g_b_id and g_b_id != g_a_id:
            await _trim_territory_log(g_b_id)
    except Exception as e:
        print(f"⚠️ _log_territory_event: {e}")

# ═══════════ ENDPOINTS ═══════════


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
    await _ensure_ref_columns()
    await _ensure_pvp_columns()
    ud = await _user(request); uid = ud["id"]
    await _expire_user_battles(uid)
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
        print(f"❌ ОШИБКА /api/me для user_id={uid}: {e}")
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
            ref_p = await db.fetchone("SELECT user_id FROM players WHERE user_id=?", (referrer_id,))
            if not ref_p:
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
    p = await _player(uid)
    return web.json_response({"player": _player_json(p)})

async def api_shop(request):
    await _user(request)
    rarity_order = {"common":0, "uncommon":1, "rare":2, "epic":3, "legendary":4}
    items = []
    for iid, it in sorted(ITEMS.items(), key=lambda kv: (rarity_order.get(kv[1].get("rarity","common"), 99), kv[1].get("price", 0))):
        items.append(item_json(iid))
    return web.json_response({"items": items})

async def api_inventory(request):
    ud = await _user(request); uid = ud["id"]
    rows = await db.fetchall(
        "SELECT item_id, quantity FROM inventory WHERE user_id=? AND quantity>0 ORDER BY item_id",
        (uid,))
    result = []
    for r in rows:
        ij = item_json(r["item_id"])
        if ij:
            ij["quantity"] = r["quantity"]
            ij["sell_price"] = item_sell_price(r["item_id"])
            result.append(ij)
    return web.json_response({"items": result})

async def api_buy(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    iid = body.get("item_id")
    it = ITEMS.get(iid)
    if not it: return web.json_response({"error":"Нет такого"}, status=400)
    p = await _player(uid)
    if p["balance"] < it["price"]:
        return web.json_response({"error":"Не хватает денег"}, status=400)
    await db.execute("UPDATE players SET balance=balance-? WHERE user_id=?",
                     (it["price"], uid))
    await _add_inv(uid, iid, 1)
    p = await _player(uid)
    await _check_achievements(uid, p)
    return web.json_response({"player": _player_json(p), "bought": it["name"]})

async def api_sell(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    iid = body.get("item_id")
    if not await _has_inv(uid, iid):
        return web.json_response({"error":"Нет предмета"}, status=400)
    sp = item_sell_price(iid)
    await _remove_inv(uid, iid, 1)
    await db.execute("UPDATE players SET balance=balance+? WHERE user_id=?", (sp, uid))
    p = await _player(uid)
    return web.json_response({"player": _player_json(p), "gold": sp})

async def api_equip(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    iid = body.get("item_id")
    it = ITEMS.get(iid)
    if not it: return web.json_response({"error":"Нет"}, status=400)
    if not await _has_inv(uid, iid):
        return web.json_response({"error":"Не в инвентаре"}, status=400)
    slot = SLOT_BY_CATEGORY[it["slot"]]
    p = await _player(uid)
    old = p.get(slot)
    if old: await _add_inv(uid, old, 1)
    await _remove_inv(uid, iid, 1)
    await db.execute(f"UPDATE players SET {slot}=? WHERE user_id=?", (iid, uid))
    p = await _player(uid)
    await _check_achievements(uid, p)
    return web.json_response({"player": _player_json(p)})

async def api_unequip(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    slot = body.get("slot")
    if slot not in SLOTS: return web.json_response({"error":"Слот"}, status=400)
    p = await _player(uid)
    old = p.get(slot)
    if not old: return web.json_response({"error":"Пусто"}, status=400)
    await _add_inv(uid, old, 1)
    await db.execute(f"UPDATE players SET {slot}=NULL WHERE user_id=?", (uid,))
    p = await _player(uid)
    return web.json_response({"player": _player_json(p)})

async def api_jobs(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    jobs = []
    for jid, j in JOBS.items():
        jobs.append({**j, "id":jid, "unlocked":p["level"]>=j["level"]})
    return web.json_response({"jobs": jobs, "current": p.get("current_job"),
                              "last_work": p.get("last_work",0), "now": int(time.time())})

async def api_set_job(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    jid = body.get("job_id")
    if jid not in JOBS: return web.json_response({"error":"Нет такой"}, status=400)
    p = await _player(uid)
    if p["level"] < JOBS[jid]["level"]:
        return web.json_response({"error":"Низкий уровень"}, status=400)
    await db.execute("UPDATE players SET current_job=? WHERE user_id=?", (jid, uid))
    return web.json_response({"ok": True})

async def api_work(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    jid = p.get("current_job")
    if not jid: return web.json_response({"error":"Выбери работу"}, status=400)
    job = JOBS[jid]
    now = int(time.time())
    cd = job["cooldown"] - (now - p.get("last_work",0))
    if cd > 0:
        return web.json_response({"error":f"Подожди {cd} сек"}, status=400)
    await db.execute("UPDATE players SET balance=balance+?, xp=xp+?, last_work=? WHERE user_id=?",
                     (job["salary"], job["xp"], now, uid))
    credit_paid = await _forced_credit_collect(uid)
    p = await _player(uid)
    levels = await _check_levelup(uid, p)
    p = await _player(uid)
    ach = await _check_achievements(uid, p)
    if "first_job" not in _json_ach(p):
        await _save_ach(uid, _json_ach(p) + ["first_job"])
        ach.append("first_job")
    return web.json_response({"player": _player_json(p), "earned": job["salary"],
                              "xp": job["xp"], "levels": levels,
                              "new_achievements": ach, "credit_paid": credit_paid})

async def api_businesses(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    owned = {b["id"]: b for b in _json_biz(p)}
    now = int(time.time())
    result = []
    total_pending = 0
    for bid, b in BUSINESSES.items():
        info = {**b, "id":bid, "owned":bid in owned}
        if bid in owned:
            lvl = owned[bid].get("level", 1)
            info["level"] = lvl
            mult = 1.0
            if lvl == 2: mult = 1.75
            elif lvl >= 3: mult = 3.0
            real_income = int(b["income"] * mult)
            info["income"] = real_income
            info["last_collect"] = owned[bid].get("last_collect", now)
            elapsed = max(0, min(86400, now - info["last_collect"]))
            info["pending"] = int(real_income * elapsed / 3600)
            total_pending += info["pending"]
        else:
            info["level"] = 0
        result.append(info)
    return web.json_response({"businesses": result, "pending": total_pending})
async def api_buy_business(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    bid = body.get("business_id")
    b = BUSINESSES.get(bid)
    if not b: return web.json_response({"error":"Нет"}, status=400)
    p = await _player(uid)
    if p["balance"] < 0:
        return web.json_response({"error": "У тебя отрицательный баланс (баг). Обратись к админу."}, status=400)
    if bid in [x["id"] for x in _json_biz(p)]:
        return web.json_response({"error":"Уже есть"}, status=400)
    if p["balance"] < b["price"]:
        return web.json_response({"error": "Не хватает денег", "required": b["price"], "balance": p["balance"]}, status=400)
    now = int(time.time())
    biz = _json_biz(p)
    biz.append({"id":bid, "last_collect":now})
    await _save_biz(uid, biz)
    await db.execute("UPDATE players SET balance=balance-?, xp=xp+? WHERE user_id=?",
                     (b["price"], b["xp"], uid))
    p = await _player(uid)
    levels = await _check_levelup(uid, p)
    p = await _player(uid)
    ach = await _check_achievements(uid, p)
    if "first_business" not in _json_ach(p):
        await _save_ach(uid, _json_ach(p) + ["first_business"])
        ach.append("first_business")
    return web.json_response({"player": _player_json(p), "levels":levels,
                              "new_achievements": ach})

async def api_collect_business(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    now = int(time.time())
    biz = _json_biz(p)
    total = 0
    for b in biz:
        info = BUSINESSES.get(b["id"])
        if not info: continue
        lvl = b.get("level", 1)
        mult = 1.0
        if lvl == 2: mult = 1.75
        elif lvl >= 3: mult = 3.0
        real_income = int(info["income"] * mult)
        last = b.get("last_collect", now)
        elapsed = max(0, min(86400, now - last))
        earned = int(real_income * elapsed / 3600)
        total += earned
        b["last_collect"] = now
    if total > 0:
        await _save_biz(uid, biz)
        await db.execute("UPDATE players SET balance=balance+? WHERE user_id=?", (total, uid))
    p = await _player(uid)
    return web.json_response({"player": _player_json(p), "collected": total})
async def api_casino_play(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    game = body.get("game")
    bet = int(body.get("bet", 0))
    if game not in CASINO_GAMES:
        return web.json_response({"error": "Игра"}, status=400)
    if bet <= 0:
        return web.json_response({"error": "Ставка"}, status=400)
    p = await _player(uid)
    if p["balance"] < bet:
        return web.json_response({"error": "Не хватает"}, status=400)
    now_cd = int(time.time())
    if now_cd - p.get("last_casino", 0) < 5:
        return web.json_response({"error": f"Кд {5 - (now_cd - p.get('last_casino', 0))}с"}, status=400)

    win_amount = 0
    result_text = ""

    if game == "coin":
        choice = body.get("choice", "Орёл")
        side = random.choice(["Орёл", "Решка"])
        result_text = f"Монетка: {side}"
        if choice == side:
            win_amount = int(bet * 2)
        else:
            result_text += " — проигрыш"

    elif game == "dice":
        choice = body.get("choice", "Больше 3")
        roll = random.randint(1, 6)
        result_text = f"Кости: выпало {roll}"
        if (choice == "Больше 3" and roll > 3) or (choice == "Меньше 4" and roll < 4):
            win_amount = int(bet * 1.8)
        else:
            result_text += " — проигрыш"

    elif game == "roulette":
        choice = body.get("choice", "red")
        number = body.get("number")
        n = random.randint(0, 36)
        color = roulette_color(n)
        result_text = f"Выпало {n} ({color})"
        if choice == "red" and color == "red":
            win_amount = bet * 2
        elif choice == "black" and color == "black":
            win_amount = bet * 2
        elif choice == "even" and n != 0 and n % 2 == 0:
            win_amount = bet * 2
        elif choice == "odd" and n % 2 == 1:
            win_amount = bet * 2
        elif choice == "low" and 1 <= n <= 18:
            win_amount = bet * 2
        elif choice == "high" and 19 <= n <= 36:
            win_amount = bet * 2
        elif choice == "dozen1" and 1 <= n <= 12:
            win_amount = bet * 3
        elif choice == "dozen2" and 13 <= n <= 24:
            win_amount = bet * 3
        elif choice == "dozen3" and 25 <= n <= 36:
            win_amount = bet * 3
        elif choice == "number" and number is not None:
            if int(number) == n:
                win_amount = bet * 36
        if win_amount == 0:
            result_text += " — проигрыш"

    elif game == "slots":
        symbols = ["🍒", "🍋", "🍊", "🔔", "⭐", "💎"]
        a, b, c = random.choices(symbols, k=3)
        result_text = f"{a}{b}{c}"
        if a == b == c == "💎":
            win_amount = int(bet * 50)
            result_text += " — ДЖЕКПОТ!"
        elif a == b == c:
            win_amount = int(bet * 5)
            result_text += " — x5!"
        elif a == b or b == c or a == c:
            win_amount = int(bet * 1.5)
            result_text += " — x1.5"
        else:
            result_text += " — проигрыш"

    net = win_amount - bet
    now_upd = int(time.time())
    await db.execute("UPDATE players SET balance=balance+?, casino_plays=casino_plays+1, last_casino=? WHERE user_id=?",
                     (net, now_upd, uid))
    credit_paid = await _forced_credit_collect(uid) if net > 0 else 0
    p = await _player(uid)
    ach = await _check_achievements(uid, p)
    if win_amount >= 100000 and "big_winner" not in _json_ach(p):
        await _save_ach(uid, _json_ach(p) + ["big_winner"])
        ach.append("big_winner")
    return web.json_response({"player": _player_json(p), "win": win_amount, "net": net,
                              "result": result_text, "new_achievements": ach})

async def api_daily(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    now = int(time.time())
    last = p.get("last_daily",0)
    if now - last < 86400:
        return web.json_response({"error":"Уже забрал","next_in":86400-(now-last)}, status=400)
    if now - last > 172800:
        streak = 1
    else:
        streak = min(7, p.get("daily_streak",0) + 1)
    reward = DAILY_REWARDS[streak-1]
    await db.execute(
        "UPDATE players SET balance=balance+?, last_daily=?, daily_streak=? WHERE user_id=?",
        (reward, now, streak, uid))
    credit_paid = await _forced_credit_collect(uid)
    p = await _player(uid)
    return web.json_response({"player": _player_json(p), "reward": reward, "streak": streak,
                              "credit_paid": credit_paid})

async def api_roulette(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    now = int(time.time())
    if now - p.get("last_roulette",0) < 21600:
        return web.json_response({"error":"Не раньше 6 часов"}, status=400)
    prizes = [0,100,500,1000,2000,5000,10000,50000]
    prize = random.choices(prizes, weights=[30,20,20,15,8,4,2,1])[0]
    await db.execute("UPDATE players SET balance=balance+?, last_roulette=? WHERE user_id=?",
                     (prize, now, uid))
    credit_paid = await _forced_credit_collect(uid) if prize > 0 else 0
    p = await _player(uid)
    return web.json_response({"player": _player_json(p), "prize": prize, "credit_paid": credit_paid})

async def api_crime(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    now = int(time.time())
    if now - p.get("last_crime",0) < 300:
        return web.json_response({"error":f"Кд {300-(now-p.get('last_crime',0))} сек"}, status=400)
    success = random.random() < 0.6
    if success:
        gain = random.randint(2000, 8000)
        await db.execute("UPDATE players SET balance=balance+?, last_crime=?, crimes_won=crimes_won+1 WHERE user_id=?",
                         (gain, now, uid))
        msg = f"🕶 Ограбил магазин +{gain}₽"
    else:
        fine = random.randint(1000, 3000)
        await db.execute("UPDATE players SET balance=MAX(0, balance-?), last_crime=? WHERE user_id=?",
                         (fine, now, uid))
        msg = f"🚔 Поймали! Штраф {fine}₽"
    p = await _player(uid)
    ach = await _check_achievements(uid, p)
    return web.json_response({"player": _player_json(p), "result": msg, "success": success,
                              "new_achievements": ach})

async def api_credit_take(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    amount = int(body.get("amount", 0))
    try:
        term_hours = int(float(body.get("term_hours", 0)))
    except (ValueError, TypeError):
        term_hours = 0
    if amount <= 0 or amount > CREDIT_MAX:
        return web.json_response({"error": f"Сумма 1-{CREDIT_MAX}₽"}, status=400)
    term = next((t for t in CREDIT_TERMS if t["hours"] == term_hours), None)
    if not term:
        return web.json_response({"error": f"Срок {term_hours}ч не найден. Доступно: {[t['hours'] for t in CREDIT_TERMS]}"}, status=400)
    p = await _player(uid)
    if p.get("credit_amount", 0) > 0:
        return web.json_response({"error": "Уже есть кредит"}, status=400)
    total_debt = int(amount * (1 + term["pct"]/100))
    now = int(time.time())
    due = now + term_hours * 3600
    await db.execute(
        "UPDATE players SET balance=balance+?, credit_amount=?, credit_due=? WHERE user_id=?",
        (amount, total_debt, due, uid))
    p = await _player(uid)
    ach = await _check_achievements(uid, p)
    return web.json_response({
        "player": _player_json(p), "total_debt": total_debt, "due_at": due,
        "term_hours": term_hours, "pct": term["pct"], "new_achievements": ach,
    })


async def api_credit_pay(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    debt = p.get("credit_amount", 0)
    if debt <= 0:
        return web.json_response({"error": "Нет кредита"}, status=400)
    if p["balance"] < debt:
        return web.json_response({"error": f"Нужно {debt}₽, у тебя {p['balance']}₽"}, status=400)
    await db.execute(
        "UPDATE players SET balance=balance-?, credit_amount=0, credit_due=0 WHERE user_id=?",
        (debt, uid))
    p = await _player(uid)
    return web.json_response({"player": _player_json(p), "paid": debt})


# ═══════════ КРИПТА (Вариант A) ═══════════
async def api_crypto_price(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    now = int(time.time())
    price = crypto_price()
    coins = p.get("crypto_amount", 0) or 0
    hold_since = p.get("crypto_hold_since", 0) or 0
    hold_secs = max(0, now - hold_since) if hold_since > 0 else 0
    sell_fee = _crypto_hold_fee(hold_secs) if coins > 0 else CRYPTO_SELL_FEE_BASE

    bought_today = p.get("crypto_bought_today", 0) or 0
    bought_ts = p.get("crypto_bought_ts", 0) or 0
    if now - bought_ts > 86400:
        bought_today = 0

    return web.json_response({
        "price": price,
        "history": crypto_history_24h(),
        "buy_fee_pct": int(CRYPTO_BUY_FEE * 100),
        "sell_fee_pct": int(sell_fee * 100),
        "sell_fee_base_pct": int(CRYPTO_SELL_FEE_BASE * 100),
        "max_per_tx": CRYPTO_MAX_PER_TX,
        "max_per_day": CRYPTO_MAX_PER_DAY,
        "bought_today": bought_today,
        "max_hold": CRYPTO_MAX_HOLD,
        "coins": coins,
        "coins_value": int(coins * price),
        "hold_seconds": hold_secs,
    })

async def api_crypto_buy(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    try:
        amount = int(body.get("amount", 0))
    except (ValueError, TypeError):
        amount = 0
    if amount <= 0:
        return web.json_response({"error": "Сумма > 0"}, status=400)
    if amount > CRYPTO_MAX_PER_TX:
        return web.json_response({"error": f"Максимум за операцию: {CRYPTO_MAX_PER_TX}₽"}, status=400)

    p = await _player(uid)
    now = int(time.time())
    price = crypto_price()

    bought_today = p.get("crypto_bought_today", 0) or 0
    bought_ts = p.get("crypto_bought_ts", 0) or 0
    if now - bought_ts > 86400:
        bought_today = 0

    if bought_today + amount > CRYPTO_MAX_PER_DAY:
        left = max(0, CRYPTO_MAX_PER_DAY - bought_today)
        return web.json_response({"error": f"Дневной лимит: осталось {left}₽ из {CRYPTO_MAX_PER_DAY}₽"}, status=400)

    current_coins = p.get("crypto_amount", 0) or 0
    current_value = current_coins * price
    if current_value + amount > CRYPTO_MAX_HOLD:
        left = max(0, int(CRYPTO_MAX_HOLD - current_value))
        return web.json_response({"error": f"Максимум во владении: {CRYPTO_MAX_HOLD}₽. Свободно: {left}₽"}, status=400)

    if p["balance"] < amount:
        return web.json_response({"error": "Не хватает денег"}, status=400)

    buy_fee = int(amount * CRYPTO_BUY_FEE)
    net_amount = amount - buy_fee
    coins = net_amount / price

    new_hold_since = p.get("crypto_hold_since", 0) or 0
    if current_coins <= 0 or new_hold_since == 0:
        new_hold_since = now

    new_bought_today = bought_today + amount
    new_bought_ts = now if bought_today == 0 else bought_ts

    await db.execute(
        "UPDATE players SET balance=balance-?, crypto_amount=crypto_amount+?, "
        "crypto_hold_since=?, crypto_bought_today=?, crypto_bought_ts=? WHERE user_id=?",
        (amount, coins, new_hold_since, new_bought_today, new_bought_ts, uid))

    p = await _player(uid)
    return web.json_response({
        "player": _player_json(p),
        "coins": coins,
        "price": price,
        "buy_fee": buy_fee,
        "net_amount": net_amount,
    })

async def api_crypto_sell(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    try:
        amount = float(body.get("amount", 0))
    except (ValueError, TypeError):
        amount = 0
    p = await _player(uid)
    if amount <= 0:
        return web.json_response({"error": "Количество > 0"}, status=400)
    if amount > p.get("crypto_amount", 0):
        return web.json_response({"error": "Недостаточно коинов"}, status=400)

    now = int(time.time())
    price = crypto_price()
    hold_since = p.get("crypto_hold_since", 0) or 0
    hold_secs = max(0, now - hold_since) if hold_since > 0 else 0
    fee_pct = _crypto_hold_fee(hold_secs)

    rub_before = int(amount * price)
    fee = int(rub_before * fee_pct)
    rub = rub_before - fee

    new_coins = p.get("crypto_amount", 0) - amount
    new_hold_since = hold_since
    if new_coins <= 0.0001:
        new_coins = 0
        new_hold_since = 0

    await db.execute(
        "UPDATE players SET balance=balance+?, crypto_amount=?, crypto_hold_since=? WHERE user_id=?",
        (rub, new_coins, new_hold_since, uid))

    credit_paid = await _forced_credit_collect(uid)
    p = await _player(uid)
    return web.json_response({
        "player": _player_json(p),
        "rub": rub,
        "fee": fee,
        "rub_before": rub_before,
        "price": price,
        "fee_pct": int(fee_pct * 100),
        "hold_hours": round(hold_secs / 3600, 2),
        "credit_paid": credit_paid,
    })

async def api_location(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    loc_id = body_loc = None
    try:
        body = await request.json(); loc_id = body.get("location_id")
    except: pass
    if loc_id is None: loc_id = p["location_id"]
    if loc_id < 0 or loc_id >= len(LOCATIONS):
        return web.json_response({"error":"Локация"}, status=400)
    others = await db.fetchall(
        "SELECT p.user_id, p.nickname, p.level, p.balance, p.last_seen, p.tg_username, g.tag AS gang_tag "
        "FROM players p "
        "LEFT JOIN gang_members gm ON gm.user_id = p.user_id "
        "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
        "WHERE p.location_id=? AND p.user_id!=?",
        (loc_id, uid))
    now_ts = int(time.time())
    for _o in others:
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
    return web.json_response({
        "user_id": t["user_id"], "nickname": t["nickname"],
        "gang_tag": t.get("gang_tag"),
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
        "is_online": (t.get("last_seen") or 0) > int(time.time()) - 120,
    })


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
    p = await _player(uid)
    await db.execute("INSERT INTO notifications (user_id, type, text) VALUES (?, 'trade', ?)", (to_user, f"Трейд от {_nick_tag(p)}"))
    return web.json_response({"ok": True, "trade_id": tid})

async def api_trades_list(request):
    ud = await _user(request); uid = ud["id"]
    incoming = await db.fetchall(
        "SELECT * FROM trades WHERE to_user=? AND status='pending' ORDER BY created_at DESC",
        (uid,))
    outgoing = await db.fetchall(
        "SELECT * FROM trades WHERE from_user=? AND status='pending' ORDER BY created_at DESC",
        (uid,))
    def enrich(t, other_field):
        other_id = t[other_field]
        t["give_items"] = json.loads(t.get("give_items") or "[]")
        t["want_items"] = json.loads(t.get("want_items") or "[]")
        return t
    inc_enriched = []
    for t in incoming:
        t2 = enrich(t, "from_user")
        sender = await _player(t["from_user"])
        if sender:
            t2["other_nickname"] = sender["nickname"]
            t2["other_gang_tag"] = sender.get("gang_tag")
        inc_enriched.append(t2)
    out_enriched = []
    for t in outgoing:
        t2 = enrich(t, "to_user")
        receiver = await _player(t["to_user"])
        if receiver:
            t2["other_nickname"] = receiver["nickname"]
            t2["other_gang_tag"] = receiver.get("gang_tag")
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
    p_to2 = await _player(uid)
    await _check_achievements(uid, p_to2)
    await _check_achievements(from_user, await _player(from_user))
    return web.json_response({"player": _player_json(p_to2)})

async def api_trade_decline(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    tid = int(body.get("trade_id",0))
    await db.execute("UPDATE trades SET status='declined' WHERE trade_id=? AND (to_user=? OR from_user=?)",
                     (tid, uid, uid))
    return web.json_response({"ok": True})

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

async def api_leaderboard(request):
    ud = await _user(request)
    try:
        body = await request.json()
    except:
        body = {}
    category = body.get("category", "money")

    if category == "money":
        rows = await db.fetchall(
            "SELECT p.nickname, p.balance, p.level, p.businesses, g.tag AS gang_tag "
            "FROM players p "
            "LEFT JOIN gang_members gm ON gm.user_id = p.user_id "
            "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
            "ORDER BY p.balance DESC LIMIT 20")
        result = [{"rank":i+1,"nickname":r["nickname"],"gang_tag":r.get("gang_tag"),
                   "balance":r["balance"],"level":r["level"],
                   "businesses_count":len(_json_biz(r))}
                  for i,r in enumerate(rows)]
    elif category == "level":
        rows = await db.fetchall(
            "SELECT p.nickname, p.balance, p.level, p.xp, g.tag AS gang_tag "
            "FROM players p "
            "LEFT JOIN gang_members gm ON gm.user_id = p.user_id "
            "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
            "ORDER BY p.level DESC, p.xp DESC LIMIT 20")
        result = [{"rank":i+1,"nickname":r["nickname"],"gang_tag":r.get("gang_tag"),
                   "level":r["level"],"xp":r["xp"],"balance":r["balance"]}
                  for i,r in enumerate(rows)]
    elif category == "gang":
        rows = await db.fetchall(
            "SELECT g.gang_id, g.name, g.emoji, g.tag, g.treasury, "
            "(SELECT COUNT(*) FROM gang_territories WHERE gang_id=g.gang_id) as terr_count "
            "FROM gangs g ORDER BY terr_count DESC, g.treasury DESC LIMIT 20")

        all_mem = await db.fetchall(
            "SELECT gm.gang_id, p.head_id, p.body_id, p.legs_id, p.right_hand_id, p.left_hand_id "
            "FROM gang_members gm JOIN players p ON p.user_id = gm.user_id"
        )
        dmg_by_gang = {}
        mem_count = {}
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
                   "tag":r.get("tag"),
                   "treasury":r["treasury"],"territories_count":r["terr_count"],
                   "total_damage":dmg_by_gang.get(r["gang_id"], 0),
                   "members_count":mem_count.get(r["gang_id"], 0),
                   "income":income_by_gang.get(r["gang_id"],0)}
                  for i,r in enumerate(rows)]
    else:
        result = []

    return web.json_response({"leaders": result, "category": category})



async def _pvp_state_response(bid, uid):
    b = await db.fetchone("SELECT * FROM pvp_battles WHERE battle_id=?", (bid,))
    if not b or uid not in (b["attacker_id"], b["defender_id"]):
        return None
    att = await _player(b["attacker_id"]); dfn = await _player(b["defender_id"])
    import json as _j
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
        "log": _j.loads(b["log"] or "[]"),
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
            return web.json_response({"error": "Бой не активен (статус: " + str(b["status"]) + ")"}, status=400)

        try: cur_turn = int(b["turn"])
        except Exception as _e:
            print(f"⚠️ turn parse error: b['turn']={b['turn']!r}: {_e}")
            cur_turn = 0
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

        else:  # defend
            attack_part = b.get("pending_attack_part")
            if not attack_part:
                return web.json_response({"error": "Нет атаки для защиты"}, status=400)

            try: attacker_id = int(b["defender_id"]) if uid == int(b["attacker_id"]) else int(b["attacker_id"])
            except Exception as _e:
                print(f"⚠️ attacker_id parse: {_e}")
                return web.json_response({"error": "Ошибка данных боя"}, status=500)

            att_p = await _player(attacker_id)
            if not att_p:
                return web.json_response({"error": "Атакующий не найден"}, status=400)
            stats = get_combat_stats(att_p)
            dmg = int(stats.get("damage", 5))

            if attack_part == part:
                dmg = 0

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

async def api_gang_set_tag(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    tag = (body.get("tag") or "").strip().upper()
    if not re.fullmatch(r"[A-ZА-ЯЁ]{3}", tag):
        return web.json_response({"error": "Тег: ровно 3 буквы A-Z или А-Я"}, status=400)
    member = await db.fetchone("SELECT * FROM gang_members WHERE user_id=?", (uid,))
    if not member or member["role"] != "leader":
        return web.json_response({"error": "Только лидер может менять тег"}, status=403)
    await db.execute("UPDATE gangs SET tag=? WHERE gang_id=?", (tag, member["gang_id"]))
    return web.json_response({"ok": True, "tag": tag})

async def _ensure_gang_columns():
    try: await db.execute("ALTER TABLE gangs ADD COLUMN last_income_at INTEGER DEFAULT 0")
    except: pass

async def _process_territories():
    now = int(time.time())
    active = await db.fetchall("SELECT * FROM territory_captures WHERE status='active'")
    for cap in active:
        cur = await db.fetchone("SELECT status FROM territory_captures WHERE capture_id=?", (cap["capture_id"],))
        if not cur or cur["status"] != "active":
            continue
        if now < cap["started_at"] + CAPTURE_HOURS * 3600:
            continue
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
                winner_gid=winner["gang_id"]
            )
            print(f"⚔️ Битва за {tname}: gang {winner['gang_id']} победил ({dmg_a} vs {dmg_b})")
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
                winner_gid=cap["gang_id"]
            )
            print(f"✅ Захват {tname} завершён (gang {cap['gang_id']})")

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
    if hours > 0:
        terrs = await db.fetchall("SELECT COUNT(*) as c FROM gang_territories WHERE gang_id=?", (gid,))
        count = terrs[0]["c"] if terrs else 0
        income = count * 1000 * hours
        if income > 0:
            await db.execute("UPDATE gangs SET treasury=treasury+?, last_income_at=last_income_at+? WHERE gang_id=?", (income, hours*3600, gid))
        else:
            await db.execute("UPDATE gangs SET last_income_at=? WHERE gang_id=?", (now, gid))

async def api_gang_set_deputy(request):
    ud = await _user(request); uid = ud["id"]
    member = await db.fetchone("SELECT * FROM gang_members WHERE user_id=?", (uid,))
    if not member or member["role"] != "leader":
        return web.json_response({"error": "Только лидер может назначать замов"}, status=403)
    body = await request.json()
    target_id = int(body.get("user_id", 0))
    action = body.get("action", "promote")
    target = await db.fetchone("SELECT * FROM gang_members WHERE user_id=? AND gang_id=?", (target_id, member["gang_id"]))
    if not target: return web.json_response({"error": "Игрок не в банде"}, status=404)
    if target["role"] == "leader": return web.json_response({"error": "Нельзя менять роль лидера"}, status=400)
    new_role = "deputy" if action == "promote" else "member"
    await db.execute("UPDATE gang_members SET role=? WHERE user_id=?", (new_role, target_id))
    return web.json_response({"ok": True})

async def api_gang_captures(request):
    try: await _process_territories()
    except Exception as _e: print(f"⚠️ _process_territories: {_e}")
    rows = await db.fetchall("""
        SELECT tc.*, g.name as gang_name, g.emoji as gang_emoji
        FROM territory_captures tc
        JOIN gangs g ON g.gang_id = tc.gang_id
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
                "territory_id": tid,
                "territory_name": terr["name"],
                "territory_emoji": terr.get("emoji", "🏙️"),
                "captures": [],
                "battle_left": left,
                "is_contested": False,
            }
        by_terr[tid]["captures"].append({
            "capture_id": r["capture_id"],
            "gang_id": r["gang_id"],
            "gang_name": r["gang_name"],
            "gang_emoji": r["gang_emoji"],
            "total_damage": r["total_damage"],
            "left": left,
        })
        if left < by_terr[tid]["battle_left"]:
            by_terr[tid]["battle_left"] = left
    for v in by_terr.values():
        v["is_contested"] = len(v["captures"]) >= 2
    return web.json_response({"captures": rows, "by_territory": list(by_terr.values())})

async def api_gang_invite(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    target_id = int(body.get("target_id", 0))
    if target_id == uid: return web.json_response({"error": "Себя нельзя"}, status=400)
    my = await db.fetchone("SELECT gang_id, role FROM gang_members WHERE user_id=?", (uid,))
    if not my or my["role"] not in ("leader", "deputy"):
        return web.json_response({"error": "Только лидер или зам"}, status=403)
    if not await _player(target_id): return web.json_response({"error": "Игрок не найден"}, status=404)
    if await db.fetchone("SELECT 1 FROM gang_members WHERE user_id=?", (target_id,)):
        return web.json_response({"error": "Игрок уже в банде"}, status=400)
    cnt = await db.fetchone("SELECT COUNT(*) as c FROM gang_members WHERE gang_id=?", (my["gang_id"],))
    if cnt["c"] >= GANG_MAX_MEMBERS:
        return web.json_response({"error": "Банда заполнена"}, status=400)
    gang = await db.fetchone("SELECT name, emoji FROM gangs WHERE gang_id=?", (my["gang_id"],))
    me = await _player(uid)
    await db.execute(
        "INSERT INTO notifications (user_id, type, text, data) VALUES (?, 'gang_invite', ?, ?)",
        (target_id, f"Приглашение в банду {gang['emoji']} {gang['name']} от {_nick_tag(me)}", json.dumps({"gang_id": my["gang_id"]}))
    )
    return web.json_response({"ok": True})

async def api_gang_invite_accept(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    notif_id = int(body.get("notification_id", 0))
    notif = await db.fetchone("SELECT * FROM notifications WHERE id=? AND user_id=? AND type='gang_invite'", (notif_id, uid))
    if not notif: return web.json_response({"error": "Приглашение не найдено"}, status=404)
    if await db.fetchone("SELECT 1 FROM gang_members WHERE user_id=?", (uid,)):
        return web.json_response({"error": "Ты уже в банде"}, status=400)
    try:
        gid = int(json.loads(notif.get("data") or "{}").get("gang_id", 0))
    except: gid = 0
    gang = await db.fetchone("SELECT * FROM gangs WHERE gang_id=?", (gid,))
    if not gang: return web.json_response({"error": "Банда не существует"}, status=404)
    cnt = await db.fetchone("SELECT COUNT(*) as c FROM gang_members WHERE gang_id=?", (gid,))
    if cnt["c"] >= GANG_MAX_MEMBERS:
        return web.json_response({"error": "Банда уже заполнена"}, status=400)
    await db.execute("INSERT INTO gang_members (gang_id, user_id, role) VALUES (?, ?, 'member')", (gid, uid))
    await db.execute("DELETE FROM notifications WHERE id=?", (notif_id,))
    return web.json_response({"ok": True})

async def api_gang_invite_decline(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    notif_id = int(body.get("notification_id", 0))
    await db.execute("DELETE FROM notifications WHERE id=? AND user_id=? AND type='gang_invite'", (notif_id, uid))
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
    members = await db.fetchall(
        "SELECT gm.user_id, gm.role, p.nickname, p.level FROM gang_members gm "
        "JOIN players p ON gm.user_id = p.user_id WHERE gm.gang_id=?", (gang["gang_id"],))
    for m in members:
        m["gang_tag"] = gang.get("tag")

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

    # ═══ ЛОГ ЗАХВАТОВ: только последние 10 (обрезка в _trim_territory_log) ═══
    logs = await db.fetchall(
        "SELECT * FROM territory_log WHERE gang_a_id=? OR gang_b_id=? "
        "ORDER BY id DESC LIMIT 10",
        (my_gid, my_gid))

    return web.json_response({
        "in_gang": True, "gang": gang, "members": members, "my_role": member["role"],
        "is_leader_or_deputy": member["role"] in ("leader","deputy"),
        "territories": terr_status,
        "territory_log": logs,
        "notifications": [],
    })

async def api_gang_join(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    gid = int(body.get("gang_id",0))
    ex = await db.fetchone("SELECT * FROM gang_members WHERE user_id=?", (uid,))
    if ex: return web.json_response({"error":"Ты уже в банде"}, status=400)
    gang = await db.fetchone("SELECT * FROM gangs WHERE gang_id=?", (gid,))
    if not gang: return web.json_response({"error":"Банда не найдена"}, status=400)
    cnt = await db.fetchone("SELECT COUNT(*) as c FROM gang_members WHERE gang_id=?", (gid,))
    if cnt["c"] >= GANG_MAX_MEMBERS:
        return web.json_response({"error":"Банда заполнена"}, status=400)
    await db.execute(
        "INSERT INTO gang_members (gang_id, user_id, role) VALUES (?, ?, 'member')",
        (gid, uid))
    return web.json_response({"ok":True})

async def api_gang_leave(request):
    ud = await _user(request); uid = ud["id"]
    member = await db.fetchone("SELECT * FROM gang_members WHERE user_id=?", (uid,))
    if not member: return web.json_response({"error":"Не в банде"}, status=400)
    if member["role"] == "leader":
        return web.json_response({"error":"Лидер не может выйти"}, status=400)
    await db.execute("DELETE FROM gang_members WHERE user_id=?", (uid,))
    return web.json_response({"ok":True})

async def api_gang_deposit(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    amount = int(body.get("amount",0))
    if amount <= 0: return web.json_response({"error":"Сумма"}, status=400)
    member = await db.fetchone("SELECT * FROM gang_members WHERE user_id=?", (uid,))
    if not member: return web.json_response({"error":"Не в банде"}, status=400)
    p = await _player(uid)
    if p["balance"] < amount: return web.json_response({"error": "Не хватает денег", "required": amount, "balance": p["balance"]}, status=400)
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
        "SELECT capture_id, territory_id FROM territory_captures "
        "WHERE gang_id=? AND status='active'", (my_gid,))
    if my_active:
        terr = next((t for t in GANG_TERRITORIES if t["id"] == my_active["territory_id"]), None)
        tname = terr["name"] if terr else f"#{my_active['territory_id']}"
        return web.json_response({"error": f"У банды уже идёт захват: {tname}"}, status=400)

    last_any = await db.fetchone(
        "SELECT started_at FROM territory_captures WHERE gang_id=? "
        "ORDER BY started_at DESC LIMIT 1", (my_gid,))
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
        return web.json_response({"error": "Это уже твоя территория и её никто не атакует"}, status=400)

    total_dmg = await _gang_total_damage(my_gid)
    cap_id = await db.execute(
        "INSERT INTO territory_captures (territory_id, gang_id, status, started_at, total_damage) "
        "VALUES (?,?, 'active', ?, ?)",
        (tid, my_gid, now, total_dmg))

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
        g_b_id=opp_gid, g_b_name=opp_gname
    )

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

async def api_online_count(request):
    await _user(request)
    now = int(time.time())
    row = await db.fetchone("SELECT COUNT(*) as c FROM players WHERE last_seen > ?", (now - 120,))
    return web.json_response({"count": row["c"] if row else 0})

async def api_notifications_get(request):
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


async def api_friend_search(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json(); q = body.get("query", "").strip()
    if len(q) < 2: return web.json_response({"error": "Минимум 2 символа"}, status=400)
    rows = await db.fetchall(
        "SELECT p.user_id, p.nickname, p.level, p.tg_username, g.tag AS gang_tag "
        "FROM players p "
        "LEFT JOIN gang_members gm ON gm.user_id = p.user_id "
        "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
        "WHERE p.nickname LIKE ? AND p.user_id != ? LIMIT 10",
        (f"%{q}%", uid))
    return web.json_response({"results": rows})

async def api_friend_request(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json(); target_id = int(body.get("target_id", 0))
    if target_id == uid: return web.json_response({"error": "Себя нельзя"}, status=400)
    p = await _player(uid)
    if not await _player(target_id): return web.json_response({"error": "Игрок не найден"}, status=404)
    if await db.fetchone("SELECT * FROM friends WHERE user_id=? AND friend_id=?", (uid, target_id)): return web.json_response({"error": "Запрос уже отправлен"}, status=400)
    ex2 = await db.fetchone("SELECT * FROM friends WHERE user_id=? AND friend_id=? AND status='pending'", (target_id, uid))
    if ex2:
        await db.execute("UPDATE friends SET status='accepted' WHERE user_id=? AND friend_id=?", (target_id, uid))
        await db.execute("INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'accepted')", (uid, target_id))
        return web.json_response({"ok": True, "accepted": True})
    await db.execute("INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'pending')", (uid, target_id))
    await db.execute("INSERT INTO notifications (user_id, type, text) VALUES (?, 'friend', ?)", (target_id, f"Запрос в друзья от {_nick_tag(p)}"))
    return web.json_response({"ok": True})

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
    friends = await db.fetchall(
        "SELECT f.friend_id as user_id, p.nickname, p.level, p.last_seen, p.tg_username, g.tag AS gang_tag "
        "FROM friends f "
        "JOIN players p ON p.user_id=f.friend_id "
        "LEFT JOIN gang_members gm ON gm.user_id = p.user_id "
        "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
        "WHERE f.user_id=? AND f.status='accepted'", (uid,))
    for f in friends:
        f["is_online"] = (f.get("last_seen") or 0) > now - 120
    reqs = await db.fetchall(
        "SELECT f.user_id, p.nickname, p.level, p.last_seen, p.tg_username, g.tag AS gang_tag "
        "FROM friends f "
        "JOIN players p ON p.user_id=f.user_id "
        "LEFT JOIN gang_members gm ON gm.user_id = p.user_id "
        "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
        "WHERE f.friend_id=? AND f.status='pending'", (uid,))
    for r in reqs:
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
        "SELECT pm.from_id as user_id, p.nickname, g.tag as gang_tag, MAX(pm.id) as last_id, "
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
    rows = await db.fetchall("SELECT * FROM private_messages WHERE (from_id=? AND to_id=?) OR (from_id=? AND to_id=?) ORDER BY id ASC LIMIT 100", (uid, with_id, with_id, uid))
    await db.execute("UPDATE private_messages SET is_read=1 WHERE to_id=? AND from_id=?", (uid, with_id))
    return web.json_response({"messages": rows})

async def api_chat_send(request):
    try:
        ud = await _user(request); uid = ud["id"]
        p = await _player(uid)
        if not p: return web.json_response({"error":"Нет игрока"}, status=400)
        body = await request.json()
        msg = (body.get("message") or "").strip()
        if not msg: return web.json_response({"error":"Пустое сообщение"}, status=400)
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
        "SELECT c.user_id, c.nickname, c.level, c.message, c.created_at, g.tag AS gang_tag "
        "FROM chat_messages c "
        "LEFT JOIN gang_members gm ON gm.user_id = c.user_id "
        "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
        "ORDER BY c.id DESC LIMIT 50")
    rows.reverse()
    return web.json_response({"messages": rows})
async def api_cases_list(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    result = []
    for cid, c in CASES.items():
        items = []
        for it in c["items"]:
            ij = item_json(it["iid"])
            if ij:
                ij["chance"] = it["chance"]
                items.append(ij)
        result.append({"case_id":cid,"name":c["name"],"emoji":c["emoji"],
                       "price":c["price"],"items":items})
    return web.json_response({"cases": result, "balance": p["balance"]})
async def api_cases_open(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    cid = body.get("case_id")
    c = CASES.get(cid)
    if not c: return web.json_response({"error":"Кейс не найден"}, status=400)
    p = await _player(uid)
    if p["balance"] < c["price"]:
        return web.json_response({"error":"Не хватает денег"}, status=400)
    import random as _r
    total = sum(it["chance"] for it in c["items"])
    roll = _r.uniform(0, total)
    acc = 0; won = None
    for it in c["items"]:
        acc += it["chance"]
        if roll <= acc: won = it["iid"]; break
    if not won: won = c["items"][0]["iid"]
    await db.execute("UPDATE players SET balance=balance-? WHERE user_id=?", (c["price"], uid))
    await _add_inv(uid, won, 1)
    p = await _player(uid)
    return web.json_response({"player":_player_json(p), "won":item_json(won)})
async def _cleanup_stale_pvp():
    try:
        await db.execute(
            "UPDATE pvp_battles SET status='expired' WHERE status='pending' "
            "AND (strftime('%s','now') - strftime('%s', created_at)) > 30"
        )
        await db.execute(
            "UPDATE pvp_battles SET status='expired' WHERE status='active' "
            "AND (turn_started_at IS NULL OR turn_started_at = 0 "
            "OR (strftime('%s','now') - turn_started_at) > 300)"
        )
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
    await db.execute("INSERT INTO notifications (user_id, type, text, data) VALUES (?, 'pvp', ?, ?)", (target_id, f"Вызов на гоп-стоп от {_nick_tag(p1)}", json.dumps({"battle_id": bid})))
    return web.json_response({"ok":True,"battle_id":bid,"attacker":p1["nickname"],
                              "defender":p2["nickname"]})
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
        return web.json_response({"error":"Время на ответ истекло (30 сек)"}, status=400)
    if not accept:
        await db.execute("UPDATE pvp_battles SET status='declined' WHERE battle_id=?", (bid,))
        return web.json_response({"ok":True,"declined":True})
    await db.execute("UPDATE pvp_battles SET status='active', turn_started_at=? WHERE battle_id=?",
                     (int(time.time()), bid))
    return web.json_response({"ok":True})


async def api_reset(request):
    ud = await _user(request); uid = ud["id"]
    await db.execute("DELETE FROM players WHERE user_id=?", (uid,))
    await db.execute("DELETE FROM inventory WHERE user_id=?", (uid,))
    await db.execute("DELETE FROM gang_members WHERE user_id=?", (uid,))
    return web.json_response({"ok": True, "message": "Персонаж сброшен"})


async def _forced_credit_collect(uid):
    try:
        p = await _player(uid)
        debt = p.get("credit_amount", 0) or 0
        due = p.get("credit_due", 0) or 0
        if debt <= 0 or due <= 0:
            return 0
        now = int(time.time())
        if now < due:
            return 0
        if p["balance"] <= 0:
            return 0
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

async def _pvp_finish(winner_id, loser_id, bid):
    _PENDING_MOVES.pop(f"pvp_turn_{bid}", None)
    winner = await _player(winner_id)
    loser = await _player(loser_id)
    if not winner or not loser: return web.json_response({"error":"Нет игрока"}, status=400)
    steal = int(loser["balance"] * 0.10)
    await db.execute("UPDATE players SET balance=balance-? WHERE user_id=?", (steal, loser_id))
    await db.execute("UPDATE players SET balance=balance+? WHERE user_id=?", (steal, winner_id))
    return web.json_response({"ok":True,"finished":True,
                              "winner_id":winner_id,"winner_name":winner["nickname"],
                              "loser_name":loser["nickname"],"steal":steal})



# ══════════════════════════════════════════════════════════════
#  PVP (ГОП-СТОП) — старая имплементация
# ══════════════════════════════════════════════════════════════
_PENDING_MOVES = {}

async def api_pvp_start(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    target_id = int(body.get("target_id", 0))
    if target_id == uid:
        return web.json_response({"error": "Себя бить нельзя"}, status=400)
    target = await _player(target_id)
    if not target:
        return web.json_response({"error": "Игрок не найден"}, status=404)
    p = await _player(uid)
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

async def api_territory_capture_start(request):
    return await api_gang_capture(request)

async def _gang_total_damage(gid):
    members = await db.fetchall("SELECT user_id FROM gang_members WHERE gang_id=?", (gid,))
    total = 0
    for m in members:
        p = await _player(m["user_id"])
        if p:
            stats = get_combat_stats(p)
            total += stats.get("damage", 5)
    return total

async def api_territory_capture_resolve(request):
    ud = await _user(request)
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
    ud = await _user(request)
    territories = []
    for t in GANG_TERRITORIES:
        owner = await db.fetchone(
            "SELECT g.gang_id, g.name FROM gang_territories gt JOIN gangs g ON g.gang_id=gt.gang_id WHERE gt.territory_id=?",
            (t["id"],))
        territories.append({
            "id": t["id"], "name": t["name"], "emoji": t.get("emoji", "🏙️"),
            "income": t.get("income", 1000),
            "owner": {"gang_id": owner["gang_id"], "name": owner["name"]} if owner else None
        })
    return web.json_response({"territories": territories})

async def api_referral_info(request):
    await _ensure_ref_columns()
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)

    try:
        row = await db.fetchone("SELECT COUNT(*) as c FROM players WHERE referrer_id=?", (uid,))
        count = row["c"] if row else 0
    except Exception:
        count = 0

    import json
    claims_str = p.get("ref_claims") if p else None
    try: claims = json.loads(claims_str or "[]")
    except: claims = []

    earned = count * 5000

    return web.json_response({
        "count": count,
        "earned": earned,
        "claims": claims,
        "link": f"https://t.me/newerarpgbot?start=ref_{uid}"
    })

async def api_referral_claim(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    body = await request.json()
    milestone = int(body.get("milestone", 0))

    row = await db.fetchone("SELECT COUNT(*) as c FROM players WHERE referrer_id=?", (uid,))
    count = row["c"] if row else 0

    import json
    try: claims = json.loads(p.get("ref_claims") or "[]")
    except: claims = []

    if milestone in claims:
        return web.json_response({"error": "Бонус уже получен"}, status=400)

    rewards = {3: 15000, 5: 30000, 10: 100000}
    if milestone not in rewards:
        return web.json_response({"error": "Неверная награда"}, status=400)

    if count < milestone:
        return web.json_response({"error": f"Нужно {milestone} рефералов"}, status=400)

    reward = rewards[milestone]
    claims.append(milestone)
    claims_json = json.dumps(claims)

    await db.execute("UPDATE players SET balance=balance+?, ref_claims=? WHERE user_id=?", (reward, claims_json, uid))

    return web.json_response({"ok": True, "reward": reward})



async def api_upgrade_business(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    bid = body.get("business_id")
    b = BUSINESSES.get(bid)
    if not b: return web.json_response({"error":"Бизнес не найден"}, status=400)
    p = await _player(uid)
    biz = _json_biz(p)

    target = next((x for x in biz if x["id"] == bid), None)
    if not target: return web.json_response({"error":"У тебя нет этого бизнеса"}, status=400)

    lvl = target.get("level", 1)
    if lvl >= 3: return web.json_response({"error":"Максимальный уровень"}, status=400)

    cost = int(b["price"] * (1.3 if lvl == 1 else 1.7))
    if p["balance"] < 0:
        return web.json_response({"error": "У тебя отрицательный баланс (баг). Обратись к админу."}, status=400)
    if p["balance"] < cost: return web.json_response({"error": "Не хватает денег", "required": cost, "balance": p["balance"]}, status=400)

    target["level"] = lvl + 1
    await _save_biz(uid, biz)
    await db.execute("UPDATE players SET balance=balance-? WHERE user_id=?", (cost, uid))

    p = await _player(uid)
    return web.json_response({"player": _player_json(p), "success": True})



# ═══════════ ADMIN PANEL ═══════════
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
    rows = await db.fetchall("SELECT user_id, nickname, balance, level FROM players WHERE nickname LIKE ? LIMIT 20", (f"%{query}%",))
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


def setup_routes(app):
    R = app.router
    R.add_post("/api/admin/set_level", api_admin_set_level)
    R.add_post("/api/admin/search", api_admin_search)
    R.add_post("/api/admin/player_info", api_admin_player_info)
    R.add_post("/api/admin/change_balance", api_admin_change_balance)
    R.add_post("/api/admin/delete", api_admin_delete)
    R.add_post("/api/me", api_me)
    R.add_post("/api/register", api_register)
    R.add_post("/api/reset", api_reset)
    R.add_post("/api/shop", api_shop)
    R.add_post("/api/inventory", api_inventory)
    R.add_post("/api/buy", api_buy)
    R.add_post("/api/sell", api_sell)
    R.add_post("/api/equip", api_equip)
    R.add_post("/api/unequip", api_unequip)
    R.add_post("/api/jobs", api_jobs)
    R.add_post("/api/set_job", api_set_job)
    R.add_post("/api/work", api_work)
    R.add_post("/api/businesses", api_businesses)
    R.add_post("/api/buy_business", api_buy_business)
    R.add_post("/api/upgrade_business", api_upgrade_business)
    R.add_post("/api/collect_business", api_collect_business)
    R.add_post("/api/casino_play", api_casino_play)
    R.add_post("/api/daily", api_daily)
    R.add_post("/api/roulette", api_roulette)
    R.add_post("/api/crime", api_crime)
    R.add_post("/api/credit/take", api_credit_take)
    R.add_post("/api/pvp/incoming", api_pvp_incoming)
    R.add_post("/api/pvp/start", api_pvp_start)
    R.add_post("/api/pvp/respond", api_pvp_respond)
    R.add_post("/api/pvp/state", api_pvp_state)
    R.add_post("/api/pvp/action", api_pvp_action)
    R.add_post("/api/referral/info", api_referral_info)
    R.add_post("/api/referral/claim", api_referral_claim)
    R.add_post("/api/gang/info", api_gang_info)
    R.add_post("/api/gang/create", api_gang_create)
    R.add_post("/api/gang/join", api_gang_join)
    R.add_post("/api/gang/territories", api_gang_territories)
    R.add_post("/api/territory/capture/start", api_territory_capture_start)
    R.add_post("/api/territory/capture/resolve", api_territory_capture_resolve)
    R.add_post("/api/credit/pay", api_credit_pay)
    R.add_post("/api/crypto/price", api_crypto_price)
    R.add_post("/api/crypto/buy", api_crypto_buy)
    R.add_post("/api/crypto/sell", api_crypto_sell)
    R.add_post("/api/location", api_location)
    R.add_post("/api/move", api_move)
    R.add_post("/api/player_view", api_player_view)
    R.add_post("/api/player_items", api_player_items)
    R.add_post("/api/trade/send", api_trade_send)
    R.add_post("/api/trade/list", api_trades_list)
    R.add_post("/api/trade/accept", api_trade_accept)
    R.add_post("/api/trade/decline", api_trade_decline)
    R.add_post("/api/leaderboard", api_leaderboard)
    R.add_post("/api/gang/get", api_gang_get)
    R.add_post("/api/gang/leave", api_gang_leave)
    R.add_post("/api/gang/deposit", api_gang_deposit)
    R.add_post("/api/gang/withdraw", api_gang_withdraw)
    R.add_post("/api/gang/capture", api_gang_capture)
    R.add_post("/api/gang/set_deputy", api_gang_set_deputy)
    R.add_post("/api/gang/set_tag", api_gang_set_tag)
    R.add_post("/api/gang/captures", api_gang_captures)
    R.add_post("/api/gang/invite", api_gang_invite)
    R.add_post("/api/gang/invite/accept", api_gang_invite_accept)
    R.add_post("/api/gang/invite/decline", api_gang_invite_decline)
    R.add_post("/api/chat/send", api_chat_send)
    R.add_post("/api/notifications/get", api_notifications_get)
    R.add_post("/api/online_count", api_online_count)
    R.add_post("/api/notifications/read", api_notifications_read)
    R.add_post("/api/notifications/delete", api_notifications_delete)
    R.add_post("/api/friend/search", api_friend_search)
    R.add_post("/api/friend/request", api_friend_request)
    R.add_post("/api/friend/respond", api_friend_respond)
    R.add_post("/api/friend/remove", api_friend_remove)
    R.add_post("/api/friend/list", api_friend_list)
    R.add_post("/api/chat/pm/send", api_chat_pm_send)
    R.add_post("/api/chat/pm/get", api_chat_pm_get)
    R.add_post("/api/chat/pm/unread_count", api_chat_pm_unread_count)
    R.add_post("/api/chat/pm/conversations", api_chat_pm_conversations)
    R.add_post("/api/chat/get", api_chat_get)
    R.add_post("/api/cases/list", api_cases_list)
    R.add_post("/api/cases/open", api_cases_open)
    R.add_post("/api/pvp/challenge", api_pvp_challenge)
    R.add_post("/api/pvp/force_cancel", api_pvp_force_cancel)