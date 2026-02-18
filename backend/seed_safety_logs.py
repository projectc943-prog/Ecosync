from app import models, database
from datetime import datetime, timedelta
import random

def seed_history():
    db = database.SessionLocal()
    
    tasks = [
        "Morning Grounding Check",
        "Mixing Room Humidity Audit",
        "Chemical Waste Disposal",
        "Fire Extinguisher Pressure",
        "End-of-Shift Inventory Lock"
    ]
    
    # Generate for past 3 days
    for i in range(1, 4):
        past_date = datetime.now() - timedelta(days=i)
        date_str = past_date.strftime("%Y-%m-%d")
        
        print(f"Seeding logs for {date_str}...")
        
        for task in tasks:
            # Randomize status
            status = "COMPLETED" if random.random() > 0.2 else "PENDING"
            verified_by = "supervisor@ecosync.com" if status == "COMPLETED" else None
            
            log = models.SafetyLog(
                task_name=task,
                status=status,
                verified_by=verified_by,
                verified_at=past_date if status == "COMPLETED" else None,
                shift="A",
                date=date_str
            )
            db.add(log)
            
    db.commit()
    print("History seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_history()
