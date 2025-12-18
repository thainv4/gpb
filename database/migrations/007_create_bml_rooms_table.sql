-- Migration: 007_create_bml_rooms_table.sql
-- Description: Create BML_ROOMS table for Room management
-- Author: System
-- Date: 2024-01-15

-- =====================================================
-- CREATE BML_ROOMS TABLE
-- =====================================================

CREATE TABLE BML_ROOMS (
    -- Primary Key
    ID VARCHAR2(36) PRIMARY KEY,
    
    -- Business Fields
    ROOM_CODE VARCHAR2(20) NOT NULL UNIQUE,
    ROOM_NAME VARCHAR2(100) NOT NULL,
    ROOM_ADDRESS VARCHAR2(200),
    DEPARTMENT_ID VARCHAR2(36) NOT NULL,
    ROOM_GROUP_ID VARCHAR2(36) NOT NULL,
    DESCRIPTION CLOB,
    IS_ACTIVE NUMBER(1) DEFAULT 1,
    SORT_ORDER NUMBER DEFAULT 0,
    
    -- Audit Fields (BaseEntity)
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DELETED_AT TIMESTAMP NULL,
    CREATED_BY VARCHAR2(50),
    UPDATED_BY VARCHAR2(50),
    VERSION NUMBER DEFAULT 1,
    
    -- Foreign Key Constraints
    CONSTRAINT FK_BML_ROOMS_DEPT 
        FOREIGN KEY (DEPARTMENT_ID) 
        REFERENCES BML_DEPARTMENTS(ID),
    CONSTRAINT FK_BML_ROOMS_GROUP 
        FOREIGN KEY (ROOM_GROUP_ID) 
        REFERENCES BML_ROOM_GROUPS(ID)
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================

-- Business Indexes
CREATE INDEX IDX_BML_ROOMS_CODE ON BML_ROOMS(ROOM_CODE);
CREATE INDEX IDX_BML_ROOMS_NAME ON BML_ROOMS(ROOM_NAME);
CREATE INDEX IDX_BML_ROOMS_DEPT ON BML_ROOMS(DEPARTMENT_ID);
CREATE INDEX IDX_BML_ROOMS_GROUP ON BML_ROOMS(ROOM_GROUP_ID);
CREATE INDEX IDX_BML_ROOMS_ACTIVE ON BML_ROOMS(IS_ACTIVE);
CREATE INDEX IDX_BML_ROOMS_SORT ON BML_ROOMS(SORT_ORDER);

-- Audit Indexes
CREATE INDEX IDX_BML_ROOMS_CREATED_AT ON BML_ROOMS(CREATED_AT);
CREATE INDEX IDX_BML_ROOMS_UPDATED_AT ON BML_ROOMS(UPDATED_AT);
CREATE INDEX IDX_BML_ROOMS_DELETED_AT ON BML_ROOMS(DELETED_AT);
CREATE INDEX IDX_BML_ROOMS_CREATED_BY ON BML_ROOMS(CREATED_BY);
CREATE INDEX IDX_BML_ROOMS_UPDATED_BY ON BML_ROOMS(UPDATED_BY);

-- Composite Indexes
CREATE INDEX IDX_BML_ROOMS_DEPT_ACTIVE ON BML_ROOMS(DEPARTMENT_ID, IS_ACTIVE);
CREATE INDEX IDX_BML_ROOMS_GROUP_ACTIVE ON BML_ROOMS(ROOM_GROUP_ID, IS_ACTIVE);
CREATE INDEX IDX_BML_ROOMS_ACTIVE_SORT ON BML_ROOMS(IS_ACTIVE, SORT_ORDER);

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Update trigger for UPDATED_AT
CREATE OR REPLACE TRIGGER TR_BML_ROOMS_UPDATE
    BEFORE UPDATE ON BML_ROOMS
    FOR EACH ROW
BEGIN
    :NEW.UPDATED_AT := CURRENT_TIMESTAMP;
    :NEW.VERSION := :OLD.VERSION + 1;
END;
/

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Sample Room data
INSERT INTO BML_ROOMS (ID, ROOM_CODE, ROOM_NAME, ROOM_ADDRESS, DEPARTMENT_ID, ROOM_GROUP_ID, DESCRIPTION, IS_ACTIVE, SORT_ORDER, CREATED_BY, UPDATED_BY) VALUES
('room-001', 'P001', 'Phòng 101', 'Tầng 1, Khu A', 'dept-001', 'group-001', 'Phòng khám nội tổng hợp', 1, 1, 'system', 'system'),
('room-002', 'P002', 'Phòng 102', 'Tầng 1, Khu A', 'dept-001', 'group-001', 'Phòng khám tim mạch', 1, 2, 'system', 'system'),
('room-003', 'P003', 'Phòng 201', 'Tầng 2, Khu B', 'dept-002', 'group-002', 'Phòng phẫu thuật', 1, 1, 'system', 'system'),
('room-004', 'P004', 'Phòng 202', 'Tầng 2, Khu B', 'dept-002', 'group-002', 'Phòng hồi sức', 1, 2, 'system', 'system'),
('room-005', 'P005', 'Phòng 301', 'Tầng 3, Khu C', 'dept-003', 'group-003', 'Phòng xét nghiệm', 1, 1, 'system', 'system');

-- =====================================================
-- CREATE COMMENTS
-- =====================================================

COMMENT ON TABLE BML_ROOMS IS 'Bảng quản lý phòng trong hệ thống LIS GPB';
COMMENT ON COLUMN BML_ROOMS.ID IS 'ID duy nhất của phòng';
COMMENT ON COLUMN BML_ROOMS.ROOM_CODE IS 'Mã phòng (duy nhất)';
COMMENT ON COLUMN BML_ROOMS.ROOM_NAME IS 'Tên phòng';
COMMENT ON COLUMN BML_ROOMS.ROOM_ADDRESS IS 'Địa chỉ phòng';
COMMENT ON COLUMN BML_ROOMS.DEPARTMENT_ID IS 'ID khoa (Foreign Key)';
COMMENT ON COLUMN BML_ROOMS.ROOM_GROUP_ID IS 'ID nhóm phòng (Foreign Key)';
COMMENT ON COLUMN BML_ROOMS.DESCRIPTION IS 'Mô tả phòng';
COMMENT ON COLUMN BML_ROOMS.IS_ACTIVE IS 'Trạng thái hoạt động (1: Hoạt động, 0: Không hoạt động)';
COMMENT ON COLUMN BML_ROOMS.SORT_ORDER IS 'Thứ tự sắp xếp';
COMMENT ON COLUMN BML_ROOMS.CREATED_AT IS 'Ngày tạo';
COMMENT ON COLUMN BML_ROOMS.UPDATED_AT IS 'Ngày cập nhật';
COMMENT ON COLUMN BML_ROOMS.DELETED_AT IS 'Ngày xóa mềm';
COMMENT ON COLUMN BML_ROOMS.CREATED_BY IS 'Người tạo';
COMMENT ON COLUMN BML_ROOMS.UPDATED_BY IS 'Người cập nhật';
COMMENT ON COLUMN BML_ROOMS.VERSION IS 'Phiên bản (Optimistic Locking)';

-- =====================================================
-- VERIFY CREATION
-- =====================================================

-- Verify table creation
SELECT COUNT(*) as ROOM_COUNT FROM BML_ROOMS;

-- Verify indexes
SELECT INDEX_NAME, INDEX_TYPE, STATUS 
FROM USER_INDEXES 
WHERE TABLE_NAME = 'BML_ROOMS'
ORDER BY INDEX_NAME;

-- Verify constraints
SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE, STATUS 
FROM USER_CONSTRAINTS 
WHERE TABLE_NAME = 'BML_ROOMS'
ORDER BY CONSTRAINT_NAME;

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================

-- Log completion
INSERT INTO MIGRATION_LOG (MIGRATION_NAME, EXECUTED_AT, STATUS, DESCRIPTION) 
VALUES ('007_create_bml_rooms_table', CURRENT_TIMESTAMP, 'SUCCESS', 'Created BML_ROOMS table with indexes, triggers, and sample data');

COMMIT;
