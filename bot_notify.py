# bot_notify.py
"""Отправка уведомлений игрокам через Telegram-бота (не в Mini App)."""
import os
import time
from database import db
from api_core import get_bot

try:
    from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
    HAS_AIOGRAM = True
except Exception:
    HAS_AIOGRAM = False

WEBAPP_URL = os.getenv("WEBAPP_URL", "").rstrip("/")

# Кулдаун для уведомлений о ЛС: не чаще раза в 5 минут на диалог
_pm_last_sent = {}
PM_NOTIFY_COOLDOWN = 300
# Слать уведомление о ЛС только если получатель offline > 60 сек
PM_OFFLINE_THRESHOLD = 60


def _game_kb():
    if not WEBAPP_URL or not HAS_AIOGRAM:
        return None
    try:
        return InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(
                text="🇷🇺 Открыть игру",
                web_app=WebAppInfo(url=f"{WEBAPP_URL}/?t={int(time.time())}")
            )]
        ])
    except Exception:
        return None


async def _notify_enabled(user_id):
    try:
        row = await db.fetchone("SELECT tg_notify_enabled FROM players WHERE user_id=?", (user_id,))
        if not row:
            return False
        return bool(row.get("tg_notify_enabled", 1))
    except Exception:
        return True


async def _send(user_id, text, kb=True):
    bot = get_bot()
    if not bot:
        return False
    try:
        kwargs = {"chat_id": user_id, "text": text, "parse_mode": "HTML"}
        if kb:
            markup = _game_kb()
            if markup:
                kwargs["reply_markup"] = markup
        await bot.send_message(**kwargs)
        return True
    except Exception as e:
        print(f"⚠️ bot_notify: send to {user_id} failed: {e}")
        return False


async def notify_trade(to_user_id, from_nickname, trade_id):
    if not await _notify_enabled(to_user_id):
        return
    text = (
        f"🤝 <b>Новый трейд</b>\n\n"
        f"От: <b>{from_nickname}</b>\n"
        f"Открой игру, чтобы посмотреть предложение."
    )
    await _send(to_user_id, text)


async def notify_pm(to_user_id, from_id, from_nickname, message_preview):
    if not await _notify_enabled(to_user_id):
        return
    now = int(time.time())

    # Проверяем, что получатель offline > 60 сек (иначе он и так видит сообщения)
    try:
        recipient = await db.fetchone("SELECT last_seen FROM players WHERE user_id=?", (to_user_id,))
        if recipient and (recipient.get("last_seen") or 0) > now - PM_OFFLINE_THRESHOLD:
            return
    except Exception:
        pass

    # Кулдаун на диалог
    key = (to_user_id, from_id)
    last = _pm_last_sent.get(key, 0)
    if now - last < PM_NOTIFY_COOLDOWN:
        return
    _pm_last_sent[key] = now

    raw = message_preview or ""
    preview = raw[:150] + ("…" if len(raw) > 150 else "")

    text = (
        f"✉️ <b>Новое сообщение</b>\n\n"
        f"От: <b>{from_nickname}</b>\n"
        f"<i>{preview}</i>"
    )
    await _send(to_user_id, text)


async def notify_friend(target_id, from_nickname):
    if not await _notify_enabled(target_id):
        return
    text = (
        f"👥 <b>Запрос в друзья</b>\n\n"
        f"<b>{from_nickname}</b> хочет добавить тебя в друзья."
    )
    await _send(target_id, text)


async def notify_gang_invite(target_id, gang_name, gang_emoji, from_nickname):
    if not await _notify_enabled(target_id):
        return
    text = (
        f"🚬 <b>Приглашение в банду</b>\n\n"
        f"{gang_emoji} <b>{gang_name}</b>\n"
        f"Приглашает: {from_nickname}"
    )
    await _send(target_id, text)


async def notify_gang_attack(defender_gang_id, attacker_gang_name, territory_name):
    """Оповещает всех членов банды-жертвы о захвате их территории."""
    try:
        members = await db.fetchall(
            "SELECT user_id FROM gang_members WHERE gang_id=?", (defender_gang_id,))
    except Exception:
        return
    text = (
        f"⚠️ <b>Атака на вашу территорию!</b>\n\n"
        f"Банда <b>{attacker_gang_name}</b> начала захват: <b>{territory_name}</b>\n"
        f"Защити её, пока не поздно!"
    )
    for m in members:
        if await _notify_enabled(m["user_id"]):
            await _send(m["user_id"], text)


async def notify_gang_contested(gang_id, rival_gang_name, territory_name):
    """Оповещает членов банды-инициатора, что на их захват пришёл конкурент."""
    try:
        members = await db.fetchall(
            "SELECT user_id FROM gang_members WHERE gang_id=?", (gang_id,))
    except Exception:
        return
    text = (
        f"⚔️ <b>Конкурент на захват</b>\n\n"
        f"Банда <b>{rival_gang_name}</b> тоже хочет захватить <b>{territory_name}</b>.\n"
        f"Скоро битва — готовься!"
    )
    for m in members:
        if await _notify_enabled(m["user_id"]):
            await _send(m["user_id"], text)