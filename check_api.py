import requests
import time

try:
    resp = requests.get('http://localhost:8009/api/filtered/latest').json()
    print(f"Status: {resp.get('status')}")
    print(f"Message: {resp.get('message')}")
    print(f"Timestamp: {resp.get('timestamp')}")
    print(f"Device ID (implied): {resp.get('message').split('found for ')[-1] if 'found for' in resp.get('message', '') else 'Unknown'}")
except Exception as e:
    print(f"Error: {e}")
