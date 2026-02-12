import numpy as np
from filterpy.kalman import KalmanFilter
from sklearn.ensemble import IsolationForest
import pickle
import os

class AdaptiveKalmanFilter:
    """
    Improved Kalman Filter that adapts Q (Process Noise) based on 
    signal stability to track trends better while smoothing noise.
    """
    def __init__(self, initial_value=0.0):
        self.kf = KalmanFilter(dim_x=2, dim_z=1) # State: [value, velocity]
        self.kf.x = np.array([[initial_value], [0.]])
        self.kf.F = np.array([[1., 1.], [0., 1.]]) # State transition (Constant Velocity model)
        self.kf.H = np.array([[1., 0.]]) # Measurement function
        self.kf.P *= 10. 
        self.kf.R = 5.0 # High measurement noise (smoothing)
        self.kf.Q = np.array([[0.01, 0.01], [0.01, 0.01]]) # Low process noise initially

    def update(self, measurement):
        self.kf.predict()
        
        # Adaptive Logic: If residual is high, increase Process Noise (Q) to track faster
        residual = abs(measurement - self.kf.x[0, 0])
        if residual > 2.0:
            self.kf.Q[0, 0] = 1.0 # Trust measurement more (fast dynamic)
        else:
            self.kf.Q[0, 0] = 0.01 # Trust model more (smooth steady state)

        self.kf.update(measurement)
        return float(self.kf.x[0, 0])

    def predict_future(self, steps=10):
        """
        Predict future values without updating the state.
        Returns a list of predicted float values.
        """
        predictions = []
        # Save current state
        current_x = self.kf.x.copy()
        current_P = self.kf.P.copy()
        
        for _ in range(steps):
            self.kf.predict()
            predictions.append(float(self.kf.x[0, 0]))
            
        # Restore state
        self.kf.x = current_x
        self.kf.P = current_P
        return predictions

class Preprocessor:
    def __init__(self):
        # [temp, pressure, vibration, wind, uv, soil_temp, soil_moist, pm25, pm10, no2, solar]
        self.min_vals = np.array([-10.0, 900.0, 0.0, 0.0, 0.0, -10.0, 0.0, 0.0, 0.0, 0.0, 0.0])
        self.max_vals = np.array([100.0, 1100.0, 20.0, 150.0, 15.0, 60.0, 1.0, 500.0, 500.0, 200.0, 1500.0])

    def scale(self, features):
        features = np.array(features)
        scaled = (features - self.min_vals) / (self.max_vals - self.min_vals)
        return scaled

class TrustScoreCalculator:
    def __init__(self):
        self.history = []

    def calculate_score(self, reading: dict):
        """
        Calculate trust score (0-100) based on:
        1. Range Validity (Physics check)
        2. Signal Stability (Variance check)
        3. Battery/Power (Simulated)
        """
        score = 100.0
        
        # 1. Physics Range Check
        if not (-50 <= reading.get('temperature', 0) <= 100): score -= 30
        if not (0 <= reading.get('humidity', 0) <= 100): score -= 20
        if reading.get('pm2_5', 0) < 0: score -= 20
        
        # 2. Stability Check (Simulated for single reading)
        # In a real system, we'd check standard deviation over time
        if len(self.history) > 5:
            last_avg = np.mean([x['temperature'] for x in self.history[-5:]])
            if abs(reading.get('temperature', 0) - last_avg) > 10: 
                score -= 15 # Sudden spike penalty

        self.history.append(reading)
        if len(self.history) > 20: self.history.pop(0)
            
        return max(0.0, min(100.0, score))


class RiskLevelCalculator:
    def calculate_risk(self, data: dict, anomalies: list) -> str:
        """
        Determines risk level based on fire-cracker industry standards.
        Output: 'SAFE', 'MODERATE', 'CRITICAL'
        """
        score = 0
        temp = data.get('temperature', 0)
        gas = data.get('gas', 0)
        humidity = data.get('humidity', 50)
        
        # 1. Temperature Risks
        if temp > 50: score += 3 # Critical
        elif temp > 40: score += 1 # Moderate
        
        # 2. Gas Risks
        if gas > 1000: score += 3 # Critical
        elif gas > 500: score += 1 # Moderate
        
        # 3. Humidity Risks (Dryness = Static Electricity Risk)
        if humidity < 30: score += 2 # Moderate-High
        
        # 4. Anomaly Boost
        if anomalies: score += 2
        
        if score >= 3: return "CRITICAL"
        if score >= 1: return "MODERATE"
        return "SAFE"

