import asyncio, logging, os
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
    text = (f"🇷🇺 <b>РП Россия</b>\n\n"
            f"Мир гопников, олигархов и шаурмы.\n\n"
            f"{greet}\n\n"
            f"💡 <i>Кнопка «🇷🇺 Играть» слева внизу — открывает игру в один тап.</i>")
    await message.answer(text, reply_markup=_kb())

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
    """Постоянная кнопка слева внизу (Menu Button) — открывает Mini App."""
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

async def main():
    logging.basicConfig(level=logging.INFO)
    await db.init()
    api.set_token(BOT_TOKEN)
    runner = web.AppRunner(make_app())
    await runner.setup()
    await web.TCPSite(runner, "localhost", PORT).start()
    logging.info(f"🌐 Web: http://0.0.0.0:{PORT}")
    bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dp = Dispatcher(); dp.include_router(router)
    me = await bot.me()
    logging.info(f"🤖 @{me.username}")
    logging.info(f"🎮 WebApp: {WEBAPP_URL}")
    await _set_menu_button(bot)
    try:
        await dp.start_polling(bot)
    finally:
        await runner.cleanup(); await db.close()

if __name__ == "__main__": asyncio.run(main())
