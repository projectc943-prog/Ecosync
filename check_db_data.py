
import os
import sqlalchemy
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

dotenv_path = os.path.join('backend', '.env.local')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path=dotenv_path)
    print(f"Loaded {dotenv_path}")
else:
    print(f"{dotenv_path} not found")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found in environment")
    exit(1)

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 5"))
        columns = result.keys()
        rows = result.fetchall()
        print("Recent rows in sensor_data:")
        for row in rows:
            print(dict(zip(columns, row)))
except Exception as e:
    print(f"Error: {e}")