class PredictionEngine:
    def predict_next_10_mins(self, history: list) -> dict:
        """
        Simple linear projection for short-term trends.
        """
        if len(history) < 5:
            return {"temperature": "Stable", "gas": "Stable"}
            
        # Get last 5 temps
        temps = [x.get('temperature', 0) for x in history[-5:]]
        gases = [x.get('gas', 0) for x in history[-5:]]
        
        # Calculate slope (simple last - first)
        temp_slope = temps[-1] - temps[0]
        gas_slope = gases[-1] - gases[0]
        
        t_trend = "Rising" if temp_slope > 0.5 else ("Falling" if temp_slope < -0.5 else "Stable")
        g_trend = "Rising" if gas_slope > 10 else ("Falling" if gas_slope < -10 else "Stable")
        
        return {"temperature": t_trend, "gas": g_trend}

class SensorHealthMonitor:
    def check_health(self, history: list) -> dict:
        """
        Detects sensor faults like 'Stuck Value' or 'Noisy/Spiky'.
        """
        health = {"temperature": "OK", "gas": "OK", "humidity": "OK"}
        
        if len(history) < 10: return health
        
        for sensor in ["temperature", "gas", "humidity"]:
            readings = [x.get(sensor, 0) for x in history[-10:]]
            if len(set(readings)) == 1:
                health[sensor] = "Stuck/Frozen"
            elif np.std(readings) > 20: # Arbitrary high noise threshold
                health[sensor] = "Unstable/Noisy"
                
        return health

class SmartInsightGenerator:
    """
    Generates human-readable insights, precautions, and now Risk/Health metrics.
    Acts as a deterministic 'AI' expert system.
    """
    def __init__(self):
        self.risk_calc = RiskLevelCalculator()
        self.predictor = PredictionEngine()
        self.health_mon = SensorHealthMonitor()
        self.history_buffer = []

    def generate_full_report(self, reading: dict, anomalies: list):
        # Update history
        self.history_buffer.append(reading)
        if len(self.history_buffer) > 20: self.history_buffer.pop(0)
        
        # Calculate Metrics
        risk = self.risk_calc.calculate_risk(reading, anomalies)
        health = self.health_mon.check_health(self.history_buffer)
        prediction = self.predictor.predict_next_10_mins(self.history_buffer)
        
        # Generate Text Insight
        insight_text = self._generate_text(reading, anomalies, risk)
        
        return {
            "insight": insight_text,
            "risk_level": risk,
            "sensor_health": health,
            "prediction": prediction,
            "baseline": self._get_mock_baseline(reading)
        }

    def _get_mock_baseline(self, reading):
        # Returns a 'normal' value slightly different from current for demo
        return {
            "temperature": max(20, reading.get('temperature', 25) - 5),
            "gas": max(100, reading.get('gas', 200) - 50)
        }

    def _generate_text(self, reading: dict, anomalies: list, risk: str):
        insights = []
        
        # High Level Risk Override
        if risk == "CRITICAL":
            insights.append("🔴 CRITICAL SAFETY RISK: Immediate Action Required.")
        
        # Temperature Insights
        temp = reading.get('temperature', 0)
        if temp > 45:
            insights.append("🔥 High Temperature: Fire risk elevated. Ensure cooling systems are active.")
        elif temp < 10:
             insights.append("❄️ Low Temperature: Check heating systems.")
             
        # Gas/Fire Insights
        gas = reading.get('gas', 0)
        if gas > 1500:
             insights.append("☠️ Hazardous Gas Levels: Evacuate area immediately.")
        elif gas > 800:
             insights.append("⚠️ Elevated Gas Levels: Inspect for leaks.")

        # pH Insights
        ph = reading.get('ph', 7.0)
        if ph is not None:
            if ph < 6.0:
                insights.append("🧪 Acidic pH Detected: Check chemical storage.")
            elif ph > 8.5:
                insights.append("🧪 Alkaline pH Detected: Check neutralization.")
        
        if anomalies:
             insights.append(f"⚠️ Anomaly Detected: {', '.join(anomalies)} behavior is unusual.")
             
        return " | ".join(insights) if insights else "System operating within normal parameters."
        
    # Legacy method compatibility
    def generate_insight(self, reading: dict, anomalies: list):
        return self._generate_text(reading, anomalies, "SAFE")

