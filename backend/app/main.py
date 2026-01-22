import asyncio
import time
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from . import models, schemas, database
from .connectors.open_meteo import OpenMeteoConnector
from .connectors.thingspeak import ThingSpeakConnector
from .connectors.waqi import WAQIConnector
from .connectors.openaq import OpenAQConnector
from .connectors.esp32_stub import ESP32StubConnector

# Create Database Tables
# Create Database Tables
models.Base.metadata.create_all(bind=database.engine)
# Seed Admin User
from . import admin_setup
try:
    admin_setup.create_admin_user()
except Exception as e:
    print(f"Admin Seed Warning: {e}")

app = FastAPI(title="IoT Device Dashboard Backend")

# CORS Configuration for Development and Production
import os
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Define allowed origins based on environment
if ENVIRONMENT == "production":
    allowed_origins = [
        "https://environmental-8b801.web.app",           # Firebase Hosting
        "https://environmental-8b801.firebaseapp.com",   # Firebase Hosting alternate
        # Add your custom domain here if you have one
        # "https://yourdomain.com",
    ]
else:
    # Development - allow localhost
    allowed_origins = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative port
        "http://127.0.0.1:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

from .routers import assistant
app.include_router(assistant.router)
from .routers import auth
app.include_router(auth.router)
from .routers import map
app.include_router(map.router)
from .routers import pro_api
app.include_router(pro_api.router)
def get_connector(device: models.Device):
    # Retrieve config based on connector type
    # For now, we map device fields to config or assume DB stored config (which we haven't implemented fully yet)
    # Using simple mapping logic based on conventions
    config = {"lat": device.lat, "lon": device.lon}
    
    # We might need to store extra config like Channel ID / Token in a separate column or JSON field?
    # Since we didn't add a 'config' column, we can hack it for now:
    # 'name' could enable "Channel: 12345" parsing OR we just add a 'config' column later.
    # User Requirement: "Input: Channel ID". We need that input.
    # Update: DeviceCreate has 'location', but might need extended props.
    # For Simplicity, we'll try to parse Name or use fixed configs for the "Demo" experience
    # OR better: Add `config` JSON column.
    
    # Let's check `connector_type`
    if device.connector_type == "public_api": # Open-Meteo
        return OpenMeteoConnector(device.id, config)
    
    elif device.connector_type == "thingspeak":
        # Hack: Extract Channel ID from device name if format is "Channel_12345"
        # Or just use a default public channel for ANY thingspeak device created
        channel_id = "12397" # Default MathWorks Weather Station
        if "Channel:" in device.name:
            channel_id = device.name.split("Channel:")[1].strip()
        config["channel_id"] = channel_id
        return ThingSpeakConnector(device.id, config)
        
    elif device.connector_type == "waqi":
        # WAQI needs Token (optional)
        config["token"] = "demo" # Use demo token
        return WAQIConnector(device.id, config)
        
    elif device.connector_type == "openaq":
        return OpenAQConnector(device.id, config)
        
    elif device.connector_type == "esp32":
        return ESP32StubConnector(device.id, config)
    else:
        return None

# --- Background Task: Polling ---
async def poll_devices():
    while True:
        db = database.SessionLocal()
        try:
            devices = db.query(models.Device).filter(models.Device.connector_type == "public_api").all()
            for dev in devices:
                connector = get_connector(dev)
                if connector:
                    data = connector.fetch_data()
                    # Update Device Status
                    dev.last_seen = datetime.utcnow()
                    dev.status = data.get("status", "offline")
                    
                    # Store Metrics (Unified Format)
                    metrics = data.get("metrics", {})
                    if metrics:
                        # Flatten unified metrics to DB columns if needed, or store as JSON.
                        # For now, we map back to our SensorData model columns
                        measurement = models.SensorData(
                            device_id=dev.id,
                            timestamp=datetime.utcnow(),
                            temperature=metrics.get("temperatureC"),
                            humidity=metrics.get("humidityPct"),
                            pressure=metrics.get("pressureHPa"),
                            wind_speed=metrics.get("windMS"),
                            pm2_5=metrics.get("pm25")
                        )
                        db.add(measurement)
                        
                        # --- ALERT CHECKING LOGIC ---
                        from .services.email_service import send_email_notification
                        
                        # 1. Check Threshold Alerts (Temperature)
                        if measurement.temperature and measurement.temperature > 40:
                             new_alert = models.Alert(
                                 metric="temperature",
                                 value=measurement.temperature,
                                 message=f"High Temperature Alert: {measurement.temperature}°C on device {dev.name}"
                             )
                             db.add(new_alert)
                             print(f"⚠️ [Alert] High Temp on {dev.name}")

                        # 2. Check Location-Based Alerts (Targeted Emails)
                        active_loc_alerts = db.query(models.Alert).filter(
                            models.Alert.metric == "location",
                            models.Alert.is_active == True,
                            models.Alert.email_sent == False
                        ).all()
                        
                        for alert in active_loc_alerts:
                            if alert.target_lat and alert.target_lon:
                                # Simple distance check (Haversine approximation)
                                from math import radians, cos, sin, asin, sqrt
                                def haversine(lon1, lat1, lon2, lat2):
                                    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
                                    dlon = lon2 - lon1
                                    dlat = lat2 - lat1
                                    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
                                    c = 2 * asin(sqrt(a))
                                    return 6371 * c # Radius of earth in km

                                dist = haversine(dev.lon, dev.lat, alert.target_lon, alert.target_lat)
                                if dist <= alert.radius_km:
                                    print(f"📍 [Alert] Location target reached by {dev.name}!")
                                    alert.email_sent = True
                                    alert.message = f"Target location reached by {dev.name}"
                                    if alert.recipient_email:
                                        send_email_notification(
                                            alert.recipient_email,
                                            "IoT Alert: Location Reached",
                                            f"The device '{dev.name}' has entered the monitored zone at {dev.lat}, {dev.lon}."
                                        )
            db.commit()
        except Exception as e:
            print(f"Polling Error: {e}")
        finally:
            db.close()
        
        await asyncio.sleep(60) # Poll every 60s

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(poll_devices())
    # Start map cache refresh
    from .services.api_cache import refresh_map_cache
    asyncio.create_task(refresh_map_cache())

