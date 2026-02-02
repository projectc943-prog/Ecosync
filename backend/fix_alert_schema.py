import sqlite3
import os

db_path = "c:/Users/sreek/OneDrive/Desktop/IOT_PROJECT/Ecosync/backend/iot_system.db"

def migrate():
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    columns_to_add = [
        ("gas_threshold", "REAL DEFAULT 600.0"),
        ("rain_alert", "INTEGER DEFAULT 1"), # SQLite doesn't have Boolean, use Integer
        ("motion_alert", "INTEGER DEFAULT 1")
    ]

    for col_name, col_type in columns_to_add:
        try:
            print(f"Attempting to add {col_name}...")
            cursor.execute(f"ALTER TABLE alert_settings ADD COLUMN {col_name} {col_type}")
            print(f"✅ Added {col_name}")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"ℹ️ Column {col_name} already exists.")
            else:
                print(f"❌ Error adding {col_name}: {e}")

    conn.commit()
    conn.close()
    print("🚀 Migration complete!")

if __name__ == "__main__":
    migrate()
