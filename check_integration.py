import requests
import json

# Configuration
SUPABASE_URL = "https://moulkspffuxigvwlflho.supabase.co"
SUPABASE_KEY = "sb_publishable_DmONHvG45TqWxsqia7kRHw_Wo1XWE9Q" # User provided this as Anon Key
BACKEND_URL = "https://capstone-backend-djdd.onrender.com"

def check_supabase():
    print(f"Checking Supabase: {SUPABASE_URL}")
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    try:
        # Try to select from 'users' table
        url = f"{SUPABASE_URL}/rest/v1/users?select=count"
        r = requests.get(url, headers=headers)
        if r.status_code == 200:
            print("✅ Supabase: 'users' table EXISTS and is accessible.")
        elif r.status_code == 404:
            print("❌ Supabase: 'users' table NOT FOUND (404). Schema migration needed.")
        elif r.status_code == 401:
             print(f"❌ Supabase: Unauthorized (401). Check RLS or Keys. Msg: {r.text}")
        else:
            print(f"❌ Supabase: Error {r.status_code}: {r.text}")
    except Exception as e:
        print(f"❌ Supabase: Connection Failed: {e}")

def check_backend():
    print(f"\nChecking Backend: {BACKEND_URL}")
    try:
        # Try root endpoint
        r = requests.get(f"{BACKEND_URL}/")
        if r.status_code == 200:
            print(f"✅ Backend: Online. Response: {r.text[:50]}...")
        else:
            print(f"⚠️ Backend: Responded with {r.status_code}. It might be running but returned error on root.")
    except Exception as e:
        print(f"❌ Backend: Connection Failed: {e}")

if __name__ == "__main__":
    check_supabase()
    check_backend()
