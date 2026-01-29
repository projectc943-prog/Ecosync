import sys
import os

# Add parent to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.database import SessionLocal
    from app.models import User
    print("Imports successful")
    
    db = SessionLocal()
    print("Session created")
    
    user = db.query(User).first()
    print("Query successful")
    if user:
        print(f"User: {user.email}")
        try:
             # Check if location_name works
             print(f"Location: {user.location_name}")
             # Check if accessing deleted columns crashes (it shouldn't if model is updated)
             try:
                 print(f"Lat: {user.location_lat}")
             except AttributeError:
                 print("Lat attribute correctly missing")
        except Exception as e:
            print(f"Access error: {e}")
            
    db.close()
    print("Session closed")
    
except Exception as e:
    import traceback
    print(f"CRASH: {e}")
    traceback.print_exc()
