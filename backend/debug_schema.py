from app.database import engine, Base
from app import models
import logging

# Configure logging to see SQLAlchemy output
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

def debug_tables():
    print("DEBUG: Importing models...")
    # Ensure SafetyLog is imported
    try:
        from app.models import SafetyLog
        print("✅ Successfully imported SafetyLog class.")
    except ImportError:
        print("❌ Could NOT import SafetyLog class from app.models")

    print(f"DEBUG: Registered tables in Base.metadata: {list(Base.metadata.tables.keys())}")
    
    if "safety_logs" in Base.metadata.tables:
        print("✅ 'safety_logs' is registered in metadata. Attempting to create...")
        Base.metadata.create_all(bind=engine)
        print("DEBUG: create_all finished.")
    else:
        print("❌ 'safety_logs' is NOT registered in metadata. Check models.py definitions.")

if __name__ == "__main__":
    debug_tables()
