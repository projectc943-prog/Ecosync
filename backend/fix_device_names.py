import sys
import os

# Add backend to path
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app import models

def fix_device_names():
    db = SessionLocal()
    try:
        devices = db.query(models.Device).all()
        print(f"Found {len(devices)} devices.")
        updated_count = 0
        for device in devices:
            old_name = device.name
            # Simplified rename logic: set everything to "EcoSync Node"
            device.name = "EcoSync Node"
            print(f"Renaming '{old_name}' -> '{device.name}'")
            updated_count += 1
        
        db.commit()
        print(f"Successfully updated {updated_count} devices.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_device_names()
