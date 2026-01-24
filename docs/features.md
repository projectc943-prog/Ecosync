# EcoSync S4 - Features Overview

## 1. User Experience & Design
-   **Bio-Mimetic Interface**: A "Living UI" that mimics organic growth and neural networks. (Dark Emerald Theme).
-   **Glassmorphism**: Modern, translucent UI components for a premium feel.
-   **Responsive**: Fully functional on Mobile, Tablet, and Desktop.

## 2. Dashboard Modes (Dual-Core)

### 🟢 Pro Mode (Cloud Connected)
*   **Source**: Supabase Database (Cloud).
*   **Features**:
    -   Historical Data Charts (Temperature, Humidity, Air Quality).
    -   Global Map with Sensor Locations.
    -   AI Insights (Google Gemini Integration ready).
    -   Export Data to CSV.
*   **Use Case**: Remote monitoring and data analysis.

### 🟡 Light Mode (Offline/Local)
*   **Source**: USB Serial (Web Serial API).
*   **Features**:
    -   **Zero-Setup**: Just plug in the ESP32.
    -   **Real-time**: sub-100ms latency.
    -   **Privacy**: Data stays in the browser/device, nothing is sent to the cloud.
*   **Use Case**: Field technicians, internet outages, debugging.

## 3. Security
-   **Supabase Auth**: Industry-standard robust authentication.
-   **Row Level Security (RLS)**: Users see only their own organization's data (if configured for multi-tenant).
-   **Secure Tokens**: JWT-based session management.

## 4. Hardware Integration
-   **Multi-Sensor Fusion**: Fuses data from DHT22 (Temp/Hum), BMP180 (Pressure), and MQ135 (Air Quality).
-   **Smart Sleep**: ESP32 Deep Sleep configurable for battery savings.
