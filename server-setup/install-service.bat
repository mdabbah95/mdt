@echo off
:: MEDI SAP Sync — Install as Windows Service using NSSM
:: Run this as Administrator!

echo ============================================
echo   MEDI SAP Sync — Windows Service Installer
echo ============================================
echo.

:: Check admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Run this as Administrator!
    echo Right-click install-service.bat and select "Run as administrator"
    pause
    exit /b 1
)

set SVCNAME=MediSapSync
set SVCDIR=%~dp0
set NSSM=%SVCDIR%nssm.exe

:: Download NSSM if not present
if not exist "%NSSM%" (
    echo Downloading NSSM...
    powershell -command "Invoke-WebRequest -Uri 'https://nssm.cc/release/nssm-2.24.zip' -OutFile '%TEMP%\nssm.zip'"
    powershell -command "Expand-Archive -Path '%TEMP%\nssm.zip' -DestinationPath '%TEMP%\nssm' -Force"
    copy "%TEMP%\nssm\nssm-2.24\win64\nssm.exe" "%NSSM%" >nul
    echo NSSM downloaded.
)

:: Stop existing service if running
"%NSSM%" stop %SVCNAME% >nul 2>&1
"%NSSM%" remove %SVCNAME% confirm >nul 2>&1

:: Install service
echo Installing service...
"%NSSM%" install %SVCNAME% "node.exe" "server.js"
"%NSSM%" set %SVCNAME% AppDirectory "%SVCDIR%"
"%NSSM%" set %SVCNAME% DisplayName "MEDI SAP Sync Server"
"%NSSM%" set %SVCNAME% Description "Syncs SAP B1 data to Google Sheets every hour"
"%NSSM%" set %SVCNAME% Start SERVICE_AUTO_START
"%NSSM%" set %SVCNAME% AppStdout "%SVCDIR%service.log"
"%NSSM%" set %SVCNAME% AppStderr "%SVCDIR%service.log"
"%NSSM%" set %SVCNAME% AppStdoutCreationDisposition 4
"%NSSM%" set %SVCNAME% AppStderrCreationDisposition 4
"%NSSM%" set %SVCNAME% AppRotateFiles 1
"%NSSM%" set %SVCNAME% AppRotateBytes 5242880

:: Start service
echo Starting service...
"%NSSM%" start %SVCNAME%

echo.
echo ============================================
echo   Service installed and started!
echo   Name: %SVCNAME%
echo   Log:  %SVCDIR%service.log
echo ============================================
echo.
echo   Commands:
echo     nssm stop MediSapSync     — Stop
echo     nssm start MediSapSync    — Start
echo     nssm remove MediSapSync   — Uninstall
echo.
pause
