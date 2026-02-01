import math

class AQICalculator:
    def __init__(self):
        # AQI breakpoints for PM2.5
        self.pm25_breakpoints = [
            (0, 12, 0, 50),
            (12.1, 35.4, 51, 100),
            (35.5, 55.4, 101, 150),
            (55.5, 150.4, 151, 200),
            (150.5, 250.4, 201, 300),
            (250.5, 500.4, 301, 500)
        ]

        # AQI categories
        self.aqi_categories = [
            (0, 50, "Good", "#00e400", "Air quality is satisfactory, and air pollution poses little or no risk."),
            (51, 100, "Moderate", "#ffff00", "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution."),
            (101, 150, "Unhealthy for Sensitive Groups", "#ff7e00", "Members of sensitive groups may experience health effects. The general public is less likely to be affected."),
            (151, 200, "Unhealthy", "#ff0000", "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects."),
            (201, 300, "Very Unhealthy", "#99004c", "Health alert: The risk of health effects is increased for everyone."),
            (301, 500, "Hazardous", "#7e0023", "Health warning of emergency conditions: everyone is more likely to be affected.")
        ]

    def calculate_aqi(self, concentration, breakpoints):
        """Calculate AQI using EPA formula"""
        for (c_low, c_high, i_low, i_high) in breakpoints:
            if c_low <= concentration <= c_high:
                aqi = ((i_high - i_low) / (c_high - c_low)) * (concentration - c_low) + i_low
                return round(aqi)
        return 0

    def calculate_overall_aqi(self, pollutants):
        """Calculate overall AQI from multiple pollutants"""
        aqi_values = []
        dominant_pollutant = None
        max_aqi = 0

        # Calculate AQI for each pollutant
        if 'pm25' in pollutants:
            pm25_aqi = self.calculate_aqi(pollutants['pm25'], self.pm25_breakpoints)
            aqi_values.append(pm25_aqi)
            if pm25_aqi > max_aqi:
                max_aqi = pm25_aqi
                dominant_pollutant = "PM2.5"

        # Add other pollutants here if needed

        # Overall AQI is the maximum of individual AQIs
        overall_aqi = max(aqi_values) if aqi_values else 0

        # Get category
        category, color, description = self.get_aqi_category(overall_aqi)

        return {
            "aqi": overall_aqi,
            "category": category,
            "color": color,
            "description": description,
            "dominant_pollutant": dominant_pollutant,
            "dominant_pollutant_aqi": max_aqi
        }

    def get_aqi_category(self, aqi):
        """Get AQI category based on AQI value"""
        for (low, high, category, color, description) in self.aqi_categories:
            if low <= aqi <= high:
                return category, color, description
        return "Unknown", "#000000", "AQI out of range"

    def get_health_recommendations(self, aqi, dominant_pollutant):
        """Get health recommendations based on AQI"""
        recommendations = {
            "general": "",
            "sensitive_groups": "",
            "good_outdoor_activity": True,
            "mask_recommended": False
        }

        if aqi <= 50:
            recommendations["general"] = "Enjoy outdoor activities! Air quality is good."
            recommendations["sensitive_groups"] = "No special precautions needed."
            recommendations["good_outdoor_activity"] = True
            recommendations["mask_recommended"] = False

        elif aqi <= 100:
            recommendations["general"] = "Air quality is acceptable, but moderate pollution may pose a risk for sensitive individuals."
            recommendations["sensitive_groups"] = "Consider reducing prolonged outdoor exertion if you experience symptoms."
            recommendations["good_outdoor_activity"] = True
            recommendations["mask_recommended"] = False

        elif aqi <= 150:
            recommendations["general"] = "Air quality is unhealthy for sensitive groups. General public may experience minor effects."
            recommendations["sensitive_groups"] = "Reduce prolonged outdoor exertion. Consider moving activities indoors or rescheduling."
            recommendations["good_outdoor_activity"] = False
            recommendations["mask_recommended"] = True

        elif aqi <= 200:
            recommendations["general"] = "Everyone may begin to experience health effects. Sensitive groups may experience more serious effects."
            recommendations["sensitive_groups"] = "Avoid prolonged outdoor exertion. Stay indoors if possible."
            recommendations["good_outdoor_activity"] = False
            recommendations["mask_recommended"] = True

        elif aqi <= 300:
            recommendations["general"] = "Health alert! Everyone may experience more serious health effects."
            recommendations["sensitive_groups"] = "Avoid all outdoor physical activity. Stay indoors and keep activity levels low."
            recommendations["good_outdoor_activity"] = False
            recommendations["mask_recommended"] = True

        else:
            recommendations["general"] = "Health warning! Emergency conditions. Everyone is more likely to be affected."
            recommendations["sensitive_groups"] = "Everyone should avoid all outdoor physical activity. Remain indoors and keep activity levels very low."
            recommendations["good_outdoor_activity"] = False
            recommendations["mask_recommended"] = True

        # Add specific recommendations based on dominant pollutant
        if dominant_pollutant == "PM2.5":
            recommendations["general"] += " PM2.5 particles can penetrate deep into lungs."
            recommendations["sensitive_groups"] += " Especially important for people with heart or lung disease, older adults, and children."

        return recommendations

# Initialize AQI calculator instance
aqi_calculator = AQICalculator()