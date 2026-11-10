# api_map.py
"""Карта: города/улицы/дома, аренда домов (макс 1 на игрока), перемещение с задержкой."""
import random
import time
from aiohttp import web
from database import db
from game import (
    CITIES, HOUSES, MOVE_DURATION_BETWEEN_CITIES, MOVE_DURATION_BETWEEN_STREETS,
    HOUSE_RENT_HOURS, PLAYER_ACTIVE_LAST_SEEN, get_city, get_street, get_house,
    get_outfit,
)
from api_core import _user, _player, _player_json

_map_migrated = False


async def _ensure_map_columns():
    global _map_migrated
    if _map_migrated:
        return
    for col_def in [
        "city_id INTEGER DEFAULT 0",
        "street_id INTEGER DEFAULT 0",
        "pos_x REAL DEFAULT 0",
        "pos_y REAL DEFAULT 0",
        "moving_until INTEGER DEFAULT 0",
        "moving_to_city INTEGER DEFAULT 0",
        "moving_to_street INTEGER DEFAULT 0",
        "inside_house_id INTEGER DEFAULT 0",
    ]:
        try:
            await db.execute(f"ALTER TABLE players ADD COLUMN {col_def}")
        except Exception:
            pass
    try:
        await db.execute(
            "CREATE TABLE IF NOT EXISTS house_rentals ("
            " house_id INTEGER PRIMARY KEY,"
            " user_id INTEGER NOT NULL,"
            " expires_at INTEGER NOT NULL,"
            " started_at INTEGER NOT NULL DEFAULT 0,"
            " is_open INTEGER DEFAULT 0)"
        )
        try:
            await db.execute("ALTER TABLE house_rentals ADD COLUMN is_open INTEGER DEFAULT 0")
        except Exception:
            pass
    except Exception:
        pass
    _map_migrated = True


def _random_pos():
    x = round(random.uniform(60, 540), 1)
    y = round(random.uniform(270, 370), 1)
    return x, y


async def _process_moving(uid=None):
    now = int(time.time())
    if uid is not None:
        rows = await db.fetchall(
            "SELECT user_id, moving_to_city, moving_to_street FROM players "
            "WHERE user_id=? AND moving_until>0 AND moving_until<=?", (uid, now))
    else:
        rows = await db.fetchall(
            "SELECT user_id, moving_to_city, moving_to_street FROM players "
            "WHERE moving_until>0 AND moving_until<=?", (now,))
    for r in rows:
        x, y = _random_pos()
        await db.execute(
            "UPDATE players SET city_id=?, street_id=?, pos_x=?, pos_y=?, "
            "moving_until=0, moving_to_city=0, moving_to_street=0, inside_house_id=0 WHERE user_id=?",
            (r["moving_to_city"], r["moving_to_street"], x, y, r["user_id"]))


async def _process_house_rentals():
    now = int(time.time())
    try:
        await db.execute("DELETE FROM house_rentals WHERE expires_at<=?", (now,))
    except Exception as e:
        print(f"⚠️ _process_house_rentals: {e}")


async def _get_my_active_house(uid, now):
    row = await db.fetchone(
        "SELECT * FROM house_rentals WHERE user_id=? AND expires_at>?", (uid, now))
    if not row:
        return None
    h = get_house(row["house_id"])
    if not h:
        return None
    out = dict(h)
    out["expires_at"] = row["expires_at"]
    out["started_at"] = row["started_at"]
    out["seconds_left"] = max(0, row["expires_at"] - now)
    out["is_open"] = bool(row.get("is_open", 0))
    return out


