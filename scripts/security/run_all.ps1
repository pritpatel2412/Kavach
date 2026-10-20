# scripts/security/run_all.ps1: PowerShell entrypoint for Kavach security gate
param (
    [switch]$Fix = $false
)

$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (-not $RepoRoot) { $RepoRoot = (Get-Location).Path }
Set-Location $RepoRoot

$PythonExe = Join-Path $RepoRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $PythonExe)) {
    $PythonExe = "python"
}

$ScriptPath = Join-Path $RepoRoot "scripts\security\run_all.py"
& $PythonExe $ScriptPath
exit $LASTEXITCODE
