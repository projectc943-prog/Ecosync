import os
import sqlalchemy
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load env vars
load_dotenv()

def test_connection():
    # Extract details
    supabase_url = os.getenv("SUPABASE_URL", "")
    supabase_key = os.getenv("SUPABASE_KEY", "") # Suspected password
    
    if not supabase_url or not supabase_key:
        print("Missing SUPABASE_URL or SUPABASE_KEY in .env")
        return

    # Parse Project Ref
    # URL format: https://[PROJECT_REF].supabase.co
    try:
        project_ref = supabase_url.split("https://")[1].split(".")[0]
    except Exception:
        print(f"Could not parse project ref from {supabase_url}")
        return

    # Construct Postgres Connection String
    # postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
    db_url = f"postgresql://postgres:{supabase_key}@db.{project_ref}.supabase.co:5432/postgres"
    
    print(f"Testing connection to: db.{project_ref}.supabase.co...")
    # Mask password in print
    masked_url = db_url.replace(supabase_key, "******")
    print(f"URL: {masked_url}")

    try:
        engine = create_engine(db_url, connect_args={'connect_timeout': 5})
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            print("\nSUCCESS! Connected to Supabase Postgres.")
            print(f"Version: {result.fetchone()[0]}")
            return True
    except Exception as e:
        print("\nCONNECTION FAILED.")
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    if test_connection():
        # Update .env if successful? No, let's just exit 0
        os._exit(0)
    else:
        os._exit(1)
