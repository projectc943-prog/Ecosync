import sys
import os

# Add parent to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    print("Importing main...")
    from app import main
    print("Main imported.")
    
    print("Importing auth router...")
    from app.routers import auth
    print("Auth router imported.")
    
    print("All imports successful.")
except Exception as e:
    import traceback
    print(f"IMPORT CRASH: {e}")
    traceback.print_exc()
