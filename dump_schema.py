import sqlite3

conn = sqlite3.connect('backend/iot_system.db')
cursor = conn.cursor()
cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'")
schema = cursor.fetchone()
print(schema[0] if schema else "Table not found")
conn.close()
