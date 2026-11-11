# api_boss.py
"""Логика глобальных боссов (Опасный Поцык — убит, Зелябоба — активен)."""
import time
from aiohttp import web
from database import db
from api_core import _user, _player, _add_inv, _player_json
from game import get_combat_stats

BOSS_POCYK = {
    "id": "pocyk",
    "name": "Опасный Поцык",
    "image": "pocyk",
    "max_hp": 10_000_000,
    "duration": 7 * 86400,
    "cooldown": 3,
    "rewards": {
        "top": [500_000, 250_000, 100_000],
        "dmg_high_threshold": 10_000,
        "dmg_high_money": 50_000,
        "item_threshold": 1_000,
        "item_id": "rh_pocyk",
        "item_name": "Опасный Поцык",
        "item_claim": "dmg1k",
        "high_claim": "dmg10k",
    }
}

BOSS_ZELYA = {
    "id": "zelya",
    "name": "Зелябоба",
    "image": "zelya",
    "max_hp": 30_000_000,
    "duration": 7 * 86400,
    "cooldown": 3,
    "rewards": {
        "top": [2_500_000, 1_250_000, 500_000],
        "dmg_high_threshold": 10_000,
        "dmg_high_money": 250_000,
        "item_threshold": 10_000,
        "item_id": "rh_zelya",
        "item_name": "Зелябоба",
        "item_claim": "dmg_item",
        "high_claim": "dmg_high",
    }
}

BOSSES = {
    "pocyk": BOSS_POCYK,
    "zelya": BOSS_ZELYA,
}

DEFAULT_BOSS_ID = "zelya"


async def _ensure_boss(boss_id):
    cfg = BOSSES.get(boss_id)
    if not cfg:
        return None
    row = await db.fetchone("SELECT * FROM boss_state WHERE boss_id=?", (boss_id,))
    if not row:
        now = int(time.time())
        await db.execute(
            "INSERT INTO boss_state (boss_id, current_hp, max_hp, ends_at, status) "
            "VALUES (?,?,?,?,'active')",
            (boss_id, cfg["max_hp"], cfg["max_hp"], now + cfg["duration"]))
        return await db.fetchone("SELECT * FROM boss_state WHERE boss_id=?", (boss_id,))
    return row


async def _distribute_rewards(boss_id, boss):
    cfg = BOSSES.get(boss_id)
    if not cfg:
        return
    rw = cfg["rewards"]
    now = int(time.time())

    # Top 3
    top = await db.fetchall(
        "SELECT user_id, damage FROM boss_damage WHERE boss_id=? ORDER BY damage DESC LIMIT 3",
        (boss_id,))
    for i, r in enumerate(top):
        if r["damage"] > 0 and i < len(rw["top"]):
            await db.execute("UPDATE players SET balance=balance+? WHERE user_id=?",
                             (rw["top"][i], r["user_id"]))
            await db.execute(
                "INSERT OR IGNORE INTO boss_rewards (boss_id, user_id, reward_type) VALUES (?, ?, ?)",
                (boss_id, r["user_id"], f"top{i+1}"))

    # dmg_high money
    r_high = await db.fetchall(
        "SELECT user_id FROM boss_damage WHERE boss_id=? AND damage >= ?",
        (boss_id, rw["dmg_high_threshold"]))
    for r in r_high:
        await db.execute("UPDATE players SET balance=balance+? WHERE user_id=?",
                         (rw["dmg_high_money"], r["user_id"]))
        await db.execute(
            "INSERT OR IGNORE INTO boss_rewards (boss_id, user_id, reward_type) VALUES (?, ?, ?)",
            (boss_id, r["user_id"], rw["high_claim"]))

    # item reward
    r_item = await db.fetchall(
        "SELECT user_id FROM boss_damage WHERE boss_id=? AND damage >= ?",
        (boss_id, rw["item_threshold"]))
    for r in r_item:
        await _add_inv(r["user_id"], rw["item_id"], 1)
        await db.execute(
            "INSERT OR IGNORE INTO boss_rewards (boss_id, user_id, reward_type) VALUES (?, ?, ?)",
            (boss_id, r["user_id"], rw["item_claim"]))


async def _check_boss_state(boss_id):
    boss = await _ensure_boss(boss_id)
    if not boss:
        return None
    now = int(time.time())
    if boss["status"] == "active":
        if boss["current_hp"] <= 0:
            await _distribute_rewards(boss_id, boss)
            await db.execute("UPDATE boss_state SET status='dead' WHERE boss_id=?", (boss_id,))
        elif boss["ends_at"] < now:
            await db.execute("UPDATE boss_state SET status='expired' WHERE boss_id=?", (boss_id,))
    return await db.fetchone("SELECT * FROM boss_state WHERE boss_id=?", (boss_id,))


async def api_boss_list(request):
    """Список всех боссов с краткой инфой."""
    await _user(request)
    result = []
    for bid, cfg in BOSSES.items():
        boss = await _check_boss_state(bid)
        if not boss:
            continue
        result.append({
            "id": bid,
            "name": cfg["name"],
            "image": cfg["image"],
            "hp": max(0, boss["current_hp"]),
            "max_hp": boss["max_hp"],
            "ends_at": boss["ends_at"],
            "status": boss["status"],
        })
    return web.json_response({"bosses": result})


