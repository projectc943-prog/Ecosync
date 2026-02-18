import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText

# Explicitly load .env
load_dotenv()

def test_smtp():
    user = os.getenv("EMAIL_USER")
    password = os.getenv("EMAIL_PASS")
    
    print(f"Testing SMTP for user: {user}")
    
    if not user or not password:
        print("❌ Error: EMAIL_USER or EMAIL_PASS not found in .env")
        return

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        print("✅ TLS Started")
        
        server.login(user, password)
        print("✅ Login Successful")
        
        msg = MIMEText("This is a test email from EcoSync debugger.")
        msg['Subject'] = "EcoSync SMTP Test"
        msg['From'] = user
        msg['To'] = user # Send to self
        
        server.sendmail(user, user, msg.as_string())
        print("✅ Email Sent Successfully")
        
        server.quit()
    except Exception as e:
        print(f"❌ SMTP Failed: {e}")

if __name__ == "__main__":
    test_smtp()
