import requests

try:
    print("Testing CORS OPTIONS request...")
    response = requests.options(
        "http://127.0.0.1:8000/iot/data",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type"
        }
    )
    print(f"Status Code: {response.status_code}")
    print("Headers:")
    for k, v in response.headers.items():
        if "Access-Control" in k:
            print(f"{k}: {v}")
            
    if "access-control-allow-origin" in response.headers:
        print("✅ CORS Headers Present")
    else:
        print("❌ CORS Headers MISSING")

except Exception as e:
    print(f"❌ Error: {e}")
