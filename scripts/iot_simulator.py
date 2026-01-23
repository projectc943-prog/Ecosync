import time
import random
import requests
import json
from datetime import datetime

# CONFIGURATION
BACKEND_URL = "http://localhost:8000" # Local dev
# BACKEND_URL = "https://capstone-backend-djdd.onrender.com" # Live Render URL

def generate_fake_data():
    """Generates realistic sensor data with slight random variations"""
    
    # Base values
    temp_base = 28.0
    hum_base = 45.0
    pm25_base = 12.0
    mq_base = 220.0
    
    # Add noise
    temp = temp_base + random.uniform(-1.5, 1.5)
    hum = hum_base + random.uniform(-5, 5)
    pm25 = pm25_base + random.uniform(-2, 10) # Occasional spikes
    mq = mq_base + random.uniform(-20, 50)
    
    return {
        "temperature": round(temp, 2),
        "humidity": round(hum, 2),
        "pm25": round(pm25, 2),
        "mq_raw": round(mq, 1),
        "pressure": 1013.25
    }

def main():
    print(f"🚀 Starting IoT Simulator targeting: {BACKEND_URL}")
    print("Press CTRL+C to stop.\n")
    
    url = f"{BACKEND_URL}/iot/data"
    
    while True:
        data = generate_fake_data()
        
        try:
            ts = datetime.now().strftime("%H:%M:%S")
            response = requests.post(url, json=data, timeout=5)
            
            if response.status_code == 200:
                print(f"[{ts}] ✅ Sent: Temp={data['temperature']}°C, PM2.5={data['pm25']}")
            else:
                print(f"[{ts}] ❌ Error {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"⚠️ Connection Error: {e}")
            
        time.sleep(2) # Send every 2 seconds

if __name__ == "__main__":
    main()
