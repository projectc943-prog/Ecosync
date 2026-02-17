from app.database import engine, Base
from app import models
from sqlalchemy import inspect

def check_and_create_safety_logs():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    if "safety_logs" in tables:
        print("✅ Table 'safety_logs' exists.")
    else:
        print("❌ Table 'safety_logs' MISSING. Creating it now...")
        try:
            models.SafetyLog.__table__.create(bind=engine)
            print("✅ Table 'safety_logs' created successfully.")
        except Exception as e:
            print(f"❌ Failed to create table: {e}")

if __name__ == "__main__":
    check_and_create_safety_logs()
