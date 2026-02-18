from app import models, database
from sqlalchemy import desc

try:
    db = database.SessionLocal()
    last_alert = db.query(models.Alert).order_by(desc(models.Alert.timestamp)).first()

    print("-" * 30)
    if last_alert:
        print(f"LAST ALERT ID: {last_alert.id}")
        print(f"TIME (UTC):    {last_alert.timestamp}")
        print(f"RECIPIENT:     {last_alert.recipient_email}")
        print(f"SENT SUCCESS:  {last_alert.email_sent}")
        print(f"MESSAGE:       {last_alert.message}")
    else:
        print("NO ALERTS FOUND IN DB.")
    print("-" * 30)
    db.close()
except Exception as e:
    print(f"ERROR: {e}")
