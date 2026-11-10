# database.py
import os
import random
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
    hair_id TEXT, shoes_id TEXT,
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
    tg_bonus_claimed INTEGER DEFAULT 0,
    role TEXT DEFAULT 'player',
    muted_until INTEGER DEFAULT 0,
    mute_reason TEXT DEFAULT NULL,
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
CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, type TEXT NOT NULL, text TEXT NOT NULL, is_read INTEGER DEFAULT 0, data TEXT DEFAULT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
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
CREATE TABLE IF NOT EXISTS blackjack_games (
    user_id INTEGER PRIMARY KEY,
    bet INTEGER NOT NULL,
    deck TEXT NOT NULL,
    player_cards TEXT NOT NULL DEFAULT '[]',
    dealer_cards TEXT NOT NULL DEFAULT '[]',
    status TEXT DEFAULT 'player',
    result TEXT DEFAULT NULL,
    payout INTEGER DEFAULT 0,
    doubled INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS promo_codes (
    code TEXT PRIMARY KEY,
    bonus INTEGER NOT NULL,
    uses_left INTEGER NOT NULL,
    uses_total INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS promo_used (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    used_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(code, user_id)
);
CREATE TABLE IF NOT EXISTS boss_state (
    boss_id TEXT PRIMARY KEY,
    current_hp INTEGER NOT NULL,
    max_hp INTEGER NOT NULL,
    ends_at INTEGER NOT NULL,
    status TEXT DEFAULT 'active'
);
CREATE TABLE IF NOT EXISTS boss_damage (
    boss_id TEXT,
    user_id INTEGER,
    damage INTEGER DEFAULT 0,
    last_attack_ts INTEGER DEFAULT 0,
    PRIMARY KEY (boss_id, user_id)
);
CREATE TABLE IF NOT EXISTS boss_rewards (
    boss_id TEXT,
    user_id INTEGER,
    reward_type TEXT,
    PRIMARY KEY (boss_id, user_id, reward_type)
);

-- ═══════════ АРЕНДА ДОМОВ ═══════════
CREATE TABLE IF NOT EXISTS house_rentals (
    house_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    started_at INTEGER NOT NULL DEFAULT 0,
    is_open INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_house_rentals_user ON house_rentals(user_id);
CREATE INDEX IF NOT EXISTS idx_house_rentals_expires ON house_rentals(expires_at);

CREATE INDEX IF NOT EXISTS idx_activity_day ON player_daily_activity(day);
CREATE INDEX IF NOT EXISTS idx_activity_user ON player_daily_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_used_user ON promo_used(user_id);
"""

KNOWN_BOT_IDS = (9900000001, 9900000002, 9900000003, 9900000004, 9900000005)
KNOWN_BOT_NICKS = ('Ксюха', 'Денчик', 'Толик', 'Света', 'Санёк')


class Database:
    def __init__(self, path=DB_PATH):
        self.path = path
        self.conn = None

    async def init(self):
        self.conn = await aiosqlite.connect(self.path)
        self.conn.row_factory = aiosqlite.Row

        await self.conn.executescript(SCHEMA)
        await self.conn.commit()

        migrations = [
            "last_work INTEGER DEFAULT 0", "last_daily INTEGER DEFAULT 0",
            "daily_streak INTEGER DEFAULT 0", "last_roulette INTEGER DEFAULT 0",
            "last_crime INTEGER DEFAULT 0", "credit_amount INTEGER DEFAULT 0",
            "crypto_amount REAL DEFAULT 0", "businesses TEXT DEFAULT '[]'",
            "achievements TEXT DEFAULT '[]'", "casino_plays INTEGER DEFAULT 0",
            "crimes_won INTEGER DEFAULT 0", "trades_done INTEGER DEFAULT 0",
            "owned_items_count INTEGER DEFAULT 0",
            "last_seen INTEGER DEFAULT 0",
            "credit_due INTEGER DEFAULT 0", "last_casino INTEGER DEFAULT 0",
            "tg_username TEXT DEFAULT NULL",
            "crypto_hold_since INTEGER DEFAULT 0",
            "crypto_bought_today INTEGER DEFAULT 0",
            "crypto_bought_ts INTEGER DEFAULT 0",
            "crypto_migrated INTEGER DEFAULT 0",
            "is_bot INTEGER DEFAULT 0",
            "seeds INTEGER DEFAULT 0",
            "hair_id TEXT",
            "shoes_id TEXT",
            "tg_bonus_claimed INTEGER DEFAULT 0",
            "role TEXT DEFAULT 'player'",
            "muted_until INTEGER DEFAULT 0",
            "mute_reason TEXT DEFAULT NULL",
            # ═══ карта ═══
            "city_id INTEGER DEFAULT 0",
            "street_id INTEGER DEFAULT 0",
            "pos_x REAL DEFAULT 0",
            "pos_y REAL DEFAULT 0",
            "moving_until INTEGER DEFAULT 0",
            "moving_to_city INTEGER DEFAULT 0",
            "moving_to_street INTEGER DEFAULT 0",
            "inside_house_id INTEGER DEFAULT 0",
        ]
        for m in migrations:
            try:
                await self.conn.execute(f"ALTER TABLE players ADD COLUMN {m}")
                await self.conn.commit()
            except Exception:
                pass

        for _gc in ["tag TEXT DEFAULT NULL", "tag_color TEXT DEFAULT NULL"]:
            try:
                await self.conn.execute(f"ALTER TABLE gangs ADD COLUMN {_gc}")
                await self.conn.commit()
            except Exception:
                pass

        try:
            await self.conn.execute("UPDATE pvp_battles SET status='expired' WHERE status='pending' AND (strftime('%s','now') - strftime('%s', created_at)) > 30")
            await self.conn.execute("UPDATE pvp_battles SET status='expired' WHERE status='active' AND (turn_started_at IS NULL OR turn_started_at = 0 OR (strftime('%s','now') - turn_started_at) > 300)")
            await self.conn.commit()
        except Exception:
            pass

        try:
            await self.conn.execute("ALTER TABLE notifications ADD COLUMN data TEXT DEFAULT NULL")
            await self.conn.commit()
        except Exception:
            pass

        for _col in ["turn_started_at INTEGER DEFAULT 0", "pending_attack_part TEXT"]:
            try:
                await self.conn.execute(f"ALTER TABLE pvp_battles ADD COLUMN {_col}")
                await self.conn.commit()
            except Exception:
                pass

        # ═══ Миграция house_rentals (is_open) ═══
        try:
            await self.conn.execute(
                "CREATE TABLE IF NOT EXISTS house_rentals ("
                " house_id INTEGER PRIMARY KEY,"
                " user_id INTEGER NOT NULL,"
                " expires_at INTEGER NOT NULL,"
                " started_at INTEGER NOT NULL DEFAULT 0,"
                " is_open INTEGER DEFAULT 0)"
            )
            await self.conn.execute("ALTER TABLE house_rentals ADD COLUMN is_open INTEGER DEFAULT 0")
            await self.conn.commit()
        except Exception:
            pass

        try:
            await self.conn.execute("CREATE INDEX IF NOT EXISTS idx_house_rentals_user ON house_rentals(user_id)")
            await self.conn.execute("CREATE INDEX IF NOT EXISTS idx_house_rentals_expires ON house_rentals(expires_at)")
            await self.conn.execute("CREATE INDEX IF NOT EXISTS idx_players_city_street ON players(city_id, street_id)")
            await self.conn.commit()
            print("✅ Таблица house_rentals готова")
        except Exception as e:
            print(f"⚠️ house_rentals indexes: {e}")

        try:
            await self.conn.execute(
                "UPDATE players SET city_id = location_id WHERE city_id = 0 AND location_id > 0"
            )
            await self.conn.commit()
            print("✅ Миграция location_id → city_id выполнена")
        except Exception as e:
            print(f"⚠️ city_id migration: {e}")

        try:
            cur = await self.conn.execute(
                "SELECT user_id FROM players WHERE (pos_x IS NULL OR pos_x = 0) AND (pos_y IS NULL OR pos_y = 0)"
            )
            rows = await cur.fetchall()
            for row in rows:
                uid = row[0]
                x = round(random.uniform(60, 540), 1)
                y = round(random.uniform(270, 370), 1)
                await self.conn.execute(
                    "UPDATE players SET pos_x=?, pos_y=? WHERE user_id=?", (x, y, uid))
            await self.conn.commit()
            if rows:
                print(f"✅ Назначены стартовые позиции игрокам: {len(rows)}")
        except Exception as e:
            print(f"⚠️ pos migration: {e}")

        try:
            await self.conn.execute(
                "DELETE FROM blackjack_games "
                "WHERE strftime('%s','now') - strftime('%s', created_at) > 3600"
            )
            await self.conn.commit()
        except Exception as e:
            print(f"⚠️ blackjack cleanup: {e}")

        try:
            ids_ph = ",".join("?" * len(KNOWN_BOT_IDS))
            await self.conn.execute(
                f"UPDATE players SET is_bot=1, last_seen=0 WHERE user_id IN ({ids_ph})",
                KNOWN_BOT_IDS)
            await self.conn.commit()
        except Exception as e:
            print(f"⚠️ bot disable by ID: {e}")
        try:
            nicks_ph = ",".join("?" * len(KNOWN_BOT_NICKS))
            await self.conn.execute(
                f"UPDATE players SET is_bot=1, last_seen=0 WHERE nickname IN ({nicks_ph})",
                KNOWN_BOT_NICKS)
            await self.conn.commit()
        except Exception as e:
            print(f"⚠️ bot disable by nick: {e}")
        try:
            await self.conn.execute("UPDATE players SET last_seen=0 WHERE is_bot=1")
            await self.conn.commit()
        except Exception as e:
            print(f"⚠️ bot last_seen reset: {e}")

        try:
            await self.conn.execute("UPDATE players SET role='admin' WHERE tg_username='tazvantuzz'")
            await self.conn.commit()
        except Exception as e:
            print(f"⚠️ admin role set: {e}")

        try:
            row = await self.fetchone("SELECT * FROM boss_state WHERE boss_id='pocyk'")
            if not row:
                import time as _t
                now = int(_t.time())
                await self.execute(
                    "INSERT INTO boss_state (boss_id, current_hp, max_hp, ends_at, status) "
                    "VALUES ('pocyk', 10000000, 10000000, ?, 'active')",
                    (now + 7 * 86400,))
                print("✅ Босс Опасный Поцык инициализирован")
        except Exception as e:
            print(f"⚠️ boss init: {e}")

    async def fetchone(self, q, p=()):
        async with self.conn.execute(q, p) as cur:
            r = await cur.fetchone()
            return dict(r) if r else None

    async def fetchall(self, q, p=()):
        async with self.conn.execute(q, p) as cur:
            return [dict(r) for r in await cur.fetchall()]

    async def execute(self, q, p=()):
        async with self.conn.execute(q, p) as cur:
            await self.conn.commit()
            return cur.lastrowid

    async def close(self):
        if self.conn:
            await self.conn.close()


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