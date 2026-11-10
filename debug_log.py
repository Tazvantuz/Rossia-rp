# debug_log.py
"""Отладочные сообщения в ЛС админу (@tazvantuzz) через бота."""
import time
from database import db
from api_core import get_bot

ADMIN_USERNAME = "tazvantuzz"
_cached_admin_id = None
_debug_state = None  # кэш состояния (1 = вкл, 0 = выкл)


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


async def _get_debug_state():
    """Возвращает 1 (вкл) или 0 (выкл)."""
    global _debug_state
    if _debug_state is not None:
        return _debug_state
    try:
        row = await db.fetchone("SELECT value FROM system_stats WHERE key='debug_enabled'")
        if row is None:
            # По умолчанию выключено, чтобы не спамить при первом запуске,
            # но ты можешь включить командой /log. Если хочешь ВКЛ по умолчанию,
            # поменяй (0) на (1).
            await db.execute("INSERT INTO system_stats (key, value) VALUES ('debug_enabled', 0)")
            _debug_state = 0
        else:
            _debug_state = int(row["value"])
    except Exception as e:
        print(f"🐞 [debug] _get_debug_state error: {e}")
        _debug_state = 0
    return _debug_state


async def toggle_debug():
    """Переключает состояние. Возвращает новое состояние (bool)."""
    global _debug_state
    current = await _get_debug_state()
    new_state = 0 if current else 1
    try:
        await db.execute("UPDATE system_stats SET value=? WHERE key='debug_enabled'", (new_state,))
        _debug_state = new_state
    except Exception as e:
        print(f"🐞 [debug] toggle_debug error: {e}")
    return bool(new_state)


async def notify_admin(text: str):
    """Отправить сообщение админу. Никогда не бросает исключений."""
    # 1. Всегда пишем в Railway logs
    print(f"🐞 [debug] {text}")

    # 2. Если отладка выключена, не шлём в ЛС
    enabled = await _get_debug_state()
    if not enabled:
        return

    # 3. Пытаемся отправить в ЛС
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
        print(f"🐞 [debug] send failed: {e}")