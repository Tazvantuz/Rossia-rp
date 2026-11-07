# api_boss.py
"""Логика глобального босса (ОДНОРАЗОВЫЙ)."""
import time
from aiohttp import web
from database import db
from api_core import _user, _player, _add_inv, _player_json
from game import get_combat_stats

BOSS_ID = "pocyk"
BOSS_MAX_HP = 10_000_000
BOSS_DURATION = 7 * 86400
BOSS_COOLDOWN = 3

async def _ensure_boss():
    row = await db.fetchone("SELECT * FROM boss_state WHERE boss_id=?", (BOSS_ID,))
    if not row:
        now = int(time.time())
        await db.execute("INSERT INTO boss_state (boss_id, current_hp, max_hp, ends_at, status) VALUES (?,?,?,?,'active')",
                         (BOSS_ID, BOSS_MAX_HP, BOSS_MAX_HP, now + BOSS_DURATION))
        return await db.fetchone("SELECT * FROM boss_state WHERE boss_id=?", (BOSS_ID,))
    return row

async def _distribute_rewards(boss):
    # Top 3
    top = await db.fetchall("SELECT user_id, damage FROM boss_damage WHERE boss_id=? ORDER BY damage DESC LIMIT 3", (BOSS_ID,))
    rewards = [500000, 250000, 100000]
    for i, r in enumerate(top):
        if r['damage'] > 0:
            await db.execute("UPDATE players SET balance=balance+? WHERE user_id=?", (rewards[i], r['user_id']))
            await db.execute("INSERT OR IGNORE INTO boss_rewards (boss_id, user_id, reward_type) VALUES (?, ?, ?)", (BOSS_ID, r['user_id'], f"top{i+1}"))

    # >= 10000 dmg
    r10k = await db.fetchall("SELECT user_id FROM boss_damage WHERE boss_id=? AND damage >= 10000", (BOSS_ID,))
    for r in r10k:
        await db.execute("UPDATE players SET balance=balance+50000 WHERE user_id=?", (r['user_id'],))
        await db.execute("INSERT OR IGNORE INTO boss_rewards (boss_id, user_id, reward_type) VALUES (?, ?, ?)", (BOSS_ID, r['user_id'], "dmg10k"))

    # >= 1000 dmg
    r1k = await db.fetchall("SELECT user_id FROM boss_damage WHERE boss_id=? AND damage >= 1000", (BOSS_ID,))
    for r in r1k:
        await _add_inv(r['user_id'], 'rh_pocyk', 1)
        await db.execute("INSERT OR IGNORE INTO boss_rewards (boss_id, user_id, reward_type) VALUES (?, ?, ?)", (BOSS_ID, r['user_id'], "dmg1k"))

async def _check_boss_state():
    boss = await _ensure_boss()
    now = int(time.time())
    
    # Если босс жив, проверяем, не истекло ли время
    if boss['status'] == 'active':
        if boss['current_hp'] <= 0:
            # Он умер. Начисляем награды и ставим статус dead.
            await _distribute_rewards(boss)
            await db.execute("UPDATE boss_state SET status='dead' WHERE boss_id=?", (BOSS_ID,))
        elif boss['ends_at'] < now:
            # Время вышло, он сбежал. Награды не выдаем.
            await db.execute("UPDATE boss_state SET status='expired' WHERE boss_id=?", (BOSS_ID,))
            
    return await db.fetchone("SELECT * FROM boss_state WHERE boss_id=?", (BOSS_ID,))

async def api_boss_get(request):
    ud = await _user(request); uid = ud["id"]
    boss = await _check_boss_state()
    p = await _player(uid)
    
    my_dmg_row = await db.fetchone("SELECT damage, last_attack_ts FROM boss_damage WHERE boss_id=? AND user_id=?", (BOSS_ID, uid))
    my_dmg = my_dmg_row['damage'] if my_dmg_row else 0
    
    top = await db.fetchall("SELECT bd.user_id, bd.damage, p.nickname, p.level, g.tag as gang_tag, g.tag_color as gang_tag_color "
                            "FROM boss_damage bd JOIN players p ON p.user_id=bd.user_id "
                            "LEFT JOIN gang_members gm ON gm.user_id = p.user_id "
                            "LEFT JOIN gangs g ON g.gang_id = gm.gang_id "
                            "WHERE bd.boss_id=? AND bd.damage > 0 ORDER BY bd.damage DESC LIMIT 5", (BOSS_ID,))
    
    claimed = await db.fetchall("SELECT reward_type FROM boss_rewards WHERE boss_id=? AND user_id=?", (BOSS_ID, uid))
    stats = get_combat_stats(p)
    
    return web.json_response({
        "boss": {
            "id": boss["boss_id"],
            "name": "Опасный Поцык",
            "hp": max(0, boss["current_hp"]),
            "max_hp": boss["max_hp"],
            "ends_at": boss["ends_at"],
            "status": boss["status"] # 'active', 'dead', 'expired'
        },
        "my_damage": my_dmg,
        "my_cooldown": max(0, 3 - (int(time.time()) - (my_dmg_row['last_attack_ts'] if my_dmg_row else 0))),
        "top": top,
        "my_stats": stats,
        "claimed": [r['reward_type'] for r in claimed],
        "now": int(time.time())
    })

async def api_boss_attack(request):
    ud = await _user(request); uid = ud["id"]
    boss = await _check_boss_state()
    
    if boss['status'] != 'active':
        return web.json_response({"error": "Босс уже мертв или сбежал"}, status=400)
        
    p = await _player(uid)
    stats = get_combat_stats(p)
    dmg = stats['damage']
    
    now = int(time.time())
    my_dmg_row = await db.fetchone("SELECT last_attack_ts FROM boss_damage WHERE boss_id=? AND user_id=?", (BOSS_ID, uid))
    last_attack = my_dmg_row['last_attack_ts'] if my_dmg_row else 0
    if now - last_attack < 3:
        return web.json_response({"error": "Кд 3 сек"}, status=400)
        
    new_hp = max(0, boss['current_hp'] - dmg)
    await db.execute("UPDATE boss_state SET current_hp=? WHERE boss_id=?", (new_hp, BOSS_ID))
    
    await db.execute(
        "INSERT INTO boss_damage (boss_id, user_id, damage, last_attack_ts) VALUES (?, ?, ?, ?) "
        "ON CONFLICT(boss_id, user_id) DO UPDATE SET damage = damage + excluded.damage, last_attack_ts = excluded.last_attack_ts",
        (BOSS_ID, uid, dmg, now)
    )
    
    if new_hp <= 0:
        await _distribute_rewards(boss)
        await db.execute("UPDATE boss_state SET status='dead' WHERE boss_id=?", (BOSS_ID,))
        
    return web.json_response({"ok": True, "damage": dmg, "new_hp": new_hp})