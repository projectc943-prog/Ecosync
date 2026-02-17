import asyncio
import logging
import os
from datetime import datetime as dt, timedelta
from typing import List, Optional
import math
# print(f"LOADING MAIN FROM {__file__}")


from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

from . import schemas, database, admin_setup, models
from .connectors.open_meteo import OpenMeteoConnector
from .connectors.thingspeak import ThingSpeakConnector
from .connectors.waqi import WAQIConnector
from .connectors.openaq import OpenAQConnector
from .connectors.esp32_stub import ESP32StubConnector

from .routers import assistant, auth_v2 as auth, map as map_router, pro_api, push_notifications, devices
from .routers.push_notifications import send_push_notification_to_user
from .services import (
    kalman_filter as kf_instance,
    aqi_calculator,
    external_apis,
    fusion_engine,
    weather_service
)
from . import ml_engine

# Initialize ML components
anomaly_detector = ml_engine.IoTAnomalyDetector()
trust_calculator = ml_engine.TrustScoreCalculator()
insight_generator = ml_engine.SmartInsightGenerator()

from .services.websocket_manager import manager
from .services.api_cache import refresh_map_cache, get_cached_markers

# --- Logging Configuration ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# --- App Initialization ---
app = FastAPI(
    title="Environmental IoT Command Center",
    description="Backend API for Real-time Environmental Monitoring System",
    version="2.0.0"
)

@app.get("/")
@app.get("/health")
def health_check():
    return {"status": "active", "service": "IoT Backend", "timestamp": dt.utcnow()}

# --- Database Initialization & Startup Tasks ---
@app.on_event("startup")
async def startup_event():
    """Unified startup handler for database initialization and background services"""
    try:
        # 1. Database Schema
        models.Base.metadata.create_all(bind=database.engine)
        
        # 2. Admin Seeding
        admin_setup.create_admin_user()
        
        # 3. Start Background Tasks
        logger.info("Starting background services...")
        asyncio.create_task(poll_devices()) 
        asyncio.create_task(refresh_map_cache())
        
        logger.info("EcoSync Backend Initialized Successfully.")
        logger.info("Startup: Background tasks initiated (Polling Enabled)")
    except Exception as e:
        logger.error(f"Startup execution failed: {e}")





# --- CORS Configuration ---
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8009",
    "http://127.0.0.1:8009",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:5176",
    "http://127.0.0.1:5176"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# --- Security Headers ---
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "your-production-domain.com"]
)

# Redirect to HTTPS in production
if ENVIRONMENT == "production":
    app.add_middleware(HTTPSRedirectMiddleware)

# --- Dependency Injection ---
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Router Registration ---
app.include_router(assistant.router, tags=["AI Assistant"])
app.include_router(auth.router, tags=["Authentication"])
app.include_router(map_router.router, tags=["Map"])
app.include_router(pro_api.router, tags=["Pro Mode"])
app.include_router(push_notifications.router, tags=["Push Notifications"])
app.include_router(devices.router, tags=["Devices"])

# --- Helper Functions ---
def get_connector(device: models.Device):
    config = {"lat": device.lat, "lon": device.lon}
    
    if device.connector_type == "public_api":
        return OpenMeteoConnector(device.id, config)
    elif device.connector_type == "thingspeak":
        channel_id = "12397"
        if "Channel:" in device.name:
            try:
                channel_id = device.name.split("Channel:")[1].strip()
            except IndexError:
                pass
        config["channel_id"] = channel_id
        return ThingSpeakConnector(device.id, config)
    elif device.connector_type == "waqi":
        config["token"] = "demo"
        return WAQIConnector(device.id, config)
    elif device.connector_type == "openaq":
        return OpenAQConnector(device.id, config)
    elif device.connector_type == "esp32":
        return ESP32StubConnector(device.id, config)
    return None

