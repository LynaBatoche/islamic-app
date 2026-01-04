@echo off
echo Starting Islamic Website with Backend API...
echo.

echo Installing backend dependencies...
cd /d "%~dp0"
npm install

echo.
echo Starting backend server on port 3001...
start "Backend Server" cmd /k "npm start"

echo.
echo Starting frontend server on port 8000...
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "python -m http.server 8000"

echo.
echo Servers starting up...
echo Backend API: http://localhost:3001
echo Frontend: http://localhost:8000
echo.
echo Press any key to stop servers...
pause > nul

echo Stopping servers...
taskkill /f /im node.exe > nul 2>&1
taskkill /f /im python.exe > nul 2>&1
echo Servers stopped.