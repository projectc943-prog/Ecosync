#include <LiquidCrystal_I2C.h>
#include <Wire.h>

// Test sketch for LCD display
void setup() {
  Serial.begin(115200);
  Serial.println("\n--- LCD TEST SKETCH ---");

  // Initialize I2C
  Wire.begin(21, 22); // SDA=21, SCL=22

  // Scan for LCD address
  byte lcdAddr = 0x27;
  byte count = 0;
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

  if (count == 0) {
    Serial.println("NO LCD FOUND! Check wiring.");
    while (true) {
      delay(1000);
    }
  }

  // Initialize LCD
  LiquidCrystal_I2C lcd(lcdAddr, 16, 2);
  lcd.init();
  lcd.backlight();

  if (!lcd.display()) {
    Serial.println("LCD Init Failed!");
    while (true) {
      delay(1000);
    }
  } else {
    Serial.printf("LCD initialized at 0x%X\n", lcdAddr);
    lcd.clear();
    lcd.print("LCD TEST OK!");
    delay(2000);
  }

  // Test display
  lcd.clear();
  lcd.print("Temp: 25C");
  lcd.setCursor(0, 1);
  lcd.print("Hum: 60%");
  delay(3000);

  // Test scrolling text
  lcd.clear();
  lcd.print("Scrolling Text...");
  delay(1000);
  for (int i = 0; i < 16; i++) {
    lcd.scrollDisplayLeft();
    delay(200);
  }
}

void loop() {
  delay(1000);
}