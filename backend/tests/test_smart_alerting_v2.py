import requests
import json
import random
import time

BASE_URL = "http://localhost:8009"

def test_smart_alerting():
    print("🚀 Testing Smart Alerting & AI Insights...")
    
    # 1. Normal Data (Trust Score should be high)
    payload_normal = {
        "temperature": 25.0,
        "humidity": 50.0,
        "pm25": 10.0,
        "pressure": 1013.0,
        "mq_raw": 200.0,
        "gas": 200.0,
        "ph": 7.0,
        "user_email": "test@example.com"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/iot/data", json=payload_normal)
        print(f"\n📡 Sending Normal Data: {response.status_code}")
        # We can't see the internal trust score processing from the POST response directly 
        # unless we modify main.py to return it, OR we check the logs/websocket.
        # But wait, main.py sends it in WebSocket.
        # However, for this test, we might check the database or just rely on status 200.
        # Actually, let's fetch the latest data to verify persistence.
        
        time.sleep(1)
        latest = requests.get(f"{BASE_URL}/api/filtered/latest").json()
        print("🔍 Latest Data Verification:")
        # Note: /api/filtered/latest might not expose the new fields yet unless updated.
        # Let's check what it returns.
        print(json.dumps(latest, indent=2))
        
    except Exception as e:
        print(f"❌ Error: {e}")

    # 2. Critical/Anomaly Data
    payload_critical = {
        "temperature": 95.0, # Too high
        "humidity": 10.0,
        "pm25": 300.0,
        "pressure": 1013.0,
        "mq_raw": 200.0,
        "gas": 2000.0, # High gas
        "ph": 1.5, # Acidic
        "user_email": "test@example.com"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/iot/data", json=payload_critical)
        print(f"\n📡 Sending Critical Data: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_smart_alerting()
