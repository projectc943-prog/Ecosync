$ErrorActionPreference = "Stop"

$url = "https://www.silabs.com/documents/public/software/CP210x_Universal_Windows_Driver.zip"
$zipPath = "cp210x_driver.zip"
$destPath = "cp210x_driver"

Write-Host "⬇️ Downloading CP210x Driver..."
Invoke-WebRequest -Uri $url -OutFile $zipPath

Write-Host "📦 Extracting..."
if (Test-Path $destPath) { Remove-Item -Recurse -Force $destPath }
Expand-Archive -Path $zipPath -DestinationPath $destPath

Write-Host "🔧 Installing Driver (Admin prompts may appear)..."
$infFile = Get-ChildItem -Path $destPath -Recurse -Filter "silabser.inf" | Select-Object -First 1

if ($infFile) {
    Write-Host "Found driver: $($infFile.FullName)"
    # Using pnputil to install
    $proc = Start-Process -FilePath "pnputil.exe" -ArgumentList "/add-driver `"$($infFile.FullName)`" /install" -Wait -PassThru -Verb RunAs
    
    if ($proc.ExitCode -eq 0) {
        Write-Host "✅ Installation Command Executed."
    } else {
        Write-Host "⚠️ Installation finished with code: $($proc.ExitCode)"
    }
} else {
    Write-Host "❌ Could not find silabser.inf"
}

Write-Host "Done."
