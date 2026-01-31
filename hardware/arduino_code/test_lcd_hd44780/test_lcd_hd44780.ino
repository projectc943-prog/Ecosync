#include <Wire.h>
#include <hd44780.h>
#include <hd44780ioClass/hd44780_I2Cexp.h>

hd44780_I2Cexp lcd;

void setup() {
  delay(2000);
  Serial.begin(115200);
  Serial.println("hd44780 auto-detect test");

  int status = lcd.begin(16, 2); // change to (20,4) ONLY if needed
  if (status) {
    Serial.print("LCD init failed, status = ");
    Serial.println(status);
    hd44780::fatalError(status); // stops here if wiring is wrong
  }

  lcd.backlight();
  lcd.clear();
  lcd.print("LCD FIXED!");
  lcd.setCursor(0, 1);
  lcd.print("Auto Mapping OK");
}

void loop() {}
