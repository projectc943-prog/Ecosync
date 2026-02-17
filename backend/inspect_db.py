from app import models, database
from sqlalchemy.orm import Session

db = database.SessionLocal()
try:
    print("--- DB CHECK ---")
    dev = db.query(models.Device).filter(models.Device.id == "ESP32_MAIN").first()
    if dev:
        print(f"DEVICE FOUND: {dev.id}")
        count = db.query(models.SensorData).filter(models.SensorData.device_id == "ESP32_MAIN").count()
        print(f"READINGS COUNT: {count}")
        last = db.query(models.SensorData).filter(models.SensorData.device_id == "ESP32_MAIN").order_by(models.SensorData.timestamp.desc()).first()
        if last:
            print(f"LATEST: {last.timestamp} Temp:{last.temperature}")
    else:
        print("DEVICE NOT FOUND: ESP32_MAIN")
        
    print("--- ALL DEVICES ---")
    devices = db.query(models.Device).all()
    for d in devices:
        print(f" - {d.id}")
        
    print("--- ALL USERS ---")
    users = db.query(models.User).all()
    for u in users:
        print(f" - {u.email} (Verified: {u.is_verified})")

finally:
    db.close()
