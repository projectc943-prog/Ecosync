import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_verify():
    # 1. Get Today's Logs
    print("Fetching today's logs...")
    res = requests.get(f"{BASE_URL}/api/compliance/logs")
    if res.status_code != 200:
        print(f"Failed to fetch logs: {res.status_code}")
        return

    logs = res.json()
    if not logs:
        print("No logs found for today.")
        return

    target_task = logs[0]
    task_id = target_task['id']
    current_status = target_task['status']
    print(f"Target Task ID: {task_id}, Status: {current_status}")

    # 2. Toggle Status
    print(f"Toggling task {task_id}...")
    payload = {
        "task_id": task_id,
        "verifier_name": "Test Script"
    }
    res = requests.post(f"{BASE_URL}/api/compliance/verify", json=payload)
    
    if res.status_code == 200:
        print("Toggle successful!")
        print(res.json())
        
        # 3. Verify Change
        res = requests.get(f"{BASE_URL}/api/compliance/logs")
        updated_logs = res.json()
        updated_task = next(t for t in updated_logs if t['id'] == task_id)
        print(f"New Status: {updated_task['status']}")
        
        if updated_task['status'] != current_status:
            print("VERIFICATION PASSED: Status changed.")
        else:
            print("VERIFICATION FAILED: Status did not change.")
            
    else:
        print(f"Toggle failed: {res.status_code}")
        print(res.text)

if __name__ == "__main__":
    test_verify()
