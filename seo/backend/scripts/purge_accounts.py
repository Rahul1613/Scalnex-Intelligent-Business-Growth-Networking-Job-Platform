import sqlite3
from pathlib import Path

db_path = Path(__file__).resolve().parents[1] / 'instance' / 'seo.db'
conn = sqlite3.connect(str(db_path))
cur = conn.cursor()

# Disable foreign key checks for delete ordering safety
cur.execute('PRAGMA foreign_keys = OFF')

# Delete in dependency-safe order
for table in (
    'application',
    'job_listing',
    'business_profile',
    'audit_log',
    'company',
    'user'
):
    try:
        cur.execute(f'DELETE FROM {table}')
    except Exception as e:
        print(f'Warning: failed to purge {table}: {e}')

conn.commit()
cur.execute('PRAGMA foreign_keys = ON')
conn.close()
print('Purged user/company accounts and related tables.')
