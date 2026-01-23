# 🌍 EcoSync S4: Environmental Intelligence

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/projectc943-prog/capstone-iot)

**Live Dashboard:** [https://environmental-8b801.web.app](https://environmental-8b801.web.app)  
**API Endpoint:** [https://projectc943-project943.hf.space](https://projectc943-project943.hf.space)

## 🚀 Overview
**EcoSync S4** is an advanced AI-powered environmental monitoring system. It fuses local sensor data (ESP32) with global satellite intelligence (OpenWeather) using an **Adaptive Kalman Filter** to provide hyper-accurate, noise-free air quality data.

## 📚 Documentation Center
Everything you need to know is in the `docs/` folder:

1.  👉 **[Installation Guide](docs/installation_guide.md)**: How to set up and run the code.
2.  👉 **[User Manual](docs/user_manual.md)**: Step-by-step usage guide (Profile, Dashboard).
3.  👉 **[Technical Report](docs/technical_report.md)**: Deep dive into Architecture, Sensor Fusion Logic, and Hardware specs.
4.  👉 **[Feature List](docs/feature_list.md)**: Summary of all capabilities.

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
