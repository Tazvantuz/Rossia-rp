# bot.py
import asyncio, logging, os, json, random, time, datetime
from aiohttp import web
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, Router, F
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import CommandStart, Command
from aiogram.types import (
    Message, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo,
    MenuButtonWebApp,
)
from database import db
from game import BUSINESSES, ITEMS, SLOT_BY_CATEGORY
from api_core import BOT_IDS, BOT_IDS_SET, bot_online_ids
import api

load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL","").rstrip("/")
PORT = int(os.getenv("PORT","8080"))

if not BOT_TOKEN: raise RuntimeError("BOT_TOKEN в .env")

WEB_DIR = os.path.join(os.path.dirname(__file__), "webapp")
router = Router()

BOTS = [
    {"uid": 9900000001, "nickname": "Ксюха",  "balance": 1200, "level": 1, "xp": 30, "tempo": 1.2},
    {"uid": 9900000002, "nickname": "Денчик", "balance": 800,  "level": 1, "xp": 10, "tempo": 0.9},
    {"uid": 9900000003, "nickname": "Толик",  "balance": 1500, "level": 2, "xp": 50, "tempo": 1.0},
    {"uid": 9900000004, "nickname": "Света",  "balance": 600,  "level": 1, "xp": 0,  "tempo": 0.8},
    {"uid": 9900000005, "nickname": "Санёк",  "balance": 2000, "level": 2, "xp": 80, "tempo": 1.3},
]

# Стартовая одежда
STARTER_OUTFITS = {
    9900000001: {"head_id": "h_cig", "body_id": "b_alco", "legs_id": "l_family"},
    9900000002: {"head_id": "h_cap", "body_id": "b_hoodie", "legs_id": "l_adidas", "right_hand_id": "rh_beer"},
    9900000003: {"head_id": "h_bandana", "body_id": "b_supreme", "legs_id": "l_lampasy", "left_hand_id": "lh_phone"},
    9900000004: {"head_id": "h_flower", "body_id": "b_aura", "legs_id": "l_shorts", "left_hand_id": "lh_cola"},
    9900000005: {"head_id": "h_balaclava", "body_id": "b_nf", "legs_id": "l_camo", "right_hand_id": "rh_bat"},
}

def _kb():
    if WEBAPP_URL:
        return InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🇷🇺 Играть", web_app=WebAppInfo(url=f"{WEBAPP_URL}/"))]])
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="⚠️ URL не задан", callback_data="noop")]])

@router.message(CommandStart())
async def cmd_start(message: Message):
    p = await db.fetchone("SELECT nickname FROM players WHERE user_id=?", (message.from_user.id,))
    greet = f"👋 С возвращением, <b>{p['nickname']}</b>!" if p else "🌟 Начни свой путь бомжа!"
    args = message.text.split()
    param = args[1] if len(args) > 1 else None
    url = f"{WEBAPP_URL}/"
    if param and param.startswith("ref_") and WEBAPP_URL:
        url += f"?ref={param[4:]}"
        if not p:
            greet = "🎁 <b>Ты пришёл по приглашению!</b>\n" + greet
    text = (f"🇷🇺 <b>РП Россия</b>\n\n"
            f"Мир гопников, олигархов и шаурмы.\n\n"
            f"{greet}\n\n"
            f"💡 <i>Кнопка «🇷🇺 Играть» слева внизу — открывает игру в один тап.</i>")
    if WEBAPP_URL:
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🇷🇺 Играть", web_app=WebAppInfo(url=url))]])
    else:
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="⚠️ URL не задан", callback_data="noop")]])
    await message.answer(text, reply_markup=kb)

@router.message(Command("menu"))
async def cmd_menu(message: Message):
    await message.answer("🇷🇺 Открыть игру:", reply_markup=_kb())

@router.callback_query(F.data == "noop")
async def noop(cb): await cb.answer()

async def _serve_index(request):
    return web.FileResponse(os.path.join(WEB_DIR, "index.html"))

def make_app():
    app = web.Application(client_max_size=1*1024*1024)
    api.setup_routes(app)
    app.router.add_get("/", _serve_index)
    app.router.add_static("/", WEB_DIR, show_index=False)
    return app

