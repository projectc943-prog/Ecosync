import asyncio
from app.services.ai_service import analyze_sensor_data
from dotenv import load_dotenv
import os

load_dotenv()

async def test_gemini():
    # Mock data
    temp = 35.5
    humidity = 80
    aqi = 150
    gas = "DETECTED"
    
    print("Testing Gemini API with:")
    print(f"Key Present: {bool(os.getenv('GEMINI_API_KEY'))}")
    print(f"Key Prefix: {os.getenv('GEMINI_API_KEY')[:5]}...")
    
    print("\nSending request...")
    result = await analyze_sensor_data(temp, humidity, aqi, gas)
    print("\nResult:")
    print(result)

if __name__ == "__main__":
    asyncio.run(test_gemini())
