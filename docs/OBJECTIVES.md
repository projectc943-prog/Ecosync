# Eco Intelligence - Project Objectives

## Objective 1: Overcome sensor accuracy and reliability issues (Calibration + Error-handling + Drift correction + Kalman Filter)

**What we do**

* **Calibration:** For every sensor, convert raw readings into correct units using calibration equation **y = a·x + b** (offset + gain).
* **Error handling:** Detect and handle invalid values like:
  * sensor read failure/NaN/0,
  * out-of-range values (ex: pH < 0 or > 14),
  * sudden spikes caused by sensor noise.
* **Drift correction:** Monitor readings over time (sliding window mean/variance). If drift is detected (value slowly shifting without real reason), apply correction or re-calibration flag.
* **Kalman filtering:** Apply **1D Kalman Filter** per parameter to reduce noise and produce **stable filtered values** for alerts and dashboard.

**What you will show in review**

* Raw vs calibrated values (before/after)
* Raw vs Kalman filtered graph to prove noise reduction
* Example of spike removal / invalid reading handling

---

## Objective 2: Enable real-time data collection and monitoring using IoT-based sensors

**What we do**

* Build the **hardware IoT node** (ESP32/NodeMCU + sensors) and continuously read:
  * temperature, humidity, air quality, water pH (and other supported parameters).
* Set a **sampling interval** (example: every 2–5 seconds).
* For each reading, attach:
  * **timestamp**, **device ID**, and **sensor status** (OK/FAIL).

**What you will show in review**

* Live sensor readings in Serial Monitor
* Continuous update proving real-time monitoring
* Wiring setup/photos of sensors with controller

---

## Objective 3: Integrate with cloud platforms for scalable storage, processing, and analytics

**What we do**

* Send readings from IoT node to cloud using **MQTT/HTTP**.
* Store in cloud database with time-series structure:
  * `device_id`, `timestamp`, values, status
* Maintain two streams/collections:
  * **Raw readings** (for audit/debug)
  * **Processed readings** (calibrated + Kalman filtered)
* Enable cloud queries for analytics:
  * retrieve last 1 hour/1 day readings
  * compute min/max/average trends

**What you will show in review**

* MQTT publish/subscribe proof (topics + payload)
* Cloud database entries with timestamps
* Simple trend view (hourly/day graph)

---

## Objective 4: Implement automated and accurate alert mechanisms (SMS, email, mobile notifications)

**What we do**

* Define safe operating thresholds for each parameter (example: pH range, air-quality threshold, temperature limit).
* Run alert checks on **filtered (Kalman) values** to reduce false alarms.
* Assign **severity levels**:
  * Normal / Warning / Critical depending on exceed amount.
* Add **cooldown logic** (avoid repeated alerts every second).
* When alert triggers:
  * store alert record in DB
  * send notification (SMS/email/app message)
  * include parameter, value, time, device/location, severity

**What you will show in review**

* One real-time threshold breach test (simulate with gas source or change pH sensor condition if possible)
* Screenshot of received alert (SMS/email)
* Alert logs in DB (history list)

---

# Status of Implementation (Objective-wise)

## Objective 1: Accuracy & Reliability
- [x] **Calibration Logic**: Implemented `y = ax + b` correction in firmware.
- [x] **Kalman Filter**: 1D Adaptive filter coded in Python (`ml_engine.py`) for noise smoothing.
- [x] **Drift Detection**: Sliding window variance check active.
- **Evidence**:
  - *[Paste Screenshot: Serial Monitor showing erratic Raw Value vs. Smooth Filtered Value]*

## Objective 2: Real-time IoT Monitoring
- [x] **Hardware Setup**: ESP32 + DHT22/MQ135 wired and transmitting.
- [x] **Sampling**: Configured for 2-second intervals.
- [x] **Dashboard**: React Frontend (`LiveMap.jsx`) receiving updates via API.
- **Evidence**:
  - *[Paste Screenshot: Dashboard showing live, changing numbers]*
  - *[Paste Photo: Physical circuit/box setup]*

## Objective 3: Cloud Integration
- [x] **Cloud Database**: Supabase (PostgreSQL) connected and active.
- [x] **API Endpoints**: FastAPI (`main.py`) receiving POST requests from ESP32.
- [x] **Storage**: `readings` table storing timestamped data.
- **Evidence**:
  - *[Paste Screenshot: Supabase Table view showing rows of recent data]*

## Objective 4: Automated Alerts
- [x] **Thresholds**: Defined limits (e.g., AQI > 150) in `IoTAnomalyDetector`.
- [x] **Notification logic**: Email service service connected.
- [x] **Alert History**: Database logging critical events.
- **Evidence**:
  - *[Paste Screenshot: Email Notification received on phone]*
  - *[Paste Screenshot: "Alerts" table in the Dashboard/Database]*
