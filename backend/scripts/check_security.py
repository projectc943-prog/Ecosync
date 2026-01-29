import sys
import os

# Add parent to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.core import security
    print("Imports successful")
    
    pw = "password123"
    hash = security.get_password_hash(pw)
    print(f"Hash: {hash}")
    
    verify = security.verify_password(pw, hash)
    print(f"Verify: {verify}")
    
    from datetime import timedelta
    token = security.create_access_token({"sub": "test"}, timedelta(minutes=15))
    print(f"Token: {token}")

except Exception as e:
    import traceback
    print(f"CRASH: {e}")
    traceback.print_exc()
