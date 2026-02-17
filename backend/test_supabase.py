import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load from .env.local if .env is missing or has sqlite
if os.path.exists(".env.local"):
    load_dotenv(".env.local", override=True)

# Supavisor IPv4 test (Singapore Pooler)
DATABASE_URL = "postgresql://postgres.moulkspffuxigvwlflho:7Ppc6dkM1Ob98LHZ@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

print(f"Testing Supavisor IPv4 connection to Supabase (Singapore)...")

try:
    # Supabase often needs sslmode=require
    if "sslmode" not in DATABASE_URL:
        if "?" in DATABASE_URL:
            DATABASE_URL += "&sslmode=require"
        else:
            DATABASE_URL += "?sslmode=require"
    
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT current_database();"))
        db_name = result.scalar()
        print(f"SUCCESS: Connected to database: {db_name}")
        
        result = connection.execute(text("SELECT version();"))
        version = result.scalar()
        print(f"PostgreSQL Version: {version}")
        
except Exception as e:
    print(f"ERROR: Connection failed: {e}")
    import traceback
    traceback.print_exc()
