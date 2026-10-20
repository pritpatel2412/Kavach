<#
.SYNOPSIS
    Kavach Windows PowerShell Runner (S3-E).
    Zero dependencies on make or bash.

.DESCRIPTION
    Native runner for Windows environments supporting all developer, test,
    evaluation, and live verification workflows.

.EXAMPLE
    .\run.ps1 setup
    .\run.ps1 test
    .\run.ps1 dev-mock
    .\run.ps1 eval
    .\run.ps1 live-check
#>

param(
    [Parameter(Position=0)]
    [ValidateSet("setup", "test", "dev", "dev-mock", "demo", "eval", "blind-eval", "ambient-eval", "real-eval", "live-check", "help")]
    [string]$Command = "help",

    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$ExtraArgs
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Determine Python executable in venv
if (Test-Path "$ScriptDir\.venv\Scripts\python.exe") {
    $Python = "$ScriptDir\.venv\Scripts\python.exe"
    $Uvicorn = "$ScriptDir\.venv\Scripts\uvicorn.exe"
} else {
    $Python = "python"
    $Uvicorn = "uvicorn"
}

switch ($Command) {
    "setup" {
        Write-Host "Setting up Python virtual environment..." -ForegroundColor Cyan
        if (-not (Test-Path "$ScriptDir\.venv")) {
            python -m venv "$ScriptDir\.venv"
        }
        $Python = "$ScriptDir\.venv\Scripts\python.exe"
        & $Python -m pip install --upgrade pip
        & $Python -m pip install -r "$ScriptDir\apps\api\requirements.txt" -e "$ScriptDir\packages\detector"
        if (-not (Test-Path "$ScriptDir\.env")) {
            if (Test-Path "$ScriptDir\.env.example") {
                Copy-Item "$ScriptDir\.env.example" "$ScriptDir\.env"
                Write-Host "Created .env from .env.example" -ForegroundColor Green
            }
        }
        Write-Host "Setup complete. Run '.\run.ps1 test' or '.\run.ps1 dev-mock'" -ForegroundColor Green
    }

    "test" {
        Write-Host "Running all tests offline (zero credits)..." -ForegroundColor Cyan
        & $Python -m pytest @ExtraArgs
    }

    "dev-mock" {
        Write-Host "Starting Kavach mock server (zero credits)..." -ForegroundColor Cyan
        Write-Host "Open: http://localhost:8000/?mock=1&judge=1" -ForegroundColor Yellow
        $env:KAVACH_MOCK_STT = "1"
        & $Uvicorn app.main:app --app-dir "$ScriptDir\apps\api" --reload --port 8000 @ExtraArgs
    }

    "demo" {
        Write-Host "Starting Kavach automated contest demo (zero credits)..." -ForegroundColor Cyan
        Write-Host "Launching local mock server and opening browser..." -ForegroundColor Yellow
        $env:KAVACH_MOCK_STT = "1"
        $DemoUrl = "http://localhost:8000/?mock=1&judge=1&demo=1"
        
        Start-Job -ScriptBlock {
            param($url)
            Start-Sleep -Seconds 2
            Start-Process $url
        } -ArgumentList $DemoUrl | Out-Null
        
        & $Uvicorn app.main:app --app-dir "$ScriptDir\apps\api" --reload --port 8000 @ExtraArgs
    }

    "dev" {
        Write-Host "Starting Kavach with LIVE Gnani APIs (uses credits)..." -ForegroundColor Magenta
        Write-Host "Open: http://localhost:8000/?judge=1" -ForegroundColor Yellow
        $env:KAVACH_MOCK_STT = "0"
        & $Uvicorn app.main:app --app-dir "$ScriptDir\apps\api" --reload --port 8000 @ExtraArgs
    }

    "eval" {
        Write-Host "Replaying 68 scaled call fixtures and ambient benchmark..." -ForegroundColor Cyan
        & $Python "$ScriptDir\eval\run_eval.py" @ExtraArgs
    }

    "blind-eval" {
        Write-Host "Running independent blind evaluation harness..." -ForegroundColor Cyan
        & $Python "$ScriptDir\eval\run_blind.py" @ExtraArgs
    }

    "ambient-eval" {
        Write-Host "Evaluating 400 ambient household benign segments (S3-B)..." -ForegroundColor Cyan
        & $Python "$ScriptDir\eval\run_eval.py" --no-noise @ExtraArgs
    }

    "real-eval" {
        Write-Host "Running real-audio evaluation pipeline..." -ForegroundColor Cyan
        & $Python "$ScriptDir\scripts\real_eval.py" @ExtraArgs
    }

    "live-check" {
        Write-Host "Starting guided minimal-credit live smoke test..." -ForegroundColor Cyan
        & $Python "$ScriptDir\scripts\live_check.py" @ExtraArgs
    }

    Default {
        Write-Host @"
Kavach Windows PowerShell Runner

Usage:
  .\run.ps1 <command> [extra arguments]

Available Commands:
  setup         Create virtualenv and install dependencies
  test          Run offline pytest suite (zero credits consumed)
  dev-mock      Start development server in offline mock mode (http://localhost:8000/?mock=1&judge=1)
  demo          Start server, open browser, and autoplay scripted contest demo with TTW
  dev           Start development server with live Gnani Prisma STT (http://localhost:8000/?judge=1)
  eval          Run multi-condition ASR noise benchmark (0/10/20/30% WER + ambient)
  blind-eval    Run independent blind evaluation on unseen scripts with exact Wilson 95% CIs
  ambient-eval  Run 400-segment ambient false alarm benchmark
  real-eval     Evaluate role-played physical recordings (--yes or --dry-run)
  live-check    Run guided live smoke test with real Gnani key (--yes required)

Examples:
  .\run.ps1 test
  .\run.ps1 dev-mock
  .\run.ps1 eval
  .\run.ps1 blind-eval
  .\run.ps1 real-eval --dry-run
"@ -ForegroundColor White
    }
}