async def poll_devices():
    """Background task to poll external APIs"""
    while True:
        # Use a fresh session for the query, then close it
        try:
             # Prefetch device IDs to avoid holding DB while making http requests
            db = database.SessionLocal()
            devices_idx = db.query(models.Device).filter(models.Device.connector_type == "public_api").all()
            device_ids = [d.id for d in devices_idx]
            db.close()
            
            for dev_id in device_ids:
                # Re-open small session per device processing
                db = database.SessionLocal()
                dev = db.query(models.Device).get(dev_id)
                if not dev: 
                    db.close()
                    continue

                connector = get_connector(dev)
                if connector:
                    try:
                        # Offload blocking I/O to thread
                        data = await asyncio.to_thread(connector.fetch_data)
                        
                        dev.last_seen = dt.utcnow()
                        dev.status = data.get("status", "offline")
                        
                        metrics = data.get("metrics", {})
                        if metrics:
                            measurement = models.SensorData(
                                device_id=dev.id,
                                timestamp=dt.utcnow(),
                                temperature=metrics.get("temperatureC"),
                                humidity=metrics.get("humidityPct"),
                                pressure=metrics.get("pressureHPa"),
                                wind_speed=metrics.get("windMS"),
                                pm2_5=metrics.get("pm25")
                            )
                            db.add(measurement)
                            # Alerting could be slow (SMTP), offload it!
                            # Pass IDs, not objects, if possible, but for now we pass the object 
                            # and ensure it's bound. db.commit() first to save data.
                            db.commit() 
                            db.refresh(measurement)
                            
                            await asyncio.to_thread(check_alerts_wrapper, dev.id, measurement.id)
                            
                    except Exception as e:
                        logger.error(f"Error polling device {dev.name}: {e}")
                else:
                    db.close()
                    
        except Exception as e:
            logger.error(f"Polling cycle error: {e}")
        
        await asyncio.sleep(60)

