# LIS GPB Backend Deployment Script for Windows PowerShell

param(
    [string]$Env = "production"
)

Write-Host "🚀 Starting deployment..." -ForegroundColor Cyan
Write-Host "📦 Environment: $Env" -ForegroundColor Yellow

# Step 1: Pull latest code
Write-Host "`n📥 Pulling latest code..." -ForegroundColor Yellow
git pull origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git pull failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Build project
Write-Host "`n🔨 Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Step 4: Reload PM2
Write-Host "`n🔄 Reloading PM2..." -ForegroundColor Yellow
pm2 reload ecosystem.config.js --only lis-gpb-backend --env $Env

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  PM2 reload failed, trying restart..." -ForegroundColor Yellow
    pm2 restart ecosystem.config.js --only lis-gpb-backend --env $Env
}

# Step 5: Save PM2 config
pm2 save

Write-Host "`n✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "`n📊 Application status:" -ForegroundColor Cyan
pm2 list
Write-Host "`n📋 View logs: pm2 logs lis-gpb-backend" -ForegroundColor Gray
Write-Host "📈 Monitor: pm2 monit" -ForegroundColor Gray

