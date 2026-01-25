import requests
import json

api_key = "rnd_SHFNuVixpvhjiFuz52LQAfXsRzxZ"
url = "https://api.render.com/v1/services"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Accept": "application/json"
}

try:
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        services = response.json()
        print(f"Found {len(services)} services:")
        for s in services:
             # Handle list or dict response structure
             if isinstance(s, dict) and 'service' in s:
                 svc = s['service']
                 print(f"ID: {svc['id']} | Name: {svc['name']} | Repo: {svc.get('repo', 'N/A')}")
             elif isinstance(s, dict):
                 print(f"ID: {s.get('id')} | Name: {s.get('name')} | Slug: {s.get('slug')}")
             else:
                 print(f"Unknown Item format: {s}")
    else:
        print(f"Error: {response.status_code} - {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
