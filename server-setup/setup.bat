@echo off
echo ========================================
echo   MEDI SAP Sync Server - Setup
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)

echo [1/3] Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo [2/3] Configuration check...
if not exist .env (
    echo ERROR: .env file not found!
    echo Copy .env.example to .env and edit it
    pause
    exit /b 1
)
echo .env file found

echo.
echo [3/3] Starting server...
echo.
node server.js
