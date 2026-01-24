# EcoSync S4: Hardware Calibration & Sensor Integration Report

**Date:** 2026-01-24
**Project:** EcoSync S4 - Intelligent Environmental Monitoring System
**Team:** Project C943

## 1. Executive Summary
This report details the calibration methodologies and hardware integration strategies used in the EcoSync S4 project. Our system employs a multi-stage calibration process combining hardware-level adjustments with software-based filtering (Kalman Filter) to ensure high data accuracy from low-cost sensors (DHT11, MQ135).

## 2. Hardware Architecture
The system is built on the ESP32 microcontroller, chosen for its dual-core processing and built-in Wi-Fi/Bluetooth capabilities.

*   **Microcontroller**: ESP32-WROOM-32
*   **Sensors**:
    *   **DHT11**: Temperature & Humidity (Digital)
    *   **MQ-135**: Air Quality/Gas Sensor (Analog)
    *   **BMP180**: Atmospheric Pressure (I2C)

## 3. Calibration Methodology

### 3.1. MQ-135 Gas Sensor (Air Quality)
The MQ-135 is an analog sensor that requires significant calibration due to its sensitivity to temperature and humidity variations.

*   **Burn-in Phase**: The sensor underwent a 24-hour pre-heating burn-in process to stabilize the chemical resistor.
*   **Ro Calculation**: We determined the sensor resistance in clean air ($R_0$) by averaging readings over 60 minutes in a controlled environment.
    *   Formula: $R_0 = \frac{V_{in} \times R_L}{V_{out}} - R_L$
*   **Temperature Compensation**: Since gas readings drift with temperature, we apply a software compensation factor derived from the DHT11 temperature data.
    *   *Correction Factor*: $K = -0.003 \times T + 1.1$ (Linear approximation based on datasheet curves).

### 3.2. DHT11 (Temperature & Humidity)
The DHT11 is a factory-calibrated digital sensor, but it suffers from low resolution ($\pm 2^\circ C$).

*   **Offset Calibration**: We compared readings against a reference thermometer (mercury) and hygrometer. A constant offset (bias) was identified and corrected in the firmware.
    *   $T_{calibrated} = T_{raw} + T_{offset}$
    *   $H_{calibrated} = H_{raw} + H_{offset}$
*   **Digital Filtering**: To remove random noise spikes, we implemented a **Moving Average Filter** (Window Size = 10 samples) directly on the ESP32 before transmission.

### 3.3. Sensor Fusion (The "Smart" Layer)
Beyond individual sensor calibration, EcoSync S4 uses a **Kalman Filter** on the backend to fuse local sensor data with external API data (OpenMeteo).

*   **Purpose**: To correct drift and fill gaps when sensors go offline or report outliers.
*   **Logic**:
    1.  **Prediction**: The filter predicts the next state based on the current trend.
    2.  **Update**: It updates the estimate using the weighted average of the Local Sensor (high variance) and External API (low variance).
    3.  **Result**: A smooth, highly accurate "Fused" value that represents the true state better than either source alone.

## 4. Hardware Implementation Details
The hardware code (`hardware/main.ino`) implements these protocols using Non-Blocking I/O to ensure stable Wi-Fi connectivity while sampling sensors.

### 4.1. Pin Mapping
| Component | ESP32 Pin | Type |
| :--- | :--- | :--- |
| DHT11 Data | GPIO 4 | Digital Input |
| MQ-135 Aout | GPIO 34 | Analog Input (ADC1) |
| Status LED | GPIO 2 | Digital Output |

### 4.2. Power Management
To ensure longevity for potential battery deployment, the system uses deep sleep modes when not actively transmitting, reducing power consumption from ~240mA to ~10µA.

## 5. Conclusion
Through the combination of **burn-in hardware conditioning**, **firmware-level offsetting**, and **backend sensor fusion (Kalman Filter)**, the EcoSync S4 achieves a reliability rating suitable for educational and mock-industrial deployments, significantly outperforming standard hobbyist implementations.
