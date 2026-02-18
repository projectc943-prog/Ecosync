import requests
import json
import time

API_URL = "http://127.0.0.1:8000/iot/data"
EMAIL = "sreekar092004@gmail.com"

# Payload mimicking frontend
payload = {
    "temperature": 55.5,  # High Temp > 45 Default
    "humidity": 40.0,
    "pm25": 10.0,
    "mq_raw": 150.0,
    "rain": 4095,
    "motion": 0,
    "user_email": EMAIL,  # CRITICAL: Passing Email
    "lat": 17.385,
    "lon": 78.486
}

print(f"🚀 Sending Simulated Data to {API_URL}...")
print(f"👤 User: {EMAIL}")
print(f"🌡️ Temp: {payload['temperature']}°C")

try:
    response = requests.post(API_URL, json=payload)
    print(f"Response Status: {response.status_code}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 200:
        print("✅ Data Sent Successfully!")
        print("👉 Check your email now. If you get it, the Backend is fine.")
        print("👉 If you DON'T get it, the Backend Logic is broken.")
    else:
        print("❌ Server Error!")

except Exception as e:
    print(f"❌ Connection Failed: {e}")
