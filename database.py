import os
import aiosqlite

# Railway монтирует том в /data — использовать его если существует
if os.path.isdir("/data") and os.access("/data", os.W_OK):
    DB_PATH = "/data/new_era_rpg.db"
    print(f"💾 БД: {DB_PATH} (Railway volume)")
else:
    DB_PATH = "new_era_rpg.db"
    print(f"💾 БД: {DB_PATH} (локально)")

SCHEMA = """
CREATE TABLE IF NOT EXISTS players (
    user_id INTEGER PRIMARY KEY,
    nickname TEXT,
    balance INTEGER DEFAULT 1000,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    location_id INTEGER DEFAULT 0,
    head_id TEXT, body_id TEXT, legs_id TEXT,
    right_hand_id TEXT, left_hand_id TEXT,
    current_job TEXT,
    last_work INTEGER DEFAULT 0,
    last_daily INTEGER DEFAULT 0,
    daily_streak INTEGER DEFAULT 0,
    last_roulette INTEGER DEFAULT 0,
    last_crime INTEGER DEFAULT 0,
    credit_amount INTEGER DEFAULT 0,
    crypto_amount REAL DEFAULT 0,
    businesses TEXT DEFAULT '[]',
    achievements TEXT DEFAULT '[]',
    casino_plays INTEGER DEFAULT 0,
    crimes_won INTEGER DEFAULT 0,
    trades_done INTEGER DEFAULT 0,
    owned_items_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_id TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    UNIQUE(user_id, item_id)
);
CREATE TABLE IF NOT EXISTS trades (
    trade_id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user INTEGER NOT NULL,
    to_user INTEGER NOT NULL,
    give_money INTEGER DEFAULT 0,
    give_items TEXT DEFAULT '[]',
    want_money INTEGER DEFAULT 0,
    want_items TEXT DEFAULT '[]',
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    nickname TEXT NOT NULL,
    level INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS pvp_battles (
    battle_id INTEGER PRIMARY KEY AUTOINCREMENT,
    attacker_id INTEGER NOT NULL,
    defender_id INTEGER NOT NULL,
    attacker_hp INTEGER NOT NULL,
    defender_hp INTEGER NOT NULL,
    attacker_max_hp INTEGER NOT NULL,
    defender_max_hp INTEGER NOT NULL,
    attacker_damage INTEGER NOT NULL,
    defender_damage INTEGER NOT NULL,
    turn TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    log TEXT DEFAULT '[]',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS gangs (
    gang_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    emoji TEXT NOT NULL,
    leader_id INTEGER NOT NULL UNIQUE,
    treasury INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS gang_members (
    gang_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL UNIQUE,
    role TEXT DEFAULT 'member',
    joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(gang_id, user_id)
);
CREATE TABLE IF NOT EXISTS gang_territories (
    territory_id INTEGER PRIMARY KEY,
    gang_id INTEGER,
    capturing_gang_id INTEGER,
    capture_end INTEGER,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, type TEXT NOT NULL, text TEXT NOT NULL, is_read INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS friends (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, friend_id INTEGER NOT NULL, status TEXT DEFAULT 'pending', UNIQUE(user_id, friend_id));
CREATE TABLE IF NOT EXISTS private_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, from_id INTEGER NOT NULL, to_id INTEGER NOT NULL, message TEXT NOT NULL, is_read INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
"""

class Database:
    def __init__(self, path=DB_PATH):
        self.path = path; self.conn = None
    async def init(self):
        self.conn = await aiosqlite.connect(self.path)
        self.conn.row_factory = aiosqlite.Row
        await self.conn.executescript(SCHEMA); await self.conn.commit()
        # Миграции для старых БД
        migrations = [
            "last_work INTEGER DEFAULT 0","last_daily INTEGER DEFAULT 0",
            "daily_streak INTEGER DEFAULT 0","last_roulette INTEGER DEFAULT 0",
            "last_crime INTEGER DEFAULT 0","credit_amount INTEGER DEFAULT 0",
            "crypto_amount REAL DEFAULT 0","businesses TEXT DEFAULT '[]'",
            "achievements TEXT DEFAULT '[]'","casino_plays INTEGER DEFAULT 0",
            "crimes_won INTEGER DEFAULT 0","trades_done INTEGER DEFAULT 0",
            "owned_items_count INTEGER DEFAULT 0",
            "credit_due INTEGER DEFAULT 0","last_casino INTEGER DEFAULT 0",
        ]
        for m in migrations:
            try:
                await self.conn.execute(f"ALTER TABLE players ADD COLUMN {m}")
                await self.conn.commit()
            except: pass
        # Миграция pvp_battles.turn_started_at
        try:
            await self.conn.execute("ALTER TABLE pvp_battles ADD COLUMN turn_started_at INTEGER DEFAULT 0")
            await self.conn.execute("ALTER TABLE pvp_battles ADD COLUMN pending_attack_part TEXT")
            await self.conn.commit()
        except: pass
    async def fetchone(self, q, p=()):
        async with self.conn.execute(q, p) as cur:
            r = await cur.fetchone()
            return dict(r) if r else None
    async def fetchall(self, q, p=()):
        async with self.conn.execute(q, p) as cur:
            return [dict(r) for r in await cur.fetchall()]
    async def execute(self, q, p=()):
        async with self.conn.execute(q, p) as cur:
            await self.conn.commit(); return cur.lastrowid
    async def close(self):
        if self.conn: await self.conn.close()

db = Database()


async def migrate_referrals():
    try:
        await db.execute("ALTER TABLE players ADD COLUMN referrer_id INTEGER DEFAULT NULL")
    except Exception:
        pass
    try:
        await db.execute("ALTER TABLE players ADD COLUMN ref_claims TEXT DEFAULT '[]'")
    except Exception:
        pass
