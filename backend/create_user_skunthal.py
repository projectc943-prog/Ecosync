"""Create user account for skunthal@gitam.in"""
import os
os.environ["DATABASE_URL"] = "sqlite:///./iot_system.db"

from app.database import SessionLocal
from app.models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db = SessionLocal()

# Check if user exists
existing_user = db.query(User).filter(User.email == "skunthal@gitam.in").first()

if existing_user:
    print(f"✅ User already exists: {existing_user.email}")
else:
    # Create new user
    hashed_password = pwd_context.hash("your_password_here")  # Change this!
    
    new_user = User(
        email="skunthal@gitam.in",
        hashed_password=hashed_password,
        is_active=True,
        first_name="Skunthal",
        last_name="User",
        plan="pro",
        is_verified=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    print(f"✅ User created successfully: {new_user.email}")
    print(f"   Password: your_password_here")
    print(f"   Plan: {new_user.plan}")

# List all users
print("\nAll users in database:")
users = db.query(User).all()
for u in users:
    print(f"  - {u.email} (Active: {u.is_active}, Plan: {u.plan})")

db.close()
