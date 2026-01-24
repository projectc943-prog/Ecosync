# EcoSync S4: Intelligent Environmental Monitoring System 🌍
> **A Next-Gen IoT Platform for Real-Time Air Quality & Environmental Tracking**

![Project Banner](https://placehold.co/1200x400/0f172a/22d3ee?text=EcoSync+S4+Dashboard)

## 🚀 Overview
**EcoSync S4** is a demonstration of a modern, scalable IoT architecture designed to bridge the gap between low-cost hardware and enterprise-grade environmental analysis. Unlike traditional student projects that simply display sensor values, EcoSync S4 implements a **Dual-Tier SaaS Architecture**, **AI-Driven Predictive Analytics**, and **Sensor Fusion** algorithms to provide actionable insights.

This repository contains the complete source code for:
*   **Hardware**: ESP32 Firmware (C++) with HTTP Handshake & OLED Feedback.
*   **Backend**: Python FastAPI with Sensor Fusion Engine & Google Gemini AI.
*   **Frontend**: React + Vite Dashboard with Glassmorphism UI & PWA support.

---

## 🌟 Key Features ("Top Notch")

### 1. Dual-Mode Capability (Lite vs Pro)
The system features two distinct operational modes to demonstrate capability scaling and access control.
*   **Lite Mode**: streamlined access to real-time environmental data.
*   **Pro Mode**: Unlocks advanced features like **AI Assistant**, **Historical Analytics**, and **Sensor Fusion**.


### 2. Advanced Sensor Fusion (Pro Feature)
While the system collects **real-time data** from physical sensors (DHT11 & MQ-135), the Pro mode enhances this by:
*   **Validation**: Comparing local readings against public weather APIs (OpenMeteo) to identify sensor drift.
*   **Fusion**: Using a **Kalman Filter** to weigh local vs. public data, ensuring the dashboard shows the most probable environmental state even if one source is noisy.

### 3. AI Safety Officer (Google Gemini)
*   The system doesn't just show "CO2: 400ppm".
*   It analyzes the combination of Temp+Humidity+Gas using **Google Gemini AI**.
*   **Result**: "High Humidity + High Temp = Mold Risk. Suggest ventilation."

### 4. Hardware "Handshake" Protocol
*   Bi-directional communication verification.
*   The ESP32 sends data and **waits for a 200 OK** from the server.
*   **Visual Feedback**: Green LED blinks 3 times ONLY if the server accepts the data.

---

## 📸 Screenshots & Usage

### The Pro Dashboard
*A futuristic, glass-depth interface monitoring real-time metrics.*
![Dashboard](https://placehold.co/800x450/1e293b/4f46e5?text=Pro+Dashboard+Interface)

### Live Map & Predictive Zone
*Leaflet.js integration showing sensor nodes and Air Quality heatmaps.*
![Live Map](https://placehold.co/800x450/1e293b/10b981?text=Live+Map+Visualization)

### Hardware Setup
*ESP32 + DHT11 + MQ135 + OLED wiring diagram.*
![Hardware](https://placehold.co/800x450/1e293b/f59e0b?text=Hardware+Setup)

---

## 🛠️ Technology Stack
| Layer | Tech Stack | Key Libraries |
| :--- | :--- | :--- |
| **Frontend** | React, Vite | `recharts`, `lucide-react`, `leaflet`, `tailwindcss` |
| **Backend** | Python, FastAPI | `sqlalchemy`, `pydantic`, `google-generativeai`, `numpy` |
| **Hardware** | ESP32 (C++) | `ArduinoJson`, `Adafruit_GFX`, `HTTPClient` |
| **Database** | SQLite (Dev) / PostgreSQL (Prod) | `alembic` for migrations |
| **DevOps** | Docker | Hugging Face Spaces, Firebase Hosting |

---

## ⚡ Quick Start Guide

### Prerequisites
*   Node.js v18+
*   Python 3.9+
*   ESP32 Dev Board

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
# Server runs at http://localhost:8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

### 3. Hardware Flash
1. Open `hardware/src/main.cpp` in Arduino IDE.
2. Update `WIFI_SSID`, `WIFI_PASSWORD`, and `SERVER_URL`.
3. Flash to ESP32.

---

## ⚠️ Disclaimer
This software is provided for educational and demonstration purposes only. The authors make no warranties, expressed or implied, regarding the accuracy, reliability, or completeness of the data collected or the safety advice generated. 

*   **Not a Medical Device**: The health recommendations are AI-generated and sensor-based; they are not a substitute for professional medical advice.
*   **Hardware Safety**: Please handle all electronic components with care. The authors are not responsible for any hardware damage or personal injury resulting from the replication of this project.
*   **Liability**: Use this software and hardware design at your own risk. The creators shall not be held liable for any damages arising from its use.

---

## 📄 License
This project is open-source and available under the **MIT License**.
All assets and code created by **The Authors**.
