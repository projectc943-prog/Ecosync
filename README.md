# 🌍 Environmental Monitoring and Alerting

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/projectc943-prog/capstone-iot)

**Live Dashboard:** [https://environmental-8b801.web.app](https://environmental-8b801.web.app)  
**API Endpoint:** [https://capstone-backend-djdd.onrender.com](https://capstone-backend-djdd.onrender.com)

## 🚀 Overview
A futuristic, AI-powered environmental monitoring system that fuses local sensor data (ESP32) with global satellite data (NASA/OpenWeather). Featuring 1D Kalman Filtering, duplicate-sensor fusion, and a Glassmorphism II interface.

## 📚 Documentation
For detailed Architecture, API Reference, and Setup Instructions, please see:
👉 **[DOCUMENTATION.md](docs/DOCUMENTATION.md)**

## ⚡ Quick Start

### 1. View Live Demo
Simply visit [https://environmental-8b801.web.app](https://environmental-8b801.web.app).
- **Login**: `gitams4@gmail.com`
- **Password**: `Admin123@#$`

### 2. Run IoT Simulator (Generate Real Data)
To feed data into the live dashboard (if you don't have a physical ESP32):
```bash
python3 scripts/iot_simulator.py
```

### 3. Run Locally (Development)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Project Structure

```text
/Project
├── /backend            # Python FastAPI Server
│   ├── /app            # Application Source
│   └── requirements.txt
├── /frontend           # React Vite Application
│   ├── /src
│   └── package.json
├── /docs               # Documentation
│   └── DOCUMENTATION.md
├── /scripts            # Tools & Simulators
│   └── iot_simulator.py
└── README.md
```

## 🎨 Key Features
*   **Security Drone Login**: Interactive biometric simulation.
*   **HUD Live Map**: Sci-Fi glassmorphism map interface.
*   **Gemini AI Assistant**: Voice-controlled analysis.
*   **Zero Lag Architecture**: Optimized CSS/JS.

---

*Built for Capstone 2025* 🌍
