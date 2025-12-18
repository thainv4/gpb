# LIS GPB Database Setup

## 📋 Tổng Quan

Hệ thống LIS GPB sử dụng Oracle Database với các bảng được thiết kế theo chuẩn BML_ prefix.

## 🗄️ Cấu Trúc Database

### Tables
- `BML_USERS` - Quản lý người dùng
- `BML_PROVINCES` - Quản lý tỉnh/thành phố
- `BML_WARDS` - Quản lý xã/phường/thị trấn
- `BML_BRANCHES` - Quản lý chi nhánh bệnh viện
- `BML_DEPARTMENT_TYPES` - Quản lý loại khoa
- `BML_DEPARTMENTS` - Quản lý khoa/phòng ban
- `BML_ROOM_GROUPS` - Quản lý nhóm phòng
- `BML_ROOMS` - Quản lý phòng

### Relationships
```
BML_PROVINCES (1) ←→ (N) BML_WARDS
BML_PROVINCES (1) ←→ (N) BML_BRANCHES
BML_WARDS (1) ←→ (N) BML_BRANCHES
BML_BRANCHES (1) ←→ (N) BML_DEPARTMENTS
BML_DEPARTMENT_TYPES (1) ←→ (N) BML_DEPARTMENTS
BML_DEPARTMENTS (1) ←→ (N) BML_DEPARTMENTS (Self-reference)
BML_DEPARTMENTS (1) ←→ (N) BML_ROOMS
BML_ROOM_GROUPS (1) ←→ (N) BML_ROOMS
```

## 🚀 Cài Đặt

### Cách 1: Chạy Script Tổng Hợp (Khuyến nghị)

```sql
-- Kết nối Oracle Database
sqlplus username/password@host:port/service_name

-- Chạy script tổng hợp
@run_all_migrations.sql
```

### Cách 2: Chạy Từng Script Riêng Lẻ

```sql
-- 1. Tạo tất cả bảng
@000_create_all_tables.sql

-- 2. Tạo admin user và sample data
@001_create_admin_user.sql

-- 3. Fix UUID generation (khuyến nghị)
@002_fix_uuid_generation.sql
```

## 🔑 UUID Generation

Hệ thống sử dụng UUID cho tất cả Primary Keys:

- **Format**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Generation**: Oracle function `GENERATE_UUID()`
- **Type**: `VARCHAR2(36)`
- **Example**: `550e8400-e29b-41d4-a716-446655440000`

Script `002_fix_uuid_generation.sql` sẽ:
- Tạo function `GENERATE_UUID()`
- Cập nhật tất cả sample data với UUID thật
- Đảm bảo tất cả foreign key relationships đúng

## 👤 Admin User

Sau khi chạy script, bạn sẽ có user admin:

- **Username**: `admin`
- **Password**: `Admin123!`
- **Email**: `admin@lisgpb.com`
- **Full Name**: `Administrator`

## 📊 Sample Data

Script sẽ tạo dữ liệu mẫu bao gồm:

- 3 tỉnh/thành phố
- 3 xã/phường
- 2 chi nhánh bệnh viện
- 3 loại khoa
- 3 khoa/phòng ban
- 3 nhóm phòng
- 4 phòng

## 🔍 Kiểm Tra Cài Đặt

### Kiểm tra bảng đã tạo
```sql
SELECT TABLE_NAME, NUM_ROWS 
FROM USER_TABLES 
WHERE TABLE_NAME LIKE 'BML_%'
ORDER BY TABLE_NAME;
```

### Kiểm tra admin user
```sql
SELECT USERNAME, EMAIL, FULL_NAME, IS_ACTIVE 
FROM BML_USERS 
WHERE USERNAME = 'admin';
```

### Kiểm tra sample data
```sql
SELECT 'BML_USERS' as TABLE_NAME, COUNT(*) as RECORD_COUNT FROM BML_USERS
UNION ALL
SELECT 'BML_PROVINCES', COUNT(*) FROM BML_PROVINCES
UNION ALL
SELECT 'BML_WARDS', COUNT(*) FROM BML_WARDS
UNION ALL
SELECT 'BML_BRANCHES', COUNT(*) FROM BML_BRANCHES
UNION ALL
SELECT 'BML_DEPARTMENT_TYPES', COUNT(*) FROM BML_DEPARTMENT_TYPES
UNION ALL
SELECT 'BML_DEPARTMENTS', COUNT(*) FROM BML_DEPARTMENTS
UNION ALL
SELECT 'BML_ROOM_GROUPS', COUNT(*) FROM BML_ROOM_GROUPS
UNION ALL
SELECT 'BML_ROOMS', COUNT(*) FROM BML_ROOMS;
```

## 🛠️ Troubleshooting

### Lỗi: ORA-00942: table or view does not exist
- **Nguyên nhân**: Chưa chạy script tạo bảng
- **Giải pháp**: Chạy `000_create_all_tables.sql` trước

### Lỗi: ORA-01408: such column list already indexed
- **Nguyên nhân**: Index đã tồn tại
- **Giải pháp**: Drop và tạo lại bảng, hoặc bỏ qua lỗi này

### Lỗi: ORA-02291: integrity constraint violated
- **Nguyên nhân**: Foreign key constraint bị vi phạm
- **Giải pháp**: Kiểm tra dữ liệu parent table trước khi insert

## 📝 Ghi Chú

- Tất cả bảng đều có audit fields: `CREATED_AT`, `UPDATED_AT`, `DELETED_AT`, `CREATED_BY`, `UPDATED_BY`, `VERSION`
- Sử dụng soft delete với `DELETED_AT`
- Optimistic locking với `VERSION`
- Tất cả ID đều là UUID string
- Indexes được tạo để tối ưu performance

## 🔄 Rollback

Để xóa tất cả bảng (nếu cần):

```sql
-- Drop tables in reverse dependency order
DROP TABLE BML_ROOMS CASCADE CONSTRAINTS;
DROP TABLE BML_DEPARTMENTS CASCADE CONSTRAINTS;
DROP TABLE BML_DEPARTMENT_TYPES CASCADE CONSTRAINTS;
DROP TABLE BML_ROOM_GROUPS CASCADE CONSTRAINTS;
DROP TABLE BML_BRANCHES CASCADE CONSTRAINTS;
DROP TABLE BML_WARDS CASCADE CONSTRAINTS;
DROP TABLE BML_PROVINCES CASCADE CONSTRAINTS;
DROP TABLE BML_USERS CASCADE CONSTRAINTS;
DROP TABLE MIGRATION_LOG CASCADE CONSTRAINTS;
```
