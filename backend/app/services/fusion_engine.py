import numpy as np

class FusionEngine:
    def __init__(self):
        # Fusion weights
        self.local_weight = 0.7
        self.external_weight = 0.3

    def fuse_environmental_data(self, local_data, external_data):
        """Fuse local sensor data with external API data"""
        fused_data = {}

        # Temperature fusion
        if local_data.get('temp') is not None and external_data.get('temp') is not None:
            fused_temp = (self.local_weight * local_data['temp'] +
                        self.external_weight * external_data['temp'])
            fused_data['temp'] = round(fused_temp, 2)
        elif local_data.get('temp') is not None:
            fused_data['temp'] = local_data['temp']
        elif external_data.get('temp') is not None:
            fused_data['temp'] = external_data['temp']

        # Humidity fusion
        if local_data.get('humidity') is not None and external_data.get('humidity') is not None:
            fused_humidity = (self.local_weight * local_data['humidity'] +
                            self.external_weight * external_data['humidity'])
            fused_data['humidity'] = round(fused_humidity, 2)
        elif local_data.get('humidity') is not None:
            fused_data['humidity'] = local_data['humidity']
        elif external_data.get('humidity') is not None:
            fused_data['humidity'] = external_data['humidity']

        # PM2.5 fusion
        if local_data.get('pm25') is not None and external_data.get('pm25') is not None:
            fused_pm25 = (self.local_weight * local_data['pm25'] +
                        self.external_weight * external_data['pm25'])
            fused_data['pm25'] = round(fused_pm25, 2)
        elif local_data.get('pm25') is not None:
            fused_data['pm25'] = local_data['pm25']
        elif external_data.get('pm25') is not None:
            fused_data['pm25'] = external_data['pm25']

        # Calculate confidence based on data availability
        data_sources = 0
        if local_data.get('temp') is not None:
            data_sources += 1
        if external_data.get('temp') is not None:
            data_sources += 1
        if local_data.get('humidity') is not None:
            data_sources += 1
        if external_data.get('humidity') is not None:
            data_sources += 1
        if local_data.get('pm25') is not None:
            data_sources += 1
        if external_data.get('pm25') is not None:
            data_sources += 1

        confidence = min(data_sources / 6 * 100, 100)

        return {
            "fused": fused_data,
            "confidence": round(confidence, 1),
            "data_sources": data_sources,
            "local_data_available": local_data.get('temp') is not None,
            "external_data_available": external_data.get('temp') is not None
        }

    def fuse_weather_prediction(self, local_prediction, external_forecast):
        """Fuse local weather prediction with external forecast"""
        fused_prediction = {
            "rain_probability": 0,
            "rain_intensity": "None",
            "warning": "",
            "recommendations": "",
            "confidence": 0
        }

        # Fuse rain probability
        if local_prediction['rain_probability'] > 0 and external_forecast.get('rain_probability', 0) > 0:
            # Both sources predict rain, combine with higher weight to local prediction
            fused_rain_prob = (0.6 * local_prediction['rain_probability'] +
                             0.4 * external_forecast['rain_probability'])
            fused_prediction["rain_probability"] = min(fused_rain_prob, 100)
        elif local_prediction['rain_probability'] > 0:
            fused_prediction["rain_probability"] = local_prediction['rain_probability']
        elif external_forecast.get('rain_probability', 0) > 0:
            fused_prediction["rain_probability"] = external_forecast['rain_probability']

        # Fuse rain intensity
        if local_prediction['rain_intensity'] != "None" and external_forecast.get('rain_intensity', "None") != "None":
            # Use the more severe intensity
            intensities = ["None", "Light", "Moderate", "Heavy", "Storm"]
            local_idx = intensities.index(local_prediction['rain_intensity'])
            external_idx = intensities.index(external_forecast['rain_intensity'])
            fused_prediction["rain_intensity"] = intensities[max(local_idx, external_idx)]
        elif local_prediction['rain_intensity'] != "None":
            fused_prediction["rain_intensity"] = local_prediction['rain_intensity']
        elif external_forecast.get('rain_intensity', "None") != "None":
            fused_prediction["rain_intensity"] = external_forecast['rain_intensity']

        # Fuse warnings and recommendations
        warnings = []
        if local_prediction['warning']:
            warnings.append(local_prediction['warning'])
        if external_forecast.get('warning'):
            warnings.append(external_forecast['warning'])

        if warnings:
            fused_prediction["warning"] = " | ".join(warnings)

        recommendations = []
        if local_prediction['recommendations']:
            recommendations.append(local_prediction['recommendations'])
        if external_forecast.get('recommendations'):
            recommendations.append(external_forecast['recommendations'])

        if recommendations:
            fused_prediction["recommendations"] = " | ".join(recommendations)

        # Calculate confidence
        data_sources = 0
        if local_prediction['rain_probability'] > 0:
            data_sources += 1
        if external_forecast.get('rain_probability', 0) > 0:
            data_sources += 1

        fused_prediction["confidence"] = min(data_sources / 2 * 100, 100)

        return fused_prediction

    def fuse_aqi(self, local_aqi, external_aqi):
        """Fuse local AQI with external AQI"""
        if not local_aqi or not external_aqi:
            return local_aqi or external_aqi or {"aqi": 0, "category": "Unknown", "color": "#000000"}

        # Use weighted average for AQI
        fused_aqi = (self.local_weight * local_aqi['aqi'] +
                   self.external_weight * external_aqi['aqi'])
        fused_aqi = round(fused_aqi)

        # Get category from the higher AQI
        if local_aqi['aqi'] >= external_aqi['aqi']:
            category = local_aqi['category']
            color = local_aqi['color']
            description = local_aqi['description']
        else:
            category = external_aqi['category']
            color = external_aqi['color']
            description = external_aqi['description']

        return {
            "aqi": fused_aqi,
            "category": category,
            "color": color,
            "description": description,
            "dominant_pollutant": local_aqi.get('dominant_pollutant') or external_aqi.get('dominant_pollutant'),
            "confidence": 80  # Higher confidence due to multiple data sources
        }

# Initialize fusion engine instance
fusion_engine = FusionEngine()