@echo off
setlocal
set ARDUINO_CLI="c:\Users\sreek\Downloads\arduino-cli_nightly-20260128_Windows_64bit\arduino-cli.exe"

echo.
echo ===========================================
echo       EcoSync Serial Monitor Tool
echo ===========================================
echo.

%ARDUINO_CLI% board list
echo.
set /p PORT="COM14: "

echo.
echo Starting Serial Monitor on %PORT% at 115200 baud...
echo Press Ctrl+C to exit.
echo.

%ARDUINO_CLI% monitor -p %PORT% -c 115200
pause
