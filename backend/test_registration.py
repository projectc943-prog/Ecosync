import requests
import json

url = "http://127.0.0.1:8009/auth/register"
payload = {
    "email": "testuser_validation@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "Validation",
    "plan": "lite",
    "location_name": "Test Location",
    "location_lat": 0,
    "location_lon": 0
}
headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
