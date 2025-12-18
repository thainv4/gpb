-- =====================================================
-- Script: Create BML_PROVINCES Table
-- Description: Tạo bảng BML_PROVINCES cho module Province
-- Author: LIS GPB Team
-- Date: 2024-01-15
-- Version: 1.0
-- =====================================================

-- Drop table if exists (for development only)
-- DROP TABLE BML_PROVINCES CASCADE CONSTRAINTS;

-- Create BML_PROVINCES table
CREATE TABLE BML_PROVINCES (
    -- ========== PRIMARY KEY ==========
    ID VARCHAR2(36) NOT NULL,
    
    -- ========== BUSINESS FIELDS ==========
    PROVINCE_CODE VARCHAR2(10) NOT NULL,
    PROVINCE_NAME VARCHAR2(100) NOT NULL,
    SHORT_NAME VARCHAR2(20) NOT NULL,
    SORT_ORDER NUMBER(10) NOT NULL,
    IS_ACTIVE NUMBER(1) DEFAULT 1 NOT NULL,
    
    -- ========== AUDIT FIELDS ==========
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    DELETED_AT TIMESTAMP,
    CREATED_BY VARCHAR2(50),
    UPDATED_BY VARCHAR2(50),
    VERSION NUMBER(10) DEFAULT 1 NOT NULL,
    
    -- ========== CONSTRAINTS ==========
    CONSTRAINT PK_BML_PROVINCES PRIMARY KEY (ID),
    CONSTRAINT UK_BML_PROVINCES_CODE UNIQUE (PROVINCE_CODE),
    CONSTRAINT UK_BML_PROVINCES_NAME UNIQUE (PROVINCE_NAME),
    CONSTRAINT UK_BML_PROVINCES_SHORT_NAME UNIQUE (SHORT_NAME),
    CONSTRAINT CK_BML_PROVINCES_ACTIVE CHECK (IS_ACTIVE IN (0, 1)),
    CONSTRAINT CK_BML_PROVINCES_SORT_ORDER CHECK (SORT_ORDER > 0)
);

-- ========== INDEXES ==========
-- Primary key index (automatically created)
-- CREATE INDEX PK_BML_PROVINCES ON BML_PROVINCES(ID);

-- Unique indexes (automatically created by constraints)
-- CREATE INDEX UK_BML_PROVINCES_CODE ON BML_PROVINCES(PROVINCE_CODE);
-- CREATE INDEX UK_BML_PROVINCES_NAME ON BML_PROVINCES(PROVINCE_NAME);
-- CREATE INDEX UK_BML_PROVINCES_SHORT_NAME ON BML_PROVINCES(SHORT_NAME);

-- Performance indexes
CREATE INDEX IDX_BML_PROVINCES_ACTIVE ON BML_PROVINCES(IS_ACTIVE);
CREATE INDEX IDX_BML_PROVINCES_SORT_ORDER ON BML_PROVINCES(SORT_ORDER);
CREATE INDEX IDX_BML_PROVINCES_CREATED_AT ON BML_PROVINCES(CREATED_AT);
CREATE INDEX IDX_BML_PROVINCES_DELETED_AT ON BML_PROVINCES(DELETED_AT);

-- Composite indexes for common queries
CREATE INDEX IDX_BML_PROVINCES_ACTIVE_SORT ON BML_PROVINCES(IS_ACTIVE, SORT_ORDER);
CREATE INDEX IDX_BML_PROVINCES_ACTIVE_NAME ON BML_PROVINCES(IS_ACTIVE, PROVINCE_NAME);

-- ========== TRIGGERS ==========
-- Trigger for UPDATED_AT and VERSION
CREATE OR REPLACE TRIGGER TR_BML_PROVINCES_UPDATED_AT
BEFORE UPDATE ON BML_PROVINCES
FOR EACH ROW
BEGIN
    :NEW.UPDATED_AT := CURRENT_TIMESTAMP;
    :NEW.VERSION := :OLD.VERSION + 1;
END;
/

-- ========== COMMENTS ==========
COMMENT ON TABLE BML_PROVINCES IS 'Bảng quản lý thông tin các tỉnh thành Việt Nam';
COMMENT ON COLUMN BML_PROVINCES.ID IS 'ID duy nhất của tỉnh (UUID)';
COMMENT ON COLUMN BML_PROVINCES.PROVINCE_CODE IS 'Mã tỉnh (2 chữ số)';
COMMENT ON COLUMN BML_PROVINCES.PROVINCE_NAME IS 'Tên tỉnh thành';
COMMENT ON COLUMN BML_PROVINCES.SHORT_NAME IS 'Tên viết tắt của tỉnh';
COMMENT ON COLUMN BML_PROVINCES.SORT_ORDER IS 'Thứ tự sắp xếp';
COMMENT ON COLUMN BML_PROVINCES.IS_ACTIVE IS 'Trạng thái hoạt động (1: Active, 0: Inactive)';
COMMENT ON COLUMN BML_PROVINCES.CREATED_AT IS 'Ngày tạo';
COMMENT ON COLUMN BML_PROVINCES.UPDATED_AT IS 'Ngày cập nhật cuối';
COMMENT ON COLUMN BML_PROVINCES.DELETED_AT IS 'Ngày xóa mềm';
COMMENT ON COLUMN BML_PROVINCES.CREATED_BY IS 'Người tạo';
COMMENT ON COLUMN BML_PROVINCES.UPDATED_BY IS 'Người cập nhật cuối';
COMMENT ON COLUMN BML_PROVINCES.VERSION IS 'Phiên bản (optimistic locking)';

