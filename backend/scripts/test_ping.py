import requests

def test_ping():
    url = "http://localhost:8001/auth/test-ping"
    try:
        response = requests.get(url)
        print(f"Ping Status: {response.status_code}")
        print(f"Ping Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_ping()
