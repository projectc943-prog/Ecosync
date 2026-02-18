
from app import models, database
from sqlalchemy import inspect
import os
from dotenv import load_dotenv

load_dotenv()

engine = database.engine
inspector = inspect(engine)

print("--- SCHEMA INSPECTION: sensor_data ---")
columns = inspector.get_columns('sensor_data')
for col in columns:
    print(f"Column: {col['name']}, Type: {col['type']}, Nullable: {col['nullable']}")

print("\n--- SCHEMA INSPECTION: alert_settings ---")
columns = inspector.get_columns('alert_settings')
for col in columns:
    print(f"Column: {col['name']}, Type: {col['type']}, Nullable: {col['nullable']}")

db = database.SessionLocal()
try:
    # Try a dry-run insert
    print("\n--- TEST INSERT: sensor_data ---")
    test_reading = models.SensorData(
        device_id="ESP32_MAIN",
        temperature=25.0,
        humidity=50.0,
        mq_raw=100.0,
        gas=100.0,
        pm2_5=10.0
    )
    db.add(test_reading)
    db.commit()
    print("✅ Test insert successful")
    db.delete(test_reading)
    db.commit()
    print("✅ Test cleanup successful")
except Exception as e:
    print(f"❌ Test insert FAILED: {e}")
    db.rollback()
finally:
    db.close()
