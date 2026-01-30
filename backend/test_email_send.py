"""Test email sending functionality"""
import os
os.environ["DATABASE_URL"] = "sqlite:///./iot_system.db"

# Load .env file
from dotenv import load_dotenv
load_dotenv()

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

sender_email = os.getenv("EMAIL_USER")
sender_password = os.getenv("EMAIL_PASS")

print("=" * 60)
print("EMAIL CONFIGURATION TEST")
print("=" * 60)
print(f"EMAIL_USER: {sender_email}")
print(f"EMAIL_PASS: {'*' * len(sender_password) if sender_password else 'NOT SET'}")
print()

if not sender_email or not sender_password:
    print("❌ ERROR: EMAIL_USER or EMAIL_PASS not set in .env file")
    exit(1)

print("Testing email send...")
try:
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = sender_email  # Send to self for testing
    msg['Subject'] = "EcoSync Alert Test"
    
    body = "This is a test alert from EcoSync. If you receive this, email alerts are working!"
    msg.attach(MIMEText(body, 'plain'))
    
    print(f"Connecting to Gmail SMTP server...")
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    
    print(f"Logging in as {sender_email}...")
    server.login(sender_email, sender_password)
    
    print(f"Sending test email...")
    text = msg.as_string()
    server.sendmail(sender_email, sender_email, text)
    server.quit()
    
    print()
    print("✅ SUCCESS! Test email sent successfully!")
    print(f"Check inbox: {sender_email}")
    
except Exception as e:
    print()
    print(f"❌ ERROR: Failed to send email")
    print(f"Error details: {e}")
    print()
    print("Common issues:")
    print("1. Gmail App Password not configured (use App Password, not regular password)")
    print("2. 2-Step Verification not enabled on Gmail account")
    print("3. Less secure app access disabled")
