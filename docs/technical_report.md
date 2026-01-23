# IoT System Technical Project Report

## 1. Executive Summary
This document serves as the comprehensive technical reference for the Environmental Monitoring System. It details the architecture, authorized hardware interfaces, algorithmic core, and deployment strategy.

## 2. System Architecture
The system utilizes a decoupled Microservices architecture to ensure scalability and reliability.

### 2.1 Technology Stack
*   **Frontend**: React 18 (Vite Build Tool) using functional components and Hooks.
    *   *Why?* Virtual DOM ensures efficient updates for real-time sensor data graphs.
*   **Backend**: Python FastAPI (Uvicorn ASI Server).
    *   *Why?* AsyncIO support allows handling hundreds of sensor packets per second without blocking.
*   **Database**: SQLite (SQLAlchemy ORM).
    *   *Why?* Lightweight, zero-configuration atomic transactional database suitable for embedded deployments.

### 2.2 Data Flow Pipeline
1.  **Ingestion**: ESP32 sensors send `POST` requests to `/iot/data`.
2.  **Processing (Fusion Engine)**: Incoming raw data is intercepted by the `AdaptiveKalmanFilter`.
3.  **Storage**: Cleaned data (post-filtering) is committed to the database.
4.  **Broadcast**: Data is pushed to the Frontend via WebSockets (`/ws/stream`) for sub-millisecond latency.

---

## 3. Algorithmic Core: Adaptive Kalman Filter
We do not simply display raw sensor data. We use an **Adaptive Kalman Filter** to mathematically predict the true state of the environment.

### How it Works (The Math)
*   **State Prediction**: $x_{k|k-1} = F x_{k-1|k-1}$
    *   The system predicts the next temperature based on the previous trend.
*   **Adaptive Noise ($Q$)**:
    *   If the sensor reading (Measurement $z_k$) deviates significantly from prediction, we increase Process Noise ($Q$).
    *   This makes the filter "trust" the new reading more, reacting quickly to sudden changes (e.g., Fire).
    *   If the reading is stable, we decrease $Q$, aggressive smoothing out static noise.

### Why Pro Mode is "Slow" (vs Lite Mode)
*   **Lite Mode**: Displays raw, instananeous packet data directly. It is fast but noisy.
*   **Pro Mode**: Must fetch historical context (last 20 points) to compute the Kalman projection.
    *   It samples data every 5 seconds to build a "Prediction Curve" (+10 steps future).
    *   This computation adds a slight latency but provides **higher accuracy** and **forecasting**.

---

## 4. Hardware Integration (ESP32)
The system supports multiple ESP32/ESP8266 nodes.

### Connection Logic
*   **Protocol**: HTTP/1.1 (REST) over WiFi.
*   **Payload**:
    ```json
    {
      "temperature": 25.4,
      "humidity": 60.2,
      "pm25": 12,
      "mq_raw": 340
    }
    ```
*   **Multi-Device**: The Backend distinguishes devices by `deviceID` or IP address.
*   **Direct Connection (Lite Mode)**: The Frontend can bypass the Cloud Backend and query the ESP32 IP directly if on the same LAN, ensuring operation even during internet outages.

---

## 5. Security Protocols
*   **JWT (JSON Web Tokens)**: Stateless session management.
*   **Role-Based Access Control (RBAC)**: Admin vs User permissions.
*   **Rate Limiting**: Prevents API abuse from sensor spam.

## 6. Installation & Integrity
*   **Automated Setup**: `python3 scripts/setup.py` (Handles Environment, Dependencies).
*   **Verification**: All code files are verified for syntax integrity and absence of merge conflicts.
*   **Handoff**: The repository is self-contained and ready for GitHub publication.
