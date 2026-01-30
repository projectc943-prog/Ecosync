"""
Generate VAPID keys for Web Push Notifications
Run this script once to generate keys and add them to .env file
"""
from pywebpush import webpush
import base64
import os
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization

def generate_vapid_keys():
    """Generate VAPID public and private keys"""
    
    # Generate private key
    private_key = ec.generate_private_key(ec.SECP256R1())
    
    # Get private key in DER format
    private_key_der = private_key.private_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    
    # Get public key in DER format
    public_key = private_key.public_key()
    public_key_der = public_key.public_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    # Convert to URL-safe base64
    private_key_b64 = base64.urlsafe_b64encode(private_key_der).decode('utf-8').rstrip('=')
    public_key_b64 = base64.urlsafe_b64encode(public_key_der).decode('utf-8').rstrip('=')
    
    return private_key_b64, public_key_b64


if __name__ == "__main__":
    print("🔑 Generating VAPID keys for Web Push Notifications...")
    
    private_key, public_key = generate_vapid_keys()
    
    print("\n✅ VAPID keys generated successfully!")
    print("\n📋 Add these to your .env file:")
    print("\n" + "="*60)
    print(f"VAPID_PRIVATE_KEY={private_key}")
    print(f"VAPID_PUBLIC_KEY={public_key}")
    print("="*60)
    
    # Check if .env exists
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    
    if os.path.exists(env_path):
        print(f"\n📝 Found .env file at: {env_path}")
        
        # Read existing .env
        with open(env_path, 'r') as f:
            env_content = f.read()
        
        # Check if VAPID keys already exist
        if 'VAPID_PRIVATE_KEY' in env_content or 'VAPID_PUBLIC_KEY' in env_content:
            print("⚠️  VAPID keys already exist in .env file")
            response = input("Do you want to replace them? (yes/no): ")
            
            if response.lower() != 'yes':
                print("❌ Cancelled. Keys not updated.")
                exit(0)
            
            # Remove old keys
            lines = env_content.split('\n')
            lines = [line for line in lines if not line.startswith('VAPID_')]
            env_content = '\n'.join(lines)
        
        # Append new keys
        if not env_content.endswith('\n'):
            env_content += '\n'
        
        env_content += f"\n# Web Push Notification VAPID Keys\n"
        env_content += f"VAPID_PRIVATE_KEY={private_key}\n"
        env_content += f"VAPID_PUBLIC_KEY={public_key}\n"
        
        # Write back to .env
        with open(env_path, 'w') as f:
            f.write(env_content)
        
        print(f"✅ VAPID keys added to {env_path}")
    else:
        print(f"\n⚠️  .env file not found at {env_path}")
        print("Please create a .env file and add the keys manually")
    
    print("\n🔧 Next steps:")
    print("1. Restart your backend server to load the new keys")
    print("2. Update frontend pushNotifications.js with the public key:")
    print(f"\n   const VAPID_PUBLIC_KEY = '{public_key}';")
    print("\n3. Test push notifications from the frontend")
