#include <DHT.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>

// --- Configuration ---
#define DHTPIN 4      // Digital pin connected to the DHT sensor
#define DHTTYPE DHT11 // DHT 11
#define MQ_PIN 34     // Analog pin connected to the MQ sensor (AO)

// Initialize DHT sensor
DHT dht(DHTPIN, DHTTYPE);

// LCD Object Pointer (initialized in setup)
LiquidCrystal_I2C *lcd = nullptr;

void setup() {
  // 1. Initialize Serial and Power
  delay(1000);
  Serial.begin(115200);
  Serial.println("\n\n--- Ecosync Booting ---");

  // 2. Scan for I2C Address (Must be in setup!)
  Wire.begin(21, 22); // SDA=21, SCL=22
  byte count = 0;
  byte foundAddr = 0;

  Serial.println("Scanning I2C bus...");
  for (byte i = 1; i < 127; i++) {
    Wire.beginTransmission(i);
    if (Wire.endTransmission() == 0) {
      Serial.print("Found Device at: 0x");
      Serial.println(i, HEX);

      // Check for common LCD addresses
      if (i == 0x27 || i == 0x3F) {
        foundAddr = i;
        count++;
      }
    }
  }

  // 3. Initialize LCD if found
  if (foundAddr != 0) {
    Serial.printf("LCD Found at 0x%X. Initializing...\n", foundAddr);
    lcd = new LiquidCrystal_I2C(foundAddr, 16, 2);
    lcd->init();
    lcd->backlight();
    lcd->clear();
    lcd->print("EcoSync Init...");
    lcd->setCursor(0, 1);
    lcd->print("Address: 0x");
    lcd->print(foundAddr, HEX);
    delay(2000);
  } else {
    Serial.println("CRITICAL: No LCD found.");
  }

  // 4. Initialize Sensors
  dht.begin();
  pinMode(MQ_PIN, INPUT);

  if (lcd)
    lcd->clear();
}

void loop() {
  unsigned long currentMillis = millis();

  // --- Read Sensors ---
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  int mqValues = analogRead(MQ_PIN);

  // Check for read failure
  if (isnan(h) || isnan(t)) {
    Serial.println(F("{\"error\": \"Failed to read from DHT sensor!\"}"));
    if (lcd) {
      lcd->setCursor(0, 0);
      lcd->print("Sensor Error!   ");
    }
    delay(2000);
    return;
  }

  // --- Serial Output (JSON for Frontend) ---
  // Matches useEsp32Stream.js keys: temperature, humidity, gas
  Serial.print(F("{\"temperature\": "));
  Serial.print(t, 1);
  Serial.print(F(", \"humidity\": "));
  Serial.print(h, 1);
  Serial.print(F(", \"gas\": "));
  Serial.print(mqValues);
  Serial.println(F("}"));

  // --- LCD Update ---
  if (lcd) {
    // Row 0: T: 25C  G: 123
    lcd->setCursor(0, 0);
    lcd->print("T:");
    lcd->print((int)t);
    lcd->print("C  G:");
    lcd->print(mqValues);
    lcd->print("    "); // Clear trailing chars

    // Row 1: H: 60%
    lcd->setCursor(0, 1);
    lcd->print("H:");
    lcd->print((int)h);
    lcd->print("%");
    lcd->print("            "); // Clear trailing chars
  }

  delay(2000); // 2 second refresh rate
}
