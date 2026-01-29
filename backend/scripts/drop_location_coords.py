import sys
import os
from sqlalchemy import text

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal

def drop_columns():
    db = SessionLocal()
    try:
        # Check if columns exist before dropping to avoid errors? 
        # PostgreSQL ALLOWS 'DROP COLUMN IF EXISTS'
        sql = text("ALTER TABLE users DROP COLUMN IF EXISTS location_lat, DROP COLUMN IF EXISTS location_lon;")
        db.execute(sql)
        db.commit()
        print("SUCCESS: Dropped location_lat and location_lon columns.")
    except Exception as e:
        print(f"ERROR: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    drop_columns()
