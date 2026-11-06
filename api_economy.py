# api_economy.py
"""Экономика: магазин, работа, бизнесы, казино, блекджек, колесо, промокоды, кредит, крипта, кейсы, рефералы, магазин банды."""
import json, random, time
from aiohttp import web
from database import db
from game import (
    ITEMS, JOBS, BUSINESSES, CASINO_GAMES, DAILY_REWARDS, CASES,
    SLOTS, SLOT_BY_CATEGORY, GANG_SHOP_ITEMS,
    CREDIT_MAX, CREDIT_TERMS, item_json, item_sell_price, roulette_color,
    crypto_price, crypto_history_24h, crypto_price_old_at_hour,
    START_BALANCE, xp_to_next,
    is_case_item,
)
from api_core import (
    _user, _player, _add_inv, _remove_inv, _has_inv, _player_json,
    _json_biz, _json_ach, _save_biz, _save_ach, _check_levelup,
    _check_achievements, _forced_credit_collect,
    _ref_migrated, _ensure_ref_columns,
)

# ═══════════ КЕЙСЫ: ЛИМИТЫ ═══════════
CASE_LIMITS = {
    "anime_girls": 15
}

# ═══════════ КРИПТО-БАЛАНСИРОВКА ═══════════
CRYPTO_BUY_FEE = 0.03
CRYPTO_SELL_FEE_BASE = 0.05
CRYPTO_MAX_PER_TX = 10000
CRYPTO_MAX_PER_DAY = 50000
CRYPTO_MAX_HOLD = 100000
CRYPTO_HOLD_BONUS = [
    (12, -0.03), (6,  -0.02), (3,  -0.01), (1,   0.00), (0,  +0.05),
]

def _crypto_hold_fee(hold_seconds):
    hours = hold_seconds / 3600
    for min_h, modifier in CRYPTO_HOLD_BONUS:
        if hours >= min_h:
            return max(0.01, CRYPTO_SELL_FEE_BASE + modifier)
    return CRYPTO_SELL_FEE_BASE + 0.05

# ═══════════ МИГРАЦИЯ КРИПТЫ ═══════════
_migration_lock = False
async def migrate_crypto_v1():
    global _migration_lock
    if _migration_lock: return
    _migration_lock = True
    try:
        row = await db.fetchone("SELECT COUNT(*) as c FROM players WHERE crypto_migrated=0 AND crypto_amount>0")
        if not row or row["c"] == 0:
            await db.execute("UPDATE players SET crypto_migrated=1 WHERE crypto_migrated=0")
            return
        now_hour = int(time.time() / 3600)
        old_price = crypto_price_old_at_hour(now_hour)
        players = await db.fetchall("SELECT user_id, crypto_amount FROM players WHERE crypto_migrated=0 AND crypto_amount>0")
        for p in players:
            uid = p["user_id"]
            coins = p["crypto_amount"]
            rub = int(coins * old_price)
            await db.execute("UPDATE players SET balance=balance+?, crypto_amount=0, crypto_migrated=1 WHERE user_id=?", (rub, uid))
        await db.execute("UPDATE players SET crypto_migrated=1 WHERE crypto_migrated=0")
    finally:
        _migration_lock = False

# ═══════════ ХЕЛПЕР: ЛИМИТЫ КЕЙСОВ ═══════════
async def _ensure_system_stats_table():
    try:
        await db.execute(
            "CREATE TABLE IF NOT EXISTS system_stats (key TEXT PRIMARY KEY, value INTEGER DEFAULT 0)"
        )
    except Exception as e:
        print(f"⚠️ ensure system_stats: {e}")

async def _get_case_opened(cid):
    await _ensure_system_stats_table()
    try:
        row = await db.fetchone("SELECT value FROM system_stats WHERE key=?", (f"case_open_{cid}",))
        return int(row["value"]) if row else 0
    except Exception as e:
        print(f"⚠️ _get_case_opened({cid}): {e}")
        return 0

async def _try_inc_case_opened(cid, limit):
    await _ensure_system_stats_table()
    key = f"case_open_{cid}"
    try:
        await db.execute(
            "INSERT OR IGNORE INTO system_stats (key, value) VALUES (?, 0)",
            (key,))
        cur = await db.conn.execute(
            "UPDATE system_stats SET value = value + 1 WHERE key = ? AND value < ?",
            (key, limit))
        await db.conn.commit()
        if cur.rowcount == 0:
            return None
        new_row = await db.fetchone("SELECT value FROM system_stats WHERE key=?", (key,))
        return int(new_row["value"]) if new_row else None
    except Exception as e:
        print(f"⚠️ _try_inc_case_opened({cid}): {e}")
        return None

# ═══════════ МАГАЗИН / ИНВЕНТАРЬ ═══════════
async def api_shop(request):
    await _user(request)
    rarity_order = {"common":0, "uncommon":1, "rare":2, "epic":3, "legendary":4}
    items = []
    for iid, it in sorted(ITEMS.items(), key=lambda kv: (rarity_order.get(kv[1].get("rarity","common"), 99), kv[1].get("price", 0))):
        if it.get("is_gang_only"): continue
        if is_case_item(iid): continue
        items.append(item_json(iid))
    return web.json_response({"items": items})

async def api_inventory(request):
    ud = await _user(request); uid = ud["id"]
    rows = await db.fetchall("SELECT item_id, quantity FROM inventory WHERE user_id=? AND quantity>0 ORDER BY item_id", (uid,))
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
    if it.get("is_gang_only"): return web.json_response({"error":"Этот предмет продаётся только в магазине банды"}, status=400)
    if is_case_item(iid): return web.json_response({"error":"Этот предмет падает только из кейсов — купить нельзя"}, status=400)
    p = await _player(uid)
    if p["balance"] < it["price"]: return web.json_response({"error":"Не хватает денег"}, status=400)
    await db.execute("UPDATE players SET balance=balance-? WHERE user_id=?", (it["price"], uid))
    await _add_inv(uid, iid, 1)
    p = await _player(uid)
    await _check_achievements(uid, p)
    return web.json_response({"player": _player_json(p), "bought": it["name"]})

