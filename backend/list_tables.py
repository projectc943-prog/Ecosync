from sqlalchemy import create_engine, inspect
import os
from dotenv import load_dotenv

# Load from .env.local
if os.path.exists(".env.local"):
    load_dotenv(".env.local", override=True)
else:
    load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Checking database: {DATABASE_URL.split('@')[-1] if DATABASE_URL else 'None'}")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set.")
    exit(1)

try:
    # Use port 6543 for IPv4 if not already specified
    if "supabase.co" in DATABASE_URL and ":5432" in DATABASE_URL:
         DATABASE_URL = DATABASE_URL.replace(":5432", ":6543")
         print("Switching to port 6543 for pooler...")

    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    print("\nExisting Tables:")
    for table in tables:
        print(f"- {table}")
        
    if "safety_logs" not in tables:
        print("\n[!] safety_logs table is MISSING.")
    else:
        print("\n[+] safety_logs table exists.")

except Exception as e:
    print(f"ERROR: {e}")
