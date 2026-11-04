"""API для банд и карты Гетто."""
from aiohttp import web
import time, random
from database import db
from game import GANG_TERRITORIES, get_combat_stats

async def _user(request):
    # Заглушка: в реальном проекте здесь валидация initData
    return {"id": 1}

async def _player(uid):
    return await db.fetchone("SELECT * FROM players WHERE user_id=?", (uid,))

async def _gang_role(uid):
    row = await db.fetchone("SELECT gang_id, role FROM gang_members WHERE user_id=?", (uid,))
    return (row["gang_id"], row["role"]) if row else (None, None)

async def api_gang_territories(request):
    territories = []
    for t in GANG_TERRITORIES:
        owner = await db.fetchone(
            "SELECT g.gang_id, g.name FROM gang_territories gt JOIN gangs g ON g.gang_id=gt.gang_id WHERE gt.territory_id=?",
            (t["id"],))
        cap = await db.fetchone(
            "SELECT * FROM gang_territories WHERE territory_id=? AND capturing_gang_id IS NOT NULL",
            (t["id"],))
        territories.append({
            "id": t["id"], "name": t["name"], "emoji": t.get("emoji", "🏙️"),
            "income": t.get("income", 1000),
            "owner": dict(owner) if owner else None,
            "capture": dict(cap) if cap else None
        })
    return web.json_response({"territories": territories})

async def api_gang_info(request):
    ud = await _user(request); uid = ud["id"]
    gid, role = await _gang_role(uid)
    if not gid:
        return web.json_response({"in_gang": False})
    gang = await db.fetchone("SELECT * FROM gangs WHERE gang_id=?", (gid,))
    return web.json_response({"in_gang": True, "gang": dict(gang), "role": role})

async def api_territory_capture_start(request):
    ud = await _user(request); uid = ud["id"]
    gid, role = await _gang_role(uid)
    if not gid or role not in ("leader", "deputy"):
        return web.json_response({"error": "Только глава или зам"}, status=403)
    body = await request.json()
    tid = int(body.get("territory_id", -1))
    await db.execute(
        "UPDATE gang_territories SET capturing_gang_id=?, capture_end=? WHERE territory_id=?",
        (gid, int(time.time()) + 3600, tid))
    return web.json_response({"ok": True})

def setup_routes(app):
    app.router.add_post("/api/gang/territories", api_gang_territories)
    app.router.add_post("/api/gang/info", api_gang_info)
    app.router.add_post("/api/territory/capture/start", api_territory_capture_start)
