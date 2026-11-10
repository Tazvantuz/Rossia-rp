# api_donate.py
"""Донат через DonatePay (поллинг транзакций) + начисление валюты."""
import asyncio
import time
from aiohttp import web, ClientSession
from database import db
from api_core import _user, _player

DONATE_PACKAGES = {
    "pack_200k": {"amount": 200000,   "price_rub": 49,  "emoji": "💰", "name": "200 000 ₽"},
    "pack_500k": {"amount": 500000,   "price_rub": 99,  "emoji": "💎", "name": "500 000 ₽"},
    "pack_1m":   {"amount": 1000000,  "price_rub": 199, "emoji": "👑", "name": "1 000 000 ₽"},
    "pack_5m":   {"amount": 5000000,  "price_rub": 399, "emoji": "🚀", "name": "5 000 000 ₽"},
}

PRICE_TO_PACK = {
    49:  "pack_200k",
    99:  "pack_500k",
    199: "pack_1m",
    399: "pack_5m",
}

DONATE_PAGE_URL = "https://donatepay.ru/don/1542629"

DONATEPAY_API_KEY = None
def set_donatepay_key(k):
    global DONATEPAY_API_KEY
    DONATEPAY_API_KEY = k

if DONATEPAY_API_KEY:
    print("✅ DonatePay API key загружен")
else:
    print("⚠️ DONATEPAY_API_KEY не задан! Поллинг донатов работать не будет")


async def api_donate_packages(request):
    await _user(request)
    return web.json_response({
        "packages": [{"id": k, **v} for k, v in DONATE_PACKAGES.items()],
        "donate_url": DONATE_PAGE_URL,
    })


async def api_donate_create_invoice(request):
    await _user(request)
    return web.json_response({
        "error": "Оплата происходит на странице DonatePay. Открой ссылку."
    }, status=410)


async def _process_donation(transaction_id: str, user_id: int, amount_rub: int, pack_id: str):
    existing = await db.fetchone(
        "SELECT purchase_id FROM donate_purchases WHERE purchase_id=?",
        (transaction_id,),
    )
    if existing:
        print(f"🔁 DonatePay: транзакция {transaction_id} уже обработана — пропускаю")
        return False

    p = await _player(user_id)
    if not p:
        print(f"⚠️ DonatePay: игрок {user_id} не найден, но оплата прошла. "
              f"Транзакция {transaction_id} на {amount_rub}₽ — нужно начислить вручную!")
        try:
            await db.execute(
                "INSERT INTO donate_purchases (purchase_id, user_id, pack_id, amount_rub, amount_game) VALUES (?, ?, ?, ?, ?)",
                (transaction_id, user_id, pack_id, amount_rub, 0),
            )
        except Exception as e:
            print(f"⚠️ donate_purchases insert (missing player): {e}")
        return False

    pack = DONATE_PACKAGES.get(pack_id)
    if not pack:
        return False

    game_amount = pack["amount"]

    await db.execute(
        "UPDATE players SET balance = balance + ? WHERE user_id = ?",
        (game_amount, user_id),
    )

    try:
        await db.execute(
            "INSERT INTO donate_purchases (purchase_id, user_id, pack_id, amount_rub, amount_game) VALUES (?, ?, ?, ?, ?)",
            (transaction_id, user_id, pack_id, amount_rub, game_amount),
        )
    except Exception as e:
        print(f"⚠️ donate_purchases insert: {e}")

    print(f"✅ DonatePay: игрок {user_id} получил {game_amount}₽ за {amount_rub}₽ "
          f"(pack={pack_id}, txn={transaction_id})")
    return True


async def donatepay_poller():
    if not DONATEPAY_API_KEY:
        return

    API_URL = "https://donatepay.ru/api/v1/transactions"
    last_txn_id = None

    try:
        row = await db.fetchone(
            "SELECT purchase_id FROM donate_purchases ORDER BY created_at DESC LIMIT 1"
        )
        if row:
            last_txn_id = row["purchase_id"]
            print(f"📌 DonatePay поллер: стартовый last_txn_id = {last_txn_id}")
    except Exception:
        pass

    print("🔄 DonatePay поллер запущен (каждые 15 сек)")

    while True:
        await asyncio.sleep(15)
        try:
            headers = {"Authorization": f"Bearer {DONATEPAY_API_KEY}"}
            params = {"limit": 50, "order": "DESC", "type": "donation", "status": "success"}

            async with ClientSession() as session:
                async with session.get(API_URL, headers=headers, params=params) as resp:
                    if resp.status != 200:
                        continue
                    data = await resp.json()

            transactions = data.get("data", [])
            if not transactions:
                continue

            transactions.sort(key=lambda t: t.get("id", 0))

            for txn in transactions:
                txn_id = str(txn.get("id"))
                if not txn_id:
                    continue

                if last_txn_id and txn_id <= last_txn_id:
                    continue

                amount = txn.get("sum")
                if amount is None:
                    continue
                try:
                    amount_rub = int(round(float(amount)))
                except (ValueError, TypeError):
                    continue

                # Ищем ID и в сообщении, и в имени (на всякий случай)
                comment = str(txn.get("comment") or "").strip()
                name = str(txn.get("name") or "").strip()
                combined_text = f"{comment} {name}"
                
                user_id = None
                for part in combined_text.split():
                    part = part.strip(".,;:!?()[]{}")
                    if part.isdigit() and len(part) >= 5:
                        user_id = int(part)
                        break

                if user_id is None:
                    print(f"⚠️ DonatePay: в транзакции {txn_id} нет ID игрока. (name={name!r}, comment={comment!r})")
                    continue

                pack_id = PRICE_TO_PACK.get(amount_rub)
                if not pack_id:
                    print(f"⚠️ DonatePay: неизвестная сумма {amount_rub}₽ в транзакции {txn_id}")
                    continue

                await _process_donation(txn_id, user_id, amount_rub, pack_id)
                last_txn_id = txn_id

        except Exception as e:
            print(f"⚠️ DonatePay поллер ошибка: {e}")