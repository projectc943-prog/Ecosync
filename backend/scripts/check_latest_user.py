import sys
import os

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import User

def check_latest_user():
    db = SessionLocal()
    try:
        user = db.query(User).order_by(User.id.desc()).first()
        if user:
            print(f"Latest User ID: {user.id}")
            print(f"Email: {user.email}")
            print(f"First Name: {user.first_name}")
            print(f"Last Name: {user.last_name}")
            print(f"Location Name: {user.location_name}")
            print(f"Lat: {user.location_lat}, Lon: {user.location_lon}")
        else:
            print("No users found.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_latest_user()