async def _set_menu_button(bot: Bot):
    if not WEBAPP_URL:
        logging.warning("WEBAPP_URL не задан — menu button не установлена")
        return
    try:
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(
                text="🇷🇺 Играть",
                web_app=WebAppInfo(url=f"{WEBAPP_URL}/"),
            )
        )
        logging.info("🔘 Menu Button установлена (кнопка слева внизу)")
    except Exception as e:
        logging.warning(f"Menu Button error: {e}")

async def _capture_processor():
    while True:
        await asyncio.sleep(60)
        try:
            await api._process_territories()
        except Exception as e:
            logging.warning(f"capture processor: {e}")

def _json_biz_for_bot(p):
    try:
        val = p.get("businesses")
        if not val: return []
        res = json.loads(val)
        return res if isinstance(res, list) else []
    except: return []

async def _add_inv_raw(uid, iid):
    try:
        await db.execute(
            "INSERT INTO inventory (user_id, item_id, quantity) VALUES (?,?,1) "
            "ON CONFLICT(user_id,item_id) DO UPDATE SET quantity=quantity+1",
            (uid, iid))
    except: pass

async def _ensure_bot_has_outfit(uid, nickname):
    """Гарантированно назначает стартовую одежду, если слот пуст."""
    p = await db.fetchone("SELECT * FROM players WHERE user_id=?", (uid,))
    if not p: return
    starter = STARTER_OUTFITS.get(uid, {})
    for slot_field in ("head_id", "body_id", "legs_id", "right_hand_id", "left_hand_id"):
        cur = p.get(slot_field)
        # Если пусто или предмет не существует в ITEMS — назначаем
        if not cur or cur not in ITEMS:
            iid = starter.get(slot_field)
            if iid and iid in ITEMS:
                try:
                    await db.execute(f"UPDATE players SET {slot_field}=? WHERE user_id=?", (iid, uid))
                except: pass

async def _bot_update_outfit(uid, nickname):
    """Бот надевает лучшее из инвентаря + с шансом покупает новое."""
    p = await db.fetchone("SELECT * FROM players WHERE user_id=?", (uid,))
    if not p: return
    balance = p["balance"]

    # 1. Шанс купить новую вещь (10%)
    if random.random() < 0.10:
        inv_now = await db.fetchall(
            "SELECT item_id FROM inventory WHERE user_id=? AND quantity>0", (uid,))
        owned = {row["item_id"] for row in inv_now}
        candidates = []
        for iid, it in ITEMS.items():
            if it.get("is_gang_only"): continue
            if iid.startswith(("h_case_", "b_case_", "l_case_", "rh_case_", "lh_case_",
                              "h_gang_", "b_gang_", "l_gang_", "rh_gang_", "lh_gang_")):
                continue
            price = it.get("price", 0)
            if price <= 0: continue
            if iid in owned: continue
            if price > balance * 0.4: continue
            candidates.append((iid, it))
        if candidates:
            weights = []
            for iid, it in candidates:
                r = it.get("rarity", "common")
                w = {"common": 6, "uncommon": 4, "rare": 2, "epic": 1, "legendary": 1}.get(r, 1)
                weights.append(w)
            chosen = random.choices(candidates, weights=weights, k=1)[0]
            iid, it = chosen
            try:
                await db.execute("UPDATE players SET balance=balance-? WHERE user_id=?", (it["price"], uid))
                await _add_inv_raw(uid, iid)
                balance -= it["price"]
                print(f"🛍 {nickname} купил {it['name']} за {it['price']}₽")
            except Exception as e:
                print(f"⚠️ покупка {nickname}: {e}")

    # 2. Экипировка лучшего
    inv = await db.fetchall(
        "SELECT item_id, quantity FROM inventory WHERE user_id=? AND quantity>0", (uid,))
    best_by_slot = {}
    for row in inv:
        iid = row["item_id"]
        it = ITEMS.get(iid)
        if not it or it.get("is_gang_only"): continue
        slot_field = SLOT_BY_CATEGORY.get(it.get("slot"))
        if not slot_field: continue
        score = it.get("hp", 0) + it.get("damage", 0) * 2
        if slot_field not in best_by_slot or score > best_by_slot[slot_field][1]:
            best_by_slot[slot_field] = (iid, score)

    p2 = await db.fetchone("SELECT * FROM players WHERE user_id=?", (uid,))
    if not p2: return
    for slot_field, (best_iid, best_score) in best_by_slot.items():
        cur_iid = p2.get(slot_field)
        cur_score = 0
        if cur_iid:
            cur_it = ITEMS.get(cur_iid)
            if cur_it:
                cur_score = cur_it.get("hp", 0) + cur_it.get("damage", 0) * 2
        if best_score > cur_score:
            try:
                await db.execute("UPDATE inventory SET quantity=quantity-1 WHERE user_id=? AND item_id=?", (uid, best_iid))
                await db.execute("DELETE FROM inventory WHERE user_id=? AND item_id=? AND quantity<=0", (uid, best_iid))
                if cur_iid:
                    await _add_inv_raw(uid, cur_iid)
                await db.execute(f"UPDATE players SET {slot_field}=? WHERE user_id=?", (best_iid, uid))
                old_name = ITEMS[cur_iid]["name"] if cur_iid else "ничего"
                print(f"👕 {nickname} надел {ITEMS[best_iid]['name']} (было: {old_name})")
            except Exception as e:
                print(f"⚠️ экипировка {nickname}: {e}")

