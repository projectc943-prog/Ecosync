#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Arduino.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>

// --- WiFi Configuration (USER: Set your WiFi credentials here) ---
const char* WIFI_SSID = "YourWiFiSSID";        // Change to your WiFi SSID
const char* WIFI_PASSWORD = "YourWiFiPassword"; // Change to your WiFi Password
const char* SERVER_URL = "http://192.168.1.100:8000/iot/data"; // Change to your backend IP:PORT

// --- Hardware Configuration ---
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

#ifdef ESP32
#define DHTPIN 4
#define VIB_PIN 34
#define PRESS_PIN 35
#define WATER_PIN 32
#define MQ_DO 27
#define BUZZER_PIN 13
#define LED_RED 23
#define LED_GREEN 18
#else
#define DHTPIN 2
#define VIB_PIN A0
#define PRESS_PIN A1
#define WATER_PIN A2
#define MQ_DO 7
#define BUZZER_PIN 8
#define LED_RED 9
#define LED_GREEN 10
#endif

#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();

  pinMode(MQ_DO, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);

  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_RED, LOW);
  digitalWrite(LED_GREEN, HIGH); // Default to Good

  // OLED Init
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
  }
  display.display();
  delay(1000);
  display.clearDisplay();

  // WiFi Connection
  Serial.println("Connecting to WiFi...");
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("Connecting WiFi...");
  display.display();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("WiFi Connected!");
    display.print("IP: ");
    display.println(WiFi.localIP());
    display.display();
    delay(2000);
  } else {
    Serial.println("\nWiFi Connection Failed!");
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("WiFi Failed!");
    display.println("Check credentials");
    display.display();
  }
}

void loop() {
  // 1. Read Sensors
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
    t = 25.0; h = 50.0; // Fallback defaults
  }

  int rawVib = analogRead(VIB_PIN);
  int rawPress = analogRead(PRESS_PIN);
  int mq_raw = analogRead(34); // MQ-135 on Pin 34
  int gasState = digitalRead(MQ_DO);

  // Map values for better readability
  float pressure = map(rawPress, 0, 4095, 900, 1100);
  float pm25 = (gasState == 0) ? 150.0 : 15.0; // Simple logic: 0 = Gas Detected

  // 2. Prepare JSON Payload
  StaticJsonDocument<256> doc;
  doc["temperature"] = t;
  doc["humidity"] = h;
  doc["pressure"] = pressure;
  doc["pm25"] = pm25;
  doc["mq_raw"] = mq_raw;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  // 3. User Requested "Handshake" - Send Data & Verify
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");

    Serial.print("Sending Data to Backend... ");
    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.print("Response Code: ");
      Serial.println(httpResponseCode); // Should be 200

      if (httpResponseCode == 200) {
        Serial.println("✅ Handshake Success: Data Received by Server!");
        // Blink Green LED rapidly to indicate success
        for(int i=0; i<3; i++) {
          digitalWrite(LED_GREEN, LOW); delay(50); digitalWrite(LED_GREEN, HIGH); delay(50);
        }
      } else {
        Serial.print("⚠️ Server Error: ");
        Serial.println(http.getString());
      }
    } else {
      Serial.print("❌ Connection Failed. Error: ");
      Serial.println(httpResponseCode);
      digitalWrite(LED_RED, HIGH); delay(200); digitalWrite(LED_RED, LOW);
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }

  // 4. Local Display Update
  display.clearDisplay();
  display.setCursor(0, 0);
  display.print("T:"); display.print(t, 1); display.print("C H:"); display.print(h, 0); display.println("%");
  display.print("AQI:"); display.println(mq_raw);
  if(WiFi.status() == WL_CONNECTED) display.println("WiFi: OK");
  else display.println("WiFi: --");
  display.display();

  delay(2000); 
}