def check_alerts_wrapper(dev_id, measurement_id, user_email: Optional[str] = None):
    """Wrapper to run check_alerts in a new thread with its own DB session"""
    try:
        db = database.SessionLocal()
        dev = db.query(models.Device).get(dev_id)
        meas = db.query(models.SensorData).get(measurement_id)
        if dev and meas:
             check_alerts(db, dev, meas, user_email)
             db.commit() # Save alerts if any
        db.close()
    except Exception as e:
        logger.error(f"Async Alert Error: {e}")

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# --- Alerting Service ---
def send_email_alert(subject: str, body: str, recipient: str = None):
    """Sends an email alert using SMTP (e.g., Gmail) with enhanced error handling"""
    sender_email = os.getenv("EMAIL_USER")
    sender_password = os.getenv("EMAIL_PASS")
    receiver_email = recipient or os.getenv("ALERT_RECEIVER_EMAIL", sender_email)

    if not sender_email or not sender_password:
        logger.warning("⚠️ Email Alert Skipped: EMAIL_USER or EMAIL_PASS not configured in .env")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = receiver_email
        msg['Subject'] = f"🚨 EcoSync Alert: {subject}"

        msg.attach(MIMEText(body, 'plain'))

        # Connect to Gmail SMTP with timeout
        logger.info(f"📧 Connecting to Gmail SMTP for {receiver_email}...")
        server = smtplib.SMTP('smtp.gmail.com', 587, timeout=15)
        server.starttls()
        
        # Login
        logger.info(f"🔐 Authenticating as {sender_email}...")
        server.login(sender_email, sender_password)
        
        # Send email
        logger.info(f"📤 Sending alert email...")
        text = msg.as_string()
        server.sendmail(sender_email, receiver_email, text)
        server.quit()
        
        logger.info(f"Email Alert SENT successfully to {receiver_email}")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"❌ SMTP Authentication Failed: {e}")
        logger.error(f"💡 Solution: Generate new App Password at https://myaccount.google.com/apppasswords")
        return False
        
    except smtplib.SMTPException as e:
        error_msg = str(e)
        logger.error(f"❌ SMTP Error: {error_msg}")
        
        # Specific error handling
        if "550" in error_msg:
            logger.error(f"💡 Gmail blocked the email. Possible reasons:")
            logger.error(f"   - Daily sending quota exceeded")
            logger.error(f"   - Suspicious activity detected")
            logger.error(f"   - Recipient email invalid or blocked")
            logger.error(f"   - Try again in a few hours or use a different Gmail account")
        elif "535" in error_msg:
            logger.error(f"💡 Invalid credentials. Check EMAIL_USER and EMAIL_PASS in .env")
        
        return False
        
    except Exception as e:
        logger.error(f"❌ Unexpected error sending email: {type(e).__name__}: {e}")
        return False


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees) using Haversine formula.
    """
    if not all([lat1, lon1, lat2, lon2]):
        return float('inf') # Return infinite distance if coords missing

    # Convert decimal degrees to radians 
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a)) 
    r = 6371 # Radius of earth in kilometers. Use 3956 for miles
    return c * r


def check_alerts(db: Session, device: models.Device, measurement: models.SensorData, user_email: Optional[str] = None):
    """Rule-based alerting with Email Notification (Dynamic Thresholds)"""
    
    # Fetch Settings: Try user-specific first, then fall back to default
    settings = None
    if user_email:
        settings = db.query(models.AlertSettings).filter(
            models.AlertSettings.user_email == user_email,
            models.AlertSettings.is_active == True
        ).first()
    
    if not settings:
        settings = db.query(models.AlertSettings).filter(models.AlertSettings.is_active == True).first()
    
    # Defaults if no settings found
    USER_TEMP_THRESH = settings.temp_threshold if settings else 45.0
    USER_HUM_MIN = settings.humidity_min if settings else 20.0
    USER_HUM_MAX = settings.humidity_max if settings else 80.0
    USER_PM25_THRESH = settings.pm25_threshold if settings else 150.0
    USER_WIND_THRESH = settings.wind_threshold if settings else 30.0
    
    # --- CRITICAL SAFETY OVERRIDES (HARD LIMITS) ---
    # These cannot be relaxed by users. We take the LOWER of (User Setting, Hard Limit) for safety
    # Actually, for alerts, we want to trigger if EITHER User Limit OR Hard Limit is breached.
    # So effectively, the threshold is min(User, Critical)? No.
    # If User says "Alert at 80C" and Critical is 70C, we want to alert at 70C. So yes, min().
    # If User says "Alert at 30C" and Critical is 70C, we want to alert at 30C.
    
    CRITICAL_TEMP = 70.0 # Fire Risk
    CRITICAL_GAS = 2000.0 # Explosion Risk / Heavy Leak
    CRITICAL_PM25 = 300.0 # Hazardous
    
    # Effective Thresholds (The stricter of the two)
    TEMP_THRESH = min(USER_TEMP_THRESH, CRITICAL_TEMP)
    PM25_THRESH = min(USER_PM25_THRESH, CRITICAL_PM25)
    
    HUM_MIN = USER_HUM_MIN
    HUM_MAX = USER_HUM_MAX
    WIND_THRESH = USER_WIND_THRESH
    
    # Gas is usually not user-configurable in basic settings, but if it were:
    GAS_THRESH = min(settings.gas_threshold if settings and settings.gas_threshold else 600.0, CRITICAL_GAS)
    
    RAIN_ALERT_ENABLED = settings.rain_alert if settings else True
    MOTION_ALERT_ENABLED = settings.motion_alert if settings else True
    # Logic change: We will fetch ALL users below instead of just one recipient
    
    triggers = []
    
    # 1. High Temperature -> Fire Risk
    if measurement.temperature and -50 <= measurement.temperature <= 100:
        if measurement.temperature > CRITICAL_TEMP:
             triggers.append(f"⛔ CRITICAL SAFETY OVERRIDE: Temp {measurement.temperature}°C exceeded HARD LIMIT ({CRITICAL_TEMP}°C)")
        elif measurement.temperature > TEMP_THRESH:
             triggers.append(f"⚠️ High Temp: {measurement.temperature}°C (User Limit: {TEMP_THRESH}°C)")
    
    # 2. Humidity Extremes
    if measurement.humidity and 0 <= measurement.humidity <= 100:
        if measurement.humidity > HUM_MAX:
            triggers.append(f"💧 High Humidity: {measurement.humidity}% (Limit: {HUM_MAX}%)")
        elif measurement.humidity < HUM_MIN:
            triggers.append(f"🌵 Low Humidity: {measurement.humidity}% (Limit: {HUM_MIN}%)")

    # 3. High PM2.5
    if measurement.pm2_5:
        if measurement.pm2_5 > CRITICAL_PM25:
             triggers.append(f"⛔ CRITICAL AIR HAZARD: PM2.5 {measurement.pm2_5} (Hard Limit: {CRITICAL_PM25})")
        elif measurement.pm2_5 > PM25_THRESH:
             triggers.append(f"🌫️ Poor Air Quality: PM2.5 {measurement.pm2_5} (User Limit: {PM25_THRESH})")
        
    # 4. High Wind Speed
    if measurement.wind_speed and measurement.wind_speed > WIND_THRESH:
        triggers.append(f"💨 High Wind: {measurement.wind_speed} km/h (Limit: {WIND_THRESH})")

    # 5. Gas Leak Detection
    if measurement.gas and 0 <= measurement.gas <= 4095:
        if measurement.gas > CRITICAL_GAS:
            triggers.append(f"⛔ EXPLOSION RISK: Gas Level {measurement.gas} (Hard Limit: {CRITICAL_GAS})")
        elif measurement.gas > GAS_THRESH:
            triggers.append(f"⚠️ Gas Leak Detected: {measurement.gas} (Limit: {GAS_THRESH})")

    # 6. Rain Detection (Validate range 0-4095, threshold < 2000 usually means wet)
    if RAIN_ALERT_ENABLED and measurement.rain and 0 <= measurement.rain <= 4095:
        if measurement.rain < 2000:
            triggers.append(f"RAIN DETECTED: {measurement.rain}")

    # 7. Motion Detection
    if MOTION_ALERT_ENABLED and measurement.motion == 1:
        triggers.append(f"MOTION DETECTED")

    if triggers:
        alert_msg = " | ".join(triggers)
        logger.warning(f"ALERT TRIGGERED: {alert_msg} on {device.name}")
        
        # --- COOLDOWN CHECK ---
        # Prevent spamming alerts every second. Check if an alert was sent in the last 15 minutes.
        try:
             cutoff_time = dt.utcnow() - timedelta(minutes=15)
             recent_alert = db.query(models.Alert).filter(
                 models.Alert.message == alert_msg, # Same alert type
                 models.Alert.timestamp >= cutoff_time
             ).first()
             
             if recent_alert:
                 if recent_alert.timestamp: # Ensure timestamp exists
                     time_diff = (dt.utcnow() - recent_alert.timestamp).total_seconds() / 60
                     logger.info(f"⏳ Alert Cooldown Active: Last alert sent {time_diff:.1f} mins ago. Skipping.")
                     return
        except Exception as e:
             logger.error(f"Error checking alert cooldown: {e}")
             # Proceed safely if cooldown check fails
        
        # Targeted Email Logic
        recipients = set()
        
        # 1. Add the user who sent the data (Primary Target)
        if user_email:
            recipients.add(user_email)
            logger.info(f"Targeting Primary User: {user_email}")
            
        # 2. Add fallback/admin from settings (Safety Net)
        if settings and settings.user_email:
            recipients.add(settings.user_email)
            
        # 3. Geofencing (The "Sentinel" Broadcast)
        if device.lat and device.lon:
            try:
                nearby_users = db.query(models.User).filter(
                    models.User.is_verified == True,
                    models.User.location_lat != None,
                    models.User.location_lon != None
                ).all()
                
                logger.info(f"Sentinel Scan: Checking {len(nearby_users)} active users near Sector {device.lat},{device.lon}")
                
                for u in nearby_users:
                    dist = calculate_distance(device.lat, device.lon, u.location_lat, u.location_lon)
                    if dist <= 50.0: # 50km Sector Radius
                        recipients.add(u.email)
                        logger.info(f"Targeting Nearby User: {u.email} (Location: {u.location_name or 'Unknown'}, Distance: {dist:.1f}km)")
            except Exception as geo_error:
                logger.warning(f"Geofencing disabled (DB schema pending): {geo_error}")
                # Fallback: Just send to the primary user
                pass

        if recipients:
            timestamp_str = measurement.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC")
            dashboard_link = f"http://localhost:5173/dashboard?device={device.id}"
            
            # ============================================
            # PRIMARY ALERT: CONSOLE NOTIFICATION (Always Works)
            # ============================================
            print("\n" + "="*80)
            print("🚨 CRITICAL ALERT - THRESHOLD VIOLATION DETECTED 🚨")
            print("="*80)
            print(f"Device: {device.name}")
            print(f"Location: {device.lat}, {device.lon}")
            print(f"Time: {timestamp_str}")
            print(f"\nVIOLATIONS:")
            for trigger in triggers:
                print(f"  ⚠️  {trigger}")
            print(f"\nRecipients: {', '.join(recipients)}")
            print(f"Dashboard: {dashboard_link}")
            print("="*80 + "\n")
            
            # ============================================
            # SECONDARY ALERT: EMAIL (Optional - May Fail)
            # ============================================
            body = (
                f"🚨 EcoSync Alert System\n\n"
                f"Source: {device.name}\n"
                f"Location: {device.lat}, {device.lon}\n"
                f"Time: {timestamp_str}\n\n"
                f"The following threshold violations were detected:\n"
                f"--------------------------------------------------\n"
                f"{alert_msg}\n"
                f"--------------------------------------------------\n\n"
                f"🤖 AI INSIGHT:\n"
                f"{measurement.smart_insight or 'No insight available.'}\n\n"
                f"View live dashboard here:\n{dashboard_link}\n\n"
                f"- EcoSync Sentinel"
            )
            
            # Track email sending success
            emails_sent_successfully = 0
            logger.info(f"📧 Attempting to send email alerts to {len(recipients)} recipients...")
            
            for email in recipients:
                success = send_email_alert(f"Alert: {device.name} - Action Required", body, recipient=email)
                if success:
                    emails_sent_successfully += 1
            
            # ============================================
            # TERTIARY ALERT: PUSH NOTIFICATION
            # ============================================
            try:
                push_title = f"🚨 {device.name} Alert"
                push_body = f"{alert_msg}\n(AI: {measurement.smart_insight})"
                push_payload = {
                     "title": push_title,
                     "body": push_body,
                     "icon": "/warning.png",
                     "tag": "ecosync-alert",
                     "data": {"url": dashboard_link}
                }
                
                # Send to all nearby users found in 'nearby_users' scope
                # Note: 'nearby_users' var might not be available here if we didn't enter that block
                # Better strategy: Get IDs of recipients
                
                # Fetch user objects for recipients to send push
                target_users = db.query(models.User).filter(models.User.email.in_(recipients)).all()
                for user in target_users:
                     sent_push = send_push_notification_to_user(user.id, push_payload, db)
                     if sent_push:
                         logger.info(f"Push notification sent to {user.email}")
            except Exception as e:
                logger.error(f"Failed to send push notifications: {e}")
            
            # Save to DB with email status
            email_status = emails_sent_successfully > 0
            db.add(models.Alert(
                metric="multi",
                value=0.0,
                message=alert_msg,
                recipient_email=f"BROADCAST_{len(recipients)}_RECIPIENTS",
                email_sent=email_status
            ))
            
            # Log final status
            if email_status:
                logger.info(f"Alert emails sent successfully to {emails_sent_successfully}/{len(recipients)} recipients")
            else:
                logger.warning(f"Email delivery failed, but CONSOLE ALERT was displayed above")
                logger.warning(f"Check the terminal output for alert details")
        else:
             logger.warning("Alert triggered but no email recipients found (No users in DB).")


# --- Compliance Log API ---

class ViolationReport(BaseModel):
    task_id: int
    verifier_name: str

@app.get("/api/compliance/logs", tags=["Compliance"])
def get_compliance_logs(db: Session = Depends(get_db)):
    today_str = dt.now().strftime("%Y-%m-%d")
    
    # 1. Check if logs exist for today
    logs = db.query(models.SafetyLog).filter(models.SafetyLog.date == today_str).all()
    
    # 2. If not, generate defaults
    if not logs:
        default_tasks = [
            "Morning Grounding Check",
            "Mixing Room Humidity Audit",
            "Chemical Waste Disposal",
            "Fire Extinguisher Pressure",
            "End-of-Shift Inventory Lock"
        ]
        new_logs = []
        for task in default_tasks:
            log = models.SafetyLog(
                task_name=task,
                date=today_str,
                status="PENDING",
                shift="A" # Simplification for now
            )
            db.add(log)
            new_logs.append(log)
        db.commit()
        logs = new_logs
        # Refresh to get IDs
        for log in logs: db.refresh(log)

    return logs

@app.post("/api/compliance/verify", tags=["Compliance"])
def verify_compliance_task(report: ViolationReport, db: Session = Depends(get_db)):
    log = db.query(models.SafetyLog).filter(models.SafetyLog.id == report.task_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    
    # Toggle Logic
    if log.status == "PENDING":
        log.status = "COMPLETED"
        log.verified_by = report.verifier_name
        log.verified_at = dt.now()
    else:
        log.status = "PENDING"
        log.verified_by = None
        log.verified_at = None
        
    db.commit()
    return {"status": "success", "task_id": log.id, "new_status": log.status}

# --- IoT Ingestion Endpoint ---
class IoTSensorData(BaseModel):
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    pm25: float = 0.0
    pressure: float = 1013.0
    mq_raw: float = 0.0
    wind_speed: float = 0.0
    rain: float = 0.0
    motion: int = 0
    gas: Optional[float] = None
    user_email: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    ph: float = 7.0




@app.post("/iot/data", tags=["IoT"])
async def receive_iot_data(data: IoTSensorData, db: Session = Depends(get_db)):
    """
    Receives sensor data from ESP32, applies Kalman filtering, saves to DB, and broadcasts via WebSocket.
    """
    try:
        current_ts = dt.utcnow()
        
        # 1. Kalman Filtering & Cleaning
        temp_val = data.temperature if data.temperature is not None else 0.0
        hum_val = data.humidity if data.humidity is not None else 0.0
        
        filtered_temp, temp_conf = kf_instance.filter_temperature(temp_val)
        filtered_hum, hum_conf = kf_instance.filter_humidity(hum_val)
        filtered_pm25, pm25_conf = kf_instance.filter_pm25(data.pm25)
        mq_cleaned = kf_instance.clean_mq_data(data.mq_raw)

        # 1b. Trust Score & Anomaly Detection
        current_data = {
            "temperature": filtered_temp,
            "humidity": filtered_hum,
            "pm2_5": filtered_pm25,
            "pressure": data.pressure,
            "wind_speed": data.wind_speed,
            "uv_index": 0, # Placeholder
            "vibration": 0, # Placeholder
            "ph": data.ph,
            "gas": data.gas or mq_cleaned["smoothed"]
        }
        
        trust_score = trust_calculator.calculate_score(current_data)
        is_anomaly, anomaly_score = anomaly_detector.update_and_predict([
            filtered_temp, data.pressure, 0, data.wind_speed, 0, 0, 0, filtered_pm25, 0, 0, 0
        ])
        
        anomalies_list, precautions = anomaly_detector.check_thresholds(current_data)
        smart_insight = insight_generator.generate_insight(current_data, anomalies_list)
        
        if is_anomaly:
            anomalies_list.append("Statistical Outlier")
        
        # 2. Get/Create Device (Unique per User for localized geofencing)
        if data.user_email:
             id_sanitized = data.user_email.replace("@", "_").replace(".", "_")
             device_id = f"DASHBOARD_{id_sanitized}"
        else:
             device_id = "ESP32_MAIN"
        
        print(f"DEBUG: Using Device ID: {device_id} for email: {data.user_email}")
        
        device = db.query(models.Device).filter(models.Device.id == device_id).first()
        if not device:
            device = models.Device(
                id=device_id, name=f"Sector Explorer ({data.user_email or 'Public'})", 
                connector_type="esp32",
                lat=data.lat or 0.0, lon=data.lon or 0.0, 
                status="online", last_seen=current_ts
            )
            db.add(device)
            db.commit()
            db.refresh(device)
        else:
            device.last_seen = current_ts
            device.status = "online"
            # Update location if provided
            if data.lat and data.lon:
                device.lat = data.lat
                device.lon = data.lon
            db.commit()

        # New Smart Alert Logic (Phase 2) - Calculated for EVERY request
        smart_report = insight_generator.generate_full_report(
            {
                "temperature": data.temperature,
                "gas": data.mq_raw, # Using mq_raw as gas proxy
                "humidity": data.humidity,
                "ph": data.ph
            },
            anomalies_list
        )
        
        smart_insight = smart_report["insight"]
        trust_score = trust_calculator.calculate_score({
            "temperature": data.temperature,
            "humidity": data.humidity,
            "pm2_5": filtered_pm25,
        })

        # 3. Store Filtered Data with proper transaction handling
        try:
            mq_norm = min(100, max(0, (mq_cleaned["smoothed"] - 200) / 6))
            measurement = models.SensorData(
                device_id=device.id,
                user_id=device.user_id,
                timestamp=current_ts,
                temperature=filtered_temp,
                humidity=filtered_hum,
                pressure=data.pressure,
                wind_speed=0.0,
                pm2_5=filtered_pm25,
                pm10=0.0, # Using as placeholder for PM10
                mq_raw=data.mq_raw,
                gas=data.gas or mq_cleaned["smoothed"],
                rain=data.rain,
                motion=data.motion,
                ph=data.ph,
                trust_score=trust_score,
                anomaly_label=",".join(anomalies_list) if anomalies_list else "Normal",
                smart_insight=smart_insight
            )
            
            # Add extra metrics to object for immediate response (not stored in DB yet)
            measurement.risk_level = smart_report["risk_level"]
            measurement.prediction = smart_report["prediction"]
            measurement.sensor_health = smart_report["sensor_health"]
            measurement.baseline = smart_report["baseline"]
            db.add(measurement)
            db.commit()

            # 4. Alert Check with proper session management
            # Use the same session to avoid race conditions
            try:
                check_alerts(db, device, measurement, data.user_email)
                db.commit()
            except Exception as alert_error:
                logger.error(f"Alert check failed: {alert_error}")
                # Don't fail the entire request due to alert issues

            # 5. WebSocket Broadcast with error handling
            try:
                payload = {
                    "deviceId": device_id,
                    "timestamp": current_ts.isoformat(),
                    "raw": {
                        "temperature": data.temperature,
                        "humidity": data.humidity,
                        "pm25": data.pm25,
                        "mq_raw": data.mq_raw
                    },
                    "filtered": {
                        "temperature": round(filtered_temp, 2),
                        "humidity": round(filtered_hum, 2),
                        "pm25": round(filtered_pm25, 2),
                        "mq_smoothed": mq_cleaned["smoothed"]
                    },
                    "confidence": {
                        "temperature": round(temp_conf, 3),
                        "humidity": round(hum_conf, 3),
                        "pm25": round(pm25_conf, 3)
                    },
                    "mq_quality": {
                        "is_outlier": mq_cleaned["is_outlier"],
                        "z_score": mq_cleaned["z_score"]
                    },
                    "mq_index": mq_norm,
                    "pressure": data.pressure,
                    "mq_index": mq_norm,
                    "pressure": data.pressure,
                    "wind_speed": data.wind_speed,
                    "smart_metrics": {
                        "trust_score": round(trust_score, 1),
                        "is_anomaly": is_anomaly,
                        "anomaly_score": round(anomaly_score, 3),
                        "insight": smart_insight,
                        "ph": data.ph
                    }
                }
                await manager.broadcast(payload, "ESP32_MAIN")
            except Exception as ws_error:
                logger.error(f"WebSocket broadcast failed: {ws_error}")
                # Don't fail the entire request due to WebSocket issues

            # Save wind speed to DB
            measurement.wind_speed = data.wind_speed
            db.commit()

            return {"status": "ok", "message": "Data processed successfully", "device_id": device_id}

        except Exception as e:
            logger.error(f"IoT Data Error: {e}")
            return {"status": "error", "detail": str(e)}
            
    except Exception as e:
        logger.error(f"IoT Data Error: {e}")
        return {"status": "error", "detail": str(e)}


@app.get("/api/data", tags=["Analytics"])
def get_historical_data(limit: int = 100, db: Session = Depends(get_db)):
    """
    Returns historical sensor data for analytics visualization.
    """
    data = db.query(models.SensorData).order_by(models.SensorData.timestamp.desc()).limit(limit).all()
    return data

@app.get("/api/filtered/latest", tags=["IoT"])
async def get_filtered_iot_data(db: Session = Depends(get_db)):
    """Returns latest Kalman-filtered data with AQI and health recommendations."""
    # Debug: Try ESP32_MAIN first
    reading = db.query(models.SensorData).filter(
        models.SensorData.device_id == "ESP32_MAIN"
    ).order_by(models.SensorData.timestamp.desc()).first()
    
    if not reading:
        # Debug: Try ANY device
        last_any = db.query(models.SensorData).order_by(models.SensorData.timestamp.desc()).first()
        if last_any:
             print(f"DEBUG: Found data for {last_any.device_id} but not ESP32_MAIN")
             return {
                 "status": "partial",
                 "message": f"Data found for {last_any.device_id}",
                 "timestamp": last_any.timestamp,
                 "filtered": {
                     "temperature": last_any.temperature,
                     "humidity": last_any.humidity,
                     "pm25": last_any.pm2_5,
                     "mq_smoothed": last_any.gas
                 },
                 "smart_metrics": {
                        "trust_score": last_any.trust_score,
                        "smart_insight": last_any.smart_insight,
                        "anomaly_label": last_any.anomaly_label,
                        "ph": last_any.ph,
                        "prediction": "From Backup Device"
                 }
             }

        return {"status": "no_data", "message": "No ESP32 data available"}
    
    # Calculate AQI
    aqi_result = aqi_calculator.calculate_overall_aqi({"pm25": reading.pm2_5})
    health_recs = aqi_calculator.get_health_recommendations(
        aqi_result.get("aqi"), aqi_result.get("dominant_pollutant_key")
    )
    
    # Calculate Rainfall Prediction
    prediction = weather_service.calculate_rainfall_prediction(
        reading.humidity, 
        reading.wind_speed or 0.0, 
        reading.pressure or 1013.0
    )
    
    return {
        "status": "ok",
        "timestamp": reading.timestamp.isoformat(),
        "deviceId": "ESP32_MAIN",
        "filtered": {
            "temperature": reading.temperature,
            "humidity": reading.humidity,
            "pm25": reading.pm2_5,
            "mq_smoothed": reading.pm10,
            "pressure": reading.pressure,
            "wind_speed": reading.wind_speed or 0.0
        },
        "air_quality": {
            "aqi": aqi_result.get("aqi"),
            "category": aqi_result.get("category"),
            "color": aqi_result.get("color"),
            "dominant_pollutant": aqi_result.get("dominant_pollutant")
        },
        "health": health_recs,
        "weather": prediction,
        "smart_metrics": {
            "trust_score": reading.trust_score,
            "anomaly_label": reading.anomaly_label,
            "insight": reading.smart_insight,
            "ph": reading.ph
        }
    }


# --- WebSocket Endpoint with proper error handling and cleanup ---
@app.websocket("/ws/stream/{device_id}")
async def websocket_endpoint(websocket: WebSocket, device_id: str):
    # Validate device_id
    if not device_id or not isinstance(device_id, str):
        await websocket.close(code=4000, reason="Invalid device_id")
        return

    # Authenticate the connection
    try:
        # Get token from query parameters
        token = websocket.query_params.get("token")
        if not token:
            await websocket.close(code=4001, reason="Authentication required")
            return

        # Verify token
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
            username: str = payload.get("sub")
            if username is None:
                raise credentials_exception
        except JWTError:
            raise credentials_exception

        # Get user from database
        db = database.SessionLocal()
        try:
            user = db.query(models.User).filter(models.User.email == username).first()
            if user is None:
                raise credentials_exception
        finally:
            db.close()

        # Store user in WebSocket manager
        await manager.connect(websocket, device_id, user)
        logger.info(f"WebSocket connected for device {device_id} (user: {user.email})")
    except Exception as auth_error:
        logger.error(f"WebSocket auth failed: {auth_error}")
        await websocket.close(code=4001, reason="Authentication failed")
        return

    # Connect to WebSocket manager
    try:
        await manager.connect(websocket, device_id)
        logger.info(f"WebSocket connected for device {device_id} (user: {user.email})")

        try:
            while True:
                try:
                    # Receive and process messages
                    data = await websocket.receive_text()
                    # Process incoming data if needed
                    logger.debug(f"WebSocket message from {device_id}: {data}")
                except WebSocketDisconnect:
                    logger.info(f"WebSocket disconnected for device {device_id}")
                    break
                except Exception as receive_error:
                    logger.error(f"WebSocket receive error: {receive_error}")
                    break
        finally:
            # Always clean up the connection
            try:
                await manager.disconnect(websocket, device_id)
                logger.info(f"WebSocket cleanup complete for device {device_id}")
            except Exception as cleanup_error:
                logger.error(f"WebSocket cleanup error: {cleanup_error}")

    except Exception as connect_error:
        logger.error(f"WebSocket connection failed: {connect_error}")
        await websocket.close(code=4002, reason="Connection failed")

# --- Standard Device Endpoints ---
@app.post("/api/devices", response_model=schemas.DeviceResponse, tags=["Devices"])
def create_device(device: schemas.DeviceCreate, db: Session = Depends(get_db)):
    db_device = models.Device(
        name=device.deviceName,
        connector_type=device.connectorType,
        lat=device.location.lat,
        lon=device.location.lon,
        status="created"
    )
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

@app.get("/api/devices", response_model=List[schemas.DeviceResponse], tags=["Devices"])
def list_devices(db: Session = Depends(get_db)):
    return db.query(models.Device).all()

# --- Pro Mode ---
@app.get("/api/pro-data", tags=["Pro Mode"])
async def get_pro_data(lat: float = 17.3850, lon: float = 78.4867, city: str = None, db: Session = Depends(get_db)):
    """Aggregates External API + Local Sensor Data + Kalman Fusion"""
    current_lat, current_lon = lat, lon
    location_name = "Custom Location"

    if city:
        coords = await external_apis.get_location_coordinates(city)
        if coords:
            current_lat, current_lon, location_name = coords["lat"], coords["lon"], f"{coords['name']}, {coords.get('country', '')}"

    # 1. Fetch External
    external_data = await external_apis.get_pro_dashboard_data(current_lat, current_lon)
    external_data["location"]["name"] = location_name
    
    # 2. Fetch Local
    latest = db.query(models.SensorData).order_by(models.SensorData.timestamp.desc()).first()
    local_data = {"temp": latest.temperature, "humidity": latest.humidity, "pm25": latest.pm2_5} if latest else {}
    
    # 3. Fuse
    ext_simple = {
        "temp": external_data["weather"]["temp"],
        "humidity": external_data["weather"]["humidity"],
        "pm25": external_data["air_quality"]["pm25"]
    }
    external_data["fusion"] = fusion_engine.fuse_environmental_data(local_data, ext_simple)
    
    return external_data

# --- Alert Settings API ---
@app.get("/api/settings/alerts", response_model=schemas.AlertSettingsResponse, tags=["Settings"])
def get_alert_settings(email: Optional[str] = None, db: Session = Depends(get_db)):
    # Return user-specific setting or first active or default
    settings = None
    if email:
        settings = db.query(models.AlertSettings).filter(models.AlertSettings.user_email == email).first()
    
    if not settings:
        settings = db.query(models.AlertSettings).first()
        
    if not settings:
        # Create absolute default if DB empty
        settings = models.AlertSettings(user_email=email)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@app.post("/api/settings/alerts", response_model=schemas.AlertSettingsResponse, tags=["Settings"])
def update_alert_settings(settings: schemas.AlertSettingsCreate, db: Session = Depends(get_db)):
    # Update existing for this user or create new
    db_settings = db.query(models.AlertSettings).filter(
        models.AlertSettings.user_email == settings.user_email
    ).first()
    
    if not db_settings:
        db_settings = models.AlertSettings(**settings.dict())
        db.add(db_settings)
    else:
        for key, value in settings.dict().items():
            setattr(db_settings, key, value)
    
    db.commit()
    db.refresh(db_settings)
    return db_settings
@app.get("/realtime/map", tags=["Map"])
async def get_realtime_map_data():
    markers = get_cached_markers()
    return {"count": len(markers), "markers": markers, "cache_status": "active"}