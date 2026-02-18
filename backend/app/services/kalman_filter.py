import numpy as np

class KalmanFilter:
    def __init__(self):
        # Initialize Kalman filter parameters
        self.x = np.zeros((2, 1))  # State estimate
        self.P = np.eye(2)         # Covariance matrix
        self.F = np.array([[1, 1], [0, 1]])  # State transition matrix
        self.H = np.array([[1, 0]])          # Measurement matrix
        self.Q = np.eye(2) * 0.1             # Process noise covariance
        self.R = np.array([[0.1]])           # Measurement noise covariance

    def filter_temperature(self, measurement):
        """Apply Kalman filter to temperature data"""
        # Prediction step
        self.x = self.F @ self.x
        self.P = self.F @ self.P @ self.F.T + self.Q

        # Update step
        S = self.H @ self.P @ self.H.T + self.R
        K = self.P @ self.H.T @ np.linalg.inv(S)
        self.x = self.x + K @ (measurement - self.H @ self.x)
        self.P = (np.eye(2) - K @ self.H) @ self.P

        return float(self.x[0, 0]), float(np.sqrt(self.P[0, 0]))

    def filter_humidity(self, measurement):
        """Apply Kalman filter to humidity data"""
        # Prediction step
        self.x = self.F @ self.x
        self.P = self.F @ self.P @ self.F.T + self.Q

        # Update step
        S = self.H @ self.P @ self.H.T + self.R
        K = self.P @ self.H.T @ np.linalg.inv(S)
        self.x = self.x + K @ (measurement - self.H @ self.x)
        self.P = (np.eye(2) - K @ self.H) @ self.P

        return float(self.x[0, 0]), float(np.sqrt(self.P[0, 0]))

    def filter_pm25(self, measurement):
        """Apply Kalman filter to PM2.5 data"""
        # Prediction step
        self.x = self.F @ self.x
        self.P = self.F @ self.P @ self.F.T + self.Q

        # Update step
        S = self.H @ self.P @ self.H.T + self.R
        K = self.P @ self.H.T @ np.linalg.inv(S)
        self.x = self.x + K @ (measurement - self.H @ self.x)
        self.P = (np.eye(2) - K @ self.H) @ self.P

        return float(self.x[0, 0]), float(np.sqrt(self.P[0, 0]))

    def clean_mq_data(self, raw_value):
        """Clean and filter MQ gas sensor data"""
        # Simple moving average filter
        window_size = 5
        if not hasattr(self, 'mq_buffer'):
            self.mq_buffer = [raw_value] * window_size

        self.mq_buffer.pop(0)
        self.mq_buffer.append(raw_value)

        smoothed_value = sum(self.mq_buffer) / window_size

        # Z-score for outlier detection
        mean = sum(self.mq_buffer) / window_size
        variance = sum((x - mean) ** 2 for x in self.mq_buffer) / window_size
        std_dev = np.sqrt(variance) if variance > 0 else 1
        z_score = (raw_value - mean) / std_dev if std_dev > 0 else 0

        is_outlier = abs(z_score) > 2

        return {
            "smoothed": float(smoothed_value),
            "is_outlier": bool(is_outlier),
            "z_score": float(z_score)
        }

# Initialize Kalman filter instance
kalman_filter = KalmanFilter()