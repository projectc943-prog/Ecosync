$ErrorActionPreference = "Stop"

# Paths
$CLI_PATH = "C:\Users\sreek\Downloads\arduino-cli_nightly-20260128_Windows_64bit\arduino-cli.exe"
$SKETCH_PATH = "$PSScriptRoot\hardware\arduino_code\ecosync_firmware\ecosync_firmware.ino"
$FQBN = "esp32:esp32:esp32"

Write-Host "Ecosync - ESP32 Flasher" -ForegroundColor Cyan
Write-Host "======================="

# 1. Check CLI
if (-not (Test-Path $CLI_PATH)) {
    Write-Error "arduino-cli not found at $CLI_PATH. Please check the path."
    exit 1
}

Write-Host "Using Arduino CLI: $CLI_PATH" -ForegroundColor Gray

# 1.5 Ensure Core is Installed
Write-Host "`n[0/3] Checking ESP32 Core..." -ForegroundColor Yellow
# We'll valid output or just try installing. It skips if already installed usually or we can suppress error.
# But for first run, let's just run install. It's safe.
& $CLI_PATH core install esp32:esp32
# Warning: This might take time if not downloaded, but user did update-index.

# 2. Compile
Write-Host "`n[1/3] Compiling firmware..." -ForegroundColor Yellow
& $CLI_PATH compile --fqbn $FQBN $SKETCH_PATH
if ($LASTEXITCODE -ne 0) {
    Write-Error "Compilation Failed!"
    exit 1
}
Write-Host "Compilation Success!" -ForegroundColor Green

# 3. Detect Port
Write-Host "`n[2/3] Detecting COM Port..." -ForegroundColor Yellow
$boardList = & $CLI_PATH board list
$boardList | Out-String | Write-Host

# Simple logic to find a port with "USB" or just take the first COM port that isn't COM1 (usually valid)
# This is a bit manual, for now we will ask the user or just grab the last one.
# Let's try to parse the JSON output for better reliability
$portsJson = & $CLI_PATH board list --format json | ConvertFrom-Json

$selectedPort = $null

if ($portsJson) {
    foreach ($p in $portsJson) {
        if ($p.port.address -match "COM") {
            $selectedPort = $p.port.address
            # If we find a specific ESP32 match, break, otherwise keep the last one found
            if ($p.matching_boards.name -match "ESP32") {
                break
            }
        }
    }
}

if (-not $selectedPort) {
    Write-Warning "No COM port auto-detected. Please enter it manually (e.g., COM3):"
    $selectedPort = Read-Host "Port"
}

if (-not $selectedPort) {
    Write-Error "No port selected."
    exit 1
}

Write-Host "Target Port: $selectedPort" -ForegroundColor Cyan

# 4. Upload
Write-Host "`n[3/3] Uploading to $selectedPort..." -ForegroundColor Yellow
& $CLI_PATH upload -p $selectedPort --fqbn $FQBN $SKETCH_PATH

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSUCCESS! Firmware updated." -ForegroundColor Green
    Write-Host "Monitor the dashboard now." -ForegroundColor Green
}
else {
    Write-Error "Upload Failed. Make sure Serial Monitor is CLOSED."
}
