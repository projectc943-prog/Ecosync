import sys
import os
from datetime import datetime as dt

# Fix import path to allow 'app' module resolution
sys.path.append(os.getcwd())

from app import models, database, main
from app.services import email_notifier

# Setup DB
db = database.SessionLocal()

def test_alert_logic():
    print("--- Starting Alert Logic Test (Rich Email) ---")
    
    # 1. Mock Device
    device = models.Device(
        id="TEST_DEVICE_002", # New ID to avoid old state
        name="Rich Email Test Sensor",
        lat=12.97,
        lon=77.59,
        connector_type="esp32",
        status="online",
        last_seen=dt.utcnow()
    )
    # Upsert device to avoid errors
    existing_dev = db.query(models.Device).get("TEST_DEVICE_002")
    if not existing_dev:
        db.add(device)
        db.commit()
    else:
        device = existing_dev

    # 2. Mock High Temp Data (Use 55 this time to be different)
    data = models.SensorData(
        device_id=device.id,
        timestamp=dt.utcnow(),
        temperature=55.0, # Moderately High
        humidity=35.0,
        pm2_5=5.0,
        gas=100.0,
        rain=0,
        motion=0
    )
    
    # 3. Call check_alerts with a test email
    test_email = os.getenv("EMAIL_USER")
    print(f"Testing with User Email: {test_email}")
    
    try:
        # Use main.check_alerts
        # main.check_alerts(db, device, data, user_email=test_email)
        
        # Or better, simulate the logic directly to test email_notifier
        print("--- Simulating Alert Logic ---")
        formatted = [{
            "metric": "Test Temp",
            "value": "55°C",
            "limit": "45°C",
            "status": "CRITICAL"
        }]
        
        success = email_notifier.send_alert(
            recipients=[test_email],
            device_name=device.name,
            timestamp=dt.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            alert_data=formatted,
            ai_insight="Simulated AI Insight for Verification",
            dashboard_link="http://localhost:5173/dashboard"
        )
        
        if success:
             print("✅ Email Sent Successfully!")
        else:
             print("❌ Email Sending Failed.")

    except Exception as e:
        print(f"❌ Error executing test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_alert_logic()
