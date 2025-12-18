-- Migration: 006_create_bml_department_types_table.sql
-- Description: Create BML_DEPARTMENT_TYPES table for department type management
-- Author: LIS GPB Team
-- Date: 2024-01-15

-- Create BML_DEPARTMENT_TYPES table
CREATE TABLE BML_DEPARTMENT_TYPES (
    ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TYPE_CODE VARCHAR(20) NOT NULL UNIQUE,
    TYPE_NAME VARCHAR(100) NOT NULL,
    DESCRIPTION TEXT,
    IS_ACTIVE BOOLEAN DEFAULT TRUE,
    SORT_ORDER INTEGER DEFAULT 0,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DELETED_AT TIMESTAMP NULL,
    CREATED_BY VARCHAR(50),
    UPDATED_BY VARCHAR(50),
    VERSION INTEGER DEFAULT 1
);

-- Create indexes for BML_DEPARTMENT_TYPES
CREATE INDEX IDX_BML_DEPT_TYPES_CODE ON BML_DEPARTMENT_TYPES(TYPE_CODE);
CREATE INDEX IDX_BML_DEPT_TYPES_NAME ON BML_DEPARTMENT_TYPES(TYPE_NAME);
CREATE INDEX IDX_BML_DEPT_TYPES_ACTIVE ON BML_DEPARTMENT_TYPES(IS_ACTIVE);
CREATE INDEX IDX_BML_DEPT_TYPES_SORT ON BML_DEPARTMENT_TYPES(SORT_ORDER);
CREATE INDEX IDX_BML_DEPT_TYPES_CREATED_AT ON BML_DEPARTMENT_TYPES(CREATED_AT);

-- Add comments for table and columns
COMMENT ON TABLE BML_DEPARTMENT_TYPES IS 'Bảng quản lý loại khoa trong hệ thống LIS GPB';
COMMENT ON COLUMN BML_DEPARTMENT_TYPES.ID IS 'ID duy nhất của loại khoa';
COMMENT ON COLUMN BML_DEPARTMENT_TYPES.TYPE_CODE IS 'Mã loại khoa (ví dụ: KHOA, PHONG, TRUNG_TAM)';
COMMENT ON COLUMN BML_DEPARTMENT_TYPES.TYPE_NAME IS 'Tên loại khoa (ví dụ: Khoa, Phòng, Trung tâm)';
COMMENT ON COLUMN BML_DEPARTMENT_TYPES.DESCRIPTION IS 'Mô tả chi tiết về loại khoa';
COMMENT ON COLUMN BML_DEPARTMENT_TYPES.IS_ACTIVE IS 'Trạng thái hoạt động của loại khoa';
COMMENT ON COLUMN BML_DEPARTMENT_TYPES.SORT_ORDER IS 'Thứ tự sắp xếp hiển thị';
COMMENT ON COLUMN BML_DEPARTMENT_TYPES.CREATED_AT IS 'Thời gian tạo bản ghi';
COMMENT ON COLUMN BML_DEPARTMENT_TYPES.UPDATED_AT IS 'Thời gian cập nhật bản ghi';
COMMENT ON COLUMN BML_DEPARTMENT_TYPES.DELETED_AT IS 'Thời gian xóa bản ghi (soft delete)';
COMMENT ON COLUMN BML_DEPARTMENT_TYPES.CREATED_BY IS 'Người tạo bản ghi';
COMMENT ON COLUMN BML_DEPARTMENT_TYPES.UPDATED_BY IS 'Người cập nhật bản ghi';
COMMENT ON COLUMN BML_DEPARTMENT_TYPES.VERSION IS 'Phiên bản bản ghi (optimistic locking)';

-- Insert sample data
INSERT INTO BML_DEPARTMENT_TYPES (TYPE_CODE, TYPE_NAME, DESCRIPTION, SORT_ORDER, IS_ACTIVE) VALUES
('KHOA', 'Khoa', 'Các khoa chuyên môn trong bệnh viện', 1, TRUE),
('PHONG', 'Phòng', 'Các phòng ban chức năng', 2, TRUE),
('TRUNG_TAM', 'Trung tâm', 'Các trung tâm nghiên cứu và điều trị', 3, TRUE),
('BAN', 'Ban', 'Các ban quản lý và điều hành', 4, TRUE),
('PHONG_KHAM', 'Phòng khám', 'Các phòng khám chuyên khoa', 5, TRUE),
('NOI_TRO', 'Nội trú', 'Các khoa nội trú', 6, TRUE),
('NGOAI_TRO', 'Ngoại trú', 'Các khoa ngoại trú', 7, TRUE),
('CAP_CUU', 'Cấp cứu', 'Các khoa cấp cứu', 8, TRUE);

-- Create sequence for sort order (if needed)
-- CREATE SEQUENCE SEQ_BML_DEPT_TYPES_SORT_ORDER START WITH 1 INCREMENT BY 1;

-- Grant permissions (adjust as needed for your environment)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON BML_DEPARTMENT_TYPES TO your_app_user;
-- GRANT USAGE ON SEQUENCE SEQ_BML_DEPT_TYPES_SORT_ORDER TO your_app_user;

-- Verify table creation
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'BML_DEPARTMENT_TYPES'
ORDER BY ordinal_position;