class IoTAnomalyDetector:
    def __init__(self):
        self.buffer = []
        self.model = IsolationForest(n_estimators=100, contamination=0.1)
        self.is_fitted = False
        self.preprocessor = Preprocessor()
        
        self.config = {
            "TEMP_MAX": 80.0,
            "TEMP_MIN": -10.0,
            "VIBRATION_MAX": 5.0,
            "PRESSURE_MIN": 900.0,
            "WIND_MAX": 50.0,
            "UV_MAX": 10.0,
            "PM25_MAX": 150.0,
            "NO2_MAX": 100.0,
            "PH_MIN": 1.0,
            "PH_MAX": 14.0
        }

    def update_config(self, new_config: dict):
        self.config.update(new_config)

    def check_thresholds(self, data: dict):
        alerts = []
        precautions = []
        
        # Temperature
        if data['temperature'] > self.config['TEMP_MAX']:
            alerts.append(f"Temperature High (> {self.config['TEMP_MAX']}°C)")
            precautions.append("Hydrate immediately and avoid direct sunlight.")
            precautions.append("Check device cooling systems.")
        elif data['temperature'] < self.config['TEMP_MIN']:
            alerts.append(f"Temperature Low (< {self.config['TEMP_MIN']}°C)")
            precautions.append("Ensure thermal insulation is active.")

        # Vibration
        if data['vibration'] > self.config['VIBRATION_MAX']:
            alerts.append(f"Vibration Critical (> {self.config['VIBRATION_MAX']})")
            precautions.append("Inspect mounting integrity immediately.")
            precautions.append("Possible bearing failure - schedule maintenance.")

        # Pressure
        if data['pressure'] < self.config['PRESSURE_MIN']:
             alerts.append(f"Pressure Drop (< {self.config['PRESSURE_MIN']}hPa)")
             precautions.append("Check for vacuum leaks or seal breaches.")

        # Wind
        if data.get('wind_speed', 0) > self.config['WIND_MAX']:
            alerts.append(f"High Wind (> {self.config['WIND_MAX']}km/h)")
            precautions.append("Secure loose outdoor equipment.")
            precautions.append("Halt crane/aerial operations.")

        # UV
        if data.get('uv_index', 0) > self.config['UV_MAX']:
            alerts.append(f"Extreme UV (> {self.config['UV_MAX']})")
            precautions.append("Wear UV-protective gear and eye protection.")
            precautions.append("Limit exposure to < 10 minutes.")

        # Air Quality
        if data.get('pm2_5', 0) > self.config['PM25_MAX']:
            alerts.append(f"Hazardous Air Quality (PM2.5 > {self.config['PM25_MAX']})")
            precautions.append("Wear N95/N99 respirator masks.")
            precautions.append("Activate air filtration systems immediately.")
            
        # pH 
        if data.get('ph') is not None:
             if data['ph'] < self.config.get('PH_MIN', 0):
                  alerts.append(f"pH Critical Low (< {self.config.get('PH_MIN')})")
                  precautions.append("Neutralize acid immediately.")
             elif data['ph'] > self.config.get('PH_MAX', 14):
                  alerts.append(f"pH Critical High (> {self.config.get('PH_MAX')})")
                  precautions.append("Neutralize base immediately.")

        return alerts, precautions

    def update_and_predict(self, feature_vector):
        scaled_features = self.preprocessor.scale(feature_vector)
        self.buffer.append(scaled_features)
        
        if len(self.buffer) > 1000:
            self.buffer.pop(0)
        
        if len(self.buffer) >= 50 and not self.is_fitted:
            self.model.fit(self.buffer)
            self.is_fitted = True
            
        if self.is_fitted:
            prediction = self.model.predict([scaled_features])[0]
            score = self.model.decision_function([scaled_features])[0]
            return prediction == -1, score # True if anomaly
        
        return False, 0.0

# Singleton Instances
anomaly_detector = IoTAnomalyDetector()
trust_calculator = TrustScoreCalculator()
insight_generator = SmartInsightGenerator()
