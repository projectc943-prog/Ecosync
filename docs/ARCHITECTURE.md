# How Eco Intelligence Was Built (Technical Architecture)

## 🏗 High-Level Architecture
**Eco Intelligence** uses a modern **Client-Server Architecture**, designed for scalability and real-time data processing.

### 1. The Frontend (Client-Side)
*Where the user interacts.*
-   **Framework**: **React.js** (Vite) for a fast, responsive Single Page Application (SPA).
-   **Styling**: **TailwindCSS** + Custom CSS Variables for the "Bio-Digital" glassmorphism aesthetic.
-   **State Management**: `Context API` (`AuthContext`) for managing user sessions and global state.
-   **Mapping**: **Leaflet.js** for rendering interactive, geo-spatial sensor maps.
-   **Visualization**: **Recharts** for rendering high-performance real-time analytics graphs.
-   **Routing**: **React Router** for seamless page transitions.

### 2. The Backend (Server-Side)
*The brain of the operation.*
-   **Language**: **Python** (FastAPI/Flask architecture pattern).
-   **API Core**: `main.py` handles HTTP requests, serving endpoints like `/api/data` and `/auth`.
-   **AI Engine**:
    -   `ml_engine.py`: Runs predictive models (Linear Regression/LSTM) to forecast air quality.
    -   `chat_engine.py`: Powers the AI Assistant using LLM logic.
-   **Data Processing**:
    -   **Kalman Filtering**: Implemented to "fuse" noisy sensor readings with satellite baselines to produce a "True" value.
    -   **Aggregators**: Scripts to calculate average AQI, Temperature, and Humidity from multiple nodes.

### 3. The Database & Storage
*Where data lives.*
-   **Primary Database**: **Supabase (PostgreSQL)**.
    -   Stores User Profiles (`users` table).
    -   Logs Sensor Telemetry (`readings` table).
-   **Local Storage**: Browser-based caching for user preferences and temporary session tokens.

### 4. IoT Hardware (The Edge)
*How we get the data.*
-   **Microcontrollers**: **ESP32** (Wi-Fi enabled).
-   **Sensors**:
    -   **DHT22**: Temperature & Humidity.
    -   **MQ-135**: Air Quality (Co2, NH3, VOCs).
-   **Protocol**: Sensors send JSON payloads via HTTP POST to the central server.

---

## 🚀 Key Technical Challenges Solved

### 1. "Only Leafs" / Blank Screen Optimization
-   **Problem**: On reload, the app would flash a blank screen or just the background because the Authentication check was asynchronous.
-   **Solution**: Implemented a `loading` state in `AuthContext` that pauses rendering and shows a "Initializing Bio-Link..." spinner until the user session is confirmed.

### 2. Sensor Fusion Accuracy
-   **Problem**: Cheap IoT sensors are noisy and drift over time.
-   **Solution**: We implemented a **Sensor Fusion Algorithm**. It takes the raw IoT input and calculates a weighted average against reliable Satellite API data. The result is a smoothed, accurate "Fusion" metric.

### 3. Real-Time Performance
-   **Problem**: Rendering live graphs for multiple sensors is heavy.
-   **Solution**: Used `Recharts` with optimized re-renders and React's `useMemo` to ensure the dashboard remains buttery smooth (60fps) even with live data streams.

---
*Created for the Eco Intelligence Development Team*