async def api_sell(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    iid = body.get("item_id")
    if not await _has_inv(uid, iid): return web.json_response({"error":"Нет предмета"}, status=400)
    it = ITEMS.get(iid, {})
    if it.get("is_gang_only"): return web.json_response({"error":"Клановые шмотки нельзя продавать"}, status=400)
    if is_case_item(iid): return web.json_response({"error":"Эксклюзив с кейсов продавать нельзя"}, status=400)
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
    if not await _has_inv(uid, iid): return web.json_response({"error":"Не в инвентаре"}, status=400)
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

# ═══════════ МАГАЗИН БАНДЫ ═══════════
async def api_gang_shop_items(request):
    ud = await _user(request); uid = ud["id"]
    member = await db.fetchone("SELECT gang_id FROM gang_members WHERE user_id=?", (uid,))
    if not member: return web.json_response({"error": "Ты не в банде"}, status=400)
    p = await _player(uid)
    rarity_order = {"common":0, "uncommon":1, "rare":2, "epic":3, "legendary":4}
    items = []
    for iid, it in sorted(GANG_SHOP_ITEMS.items(), key=lambda kv: (rarity_order.get(kv[1].get("rarity","common"), 99), kv[1].get("seeds_price", 0))):
        ij = item_json(iid)
        if ij: items.append(ij)
    return web.json_response({"items": items, "seeds": p.get("seeds", 0)})

async def api_gang_shop_buy(request):
    ud = await _user(request); uid = ud["id"]
    member = await db.fetchone("SELECT gang_id FROM gang_members WHERE user_id=?", (uid,))
    if not member: return web.json_response({"error": "Ты не в банде"}, status=400)
    body = await request.json()
    iid = body.get("item_id")
    it = GANG_SHOP_ITEMS.get(iid)
    if not it: return web.json_response({"error": "Нет такого товара"}, status=400)
    p = await _player(uid)
    seeds_price = it.get("seeds_price", 0)
    if seeds_price <= 0: return web.json_response({"error": "Ошибка цены"}, status=400)
    if p.get("seeds", 0) < seeds_price: return web.json_response({"error": f"Нужно {seeds_price} 🌻 семечек, у тебя {p.get('seeds', 0)}"}, status=400)
    await db.execute("UPDATE players SET seeds=seeds-? WHERE user_id=?", (seeds_price, uid))
    await _add_inv(uid, iid, 1)
    p = await _player(uid)
    return web.json_response({"player": _player_json(p), "bought": it["name"], "seeds_spent": seeds_price})

# ═══════════ РАБОТА ═══════════
async def api_jobs(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    jobs = [ {**j, "id":jid, "unlocked":p["level"]>=j["level"]} for jid, j in JOBS.items() ]
    return web.json_response({"jobs": jobs, "current": p.get("current_job"), "last_work": p.get("last_work",0), "now": int(time.time())})

async def api_set_job(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    jid = body.get("job_id")
    if jid not in JOBS: return web.json_response({"error":"Нет такой"}, status=400)
    p = await _player(uid)
    if p["level"] < JOBS[jid]["level"]: return web.json_response({"error":"Низкий уровень"}, status=400)
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
    if cd > 0: return web.json_response({"error":f"Подожди {cd} сек"}, status=400)
    await db.execute("UPDATE players SET balance=balance+?, xp=xp+?, last_work=? WHERE user_id=?", (job["salary"], job["xp"], now, uid))
    credit_paid = await _forced_credit_collect(uid)
    p = await _player(uid)
    levels = await _check_levelup(uid, p)
    p = await _player(uid)
    ach = await _check_achievements(uid, p)
    if "first_job" not in _json_ach(p):
        await _save_ach(uid, _json_ach(p) + ["first_job"])
        ach.append("first_job")
    return web.json_response({"player": _player_json(p), "earned": job["salary"], "xp": job["xp"], "levels": levels, "new_achievements": ach, "credit_paid": credit_paid})

# ═══════════ БИЗНЕСЫ ═══════════
def _biz_mult(lvl):
    if lvl == 2: return 1.75
    if lvl >= 3: return 3.0
    return 1.0

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
            real_income = int(b["income"] * _biz_mult(lvl))
            info["income"] = real_income
            info["last_collect"] = owned[bid].get("last_collect", now)
            elapsed = max(0, min(86400, now - info["last_collect"]))
            info["pending"] = int(real_income * elapsed / 3600)
            total_pending += info["pending"]
            if lvl < 3:
                info["next_level_income"] = int(b["income"] * _biz_mult(lvl + 1))
                info["next_level"] = lvl + 1
                info["upgrade_cost"] = int(b["price"] * (1.3 if lvl == 1 else 1.7))
            else:
                info["next_level_income"] = None; info["next_level"] = None; info["upgrade_cost"] = None
        else:
            info["level"] = 0; info["next_level_income"] = None; info["next_level"] = None; info["upgrade_cost"] = None
        result.append(info)
    return web.json_response({"businesses": result, "pending": total_pending})

async def api_buy_business(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    bid = body.get("business_id")
    b = BUSINESSES.get(bid)
    if not b: return web.json_response({"error":"Нет"}, status=400)
    p = await _player(uid)
    if p["balance"] < 0: return web.json_response({"error": "Отрицательный баланс"}, status=400)
    if bid in [x["id"] for x in _json_biz(p)]: return web.json_response({"error":"Уже есть"}, status=400)
    if p["balance"] < b["price"]: return web.json_response({"error": "Не хватает", "required": b["price"], "balance": p["balance"]}, status=400)
    now = int(time.time())
    biz = _json_biz(p)
    biz.append({"id":bid, "last_collect":now, "level":1})
    await _save_biz(uid, biz)
    await db.execute("UPDATE players SET balance=balance-?, xp=xp+? WHERE user_id=?", (b["price"], b["xp"], uid))
    p = await _player(uid)
    levels = await _check_levelup(uid, p)
    p = await _player(uid)
    ach = await _check_achievements(uid, p)
    if "first_business" not in _json_ach(p):
        await _save_ach(uid, _json_ach(p) + ["first_business"])
        ach.append("first_business")
    return web.json_response({"player": _player_json(p), "levels":levels, "new_achievements": ach})

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
        real_income = int(info["income"] * _biz_mult(lvl))
        last = b.get("last_collect", now)
        elapsed = max(0, min(86400, now - last))
        total += int(real_income * elapsed / 3600)
        b["last_collect"] = now
    if total > 0:
        await _save_biz(uid, biz)
        await db.execute("UPDATE players SET balance=balance+? WHERE user_id=?", (total, uid))
    p = await _player(uid)
    return web.json_response({"player": _player_json(p), "collected": total})

async def api_upgrade_business(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    bid = body.get("business_id")
    b = BUSINESSES.get(bid)
    if not b: return web.json_response({"error":"Не найден"}, status=400)
    p = await _player(uid)
    biz = _json_biz(p)
    target = next((x for x in biz if x["id"] == bid), None)
    if not target: return web.json_response({"error":"Нет бизнеса"}, status=400)
    lvl = target.get("level", 1)
    if lvl >= 3: return web.json_response({"error":"Максимум"}, status=400)
    cost = int(b["price"] * (1.3 if lvl == 1 else 1.7))
    if p["balance"] < cost: return web.json_response({"error": "Не хватает", "required": cost, "balance": p["balance"]}, status=400)
    target["level"] = lvl + 1
    await _save_biz(uid, biz)
    await db.execute("UPDATE players SET balance=balance-? WHERE user_id=?", (cost, uid))
    p = await _player(uid)
    return web.json_response({"player": _player_json(p), "success": True})

# ═══════════ КАЗИНО ═══════════
async def api_casino_play(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    game = body.get("game"); bet = int(body.get("bet", 0))
    if game not in CASINO_GAMES: return web.json_response({"error": "Игра"}, status=400)
    if bet <= 0: return web.json_response({"error": "Ставка"}, status=400)
    p = await _player(uid)
    if p["balance"] < bet: return web.json_response({"error": "Не хватает"}, status=400)
    now_cd = int(time.time())
    if now_cd - p.get("last_casino", 0) < 5: return web.json_response({"error": f"Кд {5 - (now_cd - p.get('last_casino', 0))}с"}, status=400)
    win_amount = 0; result_text = ""
    if game == "coin":
        choice = body.get("choice", "Орёл")
        side = random.choice(["Орёл", "Решка"])
        result_text = f"Монетка: {side}"
        if choice == side: win_amount = int(bet * 2)
        else: result_text += " — проигрыш"
    elif game == "dice":
        choice = body.get("choice", "Больше 3")
        roll = random.randint(1, 6)
        result_text = f"Кости: выпало {roll}"
        if (choice == "Больше 3" and roll > 3) or (choice == "Меньше 4" and roll < 4): win_amount = int(bet * 1.8)
        else: result_text += " — проигрыш"
    elif game == "roulette":
        choice = body.get("choice", "red"); number = body.get("number")
        n = random.randint(0, 36); color = roulette_color(n)
        result_text = f"Выпало {n} ({color})"
        if choice == "red" and color == "red": win_amount = bet * 2
        elif choice == "black" and color == "black": win_amount = bet * 2
        elif choice == "even" and n != 0 and n % 2 == 0: win_amount = bet * 2
        elif choice == "odd" and n % 2 == 1: win_amount = bet * 2
        elif choice == "low" and 1 <= n <= 18: win_amount = bet * 2
        elif choice == "high" and 19 <= n <= 36: win_amount = bet * 2
        elif choice == "dozen1" and 1 <= n <= 12: win_amount = bet * 3
        elif choice == "dozen2" and 13 <= n <= 24: win_amount = bet * 3
        elif choice == "dozen3" and 25 <= n <= 36: win_amount = bet * 3
        elif choice == "number" and number is not None:
            if int(number) == n: win_amount = bet * 36
        if win_amount == 0: result_text += " — проигрыш"
    elif game == "slots":
        symbols = ["🍒", "🍋", "🍊", "🔔", "⭐", "💎"]
        a, b, c = random.choices(symbols, k=3)
        result_text = f"{a}{b}{c}"
        if a == b == c == "💎": win_amount = int(bet * 50); result_text += " — ДЖЕКПОТ!"
        elif a == b == c: win_amount = int(bet * 5); result_text += " — x5!"
        elif a == b or b == c or a == c: win_amount = int(bet * 1.5); result_text += " — x1.5"
        else: result_text += " — проигрыш"
    net = win_amount - bet
    now_upd = int(time.time())
    await db.execute("UPDATE players SET balance=balance+?, casino_plays=casino_plays+1, last_casino=? WHERE user_id=?", (net, now_upd, uid))
    credit_paid = await _forced_credit_collect(uid) if net > 0 else 0
    p = await _player(uid)
    ach = await _check_achievements(uid, p)
    if win_amount >= 100000 and "big_winner" not in _json_ach(p):
        await _save_ach(uid, _json_ach(p) + ["big_winner"])
        ach.append("big_winner")
    return web.json_response({"player": _player_json(p), "win": win_amount, "net": net, "result": result_text, "new_achievements": ach})

# ═══════════ КОЛЕСО ФОРТУНЫ ═══════════
WHEEL_SECTORS = [1, 3, 1, 5, 1, 3, 10, 1, 3, 5, 1, 3, 20, 1, 3, 5, 10, 1, 5, 1]
WHEEL_MULTIPLIERS = {1: 2, 3: 4, 5: 6, 10: 11, 20: 21}

async def api_wheel_play(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    try: bet = int(body.get("bet", 0))
    except: bet = 0
    try: choice = int(body.get("choice", 0))
    except: choice = 0
    if bet <= 0: return web.json_response({"error": "Ставка должна быть > 0"}, status=400)
    if choice not in WHEEL_MULTIPLIERS:
        return web.json_response({"error": "Неверный сектор"}, status=400)
    p = await _player(uid)
    if p["balance"] < bet: return web.json_response({"error": "Не хватает денег"}, status=400)
    now_cd = int(time.time())
    if now_cd - p.get("last_casino", 0) < 5:
        return web.json_response({"error": f"Кд {5 - (now_cd - p.get('last_casino', 0))}с"}, status=400)

    sector_idx = random.randint(0, len(WHEEL_SECTORS) - 1)
    sector_value = WHEEL_SECTORS[sector_idx]

    won = (sector_value == choice)
    win_amount = bet * WHEEL_MULTIPLIERS[choice] if won else 0
    net = win_amount - bet

    await db.execute(
        "UPDATE players SET balance=balance+?, casino_plays=casino_plays+1, last_casino=? WHERE user_id=?",
        (net, now_cd, uid))

    credit_paid = await _forced_credit_collect(uid) if net > 0 else 0
    p = await _player(uid)
    ach = await _check_achievements(uid, p)
    if win_amount >= 100000 and "big_winner" not in _json_ach(p):
        await _save_ach(uid, _json_ach(p) + ["big_winner"])
        ach.append("big_winner")

    return web.json_response({
        "player": _player_json(p),
        "sector_index": sector_idx,
        "sector_value": sector_value,
        "choice": choice,
        "won": won,
        "win": win_amount,
        "net": net,
        "multiplier": WHEEL_MULTIPLIERS[choice] if won else 0,
        "new_achievements": ach,
        "credit_paid": credit_paid,
    })

# ═══════════ БЛЭКДЖЕК ═══════════
BJ_SUITS = ["♠", "♥", "♦", "♣"]
BJ_RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]
BJ_DEALER_STAND = 18

def _bj_new_deck():
    deck = [{"rank": r, "suit": s} for s in BJ_SUITS for r in BJ_RANKS]
    random.shuffle(deck)
    return deck

def _bj_hand_value(cards):
    total = 0
    aces = 0
    for c in cards:
        if c.get("hidden"): continue
        r = c["rank"]
        if r == "A":
            aces += 1
            total += 11
        elif r in ("J", "Q", "K"):
            total += 10
        else:
            total += int(r)
    while total > 21 and aces > 0:
        total -= 10
        aces -= 1
    is_soft = aces > 0 and total <= 21
    return total, is_soft

def _bj_is_blackjack(cards):
    return len(cards) == 2 and _bj_hand_value(cards)[0] == 21

def _bj_game_state(g, reveal=False, message=None):
    deck = json.loads(g["deck"])
    player = json.loads(g["player_cards"])
    dealer = json.loads(g["dealer_cards"])
    p_total, p_soft = _bj_hand_value(player)
    finished = g["status"] == "finished"
    show_dealer = bool(reveal or finished)
    if show_dealer:
        dealer_display = dealer
        d_total, d_soft = _bj_hand_value(dealer)
    else:
        dealer_display = [dealer[0], {"hidden": True}] if len(dealer) >= 2 else dealer
        d_total, d_soft = _bj_hand_value([dealer[0]]) if dealer else (0, False)
    return {
        "bet": g["bet"],
        "status": g["status"],
        "player_cards": player,
        "dealer_cards": dealer_display,
        "reveal_dealer": show_dealer,
        "player_total": p_total,
        "player_soft": p_soft,
        "dealer_total": d_total,
        "dealer_soft": d_soft,
        "can_hit": (not finished) and p_total < 21,
        "can_stand": not finished,
        "can_double": (not finished) and not g.get("doubled") and len(player) == 2,
        "finished": finished,
        "result": g.get("result"),
        "payout": g.get("payout", 0),
        "message": message,
        "player_blackjack": _bj_is_blackjack(player),
        "dealer_blackjack": _bj_is_blackjack(dealer) if finished else False,
        "doubled": bool(g.get("doubled")),
        "player_bust": p_total > 21,
    }

async def _bj_delete_stale(uid):
    try:
        row = await db.fetchone(
            "SELECT user_id FROM blackjack_games WHERE user_id=? "
            "AND strftime('%s','now') - strftime('%s', created_at) > 3600", (uid,))
        if row:
            await db.execute("DELETE FROM blackjack_games WHERE user_id=?", (uid,))
    except: pass

async def api_blackjack_state(request):
    ud = await _user(request); uid = ud["id"]
    await _bj_delete_stale(uid)
    g = await db.fetchone("SELECT * FROM blackjack_games WHERE user_id=?", (uid,))
    p = await _player(uid)
    if not g:
        return web.json_response({"active": False, "balance": p["balance"]})
    return web.json_response({
        "active": True,
        "balance": p["balance"],
        "game": _bj_game_state(g, reveal=(g["status"] == "finished")),
    })

async def api_blackjack_start(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    try: bet = int(body.get("bet", 0))
    except: bet = 0
    if bet <= 0: return web.json_response({"error": "Ставка должна быть > 0"}, status=400)
    await _bj_delete_stale(uid)
    existing = await db.fetchone("SELECT * FROM blackjack_games WHERE user_id=?", (uid,))
    if existing:
        if existing["status"] == "finished":
            await db.execute("DELETE FROM blackjack_games WHERE user_id=?", (uid,))
        else:
            return web.json_response({"error": "У тебя уже есть активная игра"}, status=400)
    p = await _player(uid)
    if p["balance"] < bet: return web.json_response({"error": "Не хватает денег"}, status=400)

    await db.execute("UPDATE players SET balance=balance-? WHERE user_id=?", (bet, uid))

    deck = _bj_new_deck()
    player_cards = [deck.pop(), deck.pop()]
    dealer_cards = [deck.pop(), deck.pop()]

    status = "player"
    result = None
    payout = 0
    message = None

    p_bj = _bj_is_blackjack(player_cards)
    d_bj = _bj_is_blackjack(dealer_cards)
    if p_bj and d_bj:
        status = "finished"; result = "push"; payout = bet
        message = "🤝 У обоих блэкджек — ничья"
    elif p_bj:
        status = "finished"; result = "blackjack"; payout = int(bet * 2.5)
        message = "🎉 БЛЭКДЖЕК! Плата 3:2"
    elif d_bj:
        status = "finished"; result = "lose"; payout = 0
        message = "💀 Блэкджек у дилера"

    await db.execute(
        "INSERT OR REPLACE INTO blackjack_games "
        "(user_id, bet, deck, player_cards, dealer_cards, status, result, payout, doubled) "
        "VALUES (?,?,?,?,?,?,?,?,0)",
        (uid, bet, json.dumps(deck), json.dumps(player_cards),
         json.dumps(dealer_cards), status, result, payout))

    if status == "finished":
        if payout > 0:
            await db.execute("UPDATE players SET balance=balance+? WHERE user_id=?", (payout, uid))
        await db.execute("UPDATE players SET casino_plays=casino_plays+1 WHERE user_id=?", (uid,))

    g = await db.fetchone("SELECT * FROM blackjack_games WHERE user_id=?", (uid,))
    p = await _player(uid)
    return web.json_response({
        "player": _player_json(p),
        "game": _bj_game_state(g, reveal=(status == "finished"), message=message),
    })

async def api_blackjack_hit(request):
    ud = await _user(request); uid = ud["id"]
    g = await db.fetchone("SELECT * FROM blackjack_games WHERE user_id=?", (uid,))
    if not g or g["status"] != "player":
        return web.json_response({"error": "Нет активной игры"}, status=400)
    deck = json.loads(g["deck"])
    player = json.loads(g["player_cards"])
    dealer = json.loads(g["dealer_cards"])
    if not deck: deck = _bj_new_deck()
    player.append(deck.pop())
    p_total, _ = _bj_hand_value(player)
    status = "player"
    result = None
    payout = 0
    message = None
    if p_total > 21:
        status = "finished"; result = "bust"; payout = 0
        message = f"💥 Перебор! {p_total} > 21"

    await db.execute(
        "UPDATE blackjack_games SET deck=?, player_cards=?, status=?, result=?, payout=? WHERE user_id=?",
        (json.dumps(deck), json.dumps(player), status, result, payout, uid))

    if status == "finished":
        await db.execute("UPDATE players SET casino_plays=casino_plays+1 WHERE user_id=?", (uid,))
        if payout > 0:
            await db.execute("UPDATE players SET balance=balance+? WHERE user_id=?", (payout, uid))

    g = await db.fetchone("SELECT * FROM blackjack_games WHERE user_id=?", (uid,))
    p = await _player(uid)
    return web.json_response({
        "player": _player_json(p),
        "game": _bj_game_state(g, reveal=(status == "finished"), message=message),
    })

async def api_blackjack_stand(request):
    ud = await _user(request); uid = ud["id"]
    g = await db.fetchone("SELECT * FROM blackjack_games WHERE user_id=?", (uid,))
    if not g or g["status"] != "player":
        return web.json_response({"error": "Нет активной игры"}, status=400)
    deck = json.loads(g["deck"])
    player = json.loads(g["player_cards"])
    dealer = json.loads(g["dealer_cards"])

    p_total, _ = _bj_hand_value(player)
    if p_total > 21:
        await db.execute(
            "UPDATE blackjack_games SET status='finished', result='bust', payout=0 WHERE user_id=?",
            (uid,))
        await db.execute("UPDATE players SET casino_plays=casino_plays+1 WHERE user_id=?", (uid,))
        g = await db.fetchone("SELECT * FROM blackjack_games WHERE user_id=?", (uid,))
        p = await _player(uid)
        return web.json_response({
            "player": _player_json(p),
            "game": _bj_game_state(g, reveal=True, message="💥 Перебор"),
        })

    while True:
        d_total, _ = _bj_hand_value(dealer)
        if d_total >= BJ_DEALER_STAND: break
        if not deck: deck = _bj_new_deck()
        dealer.append(deck.pop())

    d_total, _ = _bj_hand_value(dealer)
    if d_total > 21:
        result = "dealer_bust"; payout = g["bet"] * 2
        message = f"🎉 Дилер перебрал ({d_total}) — ты выиграл!"
    elif p_total > d_total:
        result = "win"; payout = g["bet"] * 2
        message = f"🏆 Победа! {p_total} vs {d_total}"
    elif p_total < d_total:
        result = "lose"; payout = 0
        message = f"😢 Проигрыш. {p_total} vs {d_total}"
    else:
        result = "push"; payout = g["bet"]
        message = f"🤝 Ничья {p_total} vs {d_total} — ставка возвращена"

    await db.execute(
        "UPDATE blackjack_games SET deck=?, dealer_cards=?, status='finished', result=?, payout=? WHERE user_id=?",
        (json.dumps(deck), json.dumps(dealer), result, payout, uid))
    await db.execute("UPDATE players SET balance=balance+? WHERE user_id=?", (payout, uid))
    await db.execute("UPDATE players SET casino_plays=casino_plays+1 WHERE user_id=?", (uid,))

    g = await db.fetchone("SELECT * FROM blackjack_games WHERE user_id=?", (uid,))
    p = await _player(uid)
    return web.json_response({
        "player": _player_json(p),
        "game": _bj_game_state(g, reveal=True, message=message),
    })

async def api_blackjack_double(request):
    ud = await _user(request); uid = ud["id"]
    g = await db.fetchone("SELECT * FROM blackjack_games WHERE user_id=?", (uid,))
    if not g or g["status"] != "player":
        return web.json_response({"error": "Нет активной игры"}, status=400)
    player = json.loads(g["player_cards"])
    if len(player) != 2 or g.get("doubled"):
        return web.json_response({"error": "Удвоение недоступно"}, status=400)
    bet = g["bet"]
    p = await _player(uid)
    if p["balance"] < bet:
        return web.json_response({"error": "Не хватает денег для удвоения"}, status=400)
    await db.execute("UPDATE players SET balance=balance-? WHERE user_id=?", (bet, uid))

    deck = json.loads(g["deck"])
    dealer = json.loads(g["dealer_cards"])
    if not deck: deck = _bj_new_deck()
    player.append(deck.pop())
    p_total, _ = _bj_hand_value(player)

    new_bet = bet * 2
    result = None
    payout = 0
    message = None

    if p_total > 21:
        result = "bust"; payout = 0
        message = f"💥 Перебор! {p_total} > 21 (удвоено)"
    else:
        while True:
            d_total, _ = _bj_hand_value(dealer)
            if d_total >= BJ_DEALER_STAND: break
            if not deck: deck = _bj_new_deck()
            dealer.append(deck.pop())
        d_total, _ = _bj_hand_value(dealer)
        if d_total > 21:
            result = "dealer_bust"; payout = new_bet * 2
            message = f"🎉 Дилер перебрал ({d_total}) — удвоенная победа!"
        elif p_total > d_total:
            result = "win"; payout = new_bet * 2
            message = f"🏆 Победа! {p_total} vs {d_total} (удвоено)"
        elif p_total < d_total:
            result = "lose"; payout = 0
            message = f"😢 Проигрыш. {p_total} vs {d_total}"
        else:
            result = "push"; payout = new_bet
            message = f"🤝 Ничья {p_total} vs {d_total}"

    await db.execute(
        "UPDATE blackjack_games SET bet=?, deck=?, player_cards=?, dealer_cards=?, "
        "status='finished', result=?, payout=?, doubled=1 WHERE user_id=?",
        (new_bet, json.dumps(deck), json.dumps(player), json.dumps(dealer),
         result, payout, uid))
    await db.execute("UPDATE players SET balance=balance+? WHERE user_id=?", (payout, uid))
    await db.execute("UPDATE players SET casino_plays=casino_plays+1 WHERE user_id=?", (uid,))

    g = await db.fetchone("SELECT * FROM blackjack_games WHERE user_id=?", (uid,))
    p = await _player(uid)
    return web.json_response({
        "player": _player_json(p),
        "game": _bj_game_state(g, reveal=True, message=message),
    })

async def api_blackjack_cancel(request):
    ud = await _user(request); uid = ud["id"]
    await db.execute("DELETE FROM blackjack_games WHERE user_id=?", (uid,))
    return web.json_response({"ok": True})

# ═══════════ ПРОМОКОДЫ ═══════════
async def api_promo_apply(request):
    """Игрок вводит промокод. Атомарно: списывает 1 использование и начисляет бонус."""
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    code = (body.get("code") or "").strip().upper()
    if not code:
        return web.json_response({"error": "Введи промокод"}, status=400)
    if len(code) > 64:
        return web.json_response({"error": "Слишком длинный код"}, status=400)

    row = await db.fetchone("SELECT * FROM promo_codes WHERE code=?", (code,))
    if not row:
        return web.json_response({"error": "Промокод не найден"}, status=404)
    if row["uses_left"] <= 0:
        return web.json_response({"error": "Промокод больше не действует"}, status=400)

    already = await db.fetchone(
        "SELECT id FROM promo_used WHERE code=? AND user_id=?", (code, uid))
    if already:
        return web.json_response({"error": "Ты уже активировал этот промокод"}, status=400)

    try:
        cur = await db.conn.execute(
            "UPDATE promo_codes SET uses_left = uses_left - 1 WHERE code=? AND uses_left > 0",
            (code,))
        await db.conn.commit()
        if cur.rowcount == 0:
            return web.json_response({"error": "Промокод больше не действует"}, status=400)
        try:
            await db.conn.execute(
                "INSERT INTO promo_used (code, user_id) VALUES (?, ?)", (code, uid))
            await db.conn.commit()
        except Exception:
            await db.conn.execute(
                "UPDATE promo_codes SET uses_left = uses_left + 1 WHERE code=?", (code,))
            await db.conn.commit()
            return web.json_response({"error": "Ты уже активировал этот промокод"}, status=400)
    except Exception as e:
        print(f"⚠️ promo apply: {e}")
        return web.json_response({"error": "Ошибка сервера"}, status=500)

    bonus = int(row["bonus"] or 0)
    await db.execute("UPDATE players SET balance = balance + ? WHERE user_id=?", (bonus, uid))
    credit_paid = await _forced_credit_collect(uid)
    p = await _player(uid)
    pj = _player_json(p)
    try:
        await _check_achievements(uid, p)
    except Exception:
        pass
    return web.json_response({
        "ok": True,
        "bonus": bonus,
        "player": pj,
        "credit_paid": credit_paid,
        "message": f"✅ +{bonus}₽ зачислено на баланс!",
    })

# ═══════════ ЕЖЕДНЕВНОЕ / РУЛЕТКА / КРАЖА ═══════════
async def api_daily(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    now = int(time.time())
    last = p.get("last_daily",0)
    if now - last < 86400: return web.json_response({"error":"Уже забрал","next_in":86400-(now-last)}, status=400)
    if now - last > 172800: streak = 1
    else: streak = min(7, p.get("daily_streak",0) + 1)
    reward = DAILY_REWARDS[streak-1]
    await db.execute("UPDATE players SET balance=balance+?, last_daily=?, daily_streak=? WHERE user_id=?", (reward, now, streak, uid))
    credit_paid = await _forced_credit_collect(uid)
    p = await _player(uid)
    return web.json_response({"player": _player_json(p), "reward": reward, "streak": streak, "credit_paid": credit_paid})

async def api_roulette(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    now = int(time.time())
    if now - p.get("last_roulette",0) < 21600: return web.json_response({"error":"Не раньше 6 часов"}, status=400)
    prizes = [0,100,500,1000,2000,5000,10000,50000]
    prize = random.choices(prizes, weights=[30,20,20,15,8,4,2,1])[0]
    await db.execute("UPDATE players SET balance=balance+?, last_roulette=? WHERE user_id=?", (prize, now, uid))
    credit_paid = await _forced_credit_collect(uid) if prize > 0 else 0
    p = await _player(uid)
    return web.json_response({"player": _player_json(p), "prize": prize, "credit_paid": credit_paid})

async def api_crime(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    now = int(time.time())
    if now - p.get("last_crime",0) < 300: return web.json_response({"error":f"Кд {300-(now-p.get('last_crime',0))} сек"}, status=400)
    success = random.random() < 0.6
    if success:
        gain = random.randint(2000, 8000)
        await db.execute("UPDATE players SET balance=balance+?, last_crime=?, crimes_won=crimes_won+1 WHERE user_id=?", (gain, now, uid))
        msg = f"🕶 Ограбил магазин +{gain}₽"
    else:
        fine = random.randint(1000, 3000)
        await db.execute("UPDATE players SET balance=MAX(0, balance-?), last_crime=? WHERE user_id=?", (fine, now, uid))
        msg = f"🚔 Поймали! Штраф {fine}₽"
    p = await _player(uid)
    ach = await _check_achievements(uid, p)
    return web.json_response({"player": _player_json(p), "result": msg, "success": success, "new_achievements": ach})

# ═══════════ КРЕДИТ ═══════════
async def api_credit_take(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    amount = int(body.get("amount", 0))
    try: term_hours = int(float(body.get("term_hours", 0)))
    except: term_hours = 0
    if amount <= 0 or amount > CREDIT_MAX: return web.json_response({"error": f"Сумма 1-{CREDIT_MAX}₽"}, status=400)
    term = next((t for t in CREDIT_TERMS if t["hours"] == term_hours), None)
    if not term: return web.json_response({"error": f"Срок {term_hours}ч не найден"}, status=400)
    p = await _player(uid)
    if p.get("credit_amount", 0) > 0: return web.json_response({"error": "Уже есть кредит"}, status=400)
    total_debt = int(amount * (1 + term["pct"]/100))
    now = int(time.time()); due = now + term_hours * 3600
    await db.execute("UPDATE players SET balance=balance+?, credit_amount=?, credit_due=? WHERE user_id=?", (amount, total_debt, due, uid))
    p = await _player(uid)
    ach = await _check_achievements(uid, p)
    return web.json_response({"player": _player_json(p), "total_debt": total_debt, "due_at": due, "term_hours": term_hours, "pct": term["pct"], "new_achievements": ach})

async def api_credit_pay(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    debt = p.get("credit_amount", 0)
    if debt <= 0: return web.json_response({"error": "Нет кредита"}, status=400)
    if p["balance"] < debt: return web.json_response({"error": f"Нужно {debt}₽, у тебя {p['balance']}₽"}, status=400)
    await db.execute("UPDATE players SET balance=balance-?, credit_amount=0, credit_due=0 WHERE user_id=?", (debt, uid))
    p = await _player(uid)
    return web.json_response({"player": _player_json(p), "paid": debt})

# ═══════════ КРИПТА ═══════════
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
    if now - bought_ts > 86400: bought_today = 0
    return web.json_response({
        "price": price, "history": crypto_history_24h(),
        "buy_fee_pct": int(CRYPTO_BUY_FEE * 100),
        "sell_fee_pct": int(sell_fee * 100),
        "sell_fee_base_pct": int(CRYPTO_SELL_FEE_BASE * 100),
        "max_per_tx": CRYPTO_MAX_PER_TX, "max_per_day": CRYPTO_MAX_PER_DAY,
        "bought_today": bought_today, "max_hold": CRYPTO_MAX_HOLD,
        "coins": coins, "coins_value": int(coins * price), "hold_seconds": hold_secs,
    })

async def api_crypto_buy(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    try: amount = int(body.get("amount", 0))
    except: amount = 0
    if amount <= 0: return web.json_response({"error": "Сумма > 0"}, status=400)
    if amount > CRYPTO_MAX_PER_TX: return web.json_response({"error": f"Макс за операцию: {CRYPTO_MAX_PER_TX}₽"}, status=400)
    p = await _player(uid)
    now = int(time.time())
    price = crypto_price()
    bought_today = p.get("crypto_bought_today", 0) or 0
    bought_ts = p.get("crypto_bought_ts", 0) or 0
    if now - bought_ts > 86400: bought_today = 0
    if bought_today + amount > CRYPTO_MAX_PER_DAY:
        left = max(0, CRYPTO_MAX_PER_DAY - bought_today)
        return web.json_response({"error": f"Дневной лимит: осталось {left}₽"}, status=400)
    current_coins = p.get("crypto_amount", 0) or 0
    current_value = current_coins * price
    if current_value + amount > CRYPTO_MAX_HOLD:
        left = max(0, int(CRYPTO_MAX_HOLD - current_value))
        return web.json_response({"error": f"Макс во владении: {CRYPTO_MAX_HOLD}₽. Свободно: {left}₽"}, status=400)
    if p["balance"] < amount: return web.json_response({"error": "Не хватает денег"}, status=400)
    buy_fee = int(amount * CRYPTO_BUY_FEE)
    net_amount = amount - buy_fee
    coins = net_amount / price
    new_hold_since = p.get("crypto_hold_since", 0) or 0
    if current_coins <= 0 or new_hold_since == 0: new_hold_since = now
    new_bought_today = bought_today + amount
    new_bought_ts = now if bought_today == 0 else bought_ts
    await db.execute(
        "UPDATE players SET balance=balance-?, crypto_amount=crypto_amount+?, crypto_hold_since=?, crypto_bought_today=?, crypto_bought_ts=? WHERE user_id=?",
        (amount, coins, new_hold_since, new_bought_today, new_bought_ts, uid))
    p = await _player(uid)
    return web.json_response({"player": _player_json(p), "coins": coins, "price": price, "buy_fee": buy_fee, "net_amount": net_amount})

async def api_crypto_sell(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    try: amount = float(body.get("amount", 0))
    except: amount = 0
    p = await _player(uid)
    if amount <= 0: return web.json_response({"error": "Количество > 0"}, status=400)
    if amount > p.get("crypto_amount", 0): return web.json_response({"error": "Недостаточно коинов"}, status=400)
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
    if new_coins <= 0.0001: new_coins = 0; new_hold_since = 0
    await db.execute("UPDATE players SET balance=balance+?, crypto_amount=?, crypto_hold_since=? WHERE user_id=?", (rub, new_coins, new_hold_since, uid))
    credit_paid = await _forced_credit_collect(uid)
    p = await _player(uid)
    return web.json_response({"player": _player_json(p), "rub": rub, "fee": fee, "rub_before": rub_before, "price": price, "fee_pct": int(fee_pct * 100), "hold_hours": round(hold_secs / 3600, 2), "credit_paid": credit_paid})

# ═══════════ КЕЙСЫ ═══════════
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
        limit = CASE_LIMITS.get(cid)
        opened = 0
        if limit:
            opened = await _get_case_opened(cid)
        case_data = {
            "case_id": cid, "name": c["name"], "emoji": c["emoji"],
            "price": c["price"], "items": items,
            "is_limited": bool(limit), "limit": limit or 0, "opened": opened,
            "left": max(0, (limit or 0) - opened) if limit else 0
        }
        result.append(case_data)
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

    limit = CASE_LIMITS.get(cid)
    new_opened = None
    if limit:
        new_opened = await _try_inc_case_opened(cid, limit)
        if new_opened is None:
            return web.json_response({"error": "Лимит открытий этого кейса исчерпан!"}, status=400)

    await db.execute("UPDATE players SET balance=balance-? WHERE user_id=?", (c["price"], uid))

    total = sum(it["chance"] for it in c["items"])
    roll = random.uniform(0, total)
    acc = 0; won = None
    for it in c["items"]:
        acc += it["chance"]
        if roll <= acc: won = it["iid"]; break
    if not won: won = c["items"][0]["iid"]

    await _add_inv(uid, won, 1)
    p = await _player(uid)

    resp = {"player":_player_json(p), "won":item_json(won)}
    if limit:
        resp["is_limited"] = True
        resp["limit"] = limit
        resp["opened"] = new_opened
        resp["left"] = max(0, limit - new_opened)
        print(f"🎁 Кейс {cid}: opened={new_opened}/{limit}, left={resp['left']}")

    return web.json_response(resp)

# ═══════════ РЕФЕРАЛЫ ═══════════
async def api_referral_info(request):
    await _ensure_ref_columns()
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    try:
        row = await db.fetchone("SELECT COUNT(*) as c FROM players WHERE referrer_id=?", (uid,))
        count = row["c"] if row else 0
    except Exception: count = 0
    claims_str = p.get("ref_claims") if p else None
    try: claims = json.loads(claims_str or "[]")
    except: claims = []
    earned = count * 5000
    return web.json_response({
        "count": count, "earned": earned, "claims": claims,
        "link": f"https://t.me/newerarpgbot?start=ref_{uid}"
    })

async def api_referral_claim(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    body = await request.json()
    milestone = int(body.get("milestone", 0))
    row = await db.fetchone("SELECT COUNT(*) as c FROM players WHERE referrer_id=?", (uid,))
    count = row["c"] if row else 0
    try: claims = json.loads(p.get("ref_claims") or "[]")
    except: claims = []
    if milestone in claims: return web.json_response({"error": "Бонус уже получен"}, status=400)
    rewards = {3: 15000, 5: 30000, 10: 100000}
    if milestone not in rewards: return web.json_response({"error": "Неверная награда"}, status=400)
    if count < milestone: return web.json_response({"error": f"Нужно {milestone} рефералов"}, status=400)
    reward = rewards[milestone]
    claims.append(milestone)
    await db.execute("UPDATE players SET balance=balance+?, ref_claims=? WHERE user_id=?", (reward, json.dumps(claims), uid))
    credit_paid = await _forced_credit_collect(uid)
    p = await _player(uid)
    return web.json_response({"ok": True, "reward": reward, "credit_paid": credit_paid, "player": _player_json(p)})