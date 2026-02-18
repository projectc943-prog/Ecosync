
from app import models, database
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

load_dotenv()

db = database.SessionLocal()
email = "skunthal@gitam.in"

try:
    print(f"--- DEBUGGING ALERT FOR {email} ---")
    
    # 1. User Check
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        print(f"USER FOUND: ID:{user.id}, Email:{user.email}")
    else:
        print(f"USER NOT FOUND: {email}")
        
    # 2. Alert Settings Check
    settings = db.query(models.AlertSettings).filter(models.AlertSettings.user_email == email).first()
    if settings:
        print(f"SETTINGS FOUND: Temp Thresh:{settings.temp_threshold}, Active:{settings.is_active}")
    else:
        print(f"SETTINGS NOT FOUND for {email}")
        
    # 3. Device Check
    device_id = email.replace("@", "_").replace(".", "_")
    device_id = f"DASHBOARD_{device_id}"
    device = db.query(models.Device).filter(models.Device.id == device_id).first()
    if device:
        print(f"DEVICE FOUND: ID:{device.id}, Name:{device.name}, Last Seen:{device.last_seen}")
    else:
        # Check if it's using ESP32_MAIN
        device = db.query(models.Device).filter(models.Device.id == "ESP32_MAIN").first()
        if device:
            print(f"DEVICE FOUND (GLOBAL): ID:{device.id}, Name:{device.name}")
        else:
            print(f"NO RELEVANT DEVICE FOUND")

    # 4. Latest Readings
    last = db.query(models.SensorData).filter(
        (models.SensorData.device_id == device_id) | (models.SensorData.device_id == "ESP32_MAIN")
    ).order_by(models.SensorData.timestamp.desc()).first()
    
    if last:
        print(f"LATEST READING: {last.timestamp}, Temp:{last.temperature}, Device:{last.device_id}")
    else:
        print("NO READINGS FOUND")

finally:
    db.close()