-- ========== SAMPLE DATA ==========
-- Insert sample data for 63 provinces of Vietnam
INSERT INTO BML_PROVINCES (ID, PROVINCE_CODE, PROVINCE_NAME, SHORT_NAME, SORT_ORDER, IS_ACTIVE, CREATED_BY, UPDATED_BY) VALUES
('550e8400-e29b-41d4-a716-446655440001', '01', 'Hà Nội', 'HN', 1, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440002', '02', 'Hà Giang', 'HG', 2, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440003', '03', 'Cao Bằng', 'CB', 3, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440004', '04', 'Bắc Kạn', 'BK', 4, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440005', '05', 'Tuyên Quang', 'TQ', 5, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440006', '06', 'Lào Cai', 'LC', 6, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440007', '07', 'Điện Biên', 'ĐB', 7, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440008', '08', 'Lai Châu', 'LCh', 8, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440009', '09', 'Sơn La', 'SL', 9, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440010', '10', 'Yên Bái', 'YB', 10, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440011', '11', 'Hoà Bình', 'HB', 11, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440012', '12', 'Thái Nguyên', 'TN', 12, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440013', '13', 'Lạng Sơn', 'LS', 13, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440014', '14', 'Quảng Ninh', 'QN', 14, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440015', '15', 'Bắc Giang', 'BG', 15, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440016', '16', 'Phú Thọ', 'PT', 16, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440017', '17', 'Vĩnh Phúc', 'VP', 17, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440018', '18', 'Bắc Ninh', 'BN', 18, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440019', '19', 'Hải Dương', 'HD', 19, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440020', '20', 'Hải Phòng', 'HP', 20, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440021', '21', 'Hưng Yên', 'HY', 21, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440022', '22', 'Thái Bình', 'TB', 22, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440023', '23', 'Hà Nam', 'HNa', 23, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440024', '24', 'Nam Định', 'ND', 24, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440025', '25', 'Ninh Bình', 'NB', 25, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440026', '26', 'Thanh Hóa', 'TH', 26, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440027', '27', 'Nghệ An', 'NA', 27, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440028', '28', 'Hà Tĩnh', 'HT', 28, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440029', '29', 'Quảng Bình', 'QB', 29, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440030', '30', 'Quảng Trị', 'QT', 30, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440031', '31', 'Thừa Thiên Huế', 'TTH', 31, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440032', '32', 'Đà Nẵng', 'ĐN', 32, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440033', '33', 'Quảng Nam', 'QNa', 33, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440034', '34', 'Quảng Ngãi', 'QNg', 34, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440035', '35', 'Bình Định', 'BĐ', 35, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440036', '36', 'Phú Yên', 'PY', 36, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440037', '37', 'Khánh Hòa', 'KH', 37, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440038', '38', 'Ninh Thuận', 'NT', 38, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440039', '39', 'Bình Thuận', 'BT', 39, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440040', '40', 'Kon Tum', 'KT', 40, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440041', '41', 'Gia Lai', 'GL', 41, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440042', '42', 'Đắk Lắk', 'ĐL', 42, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440043', '43', 'Đắk Nông', 'ĐN', 43, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440044', '44', 'Lâm Đồng', 'LĐ', 44, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440045', '45', 'Bình Phước', 'BP', 45, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440046', '46', 'Tây Ninh', 'TN', 46, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440047', '47', 'Bình Dương', 'BD', 47, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440048', '48', 'Đồng Nai', 'ĐN', 48, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440049', '49', 'Bà Rịa - Vũng Tàu', 'BR-VT', 49, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440050', '50', 'TP. Hồ Chí Minh', 'HCM', 50, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440051', '51', 'Long An', 'LA', 51, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440052', '52', 'Tiền Giang', 'TG', 52, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440053', '53', 'Bến Tre', 'BT', 53, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440054', '54', 'Trà Vinh', 'TV', 54, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440055', '55', 'Vĩnh Long', 'VL', 55, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440056', '56', 'Đồng Tháp', 'ĐT', 56, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440057', '57', 'An Giang', 'AG', 57, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440058', '58', 'Kiên Giang', 'KG', 58, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440059', '59', 'Cà Mau', 'CM', 59, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440060', '60', 'Bạc Liêu', 'BL', 60, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440061', '61', 'Sóc Trăng', 'ST', 61, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440062', '62', 'Hậu Giang', 'HG', 62, 1, 'system', 'system'),
('550e8400-e29b-41d4-a716-446655440063', '63', 'Cần Thơ', 'CT', 63, 1, 'system', 'system');

-- Commit transaction
COMMIT;

-- ========== VERIFICATION ==========
-- Verify table creation
SELECT 'BML_PROVINCES table created successfully' AS STATUS FROM DUAL;

-- Verify data insertion
SELECT COUNT(*) AS TOTAL_PROVINCES FROM BML_PROVINCES;

-- Verify sample data
SELECT PROVINCE_CODE, PROVINCE_NAME, SHORT_NAME, SORT_ORDER, IS_ACTIVE 
FROM BML_PROVINCES 
ORDER BY SORT_ORDER 
FETCH FIRST 10 ROWS ONLY;

-- ========== END OF SCRIPT ==========
