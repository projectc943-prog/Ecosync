import sys
import os

# -- Add app directory to path so we can import from app --
# This handles the case where we run from project root (e.g. python3 backend/create_admin.py)
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))

# If running from inside backend/ (e.g. python3 create_admin.py), we also need the parent dir
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import models, database
from app.database import SessionLocal, engine
from app.core import security

def create_initial_admin():
    print("--- Checking Database Initialization ---")
    
    # 1. Ensure Data Directory Exists
    # database.DB_PATH usually points to .../backend/data/iot_system.db
    db_path = database.DB_PATH
    db_dir = os.path.dirname(db_path)
    
    if "sqlite" in str(engine.url) and not os.path.exists(db_dir):
        try:
            os.makedirs(db_dir)
            print(f"✅ Created data directory: {db_dir}")
        except Exception as e:
            print(f"⚠️ Could not create directory (might already exist or permission error): {e}")

    # 2. Create Tables (Idempotent)
    try:
        models.Base.metadata.create_all(bind=engine)
        print("✅ Database Tables Verified/Created")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return

    # 3. Create Admin User
    db = SessionLocal()
    try:
        admin_email = "gitams4@gmail.com"
        existing_user = db.query(models.User).filter(models.User.email == admin_email).first()
        
        if existing_user:
            print(f"ℹ️ Admin user {admin_email} already exists.")
            # Ensure they are PRO
            if existing_user.plan != "pro":
                existing_user.plan = "pro"
                db.commit()
                print("   -> Upgraded existing admin to PRO plan.")
        else:
            print(f"➕ Creating new admin user: {admin_email}")
            admin_user = models.User(
                email=admin_email,
                hashed_password=security.get_password_hash("admin123"),
                first_name="Admin",
                last_name="User",
                plan="pro",
                mobile="0000000000",
                location_name="Hyderabad, India",
                location_lat=17.3850,
                location_lon=78.4867,
                is_active=True,
                is_verified=True
            )
            db.add(admin_user)
            db.commit()
            print("✅ Admin user created successfully.")
            print("   Email: gitams4@gmail.com")
            print("   Pass : admin123")
            
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_initial_admin()
