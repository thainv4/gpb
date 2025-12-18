-- =====================================================
-- LIS GPB - FIX UUID GENERATION SCRIPT
-- =====================================================
-- Description: Sửa lại script để sử dụng UUID generation thay vì hard-code ID
-- Author: System
-- Date: 2024-01-15
-- Version: 1.0

-- =====================================================
-- CREATE UUID GENERATION FUNCTION
-- =====================================================

-- Function to generate UUID (Oracle 12c+)
CREATE OR REPLACE FUNCTION GENERATE_UUID RETURN VARCHAR2 IS
BEGIN
    RETURN LOWER(REGEXP_REPLACE(RAWTOHEX(SYS_GUID()), '([A-F0-9]{8})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{12})', '\1-\2-\3-\4-\5'));
END;
/

-- =====================================================
-- UPDATE ADMIN USER SCRIPT WITH UUID
-- =====================================================

-- Drop existing admin user if exists
DELETE FROM BML_USERS WHERE USERNAME = 'admin';

-- Insert admin user with generated UUID
INSERT INTO BML_USERS (
    ID,
    USERNAME,
    EMAIL,
    PASSWORD_HASH,
    FULL_NAME,
    IS_ACTIVE,
    PHONE_NUMBER,
    ADDRESS,
    CREATED_AT,
    UPDATED_AT,
    CREATED_BY,
    UPDATED_BY,
    VERSION
) VALUES (
    GENERATE_UUID(),  -- ID (Auto-generated UUID)
    'admin',          -- USERNAME
    'admin@lisgpb.com',  -- EMAIL
    '$2b$12$2ddGx6vkDhWljmdQxxBYxeF1PT8U0QPdoGgXh.2dL1NJfp.5oi16.',  -- PASSWORD_HASH (Admin123!)
    'Administrator',  -- FULL_NAME
    1,  -- IS_ACTIVE
    '0123456789',  -- PHONE_NUMBER
    'Hệ thống LIS GPB',  -- ADDRESS
    CURRENT_TIMESTAMP,  -- CREATED_AT
    CURRENT_TIMESTAMP,  -- UPDATED_AT
    'system',  -- CREATED_BY
    'system',  -- UPDATED_BY
    1  -- VERSION
);

-- =====================================================
-- UPDATE SAMPLE DATA WITH UUID
-- =====================================================

-- Clear existing sample data
DELETE FROM BML_ROOMS;
DELETE FROM BML_DEPARTMENTS;
DELETE FROM BML_DEPARTMENT_TYPES;
DELETE FROM BML_ROOM_GROUPS;
DELETE FROM BML_BRANCHES;
DELETE FROM BML_WARDS;
DELETE FROM BML_PROVINCES;

-- Sample Provinces with UUID
INSERT INTO BML_PROVINCES (ID, PROVINCE_CODE, PROVINCE_NAME, SHORT_NAME, SORT_ORDER, IS_ACTIVE, CREATED_AT, UPDATED_AT, CREATED_BY, UPDATED_BY, VERSION) VALUES
(GENERATE_UUID(), '01', 'Hà Nội', 'HN', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1),
(GENERATE_UUID(), '79', 'TP. Hồ Chí Minh', 'HCM', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1),
(GENERATE_UUID(), '31', 'Hải Phòng', 'HP', 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1);

-- Sample Wards with UUID (using province IDs from above)
INSERT INTO BML_WARDS (ID, WARD_CODE, WARD_NAME, PROVINCE_ID, SHORT_NAME, SORT_ORDER, IS_ACTIVE, CREATED_AT, UPDATED_AT, CREATED_BY, UPDATED_BY, VERSION) 
SELECT 
    GENERATE_UUID(),
    '01001',
    'Phường Phúc Xá',
    p.ID,
    'PX',
    1,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'admin',
    'admin',
    1
FROM BML_PROVINCES p WHERE p.PROVINCE_CODE = '01'
UNION ALL
SELECT 
    GENERATE_UUID(),
    '01002',
    'Phường Trúc Bạch',
    p.ID,
    'TB',
    2,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'admin',
    'admin',
    1
FROM BML_PROVINCES p WHERE p.PROVINCE_CODE = '01'
UNION ALL
SELECT 
    GENERATE_UUID(),
    '79001',
    'Phường Bến Nghé',
    p.ID,
    'BN',
    1,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'admin',
    'admin',
    1
