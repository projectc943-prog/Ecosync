import os
import requests
import json
from datetime import datetime

# Load from .env manually or just hardcode for this test since we know the values
# Project ID: moulkspffuxigvwlflho
SUPABASE_URL = "https://moulkspffuxigvwlflho.supabase.co"
# Need the ANON KEY. I'll read it from the file or user can provide.
# I will try to read it from the .env file in the script.

def get_anon_key():
    try:
        with open('frontend/.env', 'r') as f:
            for line in f:
                if line.startswith("VITE_SUPABASE_ANON_KEY="):
                    return line.strip().split("=", 1)[1]
    except:
        return None

ANON_KEY = get_anon_key()

def test_insert():
    if not ANON_KEY:
        print("Could not find ANON KEY")
        return

    url = f"{SUPABASE_URL}/rest/v1/sensor_readings"
    headers = {
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    payload = {
        "device_id": "COL_TEST_TRUST",
        "created_at": datetime.utcnow().isoformat(),
        "gas": 123,
        "motion": 1,
        "trust_score": 99.9
    }
    
    print(f"Attempting to insert: {json.dumps(payload)}")
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response Text: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_insert()
