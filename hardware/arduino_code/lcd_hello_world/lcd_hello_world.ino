#include <LiquidCrystal_I2C.h>
#include <Wire.h>


// I2C Pins
#define SDA_PIN 21
#define SCL_PIN 22

// LCD at address 0x27, 16 columns, 2 rows
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  Serial.begin(115200);

  // Start I2C with explicit pins
  Wire.begin(SDA_PIN, SCL_PIN);
  delay(500);

  // Initialize LCD
  lcd.init();
  lcd.backlight();

  // Display Hello World
  lcd.setCursor(0, 0);
  lcd.print("Hello World!");
  lcd.setCursor(0, 1);
  lcd.print("LCD Test OK");

  Serial.println("LCD Initialized - Check Display");
}

void loop() {
  // Do nothing, just display the message
  delay(1000);
}