async def api_map_get(request):
    await _ensure_map_columns()
    ud = await _user(request)
    uid = ud["id"]
    await _process_moving(uid)
    await _process_house_rentals()
    p = await _player(uid)

    city_id = int(p.get("city_id") or 0)
    street_id = int(p.get("street_id") or 0)
    inside_house_id = int(p.get("inside_house_id") or 0)
    now = int(time.time())

    moving = None
    mu = int(p.get("moving_until") or 0)
    if mu > now:
        to_city = int(p.get("moving_to_city") or 0)
        duration = MOVE_DURATION_BETWEEN_CITIES if to_city != city_id else MOVE_DURATION_BETWEEN_STREETS
        moving = {
            "until": mu,
            "to_city": to_city,
            "to_street": int(p.get("moving_to_street") or 0),
            "seconds_left": mu - now,
            "duration": duration,
        }

    # Дома текущей улицы
    cur_house_ids = [h["id"] for h in HOUSES
                     if h["city_id"] == city_id and h["street_id"] == street_id]
    rentals = {}
    if cur_house_ids:
        ph = ",".join("?" * len(cur_house_ids))
        rows = await db.fetchall(
            f"SELECT hr.house_id, hr.user_id, hr.expires_at, hr.is_open, p.nickname "
            f"FROM house_rentals hr JOIN players p ON p.user_id = hr.user_id "
            f"WHERE hr.house_id IN ({ph}) AND hr.expires_at > ?",
            (*cur_house_ids, now))
        for r in rows:
            rentals[r["house_id"]] = {
                "user_id": r["user_id"],
                "nickname": r["nickname"],
                "expires_at": r["expires_at"],
                "seconds_left": max(0, r["expires_at"] - now),
                "is_open": bool(r.get("is_open", 0)),
            }

    houses = []
    for h in HOUSES:
        if h["city_id"] != city_id or h["street_id"] != street_id:
            continue
        h2 = dict(h)
        h2["rented_by"] = rentals.get(h["id"])
        houses.append(h2)

    # Игроки на этой улице (кроме меня), активные < 24ч, НЕ ВНУТРИ ДОМА
    now_ts = now
    prows = await db.fetchall(
        "SELECT p.user_id, p.nickname, p.level, p.role, p.last_seen, "
        "p.pos_x, p.pos_y, p.head_id, p.body_id, p.legs_id, "
        "p.right_hand_id, p.left_hand_id, p.hair_id, p.shoes_id, "
        "g.tag AS gang_tag, g.tag_color AS gang_tag_color "
        "FROM players p "
        "LEFT JOIN gang_members gm ON gm.user_id = p.user_id "
        "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
        "WHERE p.city_id=? AND p.street_id=? AND p.user_id!=? "
        "AND (p.is_bot=0 OR p.is_bot IS NULL) "
        "AND (p.inside_house_id IS NULL OR p.inside_house_id = 0) "
        "AND p.last_seen > ? "
        "ORDER BY p.last_seen DESC",
        (city_id, street_id, uid, now_ts - PLAYER_ACTIVE_LAST_SEEN))

    for pr in prows:
        pr["is_online"] = (pr.get("last_seen") or 0) > now_ts - 120
        pr["outfit"] = get_outfit(pr)

    # Игроки на других улицах этого города
    city_prows = await db.fetchall(
        "SELECT p.user_id, p.nickname, p.street_id, p.pos_x, p.pos_y, "
        "p.head_id, p.body_id, p.legs_id, p.right_hand_id, p.left_hand_id, "
        "p.hair_id, p.shoes_id, p.last_seen "
        "FROM players p "
        "WHERE p.city_id=? AND p.user_id!=? "
        "AND (p.is_bot=0 OR p.is_bot IS NULL) "
        "AND (p.inside_house_id IS NULL OR p.inside_house_id = 0) "
        "AND p.last_seen > ? "
        "ORDER BY p.last_seen DESC",
        (city_id, uid, now_ts - PLAYER_ACTIVE_LAST_SEEN))

    for pr in city_prows:
        pr["is_online"] = (pr.get("last_seen") or 0) > now_ts - 120
        pr["outfit"] = get_outfit(pr)

    # Данные о доме, внутри которого я нахожусь
    house_inside_data = None
    if inside_house_id > 0:
        try:
            h_info = get_house(inside_house_id)
            if h_info:
                h_rental = await db.fetchone("SELECT * FROM house_rentals WHERE house_id=?", (inside_house_id,))
                is_open = bool(h_rental.get("is_open", 0)) if h_rental else False
                
                house_players = await db.fetchall(
                    "SELECT p.user_id, p.nickname, p.level, p.role, p.last_seen, p.head_id, p.body_id, p.legs_id, p.right_hand_id, p.left_hand_id, p.hair_id, p.shoes_id, "
                    "g.tag AS gang_tag, g.tag_color AS gang_tag_color "
                    "FROM players p "
                    "LEFT JOIN gang_members gm ON gm.user_id = p.user_id "
                    "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
                    "WHERE p.inside_house_id=?", (inside_house_id,))
                for hp in house_players:
                    hp["is_online"] = (hp.get("last_seen") or 0) > now_ts - 120
                    hp["outfit"] = get_outfit(hp)
                
                house_inside_data = {
                    "house": h_info,
                    "is_open": is_open,
                    "players": house_players
                }
        except Exception as e:
            print(f"⚠️ house_inside build error: {e}")

    my_house = await _get_my_active_house(uid, now)

    return web.json_response({
        "cities": CITIES,
        "current": {
            "city_id": city_id,
            "street_id": street_id,
            "inside_house_id": inside_house_id,
            "pos_x": float(p.get("pos_x") or 0),
            "pos_y": float(p.get("pos_y") or 0),
        },
        "moving": moving,
        "my_house": my_house,
        "house_inside": house_inside_data,
        "street": {
            "city_id": city_id,
            "street_id": street_id,
            "houses": houses,
            "players": prows,
        },
        "city_players": city_prows,
        "now": now_ts,
        "active_window": PLAYER_ACTIVE_LAST_SEEN,
        "house_rent_hours": HOUSE_RENT_HOURS,
    })


