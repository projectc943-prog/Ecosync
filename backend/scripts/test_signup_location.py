import requests
import sys

BASE_URL = "http://localhost:8001"

def test_registration():
    email = "loc_check_01@ecosync.io"
    payload = {
        "email": email,
        "password": "ValidPass123!",
        "first_name": "Test",
        "last_name": "Location",
        "plan": "lite",
        "location_name": "TestCity",
        "location_lat": 12.9716,
        "location_lon": 77.5946
    }
    
    print(f"Sending Registration: {payload}")
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("SUCCESS: Registration API accepted the payload.")
        elif "User already exists" in response.text:
            print("USER EXISTS: Try a different email if needed.")
        else:
            print("FAILURE: API rejected the payload.")
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_registration()
