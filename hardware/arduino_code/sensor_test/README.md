# Sensor Test for Ecosync

This sketch tests the DHT11 and MQ sensors connected to your ESP32.

## Wiring
- **DHT11 Data Pin**: GPIO 4 (D4)
- **MQ Sensor Analog Pin**: GPIO 34 (D34)
- **VCC/GND**: 3.3V or 5V (Check your specific sensor voltage requirements)

## How to Run
1. Open `sensor_test.ino` in the Arduino IDE.
2. Select your Board (e.g., "DOIT ESP32 DEVKIT V1").
3. Select the correct COM Port.
4. Install required libraries via Library Manager:
   - `DHT sensor library` by Adafruit
   - `Adafruit Unified Sensor`
5. Upload the code.
6. Open the **Serial Monitor** (Tools > Serial Monitor).
7. Set the baud rate to **115200**.

## Output
You should see readings like:
```
Humidity: 60.00%  Temperature: 25.00°C   MQ Raw Value: 1200
```
