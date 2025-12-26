# ⚡ Quick Start - Deploy trong 5 phút

## Lần đầu tiên

```bash
# 1. Cài PM2
npm install -g pm2

# 2. Vào thư mục project
cd E:\gpb

# 3. Cài dependencies
npm install

# 4. Tạo thư mục logs
mkdir logs

# 5. Build
npm run build

# 6. Start Production
npm run pm2:start

# 7. Xem logs
pm2 logs lis-gpb-backend
```

Truy cập: http://localhost:8000  
Swagger: http://localhost:8000/api/v1/docs

---

## Update và Deploy lại

```bash
# 1. Stop process cũ
pm2 stop lis-gpb-backend

# 2. Pull code mới
git pull origin main

# 3. Cài dependencies
npm install

# 4. Build
npm run build

# 5. Start lại
npm run pm2:start

# 6. Check
pm2 logs lis-gpb-backend
```

---

## Development Mode (Hot Reload)

```bash
# Start
npm run pm2:start:dev

# Xem logs
pm2 logs lis-gpb-backend-dev

# Stop
pm2 stop lis-gpb-backend-dev
```

---

## Lệnh quản lý nhanh

```bash
pm2 list                           # Xem tất cả
pm2 logs lis-gpb-backend          # Xem logs
pm2 monit                          # Monitor
pm2 restart lis-gpb-backend       # Restart
pm2 stop lis-gpb-backend          # Stop
pm2 delete lis-gpb-backend        # Delete
```

---

## Lỗi thường gặp

### Database connection failed
→ Kiểm tra `DB_SERVICE_NAME` trong `ecosystem.config.js`

### Port 8000 đang được sử dụng
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <pid> /F
```

### Application bị stopped
```bash
pm2 logs lis-gpb-backend --err
pm2 delete lis-gpb-backend
npm run pm2:start
```

---

Chi tiết xem file `DEPLOY_GUIDE.md`

