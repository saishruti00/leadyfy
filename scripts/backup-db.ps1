$ErrorActionPreference = "Stop"

$projectRoot = Split-Path $PSScriptRoot -Parent
$envFile = Join-Path $projectRoot ".env"
$backupDir = Join-Path $projectRoot "backups"

if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: .env file not found." -ForegroundColor Red
    exit 1
}

$databaseLine = Get-Content $envFile |
    Where-Object { $_ -match "^\s*DATABASE_URL\s*=" } |
    Select-Object -First 1

if (-not $databaseLine) {
    Write-Host "ERROR: DATABASE_URL not found in .env." -ForegroundColor Red
    exit 1
}

$databaseUrl = $databaseLine -replace "^\s*DATABASE_URL\s*=\s*", ""
$databaseUrl = $databaseUrl.Trim()

if (
    ($databaseUrl.StartsWith('"') -and $databaseUrl.EndsWith('"')) -or
    ($databaseUrl.StartsWith("'") -and $databaseUrl.EndsWith("'"))
) {
    $databaseUrl = $databaseUrl.Substring(1, $databaseUrl.Length - 2)
}

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Force $backupDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path $backupDir "leadyfy_$timestamp.dump"

Write-Host "Starting PostgreSQL backup..." -ForegroundColor Cyan

& pg_dump `
    --dbname="$databaseUrl" `
    --format=custom `
    --file="$backupFile"

if ($LASTEXITCODE -ne 0) {
    if (Test-Path $backupFile) {
        Remove-Item $backupFile -Force
    }

    Write-Host ""
    Write-Host "Backup failed." -ForegroundColor Red
    exit $LASTEXITCODE
}

if (-not (Test-Path $backupFile)) {
    Write-Host "Backup failed: backup file was not created." -ForegroundColor Red
    exit 1
}

$fileSize = (Get-Item $backupFile).Length

if ($fileSize -le 0) {
    Remove-Item $backupFile -Force
    Write-Host "Backup failed: backup file is empty." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Backup completed successfully!" -ForegroundColor Green
Write-Host "File: $backupFile" -ForegroundColor Yellow
Write-Host "Size: $fileSize bytes" -ForegroundColor Yellow
