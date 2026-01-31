from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///iot_system.db")

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False
    } if "sqlite" in DATABASE_URL else {}
)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base model
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Import models to make them available
from .models import User, Device, SensorData, Alert, AlertSettings

# Expose models for external use
Base = Base
User = User
Device = Device
SensorData = SensorData
Alert = Alert
AlertSettings = AlertSettings