async def api_boss_get(request):
    ud = await _user(request)
    uid = ud["id"]
    body = {}
    try:
        body = await request.json()
    except Exception:
        pass
    boss_id = body.get("boss_id", DEFAULT_BOSS_ID)
    if boss_id not in BOSSES:
        boss_id = DEFAULT_BOSS_ID
    cfg = BOSSES[boss_id]

    boss = await _check_boss_state(boss_id)
    if not boss:
        return web.json_response({"error": "Босс не найден"}, status=404)

    p = await _player(uid)
    my_dmg_row = await db.fetchone(
        "SELECT damage, last_attack_ts FROM boss_damage WHERE boss_id=? AND user_id=?",
        (boss_id, uid))
    my_dmg = my_dmg_row["damage"] if my_dmg_row else 0
    last_attack = my_dmg_row["last_attack_ts"] if my_dmg_row else 0
    cooldown = max(0, cfg["cooldown"] - (int(time.time()) - last_attack)) if last_attack else 0

    top = await db.fetchall(
        "SELECT bd.user_id, bd.damage, p.nickname, p.level, p.role, "
        "g.tag as gang_tag, g.tag_color as gang_tag_color "
        "FROM boss_damage bd JOIN players p ON p.user_id=bd.user_id "
        "LEFT JOIN gang_members gm ON gm.user_id = p.user_id "
        "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
        "WHERE bd.boss_id=? AND bd.damage > 0 ORDER BY bd.damage DESC LIMIT 5",
        (boss_id,))

    claimed = await db.fetchall(
        "SELECT reward_type FROM boss_rewards WHERE boss_id=? AND user_id=?",
        (boss_id, uid))
    claimed_types = [r["reward_type"] for r in claimed]

    stats = get_combat_stats(p)

    rw = cfg["rewards"]
    top_rewards_display = [
        {"rank": i + 1, "money": m, "label": f"Топ {i + 1}"}
        for i, m in enumerate(rw["top"])
    ]

    return web.json_response({
        "boss": {
            "id": boss_id,
            "name": cfg["name"],
            "image": cfg["image"],
            "hp": max(0, boss["current_hp"]),
            "max_hp": boss["max_hp"],
            "ends_at": boss["ends_at"],
            "status": boss["status"],
        },
        "my_damage": my_dmg,
        "my_cooldown": cooldown,
        "top": top,
        "my_stats": stats,
        "claimed": claimed_types,
        "rewards_config": {
            "item_threshold": rw["item_threshold"],
            "item_id": rw["item_id"],
            "item_name": rw["item_name"],
            "item_claim": rw["item_claim"],
            "dmg_high_threshold": rw["dmg_high_threshold"],
            "dmg_high_money": rw["dmg_high_money"],
            "dmg_high_claim": rw["high_claim"],
            "top_rewards": top_rewards_display,
        },
        "now": int(time.time()),
    })


async def api_boss_attack(request):
    ud = await _user(request)
    uid = ud["id"]
    body = {}
    try:
        body = await request.json()
    except Exception:
        pass
    boss_id = body.get("boss_id", DEFAULT_BOSS_ID)
    if boss_id not in BOSSES:
        boss_id = DEFAULT_BOSS_ID
    cfg = BOSSES[boss_id]

    boss = await _check_boss_state(boss_id)
    if not boss:
        return web.json_response({"error": "Босс не найден"}, status=404)
    if boss["status"] != "active":
        return web.json_response({"error": "Босс уже мертв или сбежал"}, status=400)

    p = await _player(uid)
    stats = get_combat_stats(p)
    dmg = stats["damage"]

    now = int(time.time())
    my_dmg_row = await db.fetchone(
        "SELECT last_attack_ts FROM boss_damage WHERE boss_id=? AND user_id=?",
        (boss_id, uid))
    last_attack = my_dmg_row["last_attack_ts"] if my_dmg_row else 0
    if now - last_attack < cfg["cooldown"]:
        return web.json_response(
            {"error": f"Кд {cfg['cooldown']} сек"}, status=400)

    new_hp = max(0, boss["current_hp"] - dmg)
    await db.execute("UPDATE boss_state SET current_hp=? WHERE boss_id=?", (new_hp, boss_id))

    await db.execute(
        "INSERT INTO boss_damage (boss_id, user_id, damage, last_attack_ts) VALUES (?, ?, ?, ?) "
        "ON CONFLICT(boss_id, user_id) DO UPDATE SET "
        "damage = damage + excluded.damage, last_attack_ts = excluded.last_attack_ts",
        (boss_id, uid, dmg, now))

    if new_hp <= 0:
        await _distribute_rewards(boss_id, boss)
        await db.execute("UPDATE boss_state SET status='dead' WHERE boss_id=?", (boss_id,))

    return web.json_response({"ok": True, "damage": dmg, "new_hp": new_hp})