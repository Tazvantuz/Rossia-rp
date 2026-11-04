"""REST API для РП Россия Mini App."""
import hmac, hashlib, json, random, time
from urllib.parse import parse_qsl
from aiohttp import web
from database import db
from game import (
    LOCATIONS, ITEMS, JOBS, BUSINESSES, CASINO_GAMES, ACHIEVEMENTS,
    DAILY_REWARDS, SLOTS, SLOT_NAMES, SLOT_CATEGORY, SLOT_BY_CATEGORY,
    CATEGORY_NAMES, CATEGORY_EMOJI, RARITIES, MAX_LEVEL, START_LOCATION,
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
    ach_new = await _check_achievements(uid, p)
    return web.json_response({"registered": True, "player": _player_json(p),
                              "new_achievements": ach_new})

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
    p = await _player(uid)
    levels = await _check_levelup(uid, p)
    p = await _player(uid)
    ach = await _check_achievements(uid, p)
    if "first_job" not in _json_ach(p):
        await _save_ach(uid, _json_ach(p) + ["first_job"])
        ach.append("first_job")
    return web.json_response({"player": _player_json(p), "earned": job["salary"],
                              "xp": job["xp"], "levels": levels,
                              "new_achievements": ach})

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
    p = await _player(uid)
    ach = await _check_achievements(uid, p)
    return web.json_response({"player": _player_json(p), "earned": total,
                              "new_achievements": ach})

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
    p = await _player(uid)
    return web.json_response({"player": _player_json(p), "reward": reward, "streak": streak})

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
    p = await _player(uid)
    return web.json_response({"player": _player_json(p), "prize": prize})

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
    amount = int(body.get("amount",0))
    if amount <= 0 or amount > 50000:
        return web.json_response({"error":"1-50000₽"}, status=400)
    p = await _player(uid)
    if p.get("credit_amount",0) > 0:
        return web.json_response({"error":"Уже есть кредит"}, status=400)
    await db.execute("UPDATE players SET balance=balance+?, credit_amount=? WHERE user_id=?",
                     (amount, int(amount*1.15), uid))
    p = await _player(uid)
    ach = await _check_achievements(uid, p)
    return web.json_response({"player": _player_json(p), "new_achievements": ach})

async def api_credit_pay(request):
    ud = await _user(request); uid = ud["id"]
    p = await _player(uid)
    debt = p.get("credit_amount",0)
    if debt <= 0:
        return web.json_response({"error":"Нет кредита"}, status=400)
    if p["balance"] < debt:
        return web.json_response({"error":f"Нужно {debt}₽"}, status=400)
    await db.execute("UPDATE players SET balance=balance-?, credit_amount=0 WHERE user_id=?",
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
    p = await _player(uid)
    return web.json_response({"player": _player_json(p), "rub": rub, "price": price})

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
    await _user(request)
    rows = await db.fetchall(
        "SELECT nickname, balance, level, businesses FROM players ORDER BY balance DESC LIMIT 20")
    result = []
    for i, r in enumerate(rows):
        result.append({
            "rank": i+1, "nickname": r["nickname"],
            "balance": r["balance"], "level": r["level"],
            "businesses_count": len(_json_biz(r)),
        })
    return web.json_response({"leaders": result})

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
