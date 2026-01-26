#define BLYNK_TEMPLATE_ID "TMPL3yy0cs--q"
#define BLYNK_TEMPLATE_NAME "SMART DEVICE"
#define BLYNK_AUTH_TOKEN "MkSpbws2is9fJBmCSYiiBgCUSQLYAKGS"

#define BLYNK_PRINT Serial

#include <BlynkSimpleEsp32.h>
#include <DHT.h>
#include <WiFi.h>
#include <WiFiClient.h>

// --- WIFI CREDENTIALS ---
char ssid[] = "Airtel_Dhanu";
char pass[] = "7093552024";

// --- HARDWARE CONFIG ---
// DHT11 Sensor
#define DHTPIN 4 // GPIO 4 (D4)
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// Gas Sensor (MQ-135/MQ-2)
// MUST use an ADC1 pin because ADC2 is invalid when WiFi is on!
// Safe ADC1 pins: 32, 33, 34, 35, 36
#define GAS_PIN 34

BlynkTimer timer;

void sendSensorData() {
  // 1. Read DHT11
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
    // Send "Error" values or keep last known
  } else {
    // Send to Blynk
    Blynk.virtualWrite(V5, t); // V5: Temperature
    Blynk.virtualWrite(V6, h); // V6: Humidity

    Serial.print("Temp: ");
    Serial.print(t);
    Serial.print(" | Humidity: ");
    Serial.println(h);
  }

  // 2. Read Gas Sensor
  int gasValue = analogRead(GAS_PIN);

  // Convert to approximate percentage (0-4095 range for ESP32)
  // This is a raw value mapping, calibration depends on specific sensor
  int gasPercent =
      map(gasValue, 0, 4095, 0, 1000); // Mapped to 0-1000 as per user config

  Blynk.virtualWrite(V7, gasPercent); // V7: Gas Values

  Serial.print("Gas Raw: ");
  Serial.print(gasValue);
  Serial.print(" | Percent: ");
  Serial.println(gasPercent);
}

void setup() {
  Serial.begin(115200);

  // Init Sensors
  dht.begin();
  pinMode(GAS_PIN, INPUT);

  Serial.println("Connecting to Blynk...");
  Blynk.begin(BLYNK_AUTH_TOKEN, ssid, pass);

  // Timer: Send data every 2 seconds
  timer.setInterval(2000L, sendSensorData);
}

void loop() {
  Blynk.run();
  timer.run();
}