async def api_map_move(request):
    await _ensure_map_columns()
    ud = await _user(request)
    uid = ud["id"]
    body = await request.json()
    try:
        to_city = int(body.get("to_city", -1))
        to_street = int(body.get("to_street", -1))
    except Exception:
        return web.json_response({"error": "Некорректные параметры"}, status=400)

    city = get_city(to_city)
    if not city:
        return web.json_response({"error": "Город не найден"}, status=400)
    street = get_street(to_city, to_street)
    if not street:
        return web.json_response({"error": "Улица не найдена"}, status=400)

    await _process_moving(uid)
    p = await _player(uid)
    now = int(time.time())

    if int(p.get("moving_until") or 0) > now:
        return web.json_response({
            "error": "Ты уже в пути",
            "seconds_left": int(p["moving_until"]) - now,
        }, status=400)

    cur_city = int(p.get("city_id") or 0)
    cur_street = int(p.get("street_id") or 0)

    if cur_city == to_city and cur_street == to_street:
        return web.json_response({"error": "Ты уже здесь"}, status=400)

    if cur_city != to_city:
        duration = MOVE_DURATION_BETWEEN_CITIES
    else:
        duration = MOVE_DURATION_BETWEEN_STREETS

    arriving_at = now + duration
    await db.execute(
        "UPDATE players SET moving_until=?, moving_to_city=?, moving_to_street=?, inside_house_id=0 WHERE user_id=?",
        (arriving_at, to_city, to_street, uid))

    return web.json_response({
        "ok": True,
        "arriving_at": arriving_at,
        "duration": duration,
        "to_city": to_city,
        "to_street": to_street,
    })


# ═══════════ ДОМА ═══════════
async def api_house_rent(request):
    await _ensure_map_columns()
    ud = await _user(request)
    uid = ud["id"]
    body = await request.json()
    try:
        house_id = int(body.get("house_id", -1))
    except Exception:
        return web.json_response({"error": "Некорректный house_id"}, status=400)

    house = get_house(house_id)
    if not house:
        return web.json_response({"error": "Дом не найден"}, status=400)

    await _process_moving(uid)
    await _process_house_rentals()
    p = await _player(uid)
    now = int(time.time())

    if int(p.get("moving_until") or 0) > now:
        return web.json_response({"error": "Ты в пути, не можешь арендовать"}, status=400)

    if int(p.get("city_id") or 0) != house["city_id"] or int(p.get("street_id") or 0) != house["street_id"]:
        return web.json_response({"error": "Ты не на этой улице"}, status=400)

    my_active = await _get_my_active_house(uid, now)
    if my_active:
        return web.json_response({
            "error": f"У тебя уже есть дом: {my_active['name']}. Сначала отмени аренду.",
            "my_house_id": my_active["id"],
        }, status=400)

    busy = await db.fetchone(
        "SELECT user_id FROM house_rentals WHERE house_id=? AND expires_at>?",
        (house_id, now))
    if busy:
        return web.json_response({"error": "Дом уже арендован"}, status=400)

    if int(p["balance"]) < house["price"]:
        return web.json_response({"error": f"Нужно {house['price']}₽"}, status=400)

    await db.execute("UPDATE players SET balance=balance-? WHERE user_id=?",
                     (house["price"], uid))
    expires_at = now + HOUSE_RENT_HOURS * 3600
    await db.execute(
        "INSERT OR REPLACE INTO house_rentals (house_id, user_id, expires_at, started_at, is_open) "
        "VALUES (?, ?, ?, ?, 0)",
        (house_id, uid, expires_at, now))

    p = await _player(uid)
    return web.json_response({
        "ok": True,
        "player": _player_json(p),
        "house_id": house_id,
        "house_name": house["name"],
        "expires_at": expires_at,
        "duration_hours": HOUSE_RENT_HOURS,
    })


