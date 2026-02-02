import sqlite3

conn = sqlite3.connect('backend/iot_system.db')
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(sensor_data)")
columns = cursor.fetchall()
with open('cols.txt', 'w') as f:
    f.write(f"Total columns in sensor_data: {len(columns)}\n")
    for col in columns:
        f.write(f"Column: {col[1]} ({col[2]})\n")
print("Done writing cols.txt")
conn.close()
