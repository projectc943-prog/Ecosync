from app.database import engine
from sqlalchemy import text

def fix_schema():
    print("--- FIXING SUPABASE SCHEMA ---")
    with engine.connect() as conn:
        try:
            # 1. Add date column to safety_logs
            print("Adding 'date' column to safety_logs...")
            conn.execute(text("ALTER TABLE safety_logs ADD COLUMN IF NOT EXISTS date VARCHAR NOT NULL DEFAULT '2026-02-17'"))
            
            # 3. Add missing columns to devices
            print("Adding missing columns to devices...")
            conn.execute(text("ALTER TABLE devices ADD COLUMN IF NOT EXISTS user_id INTEGER"))
            conn.execute(text("ALTER TABLE devices ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP"))
            
            # 4. Add missing columns to users
            print("Adding missing columns to users...")
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile VARCHAR"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_secret VARCHAR"))
            
            conn.commit()
            print("✅ Schema fixes applied successfully!")
        except Exception as e:
            print(f"❌ Error applying schema fixes: {e}")

if __name__ == "__main__":
    fix_schema()
