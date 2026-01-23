import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('models/gemini-2.0-flash')
else:
    print("Warning: GEMINI_API_KEY not found. AI features will be disabled.")
    model = None

async def analyze_sensor_data(temp, humidity, aqi, gas_status):
    """
    Uses Gemini to generate a short safety precaution based on sensor metrics.
    """
    if not model:
        return ["AI Offline: Check API Key"]

    prompt = f"""
    Act as an Environmental Safety Officer. 
    Analyze these metrics:
    - Temperature: {temp}°C
    - Humidity: {humidity}%
    - Air Quality Index (AQI): {aqi}
    - Hazardous Gas: {gas_status}

    Provide 2-3 short, imperative safety precautions for personnel in this environment.
    Format as a Python list of strings. Do not include markdown code blocks.
    Example: ["Wear N95 mask immediately.", "Limit exposure to 15 mins."]
    """

    try:
        response = await model.generate_content_async(prompt)
        text = response.text.strip()
        
        # Simple parsing to get list from text if needed, or just return lines
        lines = [line.strip().lstrip('- ').lstrip('* ') for line in text.split('\n') if line.strip()]
        return lines[:3] # Return top 3
    except Exception as e:
        print(f"Gemini Error: {e}")
        return ["AI Analysis Unavailable"]