FROM BML_PROVINCES p WHERE p.PROVINCE_CODE = '79';

-- Sample Branches with UUID
INSERT INTO BML_BRANCHES (ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, IS_ACTIVE, CREATED_AT, UPDATED_AT, CREATED_BY, UPDATED_BY, VERSION)
SELECT 
    GENERATE_UUID(),
    'HN001',
    'Bệnh viện Hà Nội',
    'BV HN',
    p.ID,
    w.ID,
    '123 Đường ABC, Phường Phúc Xá, Hà Nội',
    '0241234567',
    'Tuyến 1',
    'Nguyễn Văn A',
    '1234567890',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'admin',
    'admin',
    1
FROM BML_PROVINCES p, BML_WARDS w 
WHERE p.PROVINCE_CODE = '01' AND w.WARD_CODE = '01001'
UNION ALL
SELECT 
    GENERATE_UUID(),
    'HCM001',
    'Bệnh viện TP.HCM',
    'BV HCM',
    p.ID,
    w.ID,
    '456 Đường XYZ, Phường Bến Nghé, TP.HCM',
    '0281234567',
    'Tuyến 1',
    'Trần Thị B',
    '0987654321',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'admin',
    'admin',
    1
FROM BML_PROVINCES p, BML_WARDS w 
WHERE p.PROVINCE_CODE = '79' AND w.WARD_CODE = '79001';

-- Sample Department Types with UUID
INSERT INTO BML_DEPARTMENT_TYPES (ID, TYPE_CODE, TYPE_NAME, DESCRIPTION, IS_ACTIVE, SORT_ORDER, CREATED_AT, UPDATED_AT, CREATED_BY, UPDATED_BY, VERSION) VALUES
(GENERATE_UUID(), 'CLINICAL', 'Khoa Lâm sàng', 'Các khoa khám và điều trị bệnh nhân', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1),
(GENERATE_UUID(), 'SUPPORT', 'Khoa Hỗ trợ', 'Các khoa hỗ trợ kỹ thuật và dịch vụ', 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1),
(GENERATE_UUID(), 'ADMIN', 'Khoa Hành chính', 'Các khoa hành chính và quản lý', 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1);

-- Sample Departments with UUID
INSERT INTO BML_DEPARTMENTS (ID, DEPARTMENT_CODE, DEPARTMENT_NAME, BRANCH_ID, HEAD_OF_DEPARTMENT, HEAD_NURSE, SHORT_NAME, DEPARTMENT_TYPE_ID, IS_ACTIVE, SORT_ORDER, CREATED_AT, UPDATED_AT, CREATED_BY, UPDATED_BY, VERSION)
SELECT 
    GENERATE_UUID(),
    'KTM',
    'Khoa Tim Mạch',
    b.ID,
    'BS. Nguyễn Văn C',
    'ĐD. Trần Thị D',
    'KTM',
    dt.ID,
    1,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'admin',
    'admin',
    1
FROM BML_BRANCHES b, BML_DEPARTMENT_TYPES dt 
WHERE b.BRANCH_CODE = 'HN001' AND dt.TYPE_CODE = 'CLINICAL'
UNION ALL
SELECT 
    GENERATE_UUID(),
    'KNT',
    'Khoa Nội Tổng Hợp',
    b.ID,
    'BS. Lê Văn E',
    'ĐD. Phạm Thị F',
    'KNT',
    dt.ID,
    1,
    2,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'admin',
    'admin',
    1
FROM BML_BRANCHES b, BML_DEPARTMENT_TYPES dt 
WHERE b.BRANCH_CODE = 'HN001' AND dt.TYPE_CODE = 'CLINICAL'
UNION ALL
SELECT 
    GENERATE_UUID(),
    'KXN',
    'Khoa Xét Nghiệm',
    b.ID,
    'BS. Hoàng Văn G',
    NULL,
    'KXN',
    dt.ID,
    1,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'admin',
    'admin',
    1
FROM BML_BRANCHES b, BML_DEPARTMENT_TYPES dt 
WHERE b.BRANCH_CODE = 'HN001' AND dt.TYPE_CODE = 'SUPPORT';

