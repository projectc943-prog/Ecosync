import os
from sqlalchemy import create_engine, text

def test_url(url, distinct_name):
    print(f"--- Testing {distinct_name} ---")
    try:
        engine = create_engine(url, connect_args={'connect_timeout': 5})
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            print("SUCCESS!")
            print(f"Version: {result.fetchone()[0]}")
            return True
    except Exception as e:
        print("FAILED.")
        print(f"Error: {e}") # Enable noise
        import traceback
        traceback.print_exc()
        return False

def run_tests():
    # Base params
    host = "db.riqxvzjfcxrnslxgixgp.supabase.co"
    port = "5432"
    user = "postgres"
    dbname = "postgres"
    
    # Variants
    passwords = [
        ("s4finalyearproject", "Provided Password")
    ]

    success = False
    for pwd, name in passwords:
        url = f"postgresql://{user}:{pwd}@{host}:{port}/{dbname}"
        if test_url(url, name):
            print(f"\n✅ CORRECT PASSWORD FORMAT FOUND: {name}")
            print(f"Use this in .env: {url}")
            success = True
            break
    
    if not success:
        print("\n❌ All variants failed. Please ask user to verify password.")

if __name__ == "__main__":
    run_tests()
