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
    await _user(request)
    body = await request.json()
    pack_id = body.get("pack_id")

    if pack_id not in DONATE_PACKAGES:
        return web.json_response({"error": "Пакет не найден"}, status=400)

    # ⚠️ Платёжная система пока не подключена.
    # Никакие деньги НЕ начисляются. Просто возвращаем ошибку.
    return web.json_response({
        "error": "Оплата временно недоступна. Платёжная система ещё не подключена."
    }, status=503)