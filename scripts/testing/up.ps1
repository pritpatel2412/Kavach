# Kavach Full-System Test Environment Orchestration (PowerShell)
# Starts API (:8000), Site (:3000), App (:3001), Admin (:3002), and SMTP Catcher (:1025)

param(
    [switch]$NoSeed = $false,
    [switch]$Stop = $false
)

$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $Root

function Test-Port {
    param([int]$Port)
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    return [bool]$conn
}

if ($Stop) {
    Write-Host "[UP] Stopping test services..." -ForegroundColor Yellow
    Get-Process -Name "node", "python" -ErrorAction SilentlyContinue | ForEach-Object {
        $p = $_
        try {
            $connections = Get-NetTCPConnection -OwningProcess $p.Id -ErrorAction SilentlyContinue
            if ($connections | Where-Object { $_.LocalPort -in 8000, 3000, 3001, 3002, 1025 }) {
                Write-Host "Killing process $($p.Id) ($($p.ProcessName)) on port..."
                Stop-Process -Id $p.Id -Force
            }
        } catch {}
    }
    Write-Host "[UP] All test services stopped." -ForegroundColor Green
    exit 0
}

Write-Host "=== Kavach Full-System Test Environment Orchestrator ===" -ForegroundColor Cyan
Write-Host "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') IST"

# 1. Synthetic Demo DB Seeding
if (-not $NoSeed) {
    Write-Host "`n[1/5] Seeding synthetic demo database..." -ForegroundColor Yellow
    $env:ENV = "development"
    & .\.venv\Scripts\python.exe scripts/testing/seed_test_data.py
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Database seeding reported an error, continuing..."
    } else {
        Write-Host "  -> Database seeded successfully." -ForegroundColor Green
    }
}

$PyExe = Join-Path $Root ".venv\Scripts\python.exe"
$PnpmCmd = "pnpm.cmd"

# 2. Start SMTP Catcher on Port 1025
if (-not (Test-Port 1025)) {
    Write-Host "`n[2/5] Starting local test SMTP server (port 1025)..." -ForegroundColor Yellow
    Start-Process -FilePath $PyExe -ArgumentList "scripts/testing/smtp_catcher.py" -WorkingDirectory $Root -WindowStyle Hidden
} else {
    Write-Host "`n[2/5] Test SMTP server already active on port 1025." -ForegroundColor Green
}

# 3. Start FastAPI Server on Port 8000
if (-not (Test-Port 8000)) {
    Write-Host "`n[3/5] Starting FastAPI backend (port 8000)..." -ForegroundColor Yellow
    $env:KAVACH_MOCK_STT = "1"
    $env:SMTP_PORT = "1025"
    $env:SMTP_HOST = "127.0.0.1"
    $env:EMAIL_MODE = "smtp"
    Start-Process -FilePath $PyExe -ArgumentList "-m uvicorn app.main:app --app-dir apps/api --host 127.0.0.1 --port 8000" -WorkingDirectory $Root -WindowStyle Hidden
} else {
    Write-Host "`n[3/5] FastAPI backend already active on port 8000." -ForegroundColor Green
}

# 4. Start Next.js Applications (Site: 3000, App: 3001, Admin: 3002)
Write-Host "`n[4/5] Checking Next.js services..." -ForegroundColor Yellow

if (-not (Test-Port 3000)) {
    Write-Host "  Starting @kavach/site on port 3000..."
    Start-Process -FilePath $PnpmCmd -ArgumentList "--filter @kavach/site start" -WorkingDirectory $Root -WindowStyle Hidden
} else {
    Write-Host "  @kavach/site active on port 3000." -ForegroundColor Green
}

if (-not (Test-Port 3001)) {
    Write-Host "  Starting @kavach/app on port 3001..."
    Start-Process -FilePath $PnpmCmd -ArgumentList "--filter @kavach/app start" -WorkingDirectory $Root -WindowStyle Hidden
} else {
    Write-Host "  @kavach/app active on port 3001." -ForegroundColor Green
}

if (-not (Test-Port 3002)) {
    Write-Host "  Starting @kavach/admin on port 3002..."
    Start-Process -FilePath $PnpmCmd -ArgumentList "--filter @kavach/admin start" -WorkingDirectory $Root -WindowStyle Hidden
} else {
    Write-Host "  @kavach/admin active on port 3002." -ForegroundColor Green
}

# 5. Service Health Checks with Polling Retry
Write-Host "`n[5/5] Performing health probes across all services (polling up to 15s)..." -ForegroundColor Yellow

$services = @(
    @{ Name = "FastAPI Backend"; Url = "http://127.0.0.1:8000/health"; Port = 8000 },
    @{ Name = "Marketing Site"; Url = "http://localhost:3000"; Port = 3000 },
    @{ Name = "Guardian App"; Url = "http://localhost:3001"; Port = 3001 },
    @{ Name = "Admin Console"; Url = "http://localhost:3002"; Port = 3002 }
)

$allHealthy = $true
foreach ($s in $services) {
    $ready = $false
    for ($i = 0; $i -lt 15; $i++) {
        try {
            $resp = Invoke-WebRequest -Uri $s.Url -Method GET -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            if ($resp.StatusCode -eq 200) {
                $ready = $true
                break
            }
        } catch {
            Start-Sleep -Seconds 1
        }
    }
    if ($ready) {
        Write-Host "  [OK] $($s.Name) ($($s.Url)) -> Status 200" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $($s.Name) ($($s.Url)) -> Timed out after 15s" -ForegroundColor Red
        $allHealthy = $false
    }
}

if (Test-Port 1025) {
    Write-Host "  [OK] Local Test SMTP (127.0.0.1:1025) -> Listening" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Local Test SMTP (127.0.0.1:1025) -> Not Listening" -ForegroundColor Red
    $allHealthy = $false
}

Write-Host "`n=======================================================" -ForegroundColor Cyan
if ($allHealthy) {
    Write-Host "ALL SERVICES OPERATIONAL AND READY FOR TEST CAMPAIGN!" -ForegroundColor Green
} else {
    Write-Warning "One or more services reported warnings during initialization."
}
Write-Host "=======================================================`n" -ForegroundColor Cyan
