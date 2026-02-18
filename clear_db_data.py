
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

dotenv_path = os.path.join('backend', '.env.local')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path=dotenv_path)
    print(f"Loaded {dotenv_path}")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found")
    exit(1)

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Clearing sensor_data table...")
    conn.execute(text("DELETE FROM sensor_data"))
    conn.commit()
    print("✅ sensor_data table cleared.")
