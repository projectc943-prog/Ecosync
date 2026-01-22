# 🌍 Environmental IoT Command Center

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/projectc943-prog/capstone-iot)

> **Production-Ready IoT Monitoring System with Predictive AI & Voice Control**

![Status](https://img.shields.io/badge/Status-Operational-emerald) ![Frontend](https://img.shields.io/badge/Frontend-Firebase-orange) ![Backend](https://img.shields.io/badge/Backend-Render-blue)

**Live Demo**: [https://environmental-8b801.web.app](https://environmental-8b801.web.app)
**Backend API**: [https://capstone-backend-djdd.onrender.com](https://capstone-backend-djdd.onrender.com)

## 🌟 Overview
This project is a state-of-the-art **Environmental Monitoring System** designed to track, analyze, and predict critical atmospheric conditions in real-time. It features a **Premium UI** (React + Glassmorphism) with a robust **AI Backend** (Python + FastAPI) to provide actionable insights.

## 🚀 Key Features

### 1. 🖥️ Interactive Command Dashboard
*   **Real-Time Monitoring**: Tracks Temperature, Humidity, Pressure, Air Quality (PM2.5), and more.
*   **Sensor Fusion Radar**: Multi-axis radar chart visualizes balance between sensor inputs.
*   **AI Prediction Curve**: Uses **Kalman Filter** to project temperature trends.
*   **Safety Officer**: AI module analyzes data to generate safety warnings.

### 2. 🌍 Live 3D Mapping
*   **Satellite Navigation**: High-fidelity dark mode maps with Stadia Maps.
*   **Voice-Controlled**: Navigate to any city worldwide with voice commands.
*   **Live Weather**: Automatic real-time weather data integration.

### 3. 🧠 Artificial Intelligence
*   **Kalman Filtering**: Smooths noisy sensor data and predicts future states.
*   **Anomaly Detection**: Uses `IsolationForest` for pattern analysis.
*   **Dynamic Calibration**: Adjustable thresholds via Settings page.

### 4. 🗣️ AI Voice Assistant
*   **Interactive Commands**: 
    *   *"Status Report"* → Reads sensor summary
    *   *"Navigate to London"* → Controls map
    *   *"System Check"* → Diagnostics

### 5. 📉 Analytics & Reporting
*   **Historical Analysis**: Long-term trend visualization.
*   **Correlation Engine**: Scatter plots for relationship analysis.
*   **CSV Export**: One-click data download.

### 6. 🛡️ Enterprise Security
*   **Email/Password Authentication**: Secure user accounts.
*   **JWT Tokens**: Stateless authentication for all API endpoints.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | High-performance UI library. |
| **Styling** | Tailwind CSS / CSS3 | Modern glassmorphism and animations. |
| **Charts** | Recharts | Hardware-accelerated SVG charting. |
| **Maps** | React-Leaflet | Interactive tile maps. |
| **Backend** | FastAPI (Python) | High-speed async API framework. |
| **Database** | SQLite + SQLAlchemy | Lightweight relational database. |
| **AI/ML** | Scikit-Learn, NumPy | Predictive modeling and anomaly detection. |
| **Hardware** | ESP32-WROOM | (Optional) Edge sensor node. |

---

## ⚡ Quick Start Guide

### 1. Setup
Run the setup script to install all dependencies:

```bash
./setup.sh
```

### 2. Start the Application
Launch both frontend and backend with a single command:

```bash
npm start
```

*   **Frontend**: `http://localhost:5173`
*   **Backend API**: `http://localhost:8000`
*   **API Docs**: `http://localhost:8000/docs` (Swagger UI)

### 3. Login Credentials
*   **Admin Email**: `gitams4@gmail.com`
*   **Password**: `Admin123@#$`

### 4. Modes
*   **Lite Mode**: Basic IoT telemetry (works with ESP32).
*   **Pro Mode**: Advanced AI Analytics, Sensor Fusion, and External Weather Data.
*   *Toggle modes on the Login page or Dashboard header.*

### 5. Email Alerts
To enable email notifications, rename `.env.example` to `.env` in the `backend` directory and add your Gmail SMTP credentials.


---

## 📂 Project Structure

```text
/Project
├── /backend            # Python FastAPI Server
│   ├── /app            # Application Source
│   │   ├── main.py     # Entry Point & Routes
│   │   ├── ml_engine.py# AI & Prediction Logic
│   │   ├── models.py   # Database Schemas
│   │   └── ...
│   └── requirements.txt
├── /frontend           # React Vite Application
│   ├── /src
│   │   ├── /pages      # Dashboard, Map, Analytics, Settings
│   │   ├── /components # Reusable UI Elements
│   │   └── ...
│   └── package.json
└── package.json        # Root script runner
```

---

## 🎨 Design Features

*   **Glassmorphism UI**: Modern frosted-glass aesthetic
*   **Smooth Animations**: Micro-interactions enhance UX
*   **Dark Mode**: Premium dark theme with vibrant accents
*   **Responsive Design**: Works on all screen sizes

---

*Built with ❤️ for Environmental Monitoring* 🌍
