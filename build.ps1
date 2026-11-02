# Build toàn bộ hệ thống Danh'Mus cho Production

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  DANH'MUS — Production Build" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

$serverDir = Join-Path $PSScriptRoot "server"
$clientDir = Join-Path $PSScriptRoot "client"

Write-Host "`n[1/2] Building Express API Server..." -ForegroundColor Green
Set-Location $serverDir
npm.cmd run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Server build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Server build succeeded!" -ForegroundColor Green

Write-Host "`n[2/2] Building Vite React Client..." -ForegroundColor Green
Set-Location $clientDir
npm.cmd run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Client build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Client build succeeded!" -ForegroundColor Green

Set-Location $PSScriptRoot
Write-Host "`n==========================================" -ForegroundColor Yellow
Write-Host "  Tất cả build thành công!" -ForegroundColor Green
Write-Host "  Client bundle: client/dist/" -ForegroundColor Cyan
Write-Host "  Server bundle: server/dist/" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Yellow
