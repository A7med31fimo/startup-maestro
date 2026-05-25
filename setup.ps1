# Startup Maestro - Windows Setup Script
# Run this in PowerShell as Administrator

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Startup Maestro - Installation Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check for Rust
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

$rustInstalled = Get-Command rustc -ErrorAction SilentlyContinue
if (-not $rustInstalled) {
    Write-Host "❌ Rust not found. Installing via rustup..." -ForegroundColor Red
    Write-Host "  Visit: https://rustup.rs and install, then re-run this script."
    Write-Host "  Or run: winget install Rustlang.Rustup"
    Start-Process "https://rustup.rs"
    exit 1
} else {
    $rustVersion = & rustc --version
    Write-Host "✅ Rust: $rustVersion" -ForegroundColor Green
}

# Check for Node
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeInstalled) {
    Write-Host "❌ Node.js not found. Installing..." -ForegroundColor Red
    Write-Host "  Visit: https://nodejs.org or run: winget install OpenJS.NodeJS"
    exit 1
} else {
    $nodeVersion = & node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
}

# Check for WebView2 (required by Tauri)
$webview2 = Get-ItemProperty "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" -ErrorAction SilentlyContinue
if (-not $webview2) {
    Write-Host "⚠️  WebView2 Runtime not found. Downloading..." -ForegroundColor Yellow
    $installer = "$env:TEMP\MicrosoftEdgeWebview2Setup.exe"
    Invoke-WebRequest -Uri "https://go.microsoft.com/fwlink/p/?LinkId=2124703" -OutFile $installer
    Start-Process $installer -ArgumentList "/silent /install" -Wait
    Write-Host "✅ WebView2 installed" -ForegroundColor Green
} else {
    Write-Host "✅ WebView2 Runtime found" -ForegroundColor Green
}

# Check for Visual Studio Build Tools (needed for Rust Windows compilation)
$vstools = Get-Command cl -ErrorAction SilentlyContinue
if (-not $vstools) {
    Write-Host "⚠️  Visual Studio Build Tools may be needed." -ForegroundColor Yellow
    Write-Host "  If build fails, install from: https://visualstudio.microsoft.com/visual-cpp-build-tools/"
}

Write-Host ""
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "❌ npm install failed" -ForegroundColor Red; exit 1 }
Write-Host "✅ Node dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "Installing Tauri CLI..." -ForegroundColor Yellow
cargo install tauri-cli
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Tauri CLI install failed" -ForegroundColor Red; exit 1 }
Write-Host "✅ Tauri CLI installed" -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Commands:" -ForegroundColor Cyan
Write-Host "  Dev mode:    cargo tauri dev" -ForegroundColor White
Write-Host "  Build:       cargo tauri build" -ForegroundColor White
Write-Host ""
Write-Host "The built .exe will be in: src-tauri/target/release/" -ForegroundColor Gray
