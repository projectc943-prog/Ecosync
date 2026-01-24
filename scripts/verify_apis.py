import requests
import os
from dotenv import load_dotenv

load_dotenv()

def test_api(name, url, params=None, headers=None):
    print(f"Testing {name}...", end=" ")
    try:
        response = requests.get(url, params=params, headers=headers, timeout=5)
        if response.status_code == 200:
            print("✅ OK")
            return True
        else:
            print(f"❌ Failed ({response.status_code})")
            print(response.text[:100])
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

print("--- Checking External APIs ---")

# 1. OpenMeteo (Weather)
test_api("OpenMeteo (Weather)", "https://api.open-meteo.com/v1/forecast", 
         params={"latitude": 17.385, "longitude": 78.486, "current_weather": "true"})

# 2. OpenMeteo (Air Quality)
test_api("OpenMeteo (AQI)", "https://air-quality-api.open-meteo.com/v1/air-quality",
         params={"latitude": 17.385, "longitude": 78.486, "hourly": "pm2_5"})

# 3. WAQI (Public Token Demo)
test_api("WAQI (Demo Token)", "https://api.waqi.info/feed/here/", 
         params={"token": "demo"})

# 4. Google Gemini (If Key Exists)
key = os.getenv("GEMINI_API_KEY")
if key:
    print(f"Testing Gemini API (Key: {key[:5]}...)...", end=" ")
    # Simple list models check
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={key}"
    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            print("✅ OK")
        else:
            print(f"❌ Failed ({resp.status_code})")
    except Exception as e:
        print(f"❌ Error: {e}")
else:
    print("Testing Gemini API... ⚠️ Skipped (No GEMINI_API_KEY in .env)")

print("\n--- Done ---")
