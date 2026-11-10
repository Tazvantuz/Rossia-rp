# debug_log.py
"""Отладочные сообщения в ЛС админу (@tazvantuzz) через бота."""
import time
from database import db
from api_core import get_bot

ADMIN_USERNAME = "tazvantuzz"
_cached_admin_id = None


async def _get_admin_id():
    global _cached_admin_id
    if _cached_admin_id:
        return _cached_admin_id
    try:
        row = await db.fetchone(
            "SELECT user_id FROM players WHERE tg_username=? LIMIT 1",
            (ADMIN_USERNAME,))
        if row:
            _cached_admin_id = row["user_id"]
            return _cached_admin_id
    except Exception as e:
        print(f"🐞 [debug] _get_admin_id error: {e}")
    return None


async def notify_admin(text: str):
    """Отправить сообщение админу. Никогда не бросает исключений."""
    # 1. Всегда пишем в Railway logs
    print(f"🐞 [debug] {text}")

    # 2. Пытаемся отправить в ЛС
    try:
        bot = get_bot()
        if not bot:
            print("🐞 [debug] bot is None, skip send")
            return

        admin_id = await _get_admin_id()
        target = admin_id if admin_id else f"@{ADMIN_USERNAME}"

        msg = f"🐞 [{time.strftime('%H:%M:%S')}] {text}"
        if len(msg) > 4000:
            msg = msg[:4000] + "..."

        await bot.send_message(chat_id=target, text=msg)
    except Exception as e:
        # Не логируем повторно в ЛС, чтобы не зациклиться
        print(f"🐞 [debug] send failed: {e}")