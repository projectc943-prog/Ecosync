import asyncio
import logging
import os
from datetime import datetime as dt
from typing import List
import math
print(f"LOADING MAIN FROM {__file__}")


from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

from . import models, schemas, database, admin_setup
from .connectors.open_meteo import OpenMeteoConnector
from .connectors.thingspeak import ThingSpeakConnector
from .connectors.waqi import WAQIConnector
from .connectors.openaq import OpenAQConnector
from .connectors.esp32_stub import ESP32StubConnector

from .routers import assistant, auth_v2 as auth, map as map_router, pro_api
from .services import kalman_filter, aqi_calculator, external_apis, fusion_engine
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
def health_check():
    return {"status": "active", "service": "IoT Backend", "timestamp": dt.utcnow()}

# --- Database Initialization ---
try:
    models.Base.metadata.create_all(bind=database.engine)
    admin_setup.create_admin_user()
    logger.info("Database initialized and Admin user verified.")
except Exception as e:
    logger.error(f"Database initialization failed: {e}")

# --- CORS Configuration ---
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
ALLOWED_ORIGINS = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

def check_alerts_wrapper(dev_id, measurement_id):
    """Wrapper to run check_alerts in a new thread with its own DB session"""
    try:
        db = database.SessionLocal()
        dev = db.query(models.Device).get(dev_id)
        meas = db.query(models.SensorData).get(measurement_id)
        if dev and meas:
             check_alerts(db, dev, meas)
             db.commit() # Save alerts if any
        db.close()
    except Exception as e:
        logger.error(f"Async Alert Error: {e}")

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# --- Alerting Service ---
def send_email_alert(subject: str, body: str, recipient: str = None):
    """Sends an email alert using SMTP (e.g., Gmail)"""
    sender_email = os.getenv("EMAIL_USER")
    sender_password = os.getenv("EMAIL_PASS")
    receiver_email = recipient or os.getenv("ALERT_RECEIVER_EMAIL", sender_email) # Use override or default

    if not sender_email or not sender_password:
        logger.warning("Skipping Email Alert: EMAIL_USER or EMAIL_PASS not set.")
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = receiver_email
        msg['Subject'] = f"EcoSync Alert: {subject}"

        msg.attach(MIMEText(body, 'plain'))

        # Standard Gmail SMTP port
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        text = msg.as_string()
        server.sendmail(sender_email, receiver_email, text)
        server.quit()
        logger.info(f"Email Alert sent to {receiver_email}")
    except Exception as e:
        logger.error(f"Failed to send email alert: {e}")

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


def check_alerts(db: Session, device: models.Device, measurement: models.SensorData):
    """Rule-based alerting with Email Notification (Dynamic Thresholds)"""
    
    # Fetch Settings (Use first available for now, or link to User later)
    # Simple Logic: Get the first active settings
    settings = db.query(models.AlertSettings).filter(models.AlertSettings.is_active == True).first()
    
    # Defaults if no settings found
    TEMP_THRESH = settings.temp_threshold if settings else 45.0
    HUM_MIN = settings.humidity_min if settings else 20.0
    HUM_MAX = settings.humidity_max if settings else 80.0
    PM25_THRESH = settings.pm25_threshold if settings else 150.0
    # Logic change: We will fetch ALL users below instead of just one recipient
    
    triggers = []
    
    # 1. High Temperature -> Fire Risk
    if measurement.temperature and measurement.temperature > TEMP_THRESH:
        triggers.append(f"CRITICAL TEMP: {measurement.temperature}°C (Limit: {TEMP_THRESH}°C)")
    
    # 2. Humidity Extremes -> Biological Stress
    if measurement.humidity:
        if measurement.humidity > HUM_MAX:
            triggers.append(f"HIGH HUMIDITY: {measurement.humidity}% (Limit: {HUM_MAX}%)")
        elif measurement.humidity < HUM_MIN:
            triggers.append(f"LOW HUMIDITY: {measurement.humidity}% (Limit: {HUM_MIN}%)")

    # 3. High PM2.5 -> Hazardous Air
    if measurement.pm2_5 and measurement.pm2_5 > PM25_THRESH:
        triggers.append(f"HAZARDOUS AIR: PM2.5 is {measurement.pm2_5} µg/m³ (Limit: {PM25_THRESH})")

    if triggers:
        alert_msg = " | ".join(triggers)
        logger.warning(f"ALERT TRIGGERED: {alert_msg} on {device.name}")
        
        # Save to DB (One record for the system event)
        db.add(models.Alert(
            metric="multi",
            value=0.0,
            message=alert_msg,
            recipient_email="BROADCAST_ALL" # Indicator that it went to everyone
        ))
        
        # Broadcast Email to NEARBY active users (Geofencing)
        users = db.query(models.User).filter(models.User.is_active == True).all()
        recipients = set()
        
        ALERT_RADIUS_KM = 50.0 # Users within this range get alerts (approx City size)
        
        # Add registered users if they are nearby
        for user in users:
            if user.email:
                # Geofencing Disabled (Columns Removed)
                # Alerting all verified users for now
                recipients.add(user.email)
                logger.info(f"Targeting User {user.email} (Geofencing Disabled)")
        
        # ALWAYS Add fallback/admin from settings (Safety Net)
        if settings and settings.user_email:
            recipients.add(settings.user_email)
            
        # Also check env var if no users? (Optional, but good for safety)
        if not recipients:
             env_email = os.getenv("ALERT_RECEIVER_EMAIL")
             if env_email:
                 recipients.add(env_email)

        if recipients:
            timestamp_str = measurement.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC")
            dashboard_link = f"http://localhost:5173/dashboard?device={device.id}"
            
            body = (
                f"🚨 EcoSync Alert System\n\n"
                f"Source: {device.name}\n"
                f"Location: {device.lat}, {device.lon}\n"
                f"Time: {timestamp_str}\n\n"
                f"The following threshold violations were detected:\n"
                f"--------------------------------------------------\n"
                f"{alert_msg}\n"
                f"--------------------------------------------------\n\n"
                f"View live dashboard here:\n{dashboard_link}\n\n"
                f"- EcoSync Sentinel"
            )
            
            for email in recipients:
                send_email_alert(f"Alert: {device.name} - Action Required", body, recipient=email)
        else:
             logger.warning("Alert triggered but no email recipients found (No users in DB).")

