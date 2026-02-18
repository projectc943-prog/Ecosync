
import requests
import json
import time

BASE_URL = "http://localhost:8000"
TEST_USER = "skunthal@gitam.in"

def test_alert_trigger():
    print(f"🚀 Testing Alert Trigger for {TEST_USER}...")
    
    # 1. Payload with Breach Condition (Temp: 28.5, Threshold is 21)
    payload = {
        "temperature": 28.5,
        "humidity": 55.0,
        "pm25": 10.0,
        "mq_raw": 600.0,
        "pressure": 1013.0,
        "user_email": "ESP32_GLOBAL_STREAM", # Using a generic sender to test global alert
        "lat": 12.9716,
        "lon": 77.5946
    }
    
    try:
        response = requests.post(f"{BASE_URL}/iot/data", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Data Ingested successfully. Check backend logs for SMTP output.")
        else:
            print("❌ Failed to ingest data.")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_alert_trigger()
