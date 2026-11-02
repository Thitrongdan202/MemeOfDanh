@echo off
echo ==========================================
echo   DANH'MUS -- Production Build
echo ==========================================

echo.
echo [1/2] Building Express API Server...
cd server
call npm.cmd run build
if %errorlevel% neq 0 (
    echo [ERROR] Server build failed!
    cd ..
    exit /b %errorlevel%
)
echo [OK] Server built successfully.

echo.
echo [2/2] Building Vite React Client...
cd ..\client
call npm.cmd run build
if %errorlevel% neq 0 (
    echo [ERROR] Client build failed!
    cd ..
    exit /b %errorlevel%
)
echo [OK] Client built successfully.

cd ..
echo.
echo ==========================================
echo   BUILD COMPLETED SUCCESSFULLY!
echo   Client dist: client\dist
echo   Server dist: server\dist
echo ==========================================