-- Sample Room Groups with UUID
INSERT INTO BML_ROOM_GROUPS (ID, ROOM_GROUP_CODE, ROOM_GROUP_NAME, IS_ACTIVE, SORT_ORDER, CREATED_AT, UPDATED_AT, CREATED_BY, UPDATED_BY, VERSION) VALUES
(GENERATE_UUID(), 'KHAM', 'Nhóm Phòng Khám', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1),
(GENERATE_UUID(), 'DIEUTRI', 'Nhóm Phòng Điều Trị', 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1),
(GENERATE_UUID(), 'XETNGHIEM', 'Nhóm Phòng Xét Nghiệm', 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1);

-- Sample Rooms with UUID
INSERT INTO BML_ROOMS (ID, ROOM_CODE, ROOM_NAME, ROOM_ADDRESS, DEPARTMENT_ID, ROOM_GROUP_ID, DESCRIPTION, IS_ACTIVE, SORT_ORDER, CREATED_AT, UPDATED_AT, CREATED_BY, UPDATED_BY, VERSION)
SELECT 
    GENERATE_UUID(),
    'P001',
    'Phòng 101',
    'Tầng 1, Khu A',
    d.ID,
    rg.ID,
    'Phòng khám tim mạch',
    1,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'admin',
    'admin',
    1
FROM BML_DEPARTMENTS d, BML_ROOM_GROUPS rg 
WHERE d.DEPARTMENT_CODE = 'KTM' AND rg.ROOM_GROUP_CODE = 'KHAM'
UNION ALL
SELECT 
    GENERATE_UUID(),
    'P002',
    'Phòng 102',
    'Tầng 1, Khu A',
    d.ID,
    rg.ID,
    'Phòng khám tim mạch',
    1,
    2,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'admin',
    'admin',
    1
FROM BML_DEPARTMENTS d, BML_ROOM_GROUPS rg 
WHERE d.DEPARTMENT_CODE = 'KTM' AND rg.ROOM_GROUP_CODE = 'KHAM'
UNION ALL
SELECT 
    GENERATE_UUID(),
    'P003',
    'Phòng 201',
    'Tầng 2, Khu B',
    d.ID,
    rg.ID,
    'Phòng điều trị nội trú',
    1,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'admin',
    'admin',
    1
FROM BML_DEPARTMENTS d, BML_ROOM_GROUPS rg 
WHERE d.DEPARTMENT_CODE = 'KNT' AND rg.ROOM_GROUP_CODE = 'DIEUTRI'
UNION ALL
SELECT 
    GENERATE_UUID(),
    'P004',
    'Phòng 301',
    'Tầng 3, Khu C',
    d.ID,
    rg.ID,
    'Phòng xét nghiệm máu',
    1,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'admin',
    'admin',
    1
FROM BML_DEPARTMENTS d, BML_ROOM_GROUPS rg 
WHERE d.DEPARTMENT_CODE = 'KXN' AND rg.ROOM_GROUP_CODE = 'XETNGHIEM';

-- =====================================================
-- VERIFY UUID GENERATION
-- =====================================================

-- Check that all IDs are UUIDs
SELECT 'UUID Format Check' as CHECK_TYPE,
       CASE 
           WHEN REGEXP_LIKE(ID, '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') 
           THEN 'VALID UUID' 
           ELSE 'INVALID UUID' 
       END as RESULT
FROM BML_USERS 
WHERE USERNAME = 'admin';

-- Check sample data with UUIDs
SELECT 'Sample Data with UUIDs' as CHECK_TYPE, 
       (SELECT COUNT(*) FROM BML_PROVINCES) as PROVINCES,
       (SELECT COUNT(*) FROM BML_WARDS) as WARDS,
       (SELECT COUNT(*) FROM BML_BRANCHES) as BRANCHES,
       (SELECT COUNT(*) FROM BML_DEPARTMENT_TYPES) as DEPT_TYPES,
       (SELECT COUNT(*) FROM BML_DEPARTMENTS) as DEPARTMENTS,
       (SELECT COUNT(*) FROM BML_ROOM_GROUPS) as ROOM_GROUPS,
       (SELECT COUNT(*) FROM BML_ROOMS) as ROOMS
FROM DUAL;

-- Show sample UUIDs
SELECT 'Sample UUIDs' as INFO, ID, USERNAME, FULL_NAME 
FROM BML_USERS 
WHERE USERNAME = 'admin';

COMMIT;

PROMPT 'UUID generation fixed successfully!'
