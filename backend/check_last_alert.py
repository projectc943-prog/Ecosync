from app import models, database
from sqlalchemy import desc

db = database.SessionLocal()
last_alert = db.query(models.Alert).order_by(desc(models.Alert.timestamp)).first()

if last_alert:
    print(f"Last Alert ID: {last_alert.id}")
    print(f"Message: {last_alert.message}")
    print(f"Timestamp: {last_alert.timestamp}")
    print(f"Sent to: {last_alert.recipient_email}")
    print(f"Success: {last_alert.email_sent}")
else:
    print("No alerts found in database.")

db.close()
