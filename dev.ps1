# Khởi chạy toàn bộ hệ thống Danh'Mus (Express API + Vite React Frontend)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  DANH'MUS — THE DIGITAL MEME MUSEUM" -ForegroundColor Yellow
Write-Host "  Vite + React + GSAP + Express API" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$serverDir = Join-Path $PSScriptRoot "server"
$clientDir = Join-Path $PSScriptRoot "client"

Write-Host "`n[1/2] Đang khởi động Express API server (port 3001)..." -ForegroundColor Green
$serverJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$serverDir'; Write-Host '[Danh''Mus API] Đang chạy tại http://localhost:3001' -ForegroundColor Green; npm.cmd run dev" -PassThru

Start-Sleep -Seconds 2

Write-Host "[2/2] Đang khởi động Vite Client (port 5173)..." -ForegroundColor Green
$clientJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$clientDir'; Write-Host '[Danh''Mus Web] Đang mở tại http://localhost:5173' -ForegroundColor Cyan; npm.cmd run dev" -PassThru

Write-Host "`n==========================================" -ForegroundColor Yellow
Write-Host "  Hệ thống đã khởi động thành công!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Yellow
