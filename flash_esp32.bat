@echo off
setlocal

:: Path to Arduino CLI (Found in Downloads)
set ARDUINO_CLI="c:\Users\sreek\Downloads\arduino-cli_nightly-20260128_Windows_64bit\arduino-cli.exe"

echo ===========================================
echo       EcoSync ESP32 Flasher Utility
echo ===========================================

echo.
echo [1/5] Initializing Configuration...
%ARDUINO_CLI% config init --dest-dir . >nul 2>&1
%ARDUINO_CLI% config set board_manager.additional_urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json

echo.
echo [2/5] Updating Cores and Installing ESP32 Board...
echo (This might take a minute, please wait...)
%ARDUINO_CLI% core update-index
%ARDUINO_CLI% core install esp32:esp32

echo.
echo [3/5] Installing Libraries...
%ARDUINO_CLI% lib install "DHT sensor library"
%ARDUINO_CLI% lib install "Adafruit Unified Sensor"
%ARDUINO_CLI% lib install "ArduinoJson"
%ARDUINO_CLI% lib install "LiquidCrystal I2C"
%ARDUINO_CLI% lib install "PubSubClient"

echo.
echo [4/5] Compiling Firmware...
%ARDUINO_CLI% compile --fqbn esp32:esp32:esp32 hardware\arduino_code\ecosync_firmware

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Compilation Failed!
    pause
    exit /b
)

echo.
echo [5/5] Detecting Devices...
%ARDUINO_CLI% board list

echo.
set /p PORT="ENTER YOUR COM PORT (e.g. COM3 or COM4): "

echo.
echo Uploading to %PORT%...
%ARDUINO_CLI% upload -p %PORT% --fqbn esp32:esp32:esp32 hardware\arduino_code\ecosync_firmware

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Upload Failed! Check connection and try again.
) else (
    echo.
    echo [SUCCESS] Firmware Flashed Successfully! 🌿
)

pause
