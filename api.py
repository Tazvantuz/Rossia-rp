"""REST API для РП Россия Mini App."""
import hmac, hashlib, json, random, time
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
    START_BALANCE, xp_to_next, crypto_price, item_json, item_sell_price,
    get_outfit,
)

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
    return ud

async def _player(uid):
    return await db.fetchone("SELECT * FROM players WHERE user_id = ?", (uid,))

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
    try: return json.loads(p.get("businesses") or "[]")
    except: return []
def _json_ach(p):
    try: return json.loads(p.get("achievements") or "[]")
    except: return []
def _save_biz(uid, biz): return db.execute(
    "UPDATE players SET businesses=? WHERE user_id=?", (json.dumps(biz), uid))
def _save_ach(uid, ach): return db.execute(
    "UPDATE players SET achievements=? WHERE user_id=?", (json.dumps(ach), uid))

def _player_json(p):
    return {
        "user_id": p["user_id"], "nickname": p["nickname"],
        "balance": p["balance"], "level": p["level"], "xp": p["xp"],
        "xp_next": xp_to_next(p["level"]),
        "location_id": p["location_id"],
        "outfit": get_outfit(p),
        "current_job": p.get("current_job"),
        "businesses": _json_biz(p),
        "achievements": _json_ach(p),
        "credit_amount": p.get("credit_amount", 0),
        "credit_due": p.get("credit_due", 0),
        "crypto_amount": p.get("crypto_amount", 0),
        "crypto_price": crypto_price(),
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

# ═══════════ ENDPOINTS ═══════════

async def api_me(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    if not p:
        return web.json_response({"registered": False})
    credit_paid = await _forced_credit_collect(uid)
    if credit_paid:
        p = await _player(uid)
    ach_new = await _check_achievements(uid, p)
    return web.json_response({"registered": True, "player": _player_json(p),
                              "new_achievements": ach_new, "credit_paid": credit_paid})

async def api_register(request):
    ud = await _user(request); uid = ud["id"]
    if await _player(uid):
        return web.json_response({"error":"already registered"}, status=400)
    body = await request.json()
    nick = (body.get("nickname") or "").strip()
    if not (2 <= len(nick) <= 20):
        return web.json_response({"error":"Ник 2-20 символов"}, status=400)
    await db.execute(
        """INSERT INTO players (user_id,nickname,balance,level,xp,location_id)
        VALUES (?,?,?,?,?,?)""",
        (uid, nick, START_BALANCE, 1, 0, START_LOCATION))
    # Стартовый шмот в инвентарь (но не надет — голый!)
    for iid in ["h_cig","b_alco","l_family"]:
        await _add_inv(uid, iid, 1)
    p = await _player(uid)
    return web.json_response({"player": _player_json(p)})

async def api_shop(request):
    await _user(request)
    items = []
    for iid, it in ITEMS.items():
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
            info["last_collect"] = owned[bid].get("last_collect", now)
            elapsed = min(86400, now - info["last_collect"])
            info["pending"] = int(b["income"] * elapsed / 3600)
            total_pending += info["pending"]
        result.append(info)
    return web.json_response({"businesses": result, "pending": total_pending})

async def api_buy_business(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    bid = body.get("business_id")
    b = BUSINESSES.get(bid)
    if not b: return web.json_response({"error":"Нет"}, status=400)
    p = await _player(uid)
    if bid in [x["id"] for x in _json_biz(p)]:
        return web.json_response({"error":"Уже есть"}, status=400)
    if p["balance"] < b["price"]:
        return web.json_response({"error":"Не хватает"}, status=400)
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
        elapsed = min(86400, now - b.get("last_collect", now))
        earn = int(info["income"] * elapsed / 3600)
        total += earn
        b["last_collect"] = now
    if total <= 0:
        return web.json_response({"error":"Нечего собирать"}, status=400)
    await _save_biz(uid, biz)
    await db.execute("UPDATE players SET balance=balance+? WHERE user_id=?", (total, uid))
    credit_paid = await _forced_credit_collect(uid)
    p = await _player(uid)
    ach = await _check_achievements(uid, p)
    return web.json_response({"player": _player_json(p), "earned": total,
                              "new_achievements": ach, "credit_paid": credit_paid})

async def api_casino_play(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    game = body.get("game"); bet = int(body.get("bet",0))
    if game not in CASINO_GAMES:
        return web.json_response({"error":"Игра"}, status=400)
    if bet <= 0: return web.json_response({"error":"Ставка"}, status=400)
    p = await _player(uid)
    if p["balance"] < bet:
        return web.json_response({"error":"Не хватает"}, status=400)
    now_cd = int(time.time())
    if now_cd - p.get("last_casino", 0) < 5:
        return web.json_response({"error": f"Кд {5 - (now_cd-p.get('last_casino',0))}с"}, status=400)
    g = CASINO_GAMES[game]
    win_amount = 0; result_text = ""
    if game == "slots":
        symbols = ["🍒","🍋","🍊","🔔","⭐"]
        a,b,c = random.choices(symbols, k=3)
        result_text = f"{a}{b}{c}"
        if a==b==c:
            win_amount = int(bet * 5); result_text += " — 🎉 x5!"
        elif a==b or b==c or a==c:
            win_amount = int(bet * 1.5); result_text += " — x1.5"
        else:
            result_text += " — проигрыш"
    elif game == "dice":
        roll = random.randint(1,6)
        result_text = f"🎲 {roll}"
        if roll > 3:
            win_amount = int(bet * 1.8); result_text += " — ПОБЕДА!"
        else:
            result_text += " — проигрыш"
    else:
        if random.random() < g["chance"]:
            win_amount = int(bet * g["payout"])
            result_text = "🎉 Победа!"
        else:
            result_text = "😢 Проигрыш"
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
    return web.json_response({"player": _player_json(p), "win": win_amount,
                              "net": net, "result": result_text,
                              "new_achievements": ach})

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


async def api_crypto_buy(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    amount = int(body.get("amount",0))
    price = crypto_price()
    if amount <= 0: return web.json_response({"error":"Сумма"}, status=400)
    p = await _player(uid)
    if p["balance"] < amount:
        return web.json_response({"error":"Не хватает"}, status=400)
    coins = amount / price
    await db.execute("UPDATE players SET balance=balance-?, crypto_amount=crypto_amount+? WHERE user_id=?",
                     (amount, coins, uid))
    p = await _player(uid)
    return web.json_response({"player": _player_json(p), "coins": coins, "price": price})

async def api_crypto_sell(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    amount = float(body.get("amount",0))
    p = await _player(uid)
    if amount <= 0 or amount > p.get("crypto_amount",0):
        return web.json_response({"error":"Недостаточно"}, status=400)
    price = crypto_price()
    rub = int(amount * price)
    await db.execute("UPDATE players SET balance=balance+?, crypto_amount=crypto_amount-? WHERE user_id=?",
                     (rub, amount, uid))
    credit_paid = await _forced_credit_collect(uid)
    p = await _player(uid)
    return web.json_response({"player": _player_json(p), "rub": rub, "price": price,
                              "credit_paid": credit_paid})

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
        "SELECT user_id,nickname,level,balance FROM players WHERE location_id=? AND user_id!=?",
        (loc_id, uid))
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
    return web.json_response({
        "user_id": t["user_id"], "nickname": t["nickname"],
        "level": t["level"], "balance": t["balance"],
        "outfit": get_outfit(t),
        "businesses_count": len(_json_biz(t)),
        "achievements": _json_ach(t),
        "combat_stats": get_combat_stats(t),
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
        if sender: t2["other_nickname"] = sender["nickname"]
        inc_enriched.append(t2)
    out_enriched = []
    for t in outgoing:
        t2 = enrich(t, "to_user")
        receiver = await _player(t["to_user"])
        if receiver: t2["other_nickname"] = receiver["nickname"]
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
    # Обмен
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
            "SELECT nickname, balance, level, businesses FROM players ORDER BY balance DESC LIMIT 20")
        result = [{"rank":i+1,"nickname":r["nickname"],"balance":r["balance"],
                   "level":r["level"],"businesses_count":len(_json_biz(r))}
                  for i,r in enumerate(rows)]
    elif category == "level":
        rows = await db.fetchall(
            "SELECT nickname, balance, level, xp FROM players ORDER BY level DESC, xp DESC LIMIT 20")
        result = [{"rank":i+1,"nickname":r["nickname"],"level":r["level"],
                   "xp":r["xp"],"balance":r["balance"]}
                  for i,r in enumerate(rows)]
    elif category == "gang":
        rows = await db.fetchall(
            "SELECT g.gang_id, g.name, g.emoji, g.treasury, "
            "(SELECT COUNT(*) FROM gang_territories WHERE gang_id=g.gang_id) as terr_count "
            "FROM gangs g ORDER BY terr_count DESC, g.treasury DESC LIMIT 20")
        terr_incomes = {t["id"]: t["income"] for t in GANG_TERRITORIES}
        terr_rows = await db.fetchall(
            "SELECT territory_id, gang_id FROM gang_territories WHERE gang_id IS NOT NULL")
        income_by_gang = {}
        for r in terr_rows:
            gid = r["gang_id"]
            income_by_gang[gid] = income_by_gang.get(gid,0) + terr_incomes.get(r["territory_id"],0)
        result = [{"rank":i+1,"gang_id":r["gang_id"],"name":r["name"],"emoji":r["emoji"],
                   "treasury":r["treasury"],"territories_count":r["terr_count"],
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
    return {
        "battle_id": bid, "status": b["status"], "turn": b["turn"],
        "attacker": {"user_id":att["user_id"],"nickname":att["nickname"],
                     "hp":b["attacker_hp"],"max_hp":b["attacker_max_hp"]},
        "defender": {"user_id":dfn["user_id"],"nickname":dfn["nickname"],
                     "hp":b["defender_hp"],"max_hp":b["defender_max_hp"]},
        "log": _j.loads(b["log"] or "[]"),
        "is_attacker": uid == b["attacker_id"],
        "seconds_left": secs_left,
        "timeout": PVP_TURN_TIMEOUT,
    }

async def _pvp_do_action(bid, uid, action, part):
    b = await db.fetchone("SELECT * FROM pvp_battles WHERE battle_id=? AND status='active'", (bid,))
    if not b: return {"error":"Бой не активен"}
    if uid not in (b["attacker_id"], b["defender_id"]):
        return {"error":"Не участник"}
    if b["turn"] != uid:
        return {"error":"Не твой ход"}
    if part not in PVP_PARTS:
        return {"error":"Неверная часть"}
    import json as _j
    import random as _r
    log = _j.loads(b["log"] or "[]")
    key = f"pvp_turn_{bid}"
    is_attacker = uid == b["attacker_id"]

    if key not in _PENDING_MOVES:
        _PENDING_MOVES[key] = {"first": {"uid":uid, "action":action, "part":part}}
        next_turn = b["defender_id"] if is_attacker else b["attacker_id"]
        await db.execute("UPDATE pvp_battles SET turn=?, turn_started_at=? WHERE battle_id=?",
                         (next_turn, int(time.time()), bid))
        return {"waiting": True}

    first = _PENDING_MOVES.pop(key)["first"]
    second = {"uid":uid, "action":action, "part":part}
    attacker_move = first if first["uid"] == b["attacker_id"] else second
    defender_move = second if second["uid"] == b["defender_id"] else first
    p1 = await _player(b["attacker_id"])
    p2 = await _player(b["defender_id"])

    async def exchange(atk_move, def_move, atk_player):
        atk_uid = atk_move["uid"]
        is_atk = atk_uid == b["attacker_id"]
        b2 = await db.fetchone("SELECT * FROM pvp_battles WHERE battle_id=?", (bid,))
        def_hp_col = "defender_hp" if is_atk else "attacker_hp"
        atk_damage = b2["attacker_damage"] if is_atk else b2["defender_damage"]
        def_hp = b2[def_hp_col]
        if atk_move["action"] == "attack":
            if def_move["action"] == "defend" and def_move["part"] == atk_move["part"]:
                return {"type":"block","attacker":atk_player["nickname"],
                        "part":PVP_PARTS_NAMES[atk_move["part"]]}, def_hp
            dmg = max(1, atk_damage + _r.randint(-3, 3))
            new_hp = max(0, def_hp - dmg)
            await db.execute(f"UPDATE pvp_battles SET {def_hp_col}=? WHERE battle_id=?", (new_hp, bid))
            return {"type":"hit","attacker":atk_player["nickname"],
                    "part":PVP_PARTS_NAMES[atk_move["part"]],
                    "damage":dmg,"target_hp":new_hp}, new_hp
        return {"type":"defend","player":atk_player["nickname"],
                "part":PVP_PARTS_NAMES[atk_move["part"]]}, def_hp

    r1, _ = await exchange(attacker_move, defender_move, p1)
    log.append(r1)
    b2 = await db.fetchone("SELECT * FROM pvp_battles WHERE battle_id=?", (bid,))
    if b2["attacker_hp"] <= 0 or b2["defender_hp"] <= 0:
        winner_id = b2["attacker_id"] if b2["attacker_hp"] > 0 else b2["defender_id"]
        loser_id = b2["defender_id"] if winner_id == b2["attacker_id"] else b2["attacker_id"]
        await db.execute("UPDATE pvp_battles SET status='finished', log=? WHERE battle_id=?",
                         (_j.dumps(log), bid))
        return await _pvp_finish(winner_id, loser_id, bid)

    r2, _ = await exchange(defender_move, attacker_move, p2)
    log.append(r2)
    b2 = await db.fetchone("SELECT * FROM pvp_battles WHERE battle_id=?", (bid,))
    if b2["attacker_hp"] <= 0 or b2["defender_hp"] <= 0:
        winner_id = b2["attacker_id"] if b2["attacker_hp"] > 0 else b2["defender_id"]
        loser_id = b2["defender_id"] if winner_id == b2["attacker_id"] else b2["attacker_id"]
        await db.execute("UPDATE pvp_battles SET status='finished', log=? WHERE battle_id=?",
                         (_j.dumps(log), bid))
        return await _pvp_finish(winner_id, loser_id, bid)

    await db.execute("UPDATE pvp_battles SET log=?, turn=?, turn_started_at=? WHERE battle_id=?",
                     (_j.dumps(log), b["attacker_id"], int(time.time()), bid))
    return {"round_done": True}

async def api_pvp_state(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    bid = int(body.get("battle_id",0))
    b = await db.fetchone("SELECT * FROM pvp_battles WHERE battle_id=?", (bid,))
    if b and b["status"] == "active":
        now = int(time.time())
        turn_started = b.get("turn_started_at") or now
        if now - turn_started > PVP_TURN_TIMEOUT:
            await _pvp_do_action(bid, b["turn"], "defend", "torso")
            b = await db.fetchone("SELECT * FROM pvp_battles WHERE battle_id=?", (bid,))
            if b and b["status"] == "active":
                import json as _j
                log = _j.loads(b["log"] or "[]")
                log.append({"type":"timeout","player":"система","part":"Торс"})
                await db.execute("UPDATE pvp_battles SET log=?, turn_started_at=? WHERE battle_id=?",
                                 (_j.dumps(log), int(time.time()), bid))
    state = await _pvp_state_response(bid, uid)
    if not state:
        return web.json_response({"error":"Бой не найден"}, status=400)
    return web.json_response(state)

async def api_pvp_action(request):
    ud = await _user(request); uid = ud["id"]
    body = await request.json()
    bid = int(body.get("battle_id",0))
    action = body.get("action")
    part = body.get("part")
    result = await _pvp_do_action(bid, uid, action, part)
    if isinstance(result, dict) and "error" in result:
        return web.json_response({"error":result["error"]}, status=400)
    return result


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

async def api_gang_get(request):
    ud = await _user(request); uid = ud["id"]
    member = await db.fetchone("SELECT * FROM gang_members WHERE user_id=?", (uid,))
    if not member:
        gangs = await db.fetchall(
            "SELECT g.*, (SELECT COUNT(*) FROM gang_members WHERE gang_id=g.gang_id) as members_count "
            "FROM gangs g ORDER BY g.treasury DESC LIMIT 20")
        return web.json_response({"in_gang":False,"gangs":gangs})
    gang = await db.fetchone("SELECT * FROM gangs WHERE gang_id=?", (member["gang_id"],))
    members = await db.fetchall(
        "SELECT gm.user_id, gm.role, p.nickname, p.level FROM gang_members gm "
        "JOIN players p ON gm.user_id = p.user_id WHERE gm.gang_id=?", (gang["gang_id"],))
    territories = await db.fetchall("SELECT * FROM gang_territories")
    now = int(time.time())
    terr_status = []
    for t in GANG_TERRITORIES:
        row = next((x for x in territories if x["territory_id"] == t["id"]), None)
        info = dict(t)
        if row:
            info["gang_id"] = row.get("gang_id")
            info["capturing_gang_id"] = row.get("capturing_gang_id")
            info["capture_end"] = row.get("capture_end")
            info["capture_left"] = max(0, (row.get("capture_end") or 0) - now) if row.get("capture_end") else 0
        else:
            info["gang_id"] = None
            info["capturing_gang_id"] = None
            info["capture_end"] = None
            info["capture_left"] = 0
        terr_status.append(info)
    notifications = []
    for t in terr_status:
        if t["capture_left"] == 0 and t["capturing_gang_id"] and t["capture_end"]:
            capturing = t["capturing_gang_id"]
            was_mine = t["gang_id"] == gang["gang_id"]
            if capturing == gang["gang_id"]:
                notifications.append({"type":"captured","name":t["name"],"income":t["income"],"good":True})
            elif was_mine:
                notifications.append({"type":"lost","name":t["name"],"income":t["income"],"good":False})
            await db.execute(
                "UPDATE gang_territories SET gang_id=?, capturing_gang_id=NULL, capture_end=NULL "
                "WHERE territory_id=?", (capturing, t["id"]))
            t["gang_id"] = capturing
            t["capturing_gang_id"] = None
            t["capture_end"] = None
    return web.json_response({
        "in_gang":True, "gang":gang, "members":members, "my_role":member["role"],
        "is_leader_or_deputy": member["role"] in ("leader","deputy"),
        "territories":terr_status, "notifications":notifications,
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
    if p["balance"] < amount: return web.json_response({"error":"Не хватает"}, status=400)
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
    tid = int(body.get("territory_id",0))
    member = await db.fetchone("SELECT * FROM gang_members WHERE user_id=?", (uid,))
    if not member or member["role"] not in ("leader","deputy"):
        return web.json_response({"error":"Только лидер/зам"}, status=400)
    now = int(time.time())
    existing = await db.fetchone("SELECT * FROM gang_territories WHERE capturing_gang_id=?", (member["gang_id"],))
    if existing and (existing.get("capture_end") or 0) > now:
        return web.json_response({"error":"Уже захватываете территорию"}, status=400)
    row = await db.fetchone("SELECT * FROM gang_territories WHERE territory_id=?", (tid,))
    end = now + CAPTURE_HOURS * 3600
    if row:
        await db.execute("UPDATE gang_territories SET capturing_gang_id=?, capture_end=? WHERE territory_id=?",
                         (member["gang_id"], end, tid))
    else:
        await db.execute("INSERT INTO gang_territories (territory_id, capturing_gang_id, capture_end) VALUES (?,?,?)",
                         (tid, member["gang_id"], end))
    return web.json_response({"ok":True,"ends_at":end})


def setup_routes(app):
    R = app.router
    R.add_post("/api/me", api_me)
    R.add_post("/api/register", api_register)
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
    R.add_post("/api/collect_business", api_collect_business)
    R.add_post("/api/casino_play", api_casino_play)
    R.add_post("/api/daily", api_daily)
    R.add_post("/api/roulette", api_roulette)
    R.add_post("/api/crime", api_crime)
    R.add_post("/api/credit/take", api_credit_take)
    R.add_post("/api/credit/pay", api_credit_pay)
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
    R.add_post("/api/gang/create", api_gang_create)
    R.add_post("/api/gang/get", api_gang_get)
    R.add_post("/api/gang/join", api_gang_join)
    R.add_post("/api/gang/leave", api_gang_leave)
    R.add_post("/api/gang/deposit", api_gang_deposit)
    R.add_post("/api/gang/withdraw", api_gang_withdraw)
    R.add_post("/api/gang/capture", api_gang_capture)
    R.add_post("/api/chat/send", api_chat_send)
    R.add_post("/api/chat/get", api_chat_get)
    R.add_post("/api/cases/list", api_cases_list)
    R.add_post("/api/cases/open", api_cases_open)
    R.add_post("/api/pvp/challenge", api_pvp_challenge)
    R.add_post("/api/pvp/incoming", api_pvp_incoming)
    R.add_post("/api/pvp/respond", api_pvp_respond)
    R.add_post("/api/pvp/state", api_pvp_state)
    R.add_post("/api/pvp/action", api_pvp_action)
