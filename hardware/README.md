# EcoSync S4: Hardware Setup & Handshake Guide

This guide explains how to set up the ESP32 hardware and verify the "Handshake" connection with the backend.

## 1. Hardware Requirements
*   ESP32 Development Board (DOIT DEVKIT V1 recommended)
*   DHT11 Temperature/Humidity Sensor
*   MQ-135 Gas Sensor
*   LEDs (Red & Green)
*   Active Buzzer
*   OLED Display (SSD1306)

## 2. Wiring Diagram
| Component | ESP32 Pin | Function |
| :--- | :--- | :--- |
| **DHT11 Data** | GPIO 4 | Temp/Hum Data |
| **MQ-135 A0** | GPIO 34 | Gas Analog Value |
| **MQ-135 DO** | GPIO 27 | Digital Threshold |
| **Red LED** | GPIO 23 | Danger Indicator |
| **Green LED** | GPIO 18 | Status/Handshake |
| **Buzzer** | GPIO 13 | Alarm |
| **OLED SDA** | GPIO 21 | Display Data |
| **OLED SCL** | GPIO 22 | Display Clock |

## 3. The "Handshake" Feature
The new `main.cpp` code includes a verification step to ensure data is actually reaching the server.

### How it works:
1.  ESP32 collects sensor data.
2.  It sends a JSON POST request to `http://YOUR_BACKEND_IP:8000/iot/data`.
3.  It waits for a response code.

### Visual Feedback
*   **✅ Success (Handshake Confirmed)**:
    *   Backend returns `200 OK`.
    *   **Green LED blinks rapidly 3 times.**
    *   Serial Monitor prints: `✅ Handshake Success: Data Received by Server!`
*   **❌ Failure**:
    *   Backend unreachable or error.
    *   **Red LED blinks once.**
    *   Serial Monitor prints error details.

## 4. Setup Instructions
1.  Open `hardware/src/main.cpp` in Arduino IDE or PlatformIO.
2.  Update lines 11-13 with your credentials:
    ```cpp
    const char* WIFI_SSID = "YourWiFiSSID";
    const char* WIFI_PASSWORD = "YourWiFiPassword";
    const char* SERVER_URL = "http://YOUR_Laptop_IP:8000/iot/data"; 
    ```
    *(Note: If running locally, find your laptop IP using `ipconfig` or `ifconfig`)*.
3.  Flash the code to the ESP32.
4.  Open Serial Monitor (115200 baud) to watch the handshake happen!
