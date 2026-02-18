import requests
import json

try:
    print("Sending request to http://localhost:8000/api/filtered/latest...")
    response = requests.get('http://localhost:8000/api/filtered/latest', timeout=5)
    print(f"Status Code: {response.status_code}")
    print(f"Raw Text: {response.text[:500]}")
    
    data = response.json()
    print("Full Response JSON:", json.dumps(data, indent=2))
    
    smart = data.get('smart_metrics', {})
    print(f"\nTrust Score: {smart.get('trust_score')}")
    
except Exception as e:
    print(f"Error: {e}")
