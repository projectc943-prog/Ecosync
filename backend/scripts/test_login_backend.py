import requests

def test_login():
    url = "http://localhost:8001/token"
    # Use the test user we created earlier or try a known one
    # We created 'test_script_py_1@example.com' / 'password123' in step 1001
    payload = {
        "username": "test_script_py_1@example.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(url, data=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()
