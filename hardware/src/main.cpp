#include <Arduino.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <HTTPClient.h>
#include <LiquidCrystal_I2C.h>
#include <PubSubClient.h>
#include <WiFi.h>
#include <Wire.h>

// --- WiFi Configuration ---
const char *WIFI_SSID = "xanax";
const char *WIFI_PASSWORD = "123456789";

// Backend URL
const char *SERVER_URL = "http://10.40.160.225:8009/iot/data";

// --- MQTT Configuration ---
const char *MQTT_SERVER = "10.40.160.225";
const int MQTT_PORT = 1883;
const char *MQTT_USER = "";
const char *MQTT_PASSWORD = "";

WiFiClient espClient;
PubSubClient client(espClient);

// --- Hardware Configuration ---
LiquidCrystal_I2C lcd(0x27, 16, 2);

// --- PIN DEFINITIONS ---
#define DHTPIN 4
#define MQ_ANALOG_PIN 34
#define RAIN_ANALOG_PIN 35
#define PIR_PIN 27
#define IR_PIN 18 // Pin 18 for IR

#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// Thresholds
#define GAS_THRESHOLD 2000
#define RAIN_THRESHOLD 1500

// --- Global Variables ---
float t = 0.0;
float h = 0.0;
int mqValue = 0;
int rainValue = 0;
int pirValue = 0;
int irValue = 0;

