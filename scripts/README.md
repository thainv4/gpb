# Database Setup Scripts

## 📋 **Mô tả**
Scripts để tạo table `BML_USERS` trong Oracle database cho LIS GPB Backend.

## 🗄️ **Database Information**
- **Database**: Oracle 12c
- **Host**: 192.168.7.248
- **Port**: 1521
- **Service Name**: orclstb
- **Username**: HIS_RS
- **Password**: HIS_RS
- **Table Prefix**: BML_

## 📁 **Files**
- `create-bml-users-table.sql` - SQL script chính
- `run-sql-script.bat` - Batch script cho Windows
- `run-sql-script.ps1` - PowerShell script cho Windows

## 🚀 **Cách chạy**

### **Option 1: Sử dụng Batch Script (Windows)**
```cmd
cd scripts
run-sql-script.bat
```

### **Option 2: Sử dụng PowerShell Script**
```powershell
cd scripts
.\run-sql-script.ps1
```

### **Option 3: Chạy thủ công với sqlplus**
```cmd
sqlplus HIS_RS/HIS_RS@192.168.7.248:1521/orclstb @create-bml-users-table.sql
```

### **Option 4: Sử dụng SQL Developer/Toad**
1. Mở SQL Developer hoặc Toad
2. Connect đến database
3. Copy nội dung file `create-bml-users-table.sql`
4. Paste và execute

## 📊 **Table Structure**

### **BML_USERS Table**
```sql
CREATE TABLE BML_USERS (
    ID VARCHAR2(36) NOT NULL,                    -- UUID Primary Key
    USERNAME VARCHAR2(50) NOT NULL,               -- Username (unique)
    EMAIL VARCHAR2(100) NOT NULL,                 -- Email (unique)
    PASSWORD_HASH VARCHAR2(255) NOT NULL,         -- Hashed password
    FIRST_NAME VARCHAR2(50) NOT NULL,             -- First name
    LAST_NAME VARCHAR2(50) NOT NULL,              -- Last name
    PHONE_NUMBER VARCHAR2(20),                    -- Phone number (optional)
    DATE_OF_BIRTH TIMESTAMP,                      -- Date of birth (optional)
    ADDRESS VARCHAR2(2000),                       -- Address (optional)
    IS_ACTIVE NUMBER(1) DEFAULT 1 NOT NULL,       -- Active status
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    DELETED_AT TIMESTAMP,                         -- Soft delete
    CREATED_BY VARCHAR2(50),                     -- Audit field
    UPDATED_BY VARCHAR2(50),                      -- Audit field
    VERSION NUMBER(10) DEFAULT 1 NOT NULL,        -- Version control
);
```

### **Indexes**
- `PK_BML_USERS` - Primary key
- `UK_BML_USERS_USERNAME` - Unique username
- `UK_BML_USERS_EMAIL` - Unique email
- `IDX_BML_USERS_USERNAME` - Index on username
- `IDX_BML_USERS_EMAIL` - Index on email
- `IDX_BML_USERS_IS_ACTIVE` - Index on is_active
- `IDX_BML_USERS_CREATED_AT` - Index on created_at
- `IDX_BML_USERS_DELETED_AT` - Index on deleted_at

### **Triggers**
- `TR_BML_USERS_UPDATE` - Auto update UPDATED_AT and VERSION

## 👥 **Sample Data**
Script sẽ tạo 2 user mẫu:

### **Admin User**
- **Username**: admin
- **Email**: admin@lisgpb.com
- **Password**: admin123 (hashed)

### **Test User**
- **Username**: john_doe
- **Email**: john.doe@example.com
- **Password**: SecurePass123! (hashed)

## 🔧 **Troubleshooting**

### **Lỗi: ORA-00942: table or view does not exist**
- **Nguyên nhân**: Table chưa được tạo
- **Giải pháp**: Chạy script tạo table

### **Lỗi: ORA-00955: name is already used by an existing object**
- **Nguyên nhân**: Table đã tồn tại
- **Giải pháp**: Drop table trước hoặc bỏ qua lỗi

### **Lỗi: ORA-12541: TNS:no listener**
- **Nguyên nhân**: Database không accessible
- **Giải pháp**: Kiểm tra network connection và database service

## ✅ **Verification**
Sau khi chạy script thành công, kiểm tra:

```sql
-- Kiểm tra table đã tạo
SELECT table_name FROM user_tables WHERE table_name = 'BML_USERS';

-- Kiểm tra data
SELECT username, email, first_name, last_name, is_active 
FROM BML_USERS 
ORDER BY created_at;

-- Kiểm tra indexes
SELECT index_name, index_type, uniqueness 
FROM user_indexes 
WHERE table_name = 'BML_USERS';
```

## 🎯 **Next Steps**
Sau khi tạo table thành công:
1. Restart NestJS application
2. Test API endpoints trong Swagger UI
3. Test login với sample users
4. Tạo thêm users mới qua register API
