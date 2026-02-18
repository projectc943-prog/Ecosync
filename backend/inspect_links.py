
from app import models, database
import os
from dotenv import load_dotenv

load_dotenv()

db = database.SessionLocal()
email = "skunthal@gitam.in"

try:
    print(f"--- DEVICE & USER LINK CHECK ---")
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        print(f"User: {user.email}, ID: {user.id}")
        devices = db.query(models.Device).filter(models.Device.user_id == user.id).all()
        print(f"Owned Devices: {[d.id for d in devices]}")
    else:
        print(f"User {email} not found")

    print("\n--- ALL DEVICES ---")
    all_devs = db.query(models.Device).all()
    for d in all_devs:
        print(f"ID: {d.id}, UserID: {d.user_id}, Name: {d.name}")

    print("\n--- RECENT READINGS (GLOBAL) ---")
    recent = db.query(models.SensorData).order_by(models.SensorData.timestamp.desc()).limit(5).all()
    for r in recent:
        print(f"TS: {r.timestamp}, Device: {r.device_id}, Temp: {r.temperature}, UserID: {r.user_id}")

finally:
    db.close()
