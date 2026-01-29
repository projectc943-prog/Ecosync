import sys
import os

# Ensure we can import from app
start_dir = os.path.dirname(os.path.abspath(__file__)) # this script is in backend/scripts/
backend_dir = os.path.dirname(start_dir) # backend/
sys.path.append(backend_dir)

from app import models, database
from sqlalchemy.orm import Session

def list_users():
    db = database.SessionLocal()
    try:
        users = db.query(models.User).all()
        print(f"\n--- DATABASE USERS ({len(users)}) ---")
        print(f"{'ID':<5} | {'Email':<30} | {'Name':<20} | {'Active'}")
        print("-" * 70)
        for user in users:
            name = f"{user.first_name} {user.last_name}"
            active = "Yes" if user.is_active else "No"
            print(f"{user.id:<5} | {user.email:<30} | {name:<20} | {active}")
        print("-" * 70)
        
        # Verify location of DB file
        print(f"\nDatabase File: {database.SQLALCHEMY_DATABASE_URL}")
        
    except Exception as e:
        print(f"Error querying database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    list_users()
