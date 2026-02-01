import sqlite3

db_path = 'backend/iot_system.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def add_column_if_missing(table, col_name, col_type):
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}")
        print(f"Added {col_name} to {table}")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print(f"{col_name} already exists in {table}")
        else:
            print(f"Error adding {col_name}: {e}")

add_column_if_missing("users", "location_name", "VARCHAR")
add_column_if_missing("users", "location_lat", "FLOAT")
add_column_if_missing("users", "location_lon", "FLOAT")
add_column_if_missing("users", "zip_code", "VARCHAR")

conn.commit()
conn.close()
print("Schema update complete.")
