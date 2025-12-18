# =====================================================
# Script: Run SQL script to create BML_USERS table
# Database: Oracle 12c
# =====================================================

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Green
Write-Host "Creating BML_USERS table for LIS GPB Backend" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
Write-Host ""

# Database connection parameters
$DB_HOST = "192.168.7.248"
$DB_PORT = "1521"
$DB_SERVICE_NAME = "orclstb"
$DB_USERNAME = "HIS_RS"
$DB_PASSWORD = "HIS_RS"

Write-Host "Connecting to Oracle database..." -ForegroundColor Yellow
Write-Host "Host: $DB_HOST" -ForegroundColor Cyan
Write-Host "Port: $DB_PORT" -ForegroundColor Cyan
Write-Host "Service: $DB_SERVICE_NAME" -ForegroundColor Cyan
Write-Host "Username: $DB_USERNAME" -ForegroundColor Cyan
Write-Host ""

# Check if sqlplus is available
try {
    $sqlplusPath = Get-Command sqlplus -ErrorAction Stop
    Write-Host "Found sqlplus at: $($sqlplusPath.Source)" -ForegroundColor Green
} catch {
    Write-Host "Error: sqlplus not found in PATH" -ForegroundColor Red
    Write-Host "Please ensure Oracle Client is installed and sqlplus is in PATH" -ForegroundColor Red
    Write-Host "You can also run the SQL script manually in SQL Developer or Toad" -ForegroundColor Yellow
    Read-Host "Press Enter to continue"
    exit 1
}

# Run SQL script
$connectionString = "${DB_USERNAME}/${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_SERVICE_NAME}"
$sqlScript = "create-bml-users-table.sql"

Write-Host "Executing SQL script: $sqlScript" -ForegroundColor Yellow
Write-Host "Connection: $connectionString" -ForegroundColor Cyan
Write-Host ""

try {
    & sqlplus $connectionString "@$sqlScript"
    Write-Host ""
    Write-Host "=====================================================" -ForegroundColor Green
    Write-Host "Script execution completed successfully!" -ForegroundColor Green
    Write-Host "=====================================================" -ForegroundColor Green
} catch {
    Write-Host "Error executing SQL script: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check your database connection and try again" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to continue"
