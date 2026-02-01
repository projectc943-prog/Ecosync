import requests
import json

url = "http://127.0.0.1:8009/auth/register"
payload = {
    "email": "trace_py_v1@example.com",
    "password": "password123",
    "first_name": "TracePy",
    "plan": "lite",
    "location_name": "TestPyLoc"
}
headers = {'Content-Type': 'application/json'}

try:
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
