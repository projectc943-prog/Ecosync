
import requests
import json

url = "http://localhost:8000/iot/data"
payload = {
    "temperature": 28.5,
    "humidity": 65.0,
    "gas": 450.0,
    "user_email": "skunthal@gitam.in"
}

try:
    print(f"Sending POST to {url}...")
    res = requests.post(url, json=payload, timeout=10)
    print(f"Status: {res.status_code}")
    print(f"Body: {res.text[:100]}") # Only first 100 chars
except Exception as e:
    print(f"Error: {e}")
