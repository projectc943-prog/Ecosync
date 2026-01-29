import requests
import json

def test_register():
    url = "http://localhost:8001/auth/register"
    payload = {
        "email": "test_script_py_1@example.com",
        "password": "password123",
        "first_name": "TestPy",
        "last_name": "User",
        "plan": "lite",
        "location_name": "Python City"
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_register()
