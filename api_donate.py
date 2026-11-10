# api_donate.py
from aiohttp import web
from database import db
from api_core import _user, _player

DONATE_PACKAGES = {
    "pack_200k": {"amount": 200000, "price_rub": 49, "emoji": "💰", "name": "200 000 ₽"},
    "pack_500k": {"amount": 500000, "price_rub": 99, "emoji": "💎", "name": "500 000 ₽"},
    "pack_1m": {"amount": 1000000, "price_rub": 199, "emoji": "👑", "name": "1 000 000 ₽"},
    "pack_5m": {"amount": 5000000, "price_rub": 399, "emoji": "🚀", "name": "5 000 000 ₽"},
}

async def api_donate_packages(request):
    await _user(request)
    return web.json_response({"packages": [{"id": k, **v} for k, v in DONATE_PACKAGES.items()]})

async def api_donate_create_invoice(request):
    ud = await _user(request)
    uid = ud["id"]
    body = await request.json()
    pack_id = body.get("pack_id")
    
    if pack_id not in DONATE_PACKAGES:
        return web.json_response({"error": "Пакет не найден"}, status=400)
    
    pack = DONATE_PACKAGES[pack_id]
    
    # ⚠️ ЗАГЛУШКА: Здесь будет создание реального инвойса через выбранную платежную систему.
    # Пока просто начисляем валюту для теста.
    # В реальности здесь нужно вернуть ссылку на оплату (invoice_url) или счёт.
    
    await db.execute("UPDATE players SET balance = balance + ? WHERE user_id = ?", (pack["amount"], uid))
    
    print(f"🎁 [DONATE STUB] Игрок {uid} 'купил' пакет {pack_id} за {pack['price_rub']}₽ и получил {pack['amount']}₽")
    
    return web.json_response({
        "ok": True,
        "message": f"Тестовое начисление {pack['name']} прошло успешно!",
        "is_stub": True  # Флаг для фронтенда
    })