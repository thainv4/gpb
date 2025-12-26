# Stop LIS GPB Backend

param(
    [switch]$Dev,
    [switch]$All
)

if ($All) {
    Write-Host "🛑 Stopping all PM2 processes..." -ForegroundColor Yellow
    pm2 stop all
} elseif ($Dev) {
    Write-Host "🛑 Stopping development server..." -ForegroundColor Yellow
    pm2 stop lis-gpb-backend-dev
} else {
    Write-Host "🛑 Stopping production server..." -ForegroundColor Yellow
    pm2 stop lis-gpb-backend
}

Write-Host "✅ Done!" -ForegroundColor Green
pm2 list

