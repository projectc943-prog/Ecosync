#include <LiquidCrystal_I2C.h>
#include <Wire.h>


// Minimal sketch to FIX the LCD "Blocks" issue
// and find the correct address.

void setup() {
  Serial.begin(115200);
  Serial.println("\n--- LCD REPAIR TOOL ---");

  // 1. Scan for Address
  Wire.begin(21, 22); // SDA=21, SCL=22
  byte count = 0;
  byte lcdAddr = 0x27; // Default

  for (byte i = 1; i < 127; i++) {
    Wire.beginTransmission(i);
    if (Wire.endTransmission() == 0) {
      Serial.print("Found Device at: 0x");
      Serial.println(i, HEX);
      if (i == 0x27 || i == 0x3F) {
        lcdAddr = i;
        count++;
      }
    }
  }

  // 2. Force Initialize
  if (count == 0) {
    Serial.println("NO LCD FOUND! Check wiring.");
  } else {
    Serial.printf("Initializing LCD at 0x%X...\n", lcdAddr);
    LiquidCrystal_I2C lcd(lcdAddr, 16, 2);
    lcd.init();
    lcd.backlight();
    lcd.setCursor(0, 0);
    lcd.print("LCD FIXED!");
    lcd.setCursor(0, 1);
    lcd.print("Addr: 0x");
    lcd.print(lcdAddr, HEX);
  }
}

void loop() { delay(1000); }
