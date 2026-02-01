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

@router.websocket("/ws/stream/{device_id}")
async def websocket_endpoint(websocket: WebSocket, device_id: str):
    """WebSocket endpoint for real-time device communication"""
    # Validate device_id
    if not device_id or not isinstance(device_id, str):
        await websocket.close(code=4000, reason="Invalid device_id")
        return

    # Authenticate the connection
    try:
        user = await get_current_user(websocket=websocket)
        if not user:
            await websocket.close(code=4001, reason="Authentication required")
            return
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