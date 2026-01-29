import sys
import os

# Add parent to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.routers import auth
    print(f"Auth Path: {auth.__file__}")
    
    from app import models
    print(f"Models Path: {models.__file__}")
    
    from app import schemas
    print(f"Schemas Path: {schemas.__file__}")
    
except Exception as e:
    print(f"Import Error: {e}")
