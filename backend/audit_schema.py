from sqlalchemy import create_engine, inspect
import os
from dotenv import load_dotenv

# Load from .env.local
if os.path.exists(".env.local"):
    load_dotenv(".env.local", override=True)
else:
    load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set.")
    exit(1)

try:
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)
    
    if "sensor_data" in inspector.get_table_names():
        columns = inspector.get_columns("sensor_data")
        print("\nColumns in 'sensor_data':")
        for col in columns:
            print(f"- {col['name']} ({col['type']})")
    else:
        print("\n'sensor_data' table not found.")

except Exception as e:
    print(f"ERROR: {e}")
