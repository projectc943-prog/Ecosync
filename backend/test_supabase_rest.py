
import requests
import json
import os
from datetime import datetime

# Direct Configuration (Avoiding dotenv issues for quick test)
SUPABASE_URL = "https://moulkspffuxigvwlflho.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdWxrc3BmZnV4aWd2d2xmbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNzYwNTQsImV4cCI6MjA4NDg1MjA1NH0.gs_VoewGR9cLLQTI4llcwtSk7SDrO0PAFByzUZTv8yI"

def test_supabase_connection():
    print(f"--- TESTING SUPABASE CONNECTION ---")
    print(f"URL: {SUPABASE_URL}")
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    # 1. Test SELECT (READ)
    print("\n1. Testing READ access on 'sensor_readings'...")
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/sensor_readings?select=*&limit=1",
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] READ SUCCESS! Found {len(data)} records.")
            if data:
                print(f"Sample Record: {data[0]}")
        else:
            print(f"[ERROR] READ FAILED: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"[ERROR] READ ERROR: {e}")

    # 2. Test INSERT (WRITE)
    print("\n2. Testing WRITE access on 'sensor_readings'...")
    payload = {
        "device_id": "BACKEND_TEST_SCRIPT",
        "created_at": datetime.utcnow().isoformat(),
        "temperature": 25.5,
        "raw_temperature": 25.0,
        "humidity": 60.0,
        "raw_humidity": 60.0,
        "gas": 100,
        "raw_gas": 100,
        "motion": 1,
        "raw_motion": 1
    }
    
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/sensor_readings",
            headers=headers,
            json=payload
        )
        
        if response.status_code == 201:
            data = response.json()
            print(f"[OK] WRITE SUCCESS! Inserted record.")
            print(f"Response: {data}")
        else:
            print(f"[ERROR] WRITE FAILED: {response.status_code} - {response.text}")
            
            # Diagnostic for 404/403
            if response.status_code == 404:
                print("Make sure the table 'sensor_readings' exists and is exposed in API settings.")
            if response.status_code == 403: # RLS
                 print("Likely RLS blocking. Check Policies for 'anon' role.")
                 
    except Exception as e:
        print(f"[ERROR] WRITE ERROR: {e}")

if __name__ == "__main__":
    test_supabase_connection()
