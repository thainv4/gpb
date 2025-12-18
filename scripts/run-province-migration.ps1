# =====================================================
# Script: Run Province Migration (PowerShell)
# Description: Chạy migration script để tạo bảng BML_PROVINCES
# Author: LIS GPB Team
# Date: 2024-01-15
# Version: 1.0
# =====================================================

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "LIS GPB - Province Migration Script" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Set Oracle connection parameters
$ORACLE_HOST = "192.168.7.248"
$ORACLE_PORT = "1521"
$ORACLE_SERVICE = "orclstb"
$ORACLE_USERNAME = "HIS_RS"
$ORACLE_PASSWORD = "HIS_RS"

Write-Host "Oracle Connection Parameters:" -ForegroundColor Yellow
Write-Host "- Host: $ORACLE_HOST" -ForegroundColor White
Write-Host "- Port: $ORACLE_PORT" -ForegroundColor White
Write-Host "- Service: $ORACLE_SERVICE" -ForegroundColor White
Write-Host "- Username: $ORACLE_USERNAME" -ForegroundColor White
Write-Host ""

# Check if SQL*Plus is available
try {
    $null = Get-Command sqlplus -ErrorAction Stop
    Write-Host "SQL*Plus found successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: SQL*Plus is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Oracle Client or add SQL*Plus to PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting migration..." -ForegroundColor Yellow
Write-Host ""

# Run the migration script
$connectionString = "$ORACLE_USERNAME/$ORACLE_PASSWORD@$ORACLE_HOST`:$ORACLE_PORT/$ORACLE_SERVICE"
$scriptPath = Join-Path $PSScriptRoot "create-bml-provinces-table.sql"

try {
    & sqlplus $connectionString "@$scriptPath"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=====================================================" -ForegroundColor Green
        Write-Host "Migration completed successfully!" -ForegroundColor Green
        Write-Host "=====================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Table BML_PROVINCES has been created with sample data." -ForegroundColor White
        Write-Host "You can now use the Province API endpoints." -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "=====================================================" -ForegroundColor Red
        Write-Host "Migration failed!" -ForegroundColor Red
        Write-Host "=====================================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please check the error messages above and try again." -ForegroundColor Red
        Write-Host ""
    }
} catch {
    Write-Host ""
    Write-Host "=====================================================" -ForegroundColor Red
    Write-Host "Migration failed with error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "=====================================================" -ForegroundColor Red
    Write-Host ""
}

Read-Host "Press Enter to exit"
