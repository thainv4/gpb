@echo off
REM =====================================================
REM Script: Run SQL script to create BML_USERS table
REM Database: Oracle 12c
REM =====================================================

echo.
echo =====================================================
echo Creating BML_USERS table for LIS GPB Backend
echo =====================================================
echo.

REM Set Oracle environment variables
set ORACLE_HOME=C:\oracle\product\12.2.0\dbhome_1
set PATH=%ORACLE_HOME%\bin;%PATH%

REM Database connection parameters
set DB_HOST=192.168.7.248
set DB_PORT=1521
set DB_SERVICE_NAME=orclstb
set DB_USERNAME=HIS_RS
set DB_PASSWORD=HIS_RS

echo Connecting to Oracle database...
echo Host: %DB_HOST%
echo Port: %DB_PORT%
echo Service: %DB_SERVICE_NAME%
echo Username: %DB_USERNAME%
echo.

REM Run SQL script using sqlplus
sqlplus %DB_USERNAME%/%DB_PASSWORD%@%DB_HOST%:%DB_PORT%/%DB_SERVICE_NAME% @create-bml-users-table.sql

echo.
echo =====================================================
echo Script execution completed!
echo =====================================================
echo.
pause
