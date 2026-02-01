import sqlite3
conn = sqlite3.connect('backend/iot_system.db')
cursor = conn.cursor()

def add_col(name, type):
    try:
        cursor.execute(f"ALTER TABLE users ADD COLUMN {name} {type}")
        print(f"Added {name}")
    except Exception as e:
        print(f"Error adding {name}: {e}")

add_col("created_at", "DATETIME")
add_col("updated_at", "DATETIME")

conn.commit()
conn.close()
