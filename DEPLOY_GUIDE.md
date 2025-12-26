# 🚀 Hướng dẫn Deploy LIS GPB Backend với PM2

## 📋 Yêu cầu

- Node.js >= 18.x
- npm >= 9.x
- PM2 (sẽ cài đặt ở bước 1)
- Oracle Database đã setup
- Redis đang chạy (optional)

---

## Bước 1: Cài đặt PM2

```bash
# Cài PM2 globally
npm install -g pm2

# Kiểm tra
pm2 --version
```

---

## Bước 2: Chuẩn bị Project

### 2.1. Clone hoặc Pull code mới nhất

```bash
# Nếu là lần đầu
git clone <repository-url>
cd gpb

# Nếu đã có project
cd E:\gpb
git pull origin main
```

### 2.2. Cài đặt dependencies

```bash
npm install
```

### 2.3. Tạo thư mục logs

```bash
# Windows
mkdir logs

# Linux/Mac
mkdir -p logs
```

---

## Bước 3: Deploy Production

### 3.1. Build project

```bash
npm run build
```

Đảm bảo build thành công và thư mục `dist/` được tạo ra.

### 3.2. Start với PM2

```bash
# Production mode
pm2 start ecosystem.config.js --only lis-gpb-backend --env production

# Hoặc dùng npm script
npm run pm2:start
```

### 3.3. Kiểm tra trạng thái

```bash
# Xem danh sách processes
pm2 list

# Xem logs
pm2 logs lis-gpb-backend

# Stop xem logs khi ổn định (Ctrl+C)
```

### 3.4. Lưu cấu hình PM2

```bash
pm2 save
```

---

## Bước 4: Deploy Development (với hot reload)

```bash
# Start development mode
npm run pm2:start:dev

# Xem logs
pm2 logs lis-gpb-backend-dev
```

---

## Bước 5: Auto-start khi server khởi động lại

### 5.1. Tạo startup script

```bash
pm2 startup
```

PM2 sẽ show một command, copy và chạy command đó.

### 5.2. Lưu danh sách processes

```bash
pm2 save
```

### 5.3. Test

```bash
# Reboot server và kiểm tra
# Sau khi reboot:
pm2 list
```

---

## 📊 Quản lý Application

### Xem logs

```bash
# Logs real-time
pm2 logs lis-gpb-backend

# Xem 50 dòng cuối
pm2 logs --lines 50

# Chỉ xem errors
pm2 logs --err

# Clear logs
pm2 flush
```

### Monitor

```bash
# Terminal monitor
pm2 monit

# Web dashboard
pm2 web
# Truy cập: http://localhost:9615
```

### Restart/Reload

```bash
# Restart (có downtime ngắn)
pm2 restart lis-gpb-backend

# Reload (zero-downtime) - khuyến nghị
pm2 reload lis-gpb-backend

# Restart tất cả
pm2 restart all
```

### Stop/Delete

```bash
# Stop
pm2 stop lis-gpb-backend

# Delete khỏi PM2
pm2 delete lis-gpb-backend

# Xóa tất cả
pm2 delete all
```

---

## 🔄 Update & Redeploy

### Cách 1: Thủ công

```bash
# 1. Pull code mới
git pull origin main

# 2. Cài đặt dependencies mới (nếu có)
npm install

# 3. Build lại
npm run build

# 4. Reload PM2 (zero-downtime)
pm2 reload lis-gpb-backend

# 5. Kiểm tra logs
pm2 logs lis-gpb-backend --lines 30
```

### Cách 2: Sử dụng NPM scripts

```bash
# Stop old version
pm2 stop lis-gpb-backend

# Pull, build và start
git pull && npm install && npm run build && npm run pm2:start

# Xem logs
pm2 logs lis-gpb-backend
```

---

## 🐛 Troubleshooting

### Lỗi: Application không start

```bash
# 1. Xem logs chi tiết
pm2 logs lis-gpb-backend --err --lines 100

# 2. Kiểm tra process status
pm2 show lis-gpb-backend

# 3. Thử stop và start lại
pm2 delete lis-gpb-backend
pm2 start ecosystem.config.js --only lis-gpb-backend --env production
```

### Lỗi: Database connection failed

```bash
# Kiểm tra database có chạy không
ping 192.168.7.248

# Test kết nối database
sqlplus HIS_RS/HIS_RS@192.168.7.248:1521/orclstb

# Nếu service name sai, sửa trong ecosystem.config.js
# DB_SERVICE_NAME: 'your-correct-service-name'
```

### Lỗi: Port 8000 đã được sử dụng

```bash
# Windows: Tìm process đang dùng port
netstat -ano | findstr :8000

# Kill process
taskkill /PID <pid> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9

# Sau đó restart PM2
pm2 restart lis-gpb-backend
```

### Lỗi: Memory leak

```bash
# 1. Monitor memory
pm2 monit

# 2. Restart để giải phóng
pm2 restart lis-gpb-backend

# 3. Kiểm tra max_memory_restart trong ecosystem.config.js
# Nó sẽ tự restart khi vượt quá 1GB
```

### Lỗi: PM2 process bị stopped

```bash
# 1. Xem lý do
pm2 logs lis-gpb-backend --err

# 2. Delete và start lại
pm2 delete lis-gpb-backend
pm2 start ecosystem.config.js --only lis-gpb-backend --env production
```

---

## 📝 Các lệnh PM2 hay dùng

```bash
# Xem tất cả processes
pm2 list

# Xem chi tiết một process
pm2 show lis-gpb-backend

# Restart một process
pm2 restart lis-gpb-backend

# Reload (zero-downtime)
pm2 reload lis-gpb-backend

# Stop một process
pm2 stop lis-gpb-backend

# Delete một process
pm2 delete lis-gpb-backend

# Xem logs
pm2 logs lis-gpb-backend

# Clear logs
pm2 flush

# Monitor
pm2 monit

# Lưu cấu hình
pm2 save

# Restore processes đã save
pm2 resurrect

# Kill PM2 daemon
pm2 kill

# Web dashboard
pm2 web
```

---

## 🔒 Lưu ý bảo mật

### Production

1. **Đổi JWT_SECRET** trong `ecosystem.config.js`:
   ```javascript
   JWT_SECRET: 'your-strong-random-secret-key-here'
   ```

2. **Cập nhật CORS_ORIGIN**:
   ```javascript
   CORS_ORIGIN: 'https://your-real-domain.com'
   ```

3. **Đổi database password** nếu cần:
   ```javascript
   DB_PASSWORD: 'your-secure-password'
   ```

---

## ✅ Checklist Deploy

- [ ] Đã cài PM2
- [ ] Đã clone/pull code mới
- [ ] Đã chạy `npm install`
- [ ] Đã tạo thư mục `logs/`
- [ ] Đã chạy `npm run build` thành công
- [ ] Đã kiểm tra database connection
- [ ] Đã start PM2: `pm2 start ecosystem.config.js --only lis-gpb-backend --env production`
- [ ] Đã kiểm tra logs: `pm2 logs lis-gpb-backend`
- [ ] Application đang chạy: `pm2 list`
- [ ] Đã save PM2 config: `pm2 save`
- [ ] Đã setup auto-start: `pm2 startup` → `pm2 save`

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs: `pm2 logs lis-gpb-backend --err`
2. Xem phần Troubleshooting ở trên
3. Liên hệ team support

---

**Version:** 1.0.0  
**Updated:** December 2025

