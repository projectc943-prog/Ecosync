import sys
import os
sys.path.append(os.getcwd())

from app import models
from app.database import SessionLocal

# Setup DB connection
db = SessionLocal()

email = "skunthal@gitam.in"
print(f"🔍 Checking Settings for: {email}")

settings = db.query(models.AlertSettings).filter(models.AlertSettings.user_email == email).first()

if settings:
    print(f"✅ Settings Found!")
    print(f"   - Max Temp: {settings.temp_threshold}°C")
    print(f"   - Max PM2.5: {settings.pm25_threshold}")
    print(f"   - Min/Max Humidity: {settings.humidity_min}% - {settings.humidity_max}%")
    print(f"   - Max Wind: {settings.wind_threshold} km/h")
    print(f"   - Active: {settings.is_active}")
else:
    print(f"❌ No Settings Found for {email}. Using Defaults.")
