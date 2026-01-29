import sys
import os

# Add parent directory to path to import app modules
start_dir = os.path.dirname(os.path.abspath(__file__)) # backend/scripts
backend_dir = os.path.dirname(start_dir) # backend
sys.path.append(backend_dir)

from app import models, database
from app.database import SessionLocal, engine

# Create tables if not exist (though they should)
models.Base.metadata.create_all(bind=engine)

def seed_users():
    db = SessionLocal()
    try:
        users = [
            {"email": "test_user_1@example.com", "first_name": "Test", "last_name": "One"},
            {"email": "test_user_2@example.com", "first_name": "Test", "last_name": "Two"},
        ]
        
        for u_data in users:
            existing = db.query(models.User).filter(models.User.email == u_data["email"]).first()
            if not existing:
                user = models.User(
                    email=u_data["email"],
                    first_name=u_data["first_name"],
                    last_name=u_data["last_name"],
                    hashed_password="dummy_password", # Not needed for alerts
                    is_active=True
                )
                db.add(user)
                print(f"Created user: {u_data['email']}")
            else:
                print(f"User already exists: {u_data['email']}")
        
        db.commit()
    except Exception as e:
        print(f"Error seeding users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_users()
