import requests
import time
import random
import sys

BASE_URL = "http://localhost:8009"

def send_data(temp, humidity, gas, ph, scenario_name):
    payload = {
        "temperature": temp,
        "humidity": humidity,
        "pressure": 1013.0,
        "wind_speed": 5.0,
        "pm25": 12.0,
        "pm10": 0.0,
        "mq_raw": gas,
        "gas": gas,
        "rain": 4095,
        "motion": 0,
        "ph": ph,
        "user_email": "demo@ecosync.com",
        "lat": 17.3850,
        "lon": 78.4867
    }
    
    try:
        response = requests.post(f"{BASE_URL}/iot/data", json=payload)
        if response.status_code == 200:
            data = response.json()
            print(f"\n--- SCENARIO: {scenario_name} ---")
            print(f"Sent: Temp={temp}°C, pH={ph}, Gas={gas}")
            print(f"Response: Trust Score={data.get('trust_score')}, Anomaly={data.get('anomaly_label')}")
            print(f"Insight: {data.get('smart_insight')}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection Failed: {e}")

def run_demo():
    print("🚀 Starting Smart Alert Demo...")
    print("Keep your browser dashboard OPEN at http://localhost:5173")
    print("Press Ctrl+C to stop.\n")

    scenarios = [
        ("Normal Operation", 25.0, 45.0, 200, 7.0),
        ("Normal Operation", 26.0, 46.0, 210, 7.1),
        ("🔥 HIGH TEMP ALERT", 55.0, 30.0, 250, 6.8),
        ("🔥 HIGH TEMP ALERT", 60.0, 25.0, 300, 6.5),
        ("🧪 ACIDIC pH ALERT", 28.0, 40.0, 220, 4.5),
        ("🧪 ACIDIC pH ALERT", 27.0, 42.0, 230, 3.0),
        ("☠️ GAS LEAK ALERT", 30.0, 50.0, 2000, 7.0),
        ("☠️ GAS LEAK ALERT", 32.0, 48.0, 2500, 7.2),
        ("📉 TRUST SCORE DROP (Physics Violation)", 200.0, 45.0, 200, 7.0),
    ]

    while True:
        for name, t, h, g, p in scenarios:
            send_data(t, h, g, p, name)
            time.sleep(3) # Wait 3 seconds between updates

if __name__ == "__main__":
    try:
        run_demo()
    except KeyboardInterrupt:
        print("\nDemo stopped.")
