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
const char *SERVER_URL = "http://172.22.67.5:8009/iot/data";

// --- MQTT Configuration ---
const char *MQTT_SERVER = "172.22.67.5";
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

// I2C Pins for LCD (ESP32 defaults)
#define SDA_PIN 21
#define SCL_PIN 22

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
// RPM / Speed Variables
volatile unsigned long pulseCount = 0;
float rpm = 0.0;
unsigned long lastRpmTime = 0;

// Interrupt Service Routine for IR Speed Sensor
void IRAM_ATTR onIRPulse() { pulseCount++; }

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
  Serial.println("\n\n--- BOOT START ---");
  Serial.println("1. Serial Initialized");

  // Explicitly start I2C bus FIRST with defined pins
  Serial.printf("2. Wire.begin(SDA=%d, SCL=%d)\n", SDA_PIN, SCL_PIN);
  Wire.begin(SDA_PIN, SCL_PIN);
  delay(500); // Give LCD time to power up

  // Initialize LCD
  Serial.println("3. lcd.init()");
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Booting System");
  Serial.println("4. LCD Init Done");

  // Serial.begin(115200); // Removed from here

  pinMode(MQ_ANALOG_PIN, INPUT);
  pinMode(RAIN_ANALOG_PIN, INPUT);
  pinMode(PIR_PIN, INPUT_PULLDOWN);

  // IR Sensor Interrupt Setup
  pinMode(IR_PIN, INPUT_PULLUP); // Use PULLUP for open-collector sensors
  attachInterrupt(digitalPinToInterrupt(IR_PIN), onIRPulse, FALLING);

  dht.begin();
  client.setServer(MQTT_SERVER, MQTT_PORT);

  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  lcd.clear();
  lcd.print("EcoSync Ready");
  delay(1000);
}

void loop() {
  // WiFi Reconnect (Non-blocking check)
  if (WiFi.status() != WL_CONNECTED) {
    static unsigned long lastWifiTry = 0;
    if (millis() - lastWifiTry > 10000) { // Try reconnecting every 10s
      WiFi.disconnect();
      WiFi.reconnect();
      lastWifiTry = millis();
    }
    // Do NOT return here, so sensors can still work offline
  }

  // MQTT Reconnect
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // --- TIMERS ---
  static unsigned long lastSensorRead = 0;
  static unsigned long lastPageSwitch = 0;
  static int pageIndex = 0;

  // 1. Read Sensors (Every 2 Seconds)
  if (millis() - lastSensorRead > 2000) {
    unsigned long currentTime = millis();
    unsigned long timeDiff =
        currentTime - lastSensorRead; // Actual time elapsed
    lastSensorRead = currentTime;

    float newH = dht.readHumidity();
    float newT = dht.readTemperature();
    if (!isnan(newH) && !isnan(newT)) {
      h = newH;
      t = newT;
    }

    mqValue = analogRead(MQ_ANALOG_PIN);
    rainValue = analogRead(RAIN_ANALOG_PIN);

    // Read Motion (PIR)
    pirValue = digitalRead(PIR_PIN);

    // Calculate RPM
    // RPM = (Pulses / PulsesPerRev) * (60000 / TimeMs)
    // Assuming 1 pulse = 1 rotation (adjust if using encoder disc)
    // To be safe, let's just show "Pulses per Min" for now
    rpm = (pulseCount * 60000.0) / timeDiff; // Gives CPM (Counts Per Minute)
    pulseCount = 0;                          // Reset counter

    // Detailed Gas Calculations (Estimates for MQ Sensor)
    // MQ-135: 400ppm -> 50000ppm approx range
    int co2_ppm = map(mqValue, 0, 4095, 400, 5000);
    // Smoke/CO Estimate (0-100%)
    int smoke_pct = map(mqValue, 0, 4095, 0, 100);

    // Serial Debug
    Serial.printf(
        "T:%.1f H:%.1f Gas:%d CO2:%d Smoke:%d%% Rain:%d Mot:%d RPM:%.0f\n", t,
        h, mqValue, co2_ppm, smoke_pct, rainValue, pirValue, rpm);

    // HTTP Post (Only if Connected)
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(SERVER_URL);
      http.addHeader("Content-Type", "application/json");
      StaticJsonDocument<400> doc;
      doc["temperature"] = t;
      doc["humidity"] = h;
      doc["mq_value"] = mqValue;
      doc["rain_value"] = rainValue;
      doc["motion_detected"] = (pirValue == LOW); // PIR Is Active Low
      doc["ir_detected"] = (rpm > 0);
      doc["pm25"] = co2_ppm / 10;
      doc["pressure"] = 1013;

      // Add extra fields for debug if backend accepts them
      doc["extended_co2"] = co2_ppm;
      doc["extended_rpm"] = rpm;

      String jsonPayload;
      serializeJson(doc, jsonPayload);
      http.POST(jsonPayload);
      http.end();
    }

    // MQTT Publish
    if (client.connected()) {
      client.publish("ecosync/temperature", String(t, 2).c_str());
      client.publish("ecosync/humidity", String(h, 2).c_str());
      client.publish("ecosync/gas", String(mqValue).c_str());
      client.publish("ecosync/rain", String(rainValue).c_str());
      client.publish("ecosync/motion", (pirValue == LOW) ? "1" : "0");
      client.publish("ecosync/rpm", String(rpm).c_str());
    }
  }

  // 2. Dynamic LCD Logic (Every 3s)
  if (millis() - lastPageSwitch > 3000) {
    lastPageSwitch = millis();
    lcd.clear();

    // Identify Counts/Status
    int co2_ppm = map(mqValue, 0, 4095, 400, 5000);
    int smoke_pct = map(mqValue, 0, 4095, 0, 100);
    bool rainAlert = (rainValue < 1000); // Analog: Low = Wet usually

    // Cycle 4 screens now
    pageIndex = (pageIndex + 1) % 4;
    char line1[17];
    char line2[17];

    if (pageIndex == 0) {
      // Screen 0: Environment
      snprintf(line1, 17, "Temp: %.1f C    ", t);
      snprintf(line2, 17, "Hum : %.0f %%      ", h);
    } else if (pageIndex == 1) {
      // Screen 1: Gas Advanced
      snprintf(line1, 17, "Air: %d AQI    ", mqValue / 10);
      snprintf(line2, 17, "CO2: %d PPM   ", co2_ppm);
    } else if (pageIndex == 2) {
      // Screen 2: Safety
      const char *rStatus = rainAlert ? "WET " : "DRY ";
      const char *mStatus = (pirValue == LOW) ? "YES" : "NO ";
      snprintf(line1, 17, "Rain  : %-4s %-4d", rStatus, rainValue);
      snprintf(line2, 17, "Smoke : %d%%      ", smoke_pct);
    } else if (pageIndex == 3) {
      // Screen 3: Motion & Speed
      const char *mStatus = (pirValue == LOW) ? "Active" : "Quiet ";
      snprintf(line1, 17, "Motion: %s  ", mStatus);
      snprintf(line2, 17, "Speed : %.0f RPM ", rpm);
    }

    lcd.setCursor(0, 0);
    lcd.print(line1);
    lcd.setCursor(0, 1);
    lcd.print(line2);
  }
}
