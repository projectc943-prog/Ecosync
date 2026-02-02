import requests
import json
import time

API_URL = "http://localhost:8009/iot/data"

def test_alerts():
    print("🚀 Sending test payloads to trigger alerts...")
    
    # 1. Trigger Gas, Rain, and Motion
    payload = {
        "temperature": 25.0,
        "humidity": 50.0,
        "pm25": 10.0,
        "pressure": 1013.0,
        "mq_raw": 1500.0, # High gas
        "gas": 800.0,    # Explicit gas above 600
        "wind_speed": 5.0,
        "rain": 500.0,   # Rain detected (< 2000)
        "motion": 1,     # Motion detected
        "user_email": "gitams4@gmail.com"
    }
    
    try:
        response = requests.post(API_URL, json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_alerts()
