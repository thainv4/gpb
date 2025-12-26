# Start LIS GPB Backend with PM2

param(
    [string]$Env = "production",
    [switch]$Dev
)

if ($Dev) {
    Write-Host "🚀 Starting in Development mode..." -ForegroundColor Cyan
    pm2 start ecosystem.config.js --only lis-gpb-backend-dev
} else {
    Write-Host "🚀 Starting in Production mode ($Env)..." -ForegroundColor Cyan
    
    # Check if built
    if (-not (Test-Path "dist\main.js")) {
        Write-Host "⚠️  Build not found. Building..." -ForegroundColor Yellow
        npm run build
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Build failed!" -ForegroundColor Red
            exit 1
        }
    }
    
    pm2 start ecosystem.config.js --only lis-gpb-backend --env $Env
}

pm2 save

Write-Host "`n✅ Application started!" -ForegroundColor Green
pm2 list

