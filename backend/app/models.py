from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Device(Base):
    __tablename__ = "devices"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, index=True)
    connector_type = Column(String) # "public_api" or "esp32"
    lat = Column(Float)
    lon = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, nullable=True)
    status = Column(String, default="offline") # "online", "offline"
    
    # Relationship
    sensor_readings = relationship("SensorData", back_populates="device", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Profile & Plan
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    plan = Column(String, default="lite") # lite, pro
    plan = Column(String, default="lite") # lite, pro
    mobile = Column(String, nullable=True)
    
    # Persistent Dashboard Location
    location_lat = Column(Float, nullable=True)
    location_lon = Column(Float, nullable=True)
    location_name = Column(String, nullable=True)
    
    # Verification
    is_verified = Column(Boolean, default=False)
    otp_secret = Column(String, nullable=True)
    
    # Relationship
    sensor_readings = relationship("SensorData", back_populates="owner")
    diary_entries = relationship("DiaryEntry", back_populates="owner")
    layout = relationship("UserLayout", uselist=False, back_populates="owner")



class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Ownership - Optional: Link to User if needed, but primarily linked to Device now
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    owner = relationship("User", back_populates="sensor_readings")

    # Link to Device
    device_id = Column(String, ForeignKey("devices.id"))
    device = relationship("Device", back_populates="sensor_readings")

    temperature = Column(Float)
    humidity = Column(Float)
    pressure = Column(Float)
    vibration = Column(Float)
    wind_speed = Column(Float)
    uv_index = Column(Float)
    soil_temp = Column(Float)
    soil_moisture = Column(Float)
    pm2_5 = Column(Float)
    pm10 = Column(Float)
    no2 = Column(Float)
    solar_radiation = Column(Float)
    
    # Processed / ML features
    kalman_temp = Column(Float) 
    kalman_press = Column(Float)
    kalman_hum = Column(Float)
    anomaly_score = Column(Float)
    is_anomaly = Column(Boolean, default=False)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    metric = Column(String) # e.g., "temperature", "location"
    value = Column(Float, nullable=True)
    message = Column(String)
    
    # New fields for email and location alerts
    recipient_email = Column(String, nullable=True)
    target_lat = Column(Float, nullable=True)
    target_lon = Column(Float, nullable=True)
    radius_km = Column(Float, default=1.0)
    
    is_active = Column(Boolean, default=True)
    email_sent = Column(Boolean, default=False)

class APISnapshot(Base):
    __tablename__ = "api_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    location = Column(String) # "lat,lon"
    
    # Store aggregated metrics
    temp = Column(Float)
    humidity = Column(Float)
    
    # AQI Components
    aqi = Column(Float)
    pm2_5 = Column(Float)
    pm10 = Column(Float)
    co = Column(Float)
    o3 = Column(Float)
    no2 = Column(Float)
    so2 = Column(Float)
    
    source = Column(String) # "OpenMeteo", "OpenAQ", etc.
    created_at = Column(DateTime, default=datetime.utcnow)

class DiaryEntry(Base):
    __tablename__ = "diary_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    note = Column(String)
    location = Column(String) # Optional "City" or "Lat,Lon"
    
    owner = relationship("User", back_populates="diary_entries")

class UserLayout(Base):
    __tablename__ = "user_layouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    layout_json = Column(Text) # JSON string of widget order/config
    updated_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="layout")
