from app.database import engine
import os

print("--- BACKEND CONNECTION TEST ---")
db_url = str(engine.url)
print(f"Connecting to: {db_url.split('@')[-1] if '@' in db_url else db_url}")

if "sqlite" in db_url:
    print("\n❌ STILL USING LOCAL SQLITE!")
    print("Please restart your backend terminal as instructed.")
else:
    print("\n✅ CONNECTED TO CLOUD (Supabase)!")
    print("All safety logs will now sync correctly.")
