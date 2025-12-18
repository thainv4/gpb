@echo off
REM =====================================================
REM Script: Run Province Migration
REM Description: Chạy migration script để tạo bảng BML_PROVINCES
REM Author: LIS GPB Team
REM Date: 2024-01-15
REM Version: 1.0
REM =====================================================

echo =====================================================
echo LIS GPB - Province Migration Script
echo =====================================================
echo.

REM Set Oracle connection parameters
set ORACLE_HOST=192.168.7.248
set ORACLE_PORT=1521
set ORACLE_SERVICE=orclstb
set ORACLE_USERNAME=HIS_RS
set ORACLE_PASSWORD=HIS_RS

echo Oracle Connection Parameters:
echo - Host: %ORACLE_HOST%
echo - Port: %ORACLE_PORT%
echo - Service: %ORACLE_SERVICE%
echo - Username: %ORACLE_USERNAME%
echo.

REM Check if SQL*Plus is available
sqlplus -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: SQL*Plus is not installed or not in PATH
    echo Please install Oracle Client or add SQL*Plus to PATH
    pause
    exit /b 1
)

echo Starting migration...
echo.

REM Run the migration script
sqlplus %ORACLE_USERNAME%/%ORACLE_PASSWORD%@%ORACLE_HOST%:%ORACLE_PORT%/%ORACLE_SERVICE% @create-bml-provinces-table.sql

if %errorlevel% equ 0 (
    echo.
    echo =====================================================
    echo Migration completed successfully!
    echo =====================================================
    echo.
    echo Table BML_PROVINCES has been created with sample data.
    echo You can now use the Province API endpoints.
    echo.
) else (
    echo.
    echo =====================================================
    echo Migration failed!
    echo =====================================================
    echo.
    echo Please check the error messages above and try again.
    echo.
)

pause