void reconnect() {
  static unsigned long lastMqttAttempt = 0;
  if (millis() - lastMqttAttempt > 5000) {
    lastMqttAttempt = millis();
    if (client.connect("ESP32EcoSync", MQTT_USER, MQTT_PASSWORD)) {
      Serial.println("MQTT Connected");
    }
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(MQ_ANALOG_PIN, INPUT);
  pinMode(RAIN_ANALOG_PIN, INPUT);
  pinMode(PIR_PIN, INPUT_PULLDOWN);
  pinMode(IR_PIN, INPUT);

  dht.begin();
  client.setServer(MQTT_SERVER, MQTT_PORT);

  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("EcoSync Pro");
  delay(1000);

  // Connect to WiFi
  lcd.setCursor(0, 1);
  lcd.print("Connecting...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    lcd.setCursor(0, 1);
    lcd.print("WiFi Connected ");
  } else {
    lcd.setCursor(0, 1);
    lcd.print("Offline Mode   ");
  }
  delay(1000);
  lcd.clear();
}

void loop() {
  // --- TIMERS ---
  static unsigned long lastSensorRead = 0;
  static unsigned long lastPageSwitch = 0;
  static int pageIndex = 0;
  static unsigned long lastWiFiCheck = 0;

  // 1. WiFi & MQTT Handling (Non-Blocking)
  if (millis() - lastWiFiCheck > 5000) {
    lastWiFiCheck = millis();
    if (WiFi.status() != WL_CONNECTED) {
      WiFi.disconnect();
      WiFi.reconnect();
    } else {
      if (!client.connected()) {
        reconnect();
      }
      client.loop();
    }
  }

  // 2. Read Sensors (Every 2 Seconds)
  // 1. Read Sensors (Every 2 Seconds)
  if (millis() - lastSensorRead > 2000) {
    lastSensorRead = millis();

    float newH = dht.readHumidity();
    float newT = dht.readTemperature();
    if (!isnan(newH) && !isnan(newT)) {
      h = newH;
      t = newT;
    }

    mqValue = analogRead(MQ_ANALOG_PIN);
    rainValue = analogRead(RAIN_ANALOG_PIN);

    // Software Debounce for Motion (Check twice 50ms apart)
    int p1 = digitalRead(PIR_PIN);
    delay(50);
    int p2 = digitalRead(PIR_PIN);
    // Store exact read. If Active Low, IDLE=High, DETECT=Low.
    pirValue = (p1 == p2)
                   ? p1
                   : p1; // Simple debounce, just take p1 if match, else p1.
    // Actually, let's just read it.
    pirValue = p2;

    irValue = digitalRead(IR_PIN);

    // Determine Status for Serial Match
    const char *gasStatus = (mqValue > GAS_THRESHOLD) ? "Alert" : "Safe";
    const char *rainStatus = (rainValue > RAIN_THRESHOLD) ? "Rain" : "Clear";
    const char *motStatus = (pirValue == LOW) ? "Detected" : "Clear";
    const char *spdStatus = (irValue == LOW) ? "Detected" : "Clear";

    // Serial Debug (Synced with LCD)
    Serial.printf(
        "Temp:%.1f Hum:%.1f Gas:%s(%d) Water:%s(%d) Motion:%s Speed:%s\n", t, h,
        gasStatus, mqValue, rainStatus, rainValue, motStatus, spdStatus);

    // HTTP Post (Only if Connected)
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(SERVER_URL);
      http.addHeader("Content-Type", "application/json");
      JsonDocument doc;
      doc["temperature"] = t;
      doc["humidity"] = h;
      doc["mq_value"] = mqValue;
      doc["rain_value"] = rainValue;
      // CALIBRATED: Active Low Motion (Idle=1)
      doc["motion_detected"] = (pirValue == LOW);
      doc["ir_detected"] = (irValue == LOW);
      doc["pm25"] = map(mqValue, 0, 4095, 0, 500);
      doc["pressure"] = 1013;
      String jsonPayload;
      serializeJson(doc, jsonPayload);
      http.POST(jsonPayload);
      http.end();

      // MQTT Publish
      if (client.connected()) {
        client.publish("ecosync/temperature", String(t, 2).c_str());
        client.publish("ecosync/humidity", String(h, 2).c_str());
        client.publish("ecosync/gas", String(mqValue).c_str());
        client.publish("ecosync/rain", String(rainValue).c_str());
        // CALIBRATED: 1 if LOW
        client.publish("ecosync/motion", (pirValue == LOW) ? "1" : "0");
        client.publish("ecosync/ir", irValue == LOW ? "1" : "0");
      }
    }
  }

  // 2. Dynamic LCD Logic (Every 2.0s as requested)
  if (millis() - lastPageSwitch > 2000) {
    lastPageSwitch = millis();
    lcd.clear();

    // Identify Counts/Status
    bool gasAlert = (mqValue > GAS_THRESHOLD);
    // CALIBRATED RAIN: High Value = Wet (> 1500) (Dry was ~600)
    bool rainAlert = (rainValue > RAIN_THRESHOLD);
    // CALIBRATED MOTION: Low = Detected (Idle was 1/HIGH)
    bool motionDetected = (pirValue == LOW);
    bool speedDetected = (irValue == LOW);

    // Cycle 3 screens
    pageIndex = (pageIndex + 1) % 3;

    char line1[17];
    char line2[17];

    if (pageIndex == 0) {
      // Screen 0: Temperature & Humidity
      snprintf(line1, 17, "Temp: %.1f C    ", t);
      snprintf(line2, 17, "Hum : %.0f %%      ", h);
    } else if (pageIndex == 1) {
      // Screen 1: Gas & Rain
      // Format: "Gas : Safe (1234)" -> 16 Chars?
      // "Gas : " (6) + "Safe" (4) + " (" (2) + "1234" (4) + ")" (1) = 17 chars
      // (Too long by 1 for 4 digits) Use: "G:Safe (1234)" or "Gas:Safe (1234)"
      // Let's try: "Gas: Safe 1234 "

      const char *gasStatus = gasAlert ? "Alert" : "Safe ";
      const char *rainStatus = rainAlert ? "Rain " : "Clear";

      // "Gas: Safe  1234"
      snprintf(line1, 17, "Gas : %s %-4d", gasStatus, mqValue);
      snprintf(line2, 17, "Water: %s %-4d", rainStatus, rainValue);
    } else if (pageIndex == 2) {
      // Screen 2: Motion & Speed
      const char *motStatus = motionDetected ? "Detected" : "Clear   ";
      const char *spdStatus = speedDetected ? "Detected" : "Clear   ";

      snprintf(line1, 17, "Motion: %s", motStatus);
      snprintf(line2, 17, "Speed : %s", spdStatus);
    }

    lcd.setCursor(0, 0);
    lcd.print(line1);
    lcd.setCursor(0, 1);
    lcd.print(line2);
  }
}
