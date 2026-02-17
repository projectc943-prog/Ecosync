import sqlite3
import os

db_path = "iot_system.db"
if not os.path.exists(db_path):
    print(f"File {db_path} not found.")
    exit(1)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='safety_logs'")
    if not cursor.fetchone():
        print("Table 'safety_logs' does not exist in local SQLite.")
        exit(0)
        
    cursor.execute("SELECT count(*) FROM safety_logs WHERE status='COMPLETED'")
    count = cursor.fetchone()[0]
    print(f"Local SQLite 'COMPLETED' SafetyLog Count: {count}")
    
    cursor.execute("SELECT task_name, status, verified_by FROM safety_logs")
    rows = cursor.fetchall()
    for row in rows:
        print(f"- {row[0]}: {row[1]} (by {row[2]})")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
