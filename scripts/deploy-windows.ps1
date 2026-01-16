<#
.SYNOPSIS
    Automated Deployment Script for Bagmane AMS on Windows Server
.DESCRIPTION
    This script automates the setup and deployment of the Node.js application.
    It checks/installs Node.js, installs dependencies, sets environment variables,
    configures PM2 for process management, and opens firewall ports.
.NOTES
    Run as Administrator
#>

Write-Host "🚀 Starting Bagmane AMS Deployment..." -ForegroundColor Cyan

# 1. Check for Node.js
Write-Host "`n📦 Checking Node.js installation..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node -v
    Write-Host "   ✅ Node.js is already installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Node.js not found." -ForegroundColor Red
    Write-Host "   Attempting to install Node.js via winget..." -ForegroundColor Yellow
    try {
        winget install OpenJS.NodeJS.LTS -e --silent --accept-source-agreements --accept-package-agreements
        if ($LASTEXITCODE -eq 0) {
             # Refresh env vars
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            Write-Host "   ✅ Node.js installed successfully. Please restart PowerShell if commands fail." -ForegroundColor Green
        } else {
            Write-Host "   ⚠️ Automatic installation failed. Please install Node.js manually from https://nodejs.org/" -ForegroundColor Red
            Exit 1
        }
    } catch {
        Write-Host "   ⚠️ Winget not found or failed. Please install Node.js manually." -ForegroundColor Red
        Exit 1
    }
}

# 2. Project Setup
$projectPath = $PSScriptRoot
Write-Host "`n📂 Setting up project in: $projectPath" -ForegroundColor Yellow

# 3. Environment Variables
Write-Host "`n⚙️ Configuring Environment Variables..." -ForegroundColor Yellow
# Load .env.production values
if (Test-Path "$projectPath\.env.production") {
    Get-Content "$projectPath\.env.production" | ForEach-Object {
        if ($_ -match "^([^#=]+)=(.*)") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            # Set for current session
            Set-Item -Path "env:$name" -Value $value
            # Set permanently (Machine level)
            [System.Environment]::SetEnvironmentVariable($name, $value, [System.EnvironmentVariableTarget]::Machine)
            Write-Host "   Saved env var: $name" -ForegroundColor Gray
        }
    }
    Write-Host "   ✅ Environment variables set." -ForegroundColor Green
} else {
    Write-Host "   ⚠️ .env.production file not found! Skipping env vars." -ForegroundColor Red
}

# 4. Install Dependencies
Write-Host "`n📥 Installing Dependencies..." -ForegroundColor Yellow
cd $projectPath
# npm ci --omit=dev  <-- Using install for now to be safe with lockfile issues
npm install --omit=dev --no-audit
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Dependencies installed." -ForegroundColor Green
} else {
    Write-Host "   ❌ API Dependency installation failed." -ForegroundColor Red
    Exit 1
}

# 5. Build Verification (Optional - assuming dist is already present)
if (!(Test-Path "$projectPath\dist")) {
    Write-Host "`n⚠️ 'dist' folder missing. Attempting build..." -ForegroundColor Yellow
    npm install # Need dev deps to build
    npm run build
}

# 6. PM2 Setup (Process Manager)
Write-Host "`n🔄 Setting up PM2 Process Manager..." -ForegroundColor Yellow
npm install -g pm2
# Check if running
$pm2Running = pm2 describe bagmane-ams | Select-String "online"
if (!$pm2Running) {
    # Start app
    pm2 start server.js --name bagmane-ams
    pm2 save
    Write-Host "   ✅ App started with PM2." -ForegroundColor Green
    
    # Setup startup hook (requires admin)
    Write-Host "   Installing PM2 startup hook..." -ForegroundColor Gray
    pm2-startup install
    pm2 save
} else {
    Write-Host "   ✅ App is already running in PM2. Restarting..." -ForegroundColor Green
    pm2 restart bagmane-ams
}

# 7. Firewall Configuration
Write-Host "`n🛡️ Configuring Firewall..." -ForegroundColor Yellow
$port = 3001
$ruleName = "BagmaneAMS_Port_$port"
$existingRule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue

if (!$existingRule) {
    New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -LocalPort $port -Protocol TCP -Action Allow
    Write-Host "   ✅ Firewall rule created for Port $port." -ForegroundColor Green
} else {
    Write-Host "   ✅ Firewall rule already exists." -ForegroundColor Green
}

Write-Host "`n🎉 Deployment Complete!" -ForegroundColor Cyan
Write-Host "👉 Access the app at: http://localhost:3001" -ForegroundColor Cyan
Write-Host "👉 Or via Server IP: http://$($env:COMPUTERNAME):3001" -ForegroundColor Cyan
