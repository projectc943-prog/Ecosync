#include <DHT.h>

// --- Configuration ---
#define DHTPIN 4      // Digital pin connected to the DHT sensor
#define DHTTYPE DHT11 // DHT 11
#define MQ_PIN 34     // Analog pin connected to the MQ sensor (AO)

// Initialize DHT sensor
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  Serial.println("Ecosync Sensor Test");
  Serial.println("DHT11 + MQ Sensor Test");
  Serial.println("--------------------------------");

  dht.begin();
  
  // Set MQ Pin as Input
  pinMode(MQ_PIN, INPUT);

  delay(2000); // Allow sensors to stabilize
}

void loop() {
  // --- Read DHT11 ---
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  // Check if any reads failed and exit early (to try again).
  if (isnan(h) || isnan(t)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }

  // --- Read MQ Sensor ---
  int mqValues = analogRead(MQ_PIN);

  // --- Print to Serial Monitor ---
  Serial.print(F("Humidity: "));
  Serial.print(h);
  Serial.print(F("%  Temperature: "));
  Serial.print(t);
  Serial.print(F("°C "));
  
  Serial.print(F("  MQ Raw Value: "));
  Serial.println(mqValues);

  delay(2000); // Wait a few seconds between measurements
}
