from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from .. import models, schemas, database
from ..services.websocket_manager import manager

router = APIRouter()

@router.get("/devices", response_model=List[schemas.DeviceResponse], tags=["Devices"])
def list_devices(db: Session = Depends(database.get_db)):
    """List all registered devices"""
    return db.query(models.Device).all()

@router.post("/devices", response_model=schemas.DeviceResponse, tags=["Devices"])
def create_device(device: schemas.DeviceCreate, db: Session = Depends(database.get_db)):
    """Register a new device"""
    db_device = models.Device(
        name=device.deviceName,
        connector_type=device.connectorType,
        lat=device.location.lat,
        lon=device.location.lon,
        status="online"
    )
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

@router.get("/devices/{device_id}", response_model=schemas.DeviceResponse, tags=["Devices"])
def get_device(device_id: str, db: Session = Depends(database.get_db)):
    """Get device details by ID"""
    device = db.query(models.Device).filter(models.Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device

@router.put("/devices/{device_id}", response_model=schemas.DeviceResponse, tags=["Devices"])
def update_device(device_id: str, device_update: schemas.DeviceUpdate, db: Session = Depends(database.get_db)):
    """Update device information"""
    device = db.query(models.Device).filter(models.Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    for key, value in device_update.dict(exclude_unset=True).items():
        setattr(device, key, value)

    db.commit()
    db.refresh(device)
    return device

@router.delete("/devices/{device_id}", tags=["Devices"])
def delete_device(device_id: str, db: Session = Depends(database.get_db)):
    """Delete a device"""
    device = db.query(models.Device).filter(models.Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    db.delete(device)
    db.commit()
    return {"message": "Device deleted successfully"}