# ═══════════════════════════════════════════════════════════════
#  СИД БОТОВ
# ═══════════════════════════════════════════════════════════════
async def _seed_bots():
    try:
        now = int(time.time())
        online = bot_online_ids(now)
        created = 0
        for b in BOTS:
            uid = b["uid"]
            existing = await db.fetchone("SELECT user_id FROM players WHERE user_id=?", (uid,))
            if existing:
                try:
                    await db.execute("UPDATE players SET is_bot=1 WHERE user_id=?", (uid,))
                except: pass
                # Одеваем существующего, если раздет
                await _ensure_bot_has_outfit(uid, b["nickname"])
                # Принудительно ставим last_seen для оффлайн-ботов в старьё,
                # чтобы старая логика (если где-то осталась) не держала их онлайн
                if uid not in online:
                    try:
                        await db.execute("UPDATE players SET last_seen=0 WHERE user_id=?", (uid,))
                    except: pass
                continue
            await db.execute(
                "INSERT INTO players (user_id, nickname, balance, level, xp, location_id, is_bot) "
                "VALUES (?,?,?,?,?,0,1)",
                (uid, b["nickname"], b["balance"], b["level"], b["xp"]))
            last_seen_val = now if uid in online else 0
            try:
                await db.execute("UPDATE players SET last_seen=? WHERE user_id=?", (last_seen_val, uid))
            except: pass
            outfit = STARTER_OUTFITS.get(uid, {})
            for slot_field, iid in outfit.items():
                try:
                    await db.execute(f"UPDATE players SET {slot_field}=? WHERE user_id=?", (iid, uid))
                except: pass
            for iid in ["h_cig","b_alco","l_family"]:
                await _add_inv_raw(uid, iid)
            created += 1
        if created > 0:
            print(f"🤖 Создано {created} ботов (со стартовой одеждой)")
        else:
            print(f"🤖 Существующие боты проверены и одеты")
    except Exception as e:
        print(f"⚠️ seed bots: {e}")

