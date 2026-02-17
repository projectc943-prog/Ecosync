import sys
import os

try:
    print("Adding current directory to sys.path...")
    sys.path.append(os.getcwd())
    print("Importing app.main...")
    from app.main import app
    print("Successfully imported app.main")
except Exception as e:
    import traceback
    print("CRASH DETECTED:")
    traceback.print_exc()
    sys.exit(1)
