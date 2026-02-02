#include <DHT.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>

// --- Configuration ---
#define DHTPIN 4      // Digital pin connected to the DHT sensor
#define DHTTYPE DHT11 // DHT 11
#define MQ_PIN 34     // Analog pin connected to the MQ sensor (AO)
#define RAIN_PIN 35   // Analog pin for Rain sensor
#define PIR_PIN 27    // Digital pin for PIR motion sensor
#define IR_PIN 32     // Digital pin for IR sensor (rotation control)

// Initialize DHT sensor
DHT dht(DHTPIN, DHTTYPE);

// --- Global Variables & Constants ---
LiquidCrystal_I2C *lcd = nullptr;
volatile int screenMode = 0; // 0: Env/Gas, 1: Security/Rain
volatile unsigned long lastTrigger = 0;
unsigned long lastAutoCycle = 0;
bool autoRotation = true;

// --- Interrupt Service Routine (ISR) for IR Sensor ---
void IRAM_ATTR handleRotation() {
  unsigned long now = millis();
  if (now - lastTrigger > 300) { // 300ms debounce
    screenMode = (screenMode + 1) % 2;
    lastTrigger = now;
    autoRotation = false; // Disable auto-rotation if user interacts
  }
}

void setup() {
  // 1. Initialize Serial and Power
  delay(1000);
  Serial.begin(115200);
  Serial.println("\n\n--- Ecosync Pro 2.0 Booting ---");

  // 2. Scan for I2C Address
  Wire.begin(21, 22);
  byte foundAddr = 0;
  for (byte i = 1; i < 127; i++) {
    Wire.beginTransmission(i);
    if (Wire.endTransmission() == 0) {
      if (i == 0x27 || i == 0x3F)
        foundAddr = i;
    }
  }

  // 3. Initialize LCD if found
  if (foundAddr != 0) {
    lcd = new LiquidCrystal_I2C(foundAddr, 16, 2);
    lcd->init();
    lcd->backlight();
    lcd->clear();
    lcd->print("EcoSync Pro 2.0");
    lcd->setCursor(0, 1);
    lcd->print("Status: ONLINE");
    delay(2000);
    lcd->clear();
  }

  // 4. Initialize Sensors
  dht.begin();
  pinMode(MQ_PIN, INPUT);
  pinMode(RAIN_PIN, INPUT);
  pinMode(PIR_PIN, INPUT);

  // 5. Setup IR Interrupt
  pinMode(IR_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(IR_PIN), handleRotation, FALLING);
}

void loop() {
  // --- Auto-Rotation Logic ---
  if (autoRotation && (millis() - lastAutoCycle > 5000)) {
    screenMode = (screenMode + 1) % 2;
    lastAutoCycle = millis();
    if (lcd)
      lcd->clear();
  } else if (!autoRotation && (millis() - lastTrigger > 15000)) {
    autoRotation = true; // Re-enable auto-rotation after 15s of inactivity
  }

  // --- Read Real Sensors ---
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  int mqVal = analogRead(MQ_PIN);
  int rainVal = analogRead(RAIN_PIN);
  int motion = digitalRead(PIR_PIN);

  bool dhtError = isnan(h) || isnan(t);

  // --- Serial Output (JSON) ---
  Serial.print(F("{\"temperature\": "));
  if (dhtError)
    Serial.print("null");
  else
    Serial.print(t, 1);
  Serial.print(F(", \"humidity\": "));
  if (dhtError)
    Serial.print("null");
  else
    Serial.print(h, 1);
  Serial.print(F(", \"gas\": "));
  Serial.print(mqVal);
  Serial.print(F(", \"rain\": "));
  Serial.print(rainVal);
  Serial.print(F(", \"motion\": "));
  Serial.print(motion);
  Serial.print(F(", \"screen\": "));
  Serial.print(screenMode);
  Serial.println(F("}"));

  // --- LCD Update (Optimized All-Reading View) ---
  if (lcd) {
    lcd->setCursor(0, 0);
    if (screenMode == 0) {
      // Screen 0: Environment & Gas
      if (dhtError) {
        lcd->print("T:ERR  H:ERR   ");
      } else {
        lcd->print("T:");
        lcd->print((int)t);
        lcd->print("C ");
        lcd->print("H:");
        lcd->print((int)h);
        lcd->print("%   ");
      }
      lcd->setCursor(0, 1);
      lcd->print("Gas:");
      lcd->print(mqVal);
      lcd->print(mqVal > 600 ? " !WARN!" : " Clean");
    } else {
      // Screen 1: Security & Rain
      lcd->print("Rain:");
      lcd->print(rainVal);
      lcd->print(rainVal < 2000 ? " RAIN!" : " Dry ");
      lcd->setCursor(0, 1);
      lcd->print("Motion: ");
      lcd->print(motion == HIGH ? "DETECTED" : "CLEAR   ");
    }
  }

  delay(500); // 2Hz refresh for real-time feel
}
