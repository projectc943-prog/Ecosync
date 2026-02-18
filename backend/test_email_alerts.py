import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load env vars from .env.local
load_dotenv(".env.local")

def test_send_email():
    sender_email = os.getenv("EMAIL_USER")
    sender_password = os.getenv("EMAIL_PASS")
    receiver_email = sender_email # Send to self for testing

    print(f"Testing Email...")
    print(f"Sender: {sender_email}")
    # print(f"Password: {sender_password}") # Don't print password

    if not sender_email or not sender_password:
        print("❌ Error: EMAIL_USER or EMAIL_PASS not found in .env.local")
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = receiver_email
        msg['Subject'] = "🚀 EcoSync Alert Test"

        body = "This is a test email from EcoSync Backend Debugger."
        msg.attach(MIMEText(body, 'plain'))

        print(f"Connecting to Gmail SMTP...")
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        
        print(f"Logging in...")
        server.login(sender_email, sender_password)
        
        print(f"Sending email...")
        text = msg.as_string()
        server.sendmail(sender_email, receiver_email, text)
        server.quit()
        
        print("✅ Email sent successfully!")

    except Exception as e:
        print(f"❌ Failed to send email: {e}")

if __name__ == "__main__":
    test_send_email()
