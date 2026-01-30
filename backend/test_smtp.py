"""
Simple email test to diagnose SMTP issues
"""
import os
from dotenv import load_dotenv
load_dotenv()

import smtplib
from email.mime.text import MIMEText

sender = os.getenv("EMAIL_USER")
password = os.getenv("EMAIL_PASS")

print("Email Config:")
print(f"  USER: {sender}")
print(f"  PASS: {password[:4]}...{password[-4:] if password and len(password) > 8 else '***'}")
print()

if not sender or not password:
    print("ERROR: Email credentials not found in .env")
    exit(1)

try:
    print("Connecting to Gmail SMTP...")
    server = smtplib.SMTP('smtp.gmail.com', 587, timeout=10)
    server.set_debuglevel(1)
    server.starttls()
    
    print("\nAttempting login...")
    server.login(sender, password)
    
    print("\nSending test email...")
    msg = MIMEText("Test alert from EcoSync")
    msg['Subject'] = 'EcoSync Test Alert'
    msg['From'] = sender
    msg['To'] = sender
    
    server.send_message(msg)
    server.quit()
    
    print("\n✅ SUCCESS! Email sent successfully!")
    
except smtplib.SMTPAuthenticationError as e:
    print(f"\n❌ AUTHENTICATION ERROR: {e}")
    print("\nSolution:")
    print("1. Go to https://myaccount.google.com/apppasswords")
    print("2. Generate a new App Password")
    print("3. Update EMAIL_PASS in backend/.env")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    print(f"Error type: {type(e).__name__}")
