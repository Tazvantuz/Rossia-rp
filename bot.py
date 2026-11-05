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
from game import BUSINESSES
import api

load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL","").rstrip("/")
PORT = int(os.getenv("PORT","8080"))

if not BOT_TOKEN: raise RuntimeError("BOT_TOKEN в .env")

WEB_DIR = os.path.join(os.path.dirname(__file__), "webapp")
router = Router()

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

# ═══════════════════════════════════════════════════════════════
#  БОТЫ-ИГРОКИ (фейковые NPC)
# ═══════════════════════════════════════════════════════════════

def _json_biz_for_bot(p):
    try:
        val = p.get("businesses")
        if not val: return []
        res = json.loads(val)
        return res if isinstance(res, list) else []
    except: return []

async def _seed_bots():
    """Создаёт 5 ботов при первом запуске. Идемпотентно."""
    existing = await db.fetchone("SELECT COUNT(*) as c FROM players WHERE is_bot=1")
    if existing and existing["c"] >= 5:
        return
    BOTS = [
        {"uid": 9900000001, "nickname": "Ксюха",  "balance": 1200, "level": 1, "xp": 30},
        {"uid": 9900000002, "nickname": "Денчик", "balance": 800,  "level": 1, "xp": 10},
        {"uid": 9900000003, "nickname": "Толик",  "balance": 1500, "level": 2, "xp": 50},
        {"uid": 9900000004, "nickname": "Света",  "balance": 600,  "level": 1, "xp": 0},
        {"uid": 9900000005, "nickname": "Санёк",  "balance": 2000, "level": 2, "xp": 80},
    ]
    created = 0
    for b in BOTS:
        existing_bot = await db.fetchone("SELECT 1 FROM players WHERE user_id=?", (b["uid"],))
        if existing_bot: continue
        await db.execute(
            "INSERT INTO players (user_id, nickname, balance, level, xp, location_id, is_bot) "
            "VALUES (?,?,?,?,?,0,1)",
            (b["uid"], b["nickname"], b["balance"], b["level"], b["xp"]))
        for iid in ["h_cig","b_alco","l_family"]:
            await db.execute(
                "INSERT INTO inventory (user_id,item_id,quantity) VALUES (?,?,1) "
                "ON CONFLICT(user_id,item_id) DO UPDATE SET quantity=quantity+1",
                (b["uid"], iid))
        created += 1
    if created > 0:
        print(f"🤖 Создано {created} ботов-игроков (фейковые NPC)")

async def _bot_simulator():
    """Симулирует активность 5 ботов.
    Днём (МСК 9-23) — заходят, качаются, копят, покупают бизнесы.
    Ночью — last_seen не обновляется → оффлайн.
    """
    # Темпы развития (разные у всех, чтобы не палились одинаковостью)
    TEMPO = {
        9900000001: 1.2,  # Ксюха — быстрая
        9900000002: 0.9,  # Денчик — ленивый
        9900000003: 1.0,  # Толик — средний
        9900000004: 0.8,  # Света — медленная
        9900000005: 1.3,  # Санёк — самый быстрый
    }
    BIZ_ORDER = ["shawarma", "drones", "pelmeni", "crypto_farm", "beauty",
                 "pawnshop", "restaurant", "bentley", "oil", "gazprom", "vtope"]

    while True:
        await asyncio.sleep(60)  # тик раз в минуту
        try:
            # МСК-время: ночь = не играем
            msk = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=3)
            hour = msk.hour
            if hour >= 23 or hour < 9:
                continue  # боты спят

            bots = await db.fetchall("SELECT * FROM players WHERE is_bot=1")
            now = int(time.time())

            for b in bots:
                uid = b["user_id"]

                # "Зашёл ли" бот в этот час — стабильный псевдосид
                # (одно и то же значение в течение часа, меняется при смене часа)
                rng_seed = (uid + hour * 7) % 10
                if rng_seed < 5:
                    continue  # ~50% шанс онлайн в этот час

                # Бот онлайн — обновляем last_seen
                await db.execute("UPDATE players SET last_seen=? WHERE user_id=?", (now, uid))

                tempo = TEMPO.get(uid, 1.0)

                # ═══ Зарплата раз в 5 минут ═══
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
                    await db.execute(
                        "UPDATE players SET balance=?, xp=?, level=?, last_work=? WHERE user_id=?",
                        (new_bal, new_xp, new_lvl, now, uid))
                    print(f"🤖 {b['nickname']}: +{salary}₽ +{xp_gain}xp (lvl {new_lvl})")
                    b["balance"] = new_bal
                    b["xp"] = new_xp
                    b["level"] = new_lvl

                # ═══ Сбор с бизнесов ═══
                biz = _json_biz_for_bot(b)
                collected = 0
                for business in biz:
                    info = BUSINESSES.get(business["id"])
                    if not info: continue
                    lvl = business.get("level", 1)
                    mult = 1.0
                    if lvl == 2: mult = 1.75
                    elif lvl >= 3: mult = 3.0
                    real_income = int(info["income"] * mult)
                    last_c = business.get("last_collect", now)
                    elapsed = max(0, min(86400, now - last_c))
                    earned = int(real_income * elapsed / 3600)
                    collected += earned
                    business["last_collect"] = now
                if collected > 0:
                    await db.execute(
                        "UPDATE players SET balance=balance+?, businesses=? WHERE user_id=?",
                        (collected, json.dumps(biz), uid))
                    b["balance"] += collected
                    print(f"🤖 {b['nickname']}: собрал {collected}₽ с бизнесов")

                # ═══ Покупка бизнеса, если накопил ×1.3 ═══
                owned_ids = {x["id"] for x in biz}
                for bid in BIZ_ORDER:
                    if bid in owned_ids: continue
                    info = BUSINESSES.get(bid)
                    if not info: continue
                    if b["balance"] >= info["price"] * 1.3:
                        biz.append({"id": bid, "last_collect": now})
                        await db.execute(
                            "UPDATE players SET balance=balance-?, businesses=? WHERE user_id=?",
                            (info["price"], json.dumps(biz), uid))
                        b["balance"] -= info["price"]
                        print(f"🤖 {b['nickname']}: купил {info['name']} за {info['price']}₽!")
                        break

                # ═══ Иногда казино (10% шанс) ═══
                if b["balance"] > 1000 and random.random() < 0.10:
                    bet = int(b["balance"] * 0.10)
                    win = random.choice([0, 0, 0, bet * 2])  # 75% проигрыш, 25% x2
                    net = win - bet
                    await db.execute("UPDATE players SET balance=balance+? WHERE user_id=?", (net, uid))
                    b["balance"] += net
                    if net > 0:
                        print(f"🤖 {b['nickname']}: выиграл в казино {net}₽")

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
    # ═══ СИД БОТОВ ═══
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
    # ═══ СИМУЛЯТОР БОТОВ ═══
    asyncio.create_task(_bot_simulator())
    logging.info("🤖 Bot simulator запущен (5 NPC)")
    try:
        await dp.start_polling(bot)
    finally:
        await runner.cleanup(); await db.close()

if __name__ == "__main__": asyncio.run(main())