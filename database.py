# database.py
import os
import aiosqlite

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
    is_bot INTEGER DEFAULT 0,
    seeds INTEGER DEFAULT 0,
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
    tag TEXT DEFAULT NULL,
    tag_color TEXT DEFAULT NULL,
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
CREATE TABLE IF NOT EXISTS territory_captures (
    capture_id INTEGER PRIMARY KEY AUTOINCREMENT,
    territory_id INTEGER NOT NULL,
    gang_id INTEGER NOT NULL,
    status TEXT DEFAULT 'active',
    started_at INTEGER NOT NULL,
    total_damage INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS territory_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    territory_id INTEGER NOT NULL,
    territory_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    gang_a_id INTEGER,
    gang_a_name TEXT,
    gang_a_dmg INTEGER,
    gang_b_id INTEGER,
    gang_b_name TEXT,
    gang_b_dmg INTEGER,
    winner_gang_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, type TEXT NOT NULL, text TEXT NOT NULL, is_read INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS friends (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, friend_id INTEGER NOT NULL, status TEXT DEFAULT 'pending', UNIQUE(user_id, friend_id));
CREATE TABLE IF NOT EXISTS private_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, from_id INTEGER NOT NULL, to_id INTEGER NOT NULL, message TEXT NOT NULL, is_read INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS player_daily_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    day INTEGER NOT NULL,
    first_seen INTEGER NOT NULL,
    last_seen INTEGER NOT NULL,
    requests INTEGER DEFAULT 1,
    UNIQUE(user_id, day)
);
CREATE TABLE IF NOT EXISTS system_stats (
    key TEXT PRIMARY KEY,
    value INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_activity_day ON player_daily_activity(day);
CREATE INDEX IF NOT EXISTS idx_activity_user ON player_daily_activity(user_id);
"""

# Известные ID и ники ботов — используем оба для надёжности
KNOWN_BOT_IDS = (9900000001, 9900000002, 9900000003, 9900000004, 9900000005)
KNOWN_BOT_NICKS = ('Ксюха', 'Денчик', 'Толик', 'Света', 'Санёк')

class Database:
    def __init__(self, path=DB_PATH):
        self.path = path; self.conn = None
    async def init(self):
        self.conn = await aiosqlite.connect(self.path)
        self.conn.row_factory = aiosqlite.Row
        await self.conn.executescript(SCHEMA); await self.conn.commit()
        migrations = [
            "last_work INTEGER DEFAULT 0","last_daily INTEGER DEFAULT 0",
            "daily_streak INTEGER DEFAULT 0","last_roulette INTEGER DEFAULT 0",
            "last_crime INTEGER DEFAULT 0","credit_amount INTEGER DEFAULT 0",
            "crypto_amount REAL DEFAULT 0","businesses TEXT DEFAULT '[]'",
            "achievements TEXT DEFAULT '[]'","casino_plays INTEGER DEFAULT 0",
            "crimes_won INTEGER DEFAULT 0","trades_done INTEGER DEFAULT 0",
            "owned_items_count INTEGER DEFAULT 0",
            "last_seen INTEGER DEFAULT 0",
            "credit_due INTEGER DEFAULT 0","last_casino INTEGER DEFAULT 0",
            "tg_username TEXT DEFAULT NULL",
            "crypto_hold_since INTEGER DEFAULT 0",
            "crypto_bought_today INTEGER DEFAULT 0",
            "crypto_bought_ts INTEGER DEFAULT 0",
            "crypto_migrated INTEGER DEFAULT 0",
            "is_bot INTEGER DEFAULT 0",
            "seeds INTEGER DEFAULT 0",
        ]
        for m in migrations:
            try:
                await self.conn.execute(f"ALTER TABLE players ADD COLUMN {m}")
                await self.conn.commit()
            except: pass
        for _gc in ["tag TEXT DEFAULT NULL", "tag_color TEXT DEFAULT NULL"]:
            try:
                await self.conn.execute(f"ALTER TABLE gangs ADD COLUMN {_gc}")
                await self.conn.commit()
            except: pass
        try:
            await self.conn.execute("UPDATE pvp_battles SET status='expired' WHERE status='pending' AND (strftime('%s','now') - strftime('%s', created_at)) > 30")
            await self.conn.execute("UPDATE pvp_battles SET status='expired' WHERE status='active' AND (turn_started_at IS NULL OR turn_started_at = 0 OR (strftime('%s','now') - turn_started_at) > 300)")
            await self.conn.commit()
        except: pass
        try: await self.conn.execute("ALTER TABLE notifications ADD COLUMN data TEXT DEFAULT NULL"); await self.conn.commit()
        except: pass
        for _col in [
            "turn_started_at INTEGER DEFAULT 0",
            "pending_attack_part TEXT",
        ]:
            try:
                await self.conn.execute(f"ALTER TABLE pvp_battles ADD COLUMN {_col}")
                await self.conn.commit()
            except: pass

        # ═══ ЖЁСТКОЕ ОТКЛЮЧЕНИЕ БОТОВ ═══
        # 1. По ID
        try:
            ids_placeholder = ",".join("?" * len(KNOWN_BOT_IDS))
            await self.conn.execute(
                f"UPDATE players SET is_bot=1, last_seen=0 WHERE user_id IN ({ids_placeholder})",
                KNOWN_BOT_IDS
            )
            await self.conn.commit()
            print(f"🤖 Отключено {len(KNOWN_BOT_IDS)} ботов по ID")
        except Exception as e:
            print(f"⚠️ bot disable by ID: {e}")

        # 2. По нику (на случай если ID другие)
        try:
            nicks_placeholder = ",".join("?" * len(KNOWN_BOT_NICKS))
            await self.conn.execute(
                f"UPDATE players SET is_bot=1, last_seen=0 WHERE nickname IN ({nicks_placeholder})",
                KNOWN_BOT_NICKS
            )
            await self.conn.commit()
            print(f"🤖 Отключено ботов по нику ({len(KNOWN_BOT_NICKS)} имён)")
        except Exception as e:
            print(f"⚠️ bot disable by nick: {e}")

        # 3. Вообще ВСЕХ is_bot=1 в оффлайн
        try:
            await self.conn.execute("UPDATE players SET last_seen=0 WHERE is_bot=1")
            await self.conn.commit()
        except Exception as e:
            print(f"⚠️ bot last_seen reset: {e}")

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