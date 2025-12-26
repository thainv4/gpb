#!/bin/bash

# LIS GPB Backend Deployment Script

echo "🚀 Starting deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Environment (default: production)
ENV=${1:-production}

echo "📦 Environment: $ENV"

# Step 1: Pull latest code
echo "${YELLOW}📥 Pulling latest code...${NC}"
git pull origin main

if [ $? -ne 0 ]; then
    echo "${RED}❌ Git pull failed!${NC}"
    exit 1
fi

# Step 2: Install dependencies
echo "${YELLOW}📦 Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo "${RED}❌ npm install failed!${NC}"
    exit 1
fi

# Step 3: Build project
echo "${YELLOW}🔨 Building project...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo "${RED}❌ Build failed!${NC}"
    exit 1
fi

# Step 4: Reload PM2
echo "${YELLOW}🔄 Reloading PM2...${NC}"
pm2 reload ecosystem.config.js --only lis-gpb-backend --env $ENV

if [ $? -ne 0 ]; then
    echo "${YELLOW}⚠️  PM2 reload failed, trying restart...${NC}"
    pm2 restart ecosystem.config.js --only lis-gpb-backend --env $ENV
fi

# Step 5: Save PM2 config
pm2 save

echo "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "📊 Application status:"
pm2 list
echo ""
echo "📋 View logs: pm2 logs lis-gpb-backend"
echo "📈 Monitor: pm2 monit"

