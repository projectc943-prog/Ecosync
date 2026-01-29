from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr
print(f"LOADING SCHEMAS FROM {__file__}")

class Location(BaseModel):
    lat: float
    lon: float

class DeviceCreate(BaseModel):
    deviceName: str
    connectorType: str = "public_api"
    location: Location

class DeviceResponse(BaseModel):
    id: str
    name: str
    connector_type: str
    lat: float
    lon: float
    last_seen: Optional[datetime] = None
    status: str
    
    class Config:
        from_attributes = True

class UnifiedSensorMetrics(BaseModel):
    temperatureC: Optional[float] = None
    humidityPct: Optional[float] = None
    pressureHPa: Optional[float] = None
    windMS: Optional[float] = None
    pm25: Optional[float] = None

class UnifiedSensorData(BaseModel):
    deviceId: str
    deviceName: str
    status: str
    source: str
    ts: int
    metrics: UnifiedSensorMetrics

class HistoryPoint(BaseModel):
    ts: int
    temperatureC: Optional[float] = None
    humidityPct: Optional[float] = None
    pressureHPa: Optional[float] = None

class UnifiedHistory(BaseModel):
    deviceId: str
    range: str
    points: List[HistoryPoint]
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    first_name: Optional[str] = "Operator"
    last_name: Optional[str] = "Null"
    plan: Optional[str] = "lite"
    location_name: Optional[str] = None

class UserProfileUpdate(BaseModel):
    first_name: str
    last_name: str
    location_name: Optional[str] = None
    mobile: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    first_name: Optional[str]
    last_name: Optional[str]
    mobile: Optional[str]
    location_name: Optional[str] = None
    plan: str
    is_verified: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    redirect: Optional[str] = "/dashboard"
    plan: Optional[str] = "lite"
    is_verified: Optional[bool] = False
    user_name: Optional[str] = "User"

class TokenData(BaseModel):
    username: Optional[str] = None

class SensorDataBase(BaseModel):
    temperature: float
    humidity: float
    pressure: float
    vibration: float
    wind_speed: Optional[float] = 0.0
    uv_index: Optional[float] = 0.0
    soil_temp: Optional[float] = 0.0
    soil_moisture: Optional[float] = 0.0
    pm2_5: Optional[float] = 0.0
    pm10: Optional[float] = 0.0
    no2: Optional[float] = 0.0
    solar_radiation: Optional[float] = 0.0

class SensorDataCreate(SensorDataBase):
    pass

class SensorDataResponse(SensorDataBase):
    id: int
    timestamp: datetime
    kalman_temp: Optional[float] = None
    kalman_press: Optional[float] = None
    kalman_hum: Optional[float] = None
    anomaly_score: Optional[float] = None
    is_anomaly: bool
    precautions: List[str] = []

    device_id: Optional[str] = None

    class Config:
        from_attributes = True

class CalibrationUpdate(BaseModel):
    TEMP_MAX: Optional[float] = None
    VIBRATION_MAX: Optional[float] = None
    PRESSURE_MIN: Optional[float] = None

class AlertResponse(BaseModel):
    id: int
    timestamp: datetime
    metric: str
    value: float
    message: str
    email_sent: bool

    class Config:
        from_attributes = True

# --- NEW SCHEMAS FOR PRO FEATURES ---
class DiaryEntryCreate(BaseModel):
    note: str
    location: Optional[str] = None

class DiaryEntryResponse(BaseModel):
    id: int
    timestamp: datetime
    note: str
    location: Optional[str]
    
    class Config:
        from_attributes = True

class UserLayoutUpdate(BaseModel):
    layout_json: str # JSON String

class UserLayoutResponse(BaseModel):
    layout_json: str

    class Config:
        from_attributes = True
    class Config:
        from_attributes = True

class AlertSettingsCreate(BaseModel):
    user_email: EmailStr
    temp_threshold: float
    humidity_min: float
    humidity_max: float
    pm25_threshold: float
    is_active: bool = True

class AlertSettingsResponse(AlertSettingsCreate):
    id: int
    
    class Config:
        from_attributes = True
