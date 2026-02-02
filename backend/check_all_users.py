"""Check all users in database and their locations"""
import os
os.environ["DATABASE_URL"] = "sqlite:///./iot_system.db"

from app.database import SessionLocal
from app.models import User

db = SessionLocal()

users = db.query(User).all()
print(f"Total users in database: {len(users)}\n")
print("="*60)

for i, u in enumerate(users, 1):
    print(f"\n{i}. Email: {u.email}")
    print(f"   Name: {u.first_name} {u.last_name}")
    print(f"   Location: {u.location_name or 'Not set'}")
    print(f"   Coordinates: ({u.location_lat}, {u.location_lon})" if u.location_lat else "   Coordinates: Not set")
    print(f"   Verified: {u.is_verified}")
    print(f"   Plan: {u.plan}")

db.close()
