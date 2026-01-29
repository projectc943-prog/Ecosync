import sys
import os
import requests
import json
import random

def trigger_alert():
    url = "http://localhost:8000/iot/data"
    
    # Payload that exceeds the default temp threshold (usually 45.0)
    payload = {
        "temperature": 55.5,
        "humidity": 40.0,
        "pm25": 10.0,
        "pressure": 1013.0,
        "mq_raw": 200.0
    }
    
    try:
        print(f"Sending critical data to {url}...")
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            print("Success! Data sent.")
            print("Response:", response.json())
            print("\nCheck the backend logs for 'Email Alert sent to...' messages.")
        else:
            print(f"Failed. Status: {response.status_code}")
            print("Response:", response.text)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    trigger_alert()
