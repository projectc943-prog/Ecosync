"""Check alert settings and recent sensor data"""
import os
os.environ["DATABASE_URL"] = "sqlite:///./iot_system.db"

from app.database import SessionLocal
from app.models import AlertSettings, SensorData, Alert
from datetime import datetime, timedelta

db = SessionLocal()

print("=" * 60)
print("ALERT SETTINGS")
print("=" * 60)
settings = db.query(AlertSettings).all()
for s in settings:
    print(f"Email: {s.user_email}")
    print(f"  Temp Threshold: {s.temp_threshold}°C")
    print(f"  Humidity: {s.humidity_min}% - {s.humidity_max}%")
    print(f"  PM2.5 Threshold: {s.pm25_threshold}")
    print(f"  Wind Threshold: {s.wind_threshold} km/h")
    print(f"  Active: {s.is_active}")
    print()

print("=" * 60)
print("RECENT SENSOR DATA (Last 5 readings)")
print("=" * 60)
recent = db.query(SensorData).order_by(SensorData.timestamp.desc()).limit(5).all()
for r in recent:
    print(f"Time: {r.timestamp}")
    print(f"  Device: {r.device_id}")
    print(f"  Temperature: {r.temperature}°C")
    print(f"  Humidity: {r.humidity}%")
    print(f"  PM2.5: {r.pm2_5}")
    print()

print("=" * 60)
print("RECENT ALERTS (Last 5)")
print("=" * 60)
alerts = db.query(Alert).order_by(Alert.timestamp.desc()).limit(5).all()
if alerts:
    for a in alerts:
        print(f"Time: {a.timestamp}")
        print(f"  Message: {a.message}")
        print(f"  Recipient: {a.recipient_email}")
        print(f"  Email Sent: {a.email_sent}")
        print()
else:
    print("No alerts found in database")

db.close()
