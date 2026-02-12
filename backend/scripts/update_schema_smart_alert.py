import sqlite3
import os

# Set database path
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "iot_system.db")

def add_column_if_not_exists(cursor, table_name, column_name, column_type):
    try:
        cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}")
        print(f"✅ Added column '{column_name}' to '{table_name}'")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print(f"ℹ️  Column '{column_name}' already exists in '{table_name}'")
        else:
            print(f"❌ Error adding '{column_name}': {e}")

def update_schema():
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at {DB_PATH}")
        return

    print(f"Opening database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Add new columns to sensor_data
    add_column_if_not_exists(cursor, "sensor_data", "ph", "FLOAT")
    add_column_if_not_exists(cursor, "sensor_data", "trust_score", "FLOAT")
    add_column_if_not_exists(cursor, "sensor_data", "anomaly_label", "VARCHAR")
    add_column_if_not_exists(cursor, "sensor_data", "smart_insight", "TEXT")

    conn.commit()
    conn.close()
    print("\nSchema update complete.")

if __name__ == "__main__":
    update_schema()
