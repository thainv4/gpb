-- =====================================================
-- LIS GPB - CREATE ADMIN USER SCRIPT
-- =====================================================
-- Description: Tạo user admin với username 'admin' và password 'Admin123!'
-- Author: System
-- Date: 2024-01-15
-- Version: 1.0

-- =====================================================
-- CREATE ADMIN USER
-- =====================================================

-- Password: Admin123!
-- Hash được tạo bằng bcrypt với salt rounds = 12
-- Hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5J5K5K5K5K
-- (Đây là hash mẫu, trong thực tế cần hash password thật)

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
    'admin-001',  -- ID
    'admin',      -- USERNAME
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
-- CREATE SAMPLE DATA
-- =====================================================

-- Sample Provinces
INSERT INTO BML_PROVINCES (ID, PROVINCE_CODE, PROVINCE_NAME, SHORT_NAME, SORT_ORDER, IS_ACTIVE, CREATED_AT, UPDATED_AT, CREATED_BY, UPDATED_BY, VERSION) VALUES
('province-001', '01', 'Hà Nội', 'HN', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1),
('province-002', '79', 'TP. Hồ Chí Minh', 'HCM', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1),
('province-003', '31', 'Hải Phòng', 'HP', 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1);

-- Sample Wards
INSERT INTO BML_WARDS (ID, WARD_CODE, WARD_NAME, PROVINCE_ID, SHORT_NAME, SORT_ORDER, IS_ACTIVE, CREATED_AT, UPDATED_AT, CREATED_BY, UPDATED_BY, VERSION) VALUES
('ward-001', '01001', 'Phường Phúc Xá', 'province-001', 'PX', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1),
('ward-002', '01002', 'Phường Trúc Bạch', 'province-001', 'TB', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1),
('ward-003', '79001', 'Phường Bến Nghé', 'province-002', 'BN', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1);

-- Sample Branches
INSERT INTO BML_BRANCHES (ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, IS_ACTIVE, CREATED_AT, UPDATED_AT, CREATED_BY, UPDATED_BY, VERSION) VALUES
('branch-001', 'HN001', 'Bệnh viện Hà Nội', 'BV HN', 'province-001', 'ward-001', '123 Đường ABC, Phường Phúc Xá, Hà Nội', '0241234567', 'Tuyến 1', 'Nguyễn Văn A', '1234567890', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1),
('branch-002', 'HCM001', 'Bệnh viện TP.HCM', 'BV HCM', 'province-002', 'ward-003', '456 Đường XYZ, Phường Bến Nghé, TP.HCM', '0281234567', 'Tuyến 1', 'Trần Thị B', '0987654321', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1);

-- Sample Department Types
INSERT INTO BML_DEPARTMENT_TYPES (ID, TYPE_CODE, TYPE_NAME, DESCRIPTION, IS_ACTIVE, SORT_ORDER, CREATED_AT, UPDATED_AT, CREATED_BY, UPDATED_BY, VERSION) VALUES
('dept-type-001', 'CLINICAL', 'Khoa Lâm sàng', 'Các khoa khám và điều trị bệnh nhân', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1),
('dept-type-002', 'SUPPORT', 'Khoa Hỗ trợ', 'Các khoa hỗ trợ kỹ thuật và dịch vụ', 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1),
('dept-type-003', 'ADMIN', 'Khoa Hành chính', 'Các khoa hành chính và quản lý', 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1);

-- Sample Departments
INSERT INTO BML_DEPARTMENTS (ID, DEPARTMENT_CODE, DEPARTMENT_NAME, BRANCH_ID, HEAD_OF_DEPARTMENT, HEAD_NURSE, SHORT_NAME, DEPARTMENT_TYPE_ID, IS_ACTIVE, SORT_ORDER, CREATED_AT, UPDATED_AT, CREATED_BY, UPDATED_BY, VERSION) VALUES
('dept-001', 'KTM', 'Khoa Tim Mạch', 'branch-001', 'BS. Nguyễn Văn C', 'ĐD. Trần Thị D', 'KTM', 'dept-type-001', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1),
('dept-002', 'KNT', 'Khoa Nội Tổng Hợp', 'branch-001', 'BS. Lê Văn E', 'ĐD. Phạm Thị F', 'KNT', 'dept-type-001', 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1),
('dept-003', 'KXN', 'Khoa Xét Nghiệm', 'branch-001', 'BS. Hoàng Văn G', NULL, 'KXN', 'dept-type-002', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1);

-- Sample Room Groups
INSERT INTO BML_ROOM_GROUPS (ID, ROOM_GROUP_CODE, ROOM_GROUP_NAME, IS_ACTIVE, SORT_ORDER, CREATED_AT, UPDATED_AT, CREATED_BY, UPDATED_BY, VERSION) VALUES
('room-group-001', 'KHAM', 'Nhóm Phòng Khám', 'Nhóm các phòng khám bệnh', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1),
('room-group-002', 'DIEUTRI', 'Nhóm Phòng Điều Trị', 'Nhóm các phòng điều trị nội trú', 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1),
('room-group-003', 'XETNGHIEM', 'Nhóm Phòng Xét Nghiệm', 'Nhóm các phòng xét nghiệm', 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1);

-- Sample Rooms
INSERT INTO BML_ROOMS (ID, ROOM_CODE, ROOM_NAME, ROOM_ADDRESS, DEPARTMENT_ID, ROOM_GROUP_ID, DESCRIPTION, IS_ACTIVE, SORT_ORDER, CREATED_AT, UPDATED_AT, CREATED_BY, UPDATED_BY, VERSION) VALUES
('room-001', 'P001', 'Phòng 101', 'Tầng 1, Khu A', 'dept-001', 'room-group-001', 'Phòng khám tim mạch', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1),
('room-002', 'P002', 'Phòng 102', 'Tầng 1, Khu A', 'dept-001', 'room-group-001', 'Phòng khám tim mạch', 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1),
('room-003', 'P003', 'Phòng 201', 'Tầng 2, Khu B', 'dept-002', 'room-group-002', 'Phòng điều trị nội trú', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1),
('room-004', 'P004', 'Phòng 301', 'Tầng 3, Khu C', 'dept-003', 'room-group-003', 'Phòng xét nghiệm máu', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin', 'admin', 1);

-- =====================================================
-- VERIFY DATA
-- =====================================================

-- Verify admin user
SELECT 'Admin User' as INFO, USERNAME, EMAIL, FULL_NAME, IS_ACTIVE, CREATED_AT 
FROM BML_USERS 
WHERE USERNAME = 'admin';

-- Verify sample data counts
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

-- =====================================================
-- LOG COMPLETION
-- =====================================================

-- Log completion
INSERT INTO MIGRATION_LOG (MIGRATION_NAME, EXECUTED_AT, STATUS, DESCRIPTION) 
VALUES ('001_create_admin_user', CURRENT_TIMESTAMP, 'SUCCESS', 'Created admin user and sample data for LIS GPB system');

COMMIT;
