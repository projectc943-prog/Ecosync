import asyncio
import websockets
import json

# Your token from the curl command
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnaXRhbXM0QGdtYWlsLmNvbSIsImV4cCI6MTc2OTg1MDg1OH0.isGWgxYiJ2dvXZuAsv9QzL4J7g_HJn83HUcq0erdJNs"
URI = f"ws://localhost:8000/ws/stream/ESP32_MAIN?token={TOKEN}"

async def test_connection():
    print(f"🔌 Connecting to: {URI} ...")
    try:
        async with websockets.connect(URI) as websocket:
            print("✅ Connected! Waiting for data...")
            while True:
                try:
                    message = await websocket.recv()
                    print(f"📩 Received: {message}")
                except websockets.exceptions.ConnectionClosed:
                    print("❌ Connection closed by server")
                    break
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(test_connection())
    except KeyboardInterrupt:
        print("\n👋 Exiting...")
