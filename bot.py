# bot.py
import asyncio, logging, os, time
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
import api
import debug_log

load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL", "").rstrip("/")
PORT = int(os.getenv("PORT", "8080"))

if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN в .env")

WEB_DIR = os.path.join(os.path.dirname(__file__), "webapp")
router = Router()

ADMIN_USERNAME = "tazvantuzz"


def _kb():
    if WEBAPP_URL:
        url = f"{WEBAPP_URL}/?t={int(time.time())}"
        return InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🇷🇺 Играть", web_app=WebAppInfo(url=url))]])
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="⚠️ URL не задан", callback_data="noop")]])


@router.message(CommandStart())
async def cmd_start(message: Message):
    p = await db.fetchone("SELECT nickname FROM players WHERE user_id=?", (message.from_user.id,))
    greet = f"👋 С возвращением, <b>{p['nickname']}</b>!" if p else "🌟 Начни свой путь бомжа!"
    args = message.text.split()
    param = args[1] if len(args) > 1 else None

    url = f"{WEBAPP_URL}/?t={int(time.time())}"
    if param and param.startswith("ref_") and WEBAPP_URL:
        url += f"&ref={param[4:]}"
        if not p:
            greet = "🎁 <b>Ты пришёл по приглашению!</b>\n" + greet
    text = (f"🇷🇺 <b>РП Россия</b>\n\n"
            f"Мир гопников, олигархов и шаурмы.\n\n"
            f"{greet}\n\n"
            f"💡 <i>Кнопка «🇷🇺 Играть» слева внизу — открывает игру в один тап.</i>\n"
            f"🔔 Уведомления: /notify")
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


@router.message(Command("log"))
async def cmd_log(message: Message):
    if message.from_user.username != ADMIN_USERNAME:
        await message.answer("⛔ У тебя нет доступа к этой команде.")
        return
    new_state = await debug_log.toggle_debug()
    status_text = "🟢 ВКЛЮЧЕНА" if new_state else "🔴 ВЫКЛЮЧЕНА"
    await message.answer(f"🐞 Отладка теперь: <b>{status_text}</b>")


@router.message(Command("notify"))
async def cmd_notify(message: Message):
    """Вкл/выкл уведомления от бота о трейдах, ЛС, друзьях, банде, захватах."""
    uid = message.from_user.id
    p = await db.fetchone("SELECT tg_notify_enabled FROM players WHERE user_id=?", (uid,))
    if not p:
        await message.answer("⚠️ Сначала зарегистрируйся в игре.")
        return
    current = p.get("tg_notify_enabled", 1)
    new_state = 0 if current else 1
    await db.execute("UPDATE players SET tg_notify_enabled=? WHERE user_id=?", (new_state, uid))
    if new_state:
        await message.answer(
            "🔔 <b>Уведомления включены</b>\n\n"
            "Буду присылать сюда о:\n"
            "• 🤝 трейдах\n"
            "• ✉️ личных сообщениях (если ты offline > 1 мин)\n"
            "• 👥 запросах в друзья\n"
            "• 🚬 приглашениях в банду\n"
            "• ⚔️ атаках на территории твоей банды"
        )
    else:
        await message.answer(
            "🔕 <b>Уведомления выключены</b>\n\n"
            "Больше не буду слать сюда. Включить снова: /notify"
        )


@router.callback_query(F.data == "noop")
async def noop(cb):
    await cb.answer()


async def _serve_index(request):
    resp = web.FileResponse(os.path.join(WEB_DIR, "index.html"))
    resp.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    resp.headers["Pragma"] = "no-cache"
    resp.headers["Expires"] = "0"
    return resp


def make_app():
    app = web.Application(client_max_size=1 * 1024 * 1024)
    api.setup_routes(app)
    app.router.add_get("/", _serve_index)
    app.router.add_static("/", WEB_DIR, show_index=False)
    return app


async def _set_menu_button(bot: Bot):
    if not WEBAPP_URL:
        logging.warning("WEBAPP_URL не задан — menu button не установлена")
        return
    try:
        url = f"{WEBAPP_URL}/?t={int(time.time())}"
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(
                text="🇷🇺 Играть",
                web_app=WebAppInfo(url=url),
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


async def _map_processor():
    while True:
        await asyncio.sleep(3)
        try:
            await api.process_moving()
        except Exception as e:
            logging.warning(f"map moving: {e}")
        try:
            await api.process_house_rentals()
        except Exception as e:
            logging.warning(f"house rentals: {e}")


async def main():
    logging.basicConfig(level=logging.INFO)
    await db.init()
    api.set_token(BOT_TOKEN)
    try:
        await api.migrate_crypto_v1()
    except Exception as e:
        logging.warning(f"crypto migration: {e}")

    runner = web.AppRunner(make_app())
    await runner.setup()
    await web.TCPSite(runner, "0.0.0.0", PORT).start()
    logging.info(f"🌐 Web: http://0.0.0.0:{PORT}")

    bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    api.set_bot(bot)
    dp = Dispatcher()
    dp.include_router(router)
    me = await bot.me()
    logging.info(f"🤖 @{me.username}")
    logging.info(f"🎮 WebApp: {WEBAPP_URL}")
    await _set_menu_button(bot)

    asyncio.create_task(_capture_processor())
    logging.info("⚔️ Background capture processor запущен")
    asyncio.create_task(_map_processor())
    logging.info("🗺 Background map processor запущен")

    try:
        await dp.start_polling(bot)
    finally:
        await runner.cleanup()
        await db.close()


if __name__ == "__main__":
    asyncio.run(main())