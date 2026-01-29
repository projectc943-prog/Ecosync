import sys
import os

# Add parent to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    print("Importing app.main...")
    from app.main import app
    print("Import successful.")
    
    print("\n--- REGISTERED ROUTES ---")
    for route in app.routes:
        if hasattr(route, "path"):
             print(f"{route.path} [{route.methods}]")
        else:
             print(str(route))
    print("--- END ROUTES ---\n")

except Exception as e:
    import traceback
    print(f"CRASH: {e}")
    traceback.print_exc()
