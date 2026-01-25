# Implementation and Technical Details

## 1. System Architecture

EcoSync S4 has been modernized to use a **React + Python (FastAPI) + Supabase + IoT** architecture, ensuring advanced data processing (AI/Kalman Filter) and scalable real-time monitoring.

### A. Frontend (Client)
*   **Framework**: React (Vite)
*   **Styling**: TailwindCSS with a custom "Bio-Tech" theme (Emerald/Dark Green palette).
*   **Hosting**: Netlify.
*   **Key Components**:
    *   **Pro Dashboard**: Connects to Python Backend (Render) for fused data.
    *   **Light Mode**: Connects directly to ESP32 via Web Serial API for offline/local use.
    *   **Auth System**: Custom "Bio-Scanner" login UI integrated with Supabase Auth.

### B. Backend (The "Brain")
*   **Hosting**: Render (Docker Container).
*   **Framework**: Python FastAPI.
*   **Key Functions**:
    *   **AI Engine**: Google Gemini for environmental insights.
    *   **Math Engine**: Adaptive Kalman Filter for sensor noise reduction.
    *   **API**: REST endpoints serving frontend and receiving ESP32 data.

### C. Database (Storage)
*   **Platform**: Supabase (PostgreSQL).
*   **Role**: Stores user profiles, raw sensor logs, and fused history.
*   **Realtime**: Postgres Changes (Listening for updates).

### D. Hardware (Edge)
*   **Microcontroller**: ESP32 / ESP8266.
*   **Sensors**: DHT11/22, BMP180, MQ-135.
*   **Connectivity**: 
    1.  **WiFi Mode**: Sends JSON payloads to Python Backend (HTTP POST).
    2.  **Serial Mode**: Streams JSON payloads via USB (115200 baud) for Light Mode.

---

## 2. Core Features

### A. Dual-Mode Dashboard
EcoSync offers two primary ways to view data:
1.  **Pro Mode (Cloud)**:
    -   Best for: Remote monitoring, historical analysis, multi-device access.
    -   Tech: `recharts`, `axios` -> `FastAPI`.
    -   Features: 24h history charts, min/max stats, reliable cloud storage.
2.  **Light Mode (Local)**:
    -   Best for: Field work, no internet, debugging.
    -   Tech: `navigator.serial`.
    -   Features: Instant live values, direct hardware connection, zero-latency.

### B. "Bio-Auth" Security
The login system is more than just a form; it's a themed experience:
-   Visual feedback imitating a biometric scan.
-   Secure token handling via Supabase client.
-   Auto-redirects based on session state.

---

## 3. Data Flow

1.  **Sensor Reading**: ESP32 reads physical sensors every 2-5 seconds.
2.  **Preprocessing**: Basic outlier filtration on the edge device.
3.  **Transmission**:
    -   If WiFi Connected: HTTP POST to `https://capstone-backend.../iot/data`.
    -   If USB Connected: `Serial.println(json_string)`.
4.  **Processing (Backend)**:
    -   Incoming data passes through **Kalman Filter**.
    -   Stored in Supabase `readings` table.
5.  **Visualization**:
    -   Frontend polls Backend algorithms for "Fused" data.
    -   Light Mode parses Serial stream directly.

---

## 4. Setup Guide

### Environment Variables (.env)
```
VITE_API_BASE_URL=https://capstone-backend-djdd.onrender.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Deployment
-   **Frontend**: Netlify (via GitHub).
-   **Backend**: Render (via Docker/GitHub).