# --- Startup Events ---
@app.on_event("startup")
async def startup_event():
    logger.info("Starting background services...")
    # redis = await aioredis.create_redis_pool("redis://localhost")
    asyncio.create_task(poll_devices()) 
    asyncio.create_task(refresh_map_cache())
    logger.info("Startup: Background tasks initiated (Polling Enabled)")


# --- IoT Ingestion Endpoint ---
class IoTSensorData(BaseModel):
    temperature: float
    humidity: float
    pm25: float = 0.0
    pressure: float = 1013.0
    mq_raw: float = 0.0

@app.post("/iot/data", tags=["IoT"])
async def receive_iot_data(data: IoTSensorData, db: Session = Depends(get_db)):
    """
    Receives sensor data from ESP32, applies Kalman filtering, saves to DB, and broadcasts via WebSocket.
    """
    try:
        current_ts = dt.utcnow()
        
        # 1. Kalman Filtering & Cleaning
        filtered_temp, temp_conf = kalman_filter.filter_temperature(data.temperature)
        filtered_hum, hum_conf = kalman_filter.filter_humidity(data.humidity)
        filtered_pm25, pm25_conf = kalman_filter.filter_pm25(data.pm25)
        mq_cleaned = kalman_filter.clean_mq_data(data.mq_raw)
        
        # 2. Get/Create Device
        device_id = "ESP32_MAIN"
        device = db.query(models.Device).filter(models.Device.id == device_id).first()
        if not device:
            device = models.Device(
                id=device_id, name="ESP32 Unit", connector_type="esp32",
                lat=0.0, lon=0.0, status="online", last_seen=current_ts
            )
            db.add(device)
            db.commit()
        else:
            device.last_seen = current_ts
            device.status = "online"

        # 3. Store Filtered Data
        mq_norm = min(100, max(0, (mq_cleaned["smoothed"] - 200) / 6))
        measurement = models.SensorData(
            device_id=device.id,
            timestamp=current_ts,
            temperature=filtered_temp,
            humidity=filtered_hum,
            pressure=data.pressure,
            wind_speed=0.0,
            pm2_5=filtered_pm25,
            pm10=mq_cleaned["smoothed"] # Storing smoothed MQ here
        )
        db.add(measurement)
        db.commit()
        
        # 5. Alert Check
        check_alerts(db, device, measurement)
        
        # 4. WebSocket Broadcast
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
            "pressure": data.pressure
        }
        await manager.broadcast(payload, "ESP32_MAIN")
        return {"status": "ok", "message": "Data processed successfully"}
        
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
    reading = db.query(models.SensorData).filter(
        models.SensorData.device_id == "ESP32_MAIN"
    ).order_by(models.SensorData.timestamp.desc()).first()
    
    if not reading:
        return {"status": "no_data", "message": "No ESP32 data available"}
    
    # Calculate AQI
    aqi_result = aqi_calculator.calculate_overall_aqi({"pm25": reading.pm2_5})
    health_recs = aqi_calculator.get_health_recommendations(
        aqi_result.get("aqi"), aqi_result.get("dominant_pollutant_key")
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
            "pressure": reading.pressure
        },
        "air_quality": {
            "aqi": aqi_result.get("aqi"),
            "category": aqi_result.get("category"),
            "color": aqi_result.get("color"),
            "dominant_pollutant": aqi_result.get("dominant_pollutant")
        },
        "health": health_recs
    }

# --- WebSocket Endpoint ---
@app.websocket("/ws/stream/{device_id}")
async def websocket_endpoint(websocket: WebSocket, device_id: str):
    await manager.connect(websocket, device_id)
    try:
        while True:
            await websocket.receive_text() # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket, device_id)

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
    return external_data

# --- Alert Settings API ---
@app.get("/api/settings/alerts", response_model=schemas.AlertSettingsResponse, tags=["Settings"])
def get_alert_settings(db: Session = Depends(get_db)):
    # Return first active setting or default
    settings = db.query(models.AlertSettings).first()
    if not settings:
        # Create default
        settings = models.AlertSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@app.post("/api/settings/alerts", response_model=schemas.AlertSettingsResponse, tags=["Settings"])
def update_alert_settings(settings: schemas.AlertSettingsCreate, db: Session = Depends(get_db)):
    # Update existing or create new
    db_settings = db.query(models.AlertSettings).first()
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


