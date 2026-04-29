import sqlite3
from pathlib import Path

db_path = Path(__file__).parent / 'instance' / 'seo.db'
conn = sqlite3.connect(str(db_path))
cur = conn.cursor()

cur.execute("PRAGMA foreign_keys=ON")
cols = [row[1] for row in cur.execute("PRAGMA table_info('user')").fetchall()]

# Add missing columns if they don't exist
if 'role' not in cols:
    cur.execute("ALTER TABLE user ADD COLUMN role VARCHAR(20) DEFAULT 'user'")
if 'plan_level' not in cols:
    cur.execute("ALTER TABLE user ADD COLUMN plan_level VARCHAR(20) DEFAULT 'free'")
if 'usage_count' not in cols:
    cur.execute("ALTER TABLE user ADD COLUMN usage_count INTEGER DEFAULT 0")
if 'created_at' not in cols:
    cur.execute("ALTER TABLE user ADD COLUMN created_at TIMESTAMP")

conn.commit()
conn.close()