# --- API Endpoints ---

@app.post("/api/devices", response_model=schemas.DeviceResponse)
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

@app.get("/api/devices", response_model=List[schemas.DeviceResponse])
def list_devices(db: Session = Depends(get_db)):
    return db.query(models.Device).all()

@app.get("/api/devices/{device_id}/latest", response_model=schemas.UnifiedSensorData)
def get_latest_device_data(device_id: str, db: Session = Depends(get_db)):
    device = db.query(models.Device).filter(models.Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Check cache (DB) first for recent data
    latest_reading = db.query(models.SensorData)\
        .filter(models.SensorData.device_id == device_id)\
        .order_by(models.SensorData.timestamp.desc())\
        .first()
    
    ts = int(latest_reading.timestamp.timestamp()) if latest_reading else 0
    
    # Construct Unified Response
    metrics = {}
    source_ts = ts # Default
    if latest_reading:
        metrics = schemas.UnifiedSensorMetrics(
            temperatureC=latest_reading.temperature,
            humidityPct=latest_reading.humidity,
            pressureHPa=latest_reading.pressure,
            windMS=latest_reading.wind_speed,
            pm25=latest_reading.pm2_5
        )
        # In a real impl, we'd store source_ts in DB too.
    else:
         metrics = schemas.UnifiedSensorMetrics()

    return schemas.UnifiedSensorData(
        deviceId=device.id,
        deviceName=device.name,
        status=device.status,
        source=device.connector_type,
        ts=ts,
        metrics=metrics
    )

@app.get("/api/devices/{device_id}/history", response_model=schemas.UnifiedHistory)
def get_device_history(device_id: str, range: str = "24h", db: Session = Depends(get_db)):
    device = db.query(models.Device).filter(models.Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
        
    connector = get_connector(device)
    hist_points = []
    
    if connector and device.connector_type == "public_api":
        # For public API, we fetch from source (Open-Meteo) as per plan to show nice curves
        # Alternatively, we could query our own DB if we have been polling long enough.
        # Following requirements: "Use Open-Meteo hourly data and slice based on range"
        raw_points = connector.get_history(range)
        for p in raw_points:
            hist_points.append(schemas.HistoryPoint(**p))
    else:
        # Fallback to DB
        # This logic connects the "Unified History" requirement to local DB storage
        pass 

    return schemas.UnifiedHistory(
        deviceId=device.id,
        range=range,
        points=hist_points
    )

from .services import external_apis, fusion_engine

@app.get("/api/pro-data")
async def get_pro_data(lat: float = 17.3850, lon: float = 78.4867, city: str = None, db: Session = Depends(get_db)):
    """
    Returns aggregated data for Pro Mode:
    - External: OpenWeatherMap, OpenAQ, NASA
    - Local: Latest DB reading
    - Fused: Kalman Filtered State
    """
    
    # 0. Resolve City if provided
    current_lat, current_lon = lat, lon
    location_name = "Custom Location"

    if city:
        coords = await external_apis.get_location_coordinates(city)
        if coords:
            current_lat = coords["lat"]
            current_lon = coords["lon"]
            location_name = f"{coords['name']}, {coords.get('country', '')}"
        else:
            # If city lookup fails, maybe we just use default but warn? 
            # Or raise 404. Let's fallback to current_lat/lon but log it.
            print(f"City '{city}' not found, using coordinates: {lat}, {lon}")

    # 1. Fetch External Data
    external_data = await external_apis.get_pro_dashboard_data(current_lat, current_lon)
    # Inject resolved name
    external_data["location"]["name"] = location_name
    
    # 2. Fetch Latest Local Data (Simulated or Real from DB)
    # Get latest reading from ANY connected device (Demo assumption)
    latest_reading = db.query(models.SensorData).order_by(models.SensorData.timestamp.desc()).first()
    
    local_data = {}
    if latest_reading:
        local_data = {
            "temp": latest_reading.temperature,
            "humidity": latest_reading.humidity,
            "pm25": latest_reading.pm2_5
        }
    
    # 3. Apply AI Sensor Fusion
    # We extract the 'simple' external values to fuse with local
    ext_simple = {
        "temp": external_data["weather"]["temp"],
        "humidity": external_data["weather"]["humidity"],
        "pm25": external_data["air_quality"]["pm25"]
    }
    
    fused_state = fusion_engine.fuse_environmental_data(local_data, ext_simple)
    
    # 4. Inject Fused State into Response
    external_data["fusion"] = fused_state
    
    return external_data

# --- REAL-TIME MAP ENDPOINT ---
from .services.api_cache import get_cached_markers

@app.get("/realtime/map")
async def get_realtime_map_data():
    """
    Returns cached real-time environmental markers for the map.
    Optimized for 5-second polling without hitting external APIs.
    """
    markers = get_cached_markers()
    return {
        "count": len(markers),
        "markers": markers,
        "cache_status": "active"
    }

# --- LEGACY ENDPOINTS FOR DASHBOARD COMPATIBILITY ---
@app.get("/data")
async def get_sensor_data(limit: int = 20, db: Session = Depends(get_db)):
    """
    Returns recent sensor data for dashboard.
    """
    data = db.query(models.SensorData).order_by(models.SensorData.timestamp.desc()).limit(limit).all()
    return data

@app.get("/alerts")
async def get_alerts(limit: int = 5, db: Session = Depends(get_db)):
    """
    Returns recent alerts (placeholder - currently empty).
    """
    # For now, return empty array. Can be implemented later.
    return []

# --- REALTIME WEBSOCKETS ---
from fastapi import WebSocket, WebSocketDisconnect
from .services.websocket_manager import manager

@app.websocket("/ws/stream/{device_id}")
async def websocket_endpoint(websocket: WebSocket, device_id: str):
    await manager.connect(websocket, device_id)
    try:
        while True:
            # Keep alive / listen for client messages if needed
            data = await websocket.receive_text()
            # If client sends anything, just echo or ignore
            # await websocket.send_text(f"Message received: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, device_id)


# --- ESP32 INGESTION ENDPOINT ---
from pydantic import BaseModel
from datetime import datetime as dt

class IoTSensorData(BaseModel):
    temperature: float
    humidity: float
    pm25: float = 0.0
    pressure: float = 1013.0
    # Add MQ items if needed
    mq_raw: float = 0.0

@app.post("/iot/data")
async def receive_iot_data(data: IoTSensorData, db: Session = Depends(get_db)):
    """
    Receives sensor data from ESP32 hardware AND persists it to DB + Broadcasts via WS.
    """
    # 1. Create timestamp
    current_ts = dt.utcnow()
    
    # 2. Persist to DB
    try:
        # Find "Default ESP32" or create one
        # Ideally payload should have device_id, but per user instructions we use a simple endpoint
        device_id = "ESP32_MAIN" 
        
        device = db.query(models.Device).filter(models.Device.id == device_id).first()
        if not device:
            device = models.Device(
                id=device_id,
                name="ESP32 Unit",
                connector_type="esp32",
                lat=0.0, lon=0.0,
                status="online",
                last_seen=current_ts
            )
            db.add(device)
            db.commit()
        else:
            device.last_seen = current_ts
            device.status = "online"

        # Calculate MQ Index (Server-side per requirements)
        # Simple normalization: 0-100 based on raw 200-800 range
        mq_norm = min(100, max(0, (data.mq_raw - 200) / 6))

        measurement = models.SensorData(
            device_id=device.id,
            timestamp=current_ts,
            temperature=data.temperature,
            humidity=data.humidity,
            pressure=data.pressure,
            wind_speed=0.0,
            pm2_5=data.pm25,
            # We can use 'pm10' field for MQ Raw or add new column. Using pm10 as placeholder for MQ Raw per simple schema
            pm10=data.mq_raw 
        )
        db.add(measurement)
        db.commit()
        
        # 3. REALTIME BROADCAST
        # Send JSON to all clients watching "ESP32_MAIN"
        broadcast_payload = {
            "deviceId": device_id,
            "timestamp": current_ts.isoformat(),
            "temperature": data.temperature,
            "humidity": data.humidity,
            "mq_raw": data.mq_raw,
            "mq_index": mq_norm,
            "pm25": data.pm25,
            "pressure": data.pressure
        }
        await manager.broadcast(broadcast_payload, "ESP32_MAIN")
        
    except Exception as e:
        print(f"Error saving IoT data: {e}")
        return {"status": "error", "detail": str(e)}

    return {"status": "ok", "message": "Data saved & broadcasted"}

@app.get("/iot/latest")
async def get_latest_iot_data(db: Session = Depends(get_db)):
    # Fallback for polling clients
    reading = db.query(models.SensorData).filter(models.SensorData.device_id == "ESP32_MAIN").order_by(models.SensorData.timestamp.desc()).first()
    if not reading:
         return {}
    return {
        "timestamp": reading.timestamp,
        "temperature": reading.temperature,
        "humidity": reading.humidity,
        "pm25": reading.pm2_5,
        "mq_raw": reading.pm10, # mapped
        "pressure": reading.pressure
    }

