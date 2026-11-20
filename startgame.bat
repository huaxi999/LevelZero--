@echo off
setlocal
cd /d "%~dp0"
set "PORT=8000"
set "URL=http://127.0.0.1:%PORT%/"

echo Starting RongSang game site...
echo URL: %URL%
echo.
echo Close this window to stop the server.
echo.

start "" /min powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process '%URL%'"

node --version >nul 2>nul
if %errorlevel%==0 (
    node "%~dp0local-server.js"
    echo.
    echo Server stopped or failed to start.
    pause
    goto :eof
)

py --version >nul 2>nul
if %errorlevel%==0 (
    py -m http.server %PORT%
    echo.
    echo Server stopped or failed to start.
    pause
    goto :eof
)

python --version >nul 2>nul
if %errorlevel%==0 (
    python -m http.server %PORT%
    echo.
    echo Server stopped or failed to start.
    pause
    goto :eof
)

echo Node or Python is required to start the local server.
pause
