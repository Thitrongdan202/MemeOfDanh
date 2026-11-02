@echo off
echo ==========================================
echo   DANH'MUS -- THE DIGITAL MEME MUSEUM
echo   Starting Express API + Vite Frontend...
echo ==========================================

start "Danh'Mus API Server (Port 3001)" cmd /k "cd server && npm.cmd run dev"
timeout /t 2 /nobreak >nul
start "Danh'Mus Vite Client (Port 5173)" cmd /k "cd client && npm.cmd run dev"

echo.
echo Servers started in separate windows!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
echo.