async def api_house_cancel(request):
    await _ensure_map_columns()
    await _process_house_rentals()
    ud = await _user(request)
    uid = ud["id"]
    now = int(time.time())

    my = await _get_my_active_house(uid, now)
    if not my:
        return web.json_response({"error": "У тебя нет активной аренды"}, status=400)

    await db.execute("DELETE FROM house_rentals WHERE user_id=? AND expires_at>?", (uid, now))
    await db.execute("UPDATE players SET inside_house_id=0 WHERE inside_house_id=?", (my["id"],))
    return web.json_response({
        "ok": True,
        "cancelled_house_id": my["id"],
        "cancelled_house_name": my["name"],
    })


async def api_house_toggle_open(request):
    await _ensure_map_columns()
    ud = await _user(request)
    uid = ud["id"]
    now = int(time.time())

    my = await _get_my_active_house(uid, now)
    if not my:
        return web.json_response({"error": "У тебя нет дома"}, status=400)

    new_state = 0 if my["is_open"] else 1
    await db.execute("UPDATE house_rentals SET is_open=? WHERE house_id=?", (new_state, my["id"]))
    
    return web.json_response({"ok": True, "is_open": bool(new_state)})


async def api_house_enter(request):
    await _ensure_map_columns()
    ud = await _user(request)
    uid = ud["id"]
    body = await request.json()
    house_id = int(body.get("house_id", 0))
    now = int(time.time())

    house = get_house(house_id)
    if not house:
        return web.json_response({"error": "Дом не найден"}, status=400)

    p = await _player(uid)
    
    # Если уже внутри этого дома — просто ок
    if p.get("inside_house_id") == house_id:
        return web.json_response({"ok": True})

    if int(p.get("city_id") or 0) != house["city_id"] or int(p.get("street_id") or 0) != house["street_id"]:
        return web.json_response({"error": "Ты не на этой улице"}, status=400)

    rental = await db.fetchone("SELECT user_id, is_open FROM house_rentals WHERE house_id=? AND expires_at>?", (house_id, now))
    
    if not rental:
        return web.json_response({"error": "Дом не арендован (пустует)"}, status=400)

    if rental["user_id"] != uid and not rental.get("is_open", 0):
        return web.json_response({"error": "Дверь закрыта. Вас не приглашали."}, status=403)

    await db.execute("UPDATE players SET inside_house_id=? WHERE user_id=?", (house_id, uid))
    return web.json_response({"ok": True})


async def api_house_exit(request):
    await _ensure_map_columns()
    ud = await _user(request)
    uid = ud["id"]
    await db.execute("UPDATE players SET inside_house_id=0 WHERE user_id=?", (uid,))
    return web.json_response({"ok": True})


async def api_house_my(request):
    await _ensure_map_columns()
    await _process_house_rentals()
    ud = await _user(request)
    uid = ud["id"]
    now = int(time.time())
    house = await _get_my_active_house(uid, now)
    return web.json_response({"house": house})


# ═══════════ ОНЛАЙН ИГРОКИ ═══════════
async def api_online_players(request):
    await _ensure_map_columns()
    ud = await _user(request)
    uid = ud["id"]
    body = await request.json()
    
    try:
        city_id = body.get("city_id")
        if city_id is not None:
            city_id = int(city_id)
    except Exception:
        city_id = None

    now = int(time.time())
    
    query = (
        "SELECT p.user_id, p.nickname, p.level, p.role, p.last_seen, "
        "p.city_id, p.street_id, "
        "g.tag AS gang_tag, g.tag_color AS gang_tag_color "
        "FROM players p "
        "LEFT JOIN gang_members gm ON gm.user_id = p.user_id "
        "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
        "WHERE (p.is_bot=0 OR p.is_bot IS NULL) "
        "AND p.last_seen > ? "
    )
    params = [now - PLAYER_ACTIVE_LAST_SEEN]

    if city_id is not None:
        query += "AND p.city_id = ? "
        params.append(city_id)

    query += "ORDER BY p.last_seen DESC"

    rows = await db.fetchall(query, tuple(params))

    for r in rows:
        r["is_online"] = (r.get("last_seen") or 0) > now - 120
        c_id = r.get("city_id", 0)
        r["city_name"] = CITIES[c_id]["name"] if c_id is not None and 0 <= c_id < len(CITIES) else "?"

    return web.json_response({"players": rows})