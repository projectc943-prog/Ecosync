import math

class WeatherService:
    def __init__(self):
        # Weather prediction parameters
        self.humidity_threshold = 70  # High humidity threshold for rain prediction
        self.pressure_drop_threshold = 2  # Pressure drop threshold for rain prediction (hPa)
        self.wind_speed_threshold = 15  # High wind speed threshold for storm prediction (km/h)

    def calculate_rainfall_prediction(self, humidity, wind_speed, pressure):
        """Calculate rainfall prediction based on sensor data"""
        prediction = {
            "rain_probability": 0,
            "rain_intensity": "None",
            "warning": "",
            "recommendations": ""
        }

        # Calculate rain probability based on humidity and pressure
        if humidity >= self.humidity_threshold:
            # High humidity indicates potential for rain
            rain_prob = (humidity - self.humidity_threshold) / (100 - self.humidity_threshold) * 100
            prediction["rain_probability"] = min(rain_prob, 100)

            # Check pressure drop for rain confirmation
            if pressure < 1013:  # Standard pressure is 1013 hPa
                pressure_drop = 1013 - pressure
                if pressure_drop >= self.pressure_drop_threshold:
                    prediction["rain_probability"] = min(prediction["rain_probability"] + 20, 100)

            # Determine rain intensity
            if prediction["rain_probability"] >= 80:
                prediction["rain_intensity"] = "Heavy"
                prediction["warning"] = "High chance of heavy rain. Prepare for potential flooding."
                prediction["recommendations"] = "Stay indoors, avoid travel, secure outdoor items."
            elif prediction["rain_probability"] >= 50:
                prediction["rain_intensity"] = "Moderate"
                prediction["warning"] = "Moderate chance of rain. Be prepared for wet conditions."
                prediction["recommendations"] = "Carry umbrella, drive carefully, watch for slippery roads."
            else:
                prediction["rain_intensity"] = "Light"
                prediction["warning"] = "Slight chance of light rain. Minor inconvenience expected."
                prediction["recommendations"] = "Consider carrying umbrella, normal activities can continue."

        # Check for storm conditions
        if wind_speed >= self.wind_speed_threshold:
            prediction["warning"] = "High wind speeds detected. Potential for storm conditions."
            prediction["recommendations"] = "Secure loose objects, avoid tall structures, stay indoors if possible."
            prediction["rain_intensity"] = "Storm" if prediction["rain_probability"] > 50 else "Windy"

        return prediction

    def calculate_weather_trend(self, historical_data):
        """Analyze weather trends from historical data"""
        if not historical_data:
            return {
                "trend": "insufficient_data",
                "direction": "unknown",
                "confidence": 0
            }

        # Calculate trends for different parameters
        temp_trend = self._calculate_trend(historical_data, 'temperature')
        humidity_trend = self._calculate_trend(historical_data, 'humidity')
        pressure_trend = self._calculate_trend(historical_data, 'pressure')

        # Determine overall weather trend
        trends = [temp_trend, humidity_trend, pressure_trend]
        trend_counts = {
            "improving": sum(1 for t in trends if t > 0),
            "deteriorating": sum(1 for t in trends if t < 0),
            "stable": sum(1 for t in trends if t == 0)
        }

        if trend_counts["deteriorating"] >= 2:
            overall_trend = "deteriorating"
            direction = "worsening"
        elif trend_counts["improving"] >= 2:
            overall_trend = "improving"
            direction = "improving"
        else:
            overall_trend = "stable"
            direction = "stable"

        # Calculate confidence based on trend consistency
        confidence = max(trend_counts.values()) / len(trends) * 100

        return {
            "trend": overall_trend,
            "direction": direction,
            "confidence": round(confidence, 1),
            "details": {
                "temperature": temp_trend,
                "humidity": humidity_trend,
                "pressure": pressure_trend
            }
        }

    def _calculate_trend(self, data, parameter):
        """Calculate trend for a specific parameter"""
        if len(data) < 2:
            return 0

        values = [d.get(parameter) for d in data if d.get(parameter) is not None]
        if len(values) < 2:
            return 0

        # Simple linear regression to determine trend
        x = list(range(len(values)))
        y = values

        # Calculate slope (trend)
        n = len(x)
        x_mean = sum(x) / n
        y_mean = sum(y) / n

        numerator = sum((xi - x_mean) * (yi - y_mean) for xi, yi in zip(x, y))
        denominator = sum((xi - x_mean) ** 2 for xi in x)

        if denominator == 0:
            return 0

        slope = numerator / denominator

        # Normalize slope to -1 to 1 range
        if slope > 0.5:
            return 1  # Improving
        elif slope < -0.5:
            return -1  # Deteriorating
        else:
            return 0  # Stable

# Initialize weather service instance
weather_service = WeatherService()