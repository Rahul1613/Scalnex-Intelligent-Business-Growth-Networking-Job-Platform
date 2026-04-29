import sqlite3
import os

db_path = 'seo/backend/instance/seo.db'
if not os.path.exists(db_path):
    # Try alternate path
    db_path = 'backend/instance/seo.db'

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    cur.execute("SELECT COUNT(*) FROM user")
    total_users = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM user WHERE role='user'")
    role_users = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM company")
    total_companies = cur.fetchone()[0]
    
    print(f"Total Users: {total_users}")
    print(f"Users with role='user': {role_users}")
    print(f"Total Companies: {total_companies}")
    
    conn.close()
else:
    print(f"Database not found at {db_path}")