# ═══════════════════════════════════════════════════════════════
#  СИМУЛЯТОР
# ═══════════════════════════════════════════════════════════════
async def _bot_simulator():
    BIZ_ORDER = ["shawarma", "drones", "pelmeni", "crypto_farm", "beauty",
                 "pawnshop", "restaurant", "bentley", "oil", "gazprom", "vtope"]
    TEMPO = {b["uid"]: b["tempo"] for b in BOTS}

    while True:
        await asyncio.sleep(60)
        try:
            now = int(time.time())
            online_ids = bot_online_ids(now)

            # ═══ Синхронизация статусов: онлайн — now, оффлайн — 0 ═══
            for uid in BOT_IDS:
                try:
                    if uid in online_ids:
                        await db.execute("UPDATE players SET last_seen=? WHERE user_id=?", (now, uid))
                    else:
                        await db.execute("UPDATE players SET last_seen=0 WHERE user_id=?", (uid,))
                except: pass

            # ═══ Онлайн-боты: действия ═══
            for uid in online_ids:
                b = await db.fetchone("SELECT * FROM players WHERE user_id=?", (uid,))
                if not b: continue
                tempo = TEMPO.get(uid, 1.0)

                last_work = b.get("last_work", 0) or 0
                if now - last_work >= 300:
                    salary = int((100 + b["level"] * 60) * tempo)
                    xp_gain = int((5 + b["level"] * 2) * tempo)
                    new_bal = b["balance"] + salary
                    new_xp = b["xp"] + xp_gain
                    new_lvl = b["level"]
                    while new_lvl < 100:
                        need = 100 + (new_lvl - 1) * 50
                        if new_xp < need: break
                        new_xp -= need
                        new_lvl += 1
                    try:
                        await db.execute(
                            "UPDATE players SET balance=?, xp=?, level=?, last_work=? WHERE user_id=?",
                            (new_bal, new_xp, new_lvl, now, uid))
                    except: pass
                    b["balance"] = new_bal
                    b["xp"] = new_xp
                    b["level"] = new_lvl

                biz = _json_biz_for_bot(b)
                collected = 0
                for business in biz:
                    info = BUSINESSES.get(business["id"])
                    if not info: continue
                    lvl = business.get("level", 1)
                    mult = 1.0 if lvl == 1 else (1.75 if lvl == 2 else 3.0)
                    real_income = int(info["income"] * mult)
                    last_c = business.get("last_collect", now)
                    elapsed = max(0, min(86400, now - last_c))
                    collected += int(real_income * elapsed / 3600)
                    business["last_collect"] = now
                if collected > 0:
                    try:
                        await db.execute(
                            "UPDATE players SET balance=balance+?, businesses=? WHERE user_id=?",
                            (collected, json.dumps(biz), uid))
                    except: pass
                    b["balance"] += collected

                owned_ids = {x["id"] for x in biz}
                for bid in BIZ_ORDER:
                    if bid in owned_ids: continue
                    info = BUSINESSES.get(bid)
                    if not info: continue
                    if b["balance"] >= info["price"] * 1.3:
                        biz.append({"id": bid, "last_collect": now})
                        try:
                            await db.execute(
                                "UPDATE players SET balance=balance-?, businesses=? WHERE user_id=?",
                                (info["price"], json.dumps(biz), uid))
                        except: pass
                        b["balance"] -= info["price"]
                        break

                if b["balance"] > 1000 and random.random() < 0.10:
                    bet = int(b["balance"] * 0.10)
                    win = random.choice([0, 0, 0, bet * 2])
                    net = win - bet
                    try:
                        await db.execute("UPDATE players SET balance=balance+? WHERE user_id=?", (net, uid))
                    except: pass

                await _bot_update_outfit(uid, b["nickname"])

            # ═══ Оффлайн-боты: раз в 5 минут переодеваем, чтобы при заходе была свежая одежда ═══
            for uid in (BOT_IDS_SET - online_ids):
                if random.random() < 0.3:
                    b = await db.fetchone("SELECT nickname FROM players WHERE user_id=?", (uid,))
                    if b:
                        await _bot_update_outfit(uid, b["nickname"])

        except Exception as e:
            print(f"⚠️ bot_simulator: {e}")

# ═══════════════════════════════════════════════════════════════

async def main():
    logging.basicConfig(level=logging.INFO)
    await db.init()
    api.set_token(BOT_TOKEN)
    try:
        await api.migrate_crypto_v1()
    except Exception as e:
        logging.warning(f"crypto migration: {e}")
    try:
        await _seed_bots()
    except Exception as e:
        logging.warning(f"seed bots: {e}")

    runner = web.AppRunner(make_app())
    await runner.setup()
    await web.TCPSite(runner, "0.0.0.0", PORT).start()
    logging.info(f"🌐 Web: http://0.0.0.0:{PORT}")
    bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dp = Dispatcher(); dp.include_router(router)
    me = await bot.me()
    logging.info(f"🤖 @{me.username}")
    logging.info(f"🎮 WebApp: {WEBAPP_URL}")
    await _set_menu_button(bot)
    asyncio.create_task(_capture_processor())
    logging.info("⚔️ Background capture processor запущен")
    asyncio.create_task(_bot_simulator())
    logging.info("🤖 Bot simulator запущен (3 онлайн / 2 оффлайн, ротация 15мин, одеваются)")
    try:
        await dp.start_polling(bot)
    finally:
        await runner.cleanup(); await db.close()

if __name__ == "__main__": asyncio.run(main())