# 🛸 Environmental IoT Command Center - Technical Documentation

**Version:** 2.0.0 (Production Release)
**Status:** Live

---

## 🏗️ Architecture Overview

The system follows a **Modern Headless** architecture, separating the Command Center (Frontend) from the AI Core (Backend) for maximum scalability and performance.

### 1. The Frontend (Command Center) 🖥️
- **Tech Stack**: React 18, Vite, TailwindCSS
- **Design System**: Glassmorphism 2.0 (Custom CSS + Framer Motion)
- **Deployment**: Firebase Hosting (Global CDN)
- **Key Features**:
    - **Real-time Map**: Leaflet.js with custom dark-mode tiling.
    - **Live Charts**: Recharts for visualizing sensor streams.
    - **Voice Command**: Web Speech API integration for "Navigate to [City]" commands.

### 2. The Backend (AI Core) 🧠
- **Tech Stack**: Python 3.11, FastAPI, SQLAlchemy
- **Deployment**: Render (Dockerized Container)
- **Database**: SQLite (with Auto-Seeding) for portability.
- **Key Algorithms**:
    - **Kalman Filter**: 1D filtering for Temperature, Humidity, and PM2.5 to remove sensor noise/jitter.
    - **Outlier Detection**: Z-Score analysis to auto-reject anomalies (e.g., sudden sensor spikes).
    - **Sensor Fusion**: Combines local ESP32 data + OpenWeatherMap + OpenAQ for a "True" environmental reading.

### 3. The Edge Node (ESP32) 📡
- **Communication**: WebSocket (Real-time) + HTTP POST (Backup)
- **Sensors**: DHT11 (Temp/Hum), MQ-135 (Air Quality), PMS5003 (PM2.5)

---

## 🛠️ API Reference

### Base URL
`https://capstone-backend-djdd.onrender.com`

### Endpoints

#### 1. Real-time Stream (WebSocket)
- **URL**: `wss://capstone-backend-djdd.onrender.com/ws/stream/ESP32_MAIN`
- **Payload**:
  ```json
  {
    "filtered": {
      "temperature": 24.5,
      "humidity": 60.1,
      "pm25": 12.0
    },
    "confidence": { ... }
  }
  ```

#### 2. Ingestion (HTTP POST)
- **Endpoint**: `/iot/data`
- **Body**:
  ```json
  {
    "temperature": 25.0,
    "humidity": 60.0,
    "pm25": 15.0,
    "mq_raw": 240.0
  }
  ```

#### 3. Pro Mode Data
- **Endpoint**: `/api/pro-data?city=London`
- **Returns**: Fused data from Local Device + OpenWeather + OpenAQ.

---

## 🚀 Deployment Guide

### Frontend (Firebase)
1. `cd frontend`
2. `npm run build`
3. `firebase deploy --only hosting`

### Backend (Render)
1. Push changes to GitHub `main` branch.
2. Render automatically builds the Docker container.
3. **Note**: Database resets on restart, but `admin_setup.py` auto-seeds the admin user.

---

## 🔐 Credentials

- **Admin Email**: `gitams4@gmail.com`
- **Admin Password**: `Admin123@#$` (Case Sensitive)

---

**Project Completed by Antigravity** 🚀
