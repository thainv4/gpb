-- ============================================================================================================
-- CREATE BML_BRANCHES TABLE
-- ============================================================================================================
-- Tạo bảng BML_BRANCHES để lưu trữ thông tin chi nhánh
-- Bảng này có quan hệ với BML_PROVINCES và BML_WARDS

-- Drop table if exists (for development only)
-- DROP TABLE BML_BRANCHES CASCADE CONSTRAINTS;

-- Create BML_BRANCHES table
CREATE TABLE BML_BRANCHES (
    -- ========== PRIMARY KEY ==========
    ID VARCHAR2(36) NOT NULL,
    
    -- ========== BUSINESS FIELDS ==========
    BRANCH_CODE VARCHAR2(20) NOT NULL,
    BRANCH_NAME VARCHAR2(200) NOT NULL,
    SHORT_NAME VARCHAR2(50) NOT NULL,
    PROVINCE_ID VARCHAR2(36) NOT NULL,
    WARD_ID VARCHAR2(36) NOT NULL,
    ADDRESS VARCHAR2(500) NOT NULL,
    PHONE_NUMBER VARCHAR2(20) NOT NULL,
    HOSPITAL_LEVEL VARCHAR2(50) NOT NULL,
    REPRESENTATIVE VARCHAR2(100) NOT NULL,
    BHYT_CODE VARCHAR2(20) NOT NULL,
    IS_ACTIVE NUMBER(1) DEFAULT 1 NOT NULL,
    
    -- ========== AUDIT FIELDS ==========
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    DELETED_AT TIMESTAMP,
    CREATED_BY VARCHAR2(50),
    UPDATED_BY VARCHAR2(50),
    VERSION NUMBER(10) DEFAULT 1 NOT NULL,
    
    -- ========== CONSTRAINTS ==========
    CONSTRAINT PK_BML_BRANCHES PRIMARY KEY (ID),
    CONSTRAINT UK_BML_BRANCHES_CODE UNIQUE (BRANCH_CODE),
    CONSTRAINT FK_BML_BRANCHES_PROVINCE FOREIGN KEY (PROVINCE_ID) REFERENCES BML_PROVINCES(ID),
    CONSTRAINT FK_BML_BRANCHES_WARD FOREIGN KEY (WARD_ID) REFERENCES BML_WARDS(ID),
    CONSTRAINT CK_BML_BRANCHES_ACTIVE CHECK (IS_ACTIVE IN (0, 1)),
    CONSTRAINT CK_BML_BRANCHES_LEVEL CHECK (HOSPITAL_LEVEL IN ('Tuyến 1', 'Tuyến 2', 'Tuyến 3', 'Tuyến 4'))
);

-- ============================================================================================================
-- CREATE INDEXES
-- ============================================================================================================

-- Indexes for BML_BRANCHES
CREATE INDEX IDX_BML_BRANCHES_CODE ON BML_BRANCHES(BRANCH_CODE);
CREATE INDEX IDX_BML_BRANCHES_NAME ON BML_BRANCHES(BRANCH_NAME);
CREATE INDEX IDX_BML_BRANCHES_SHORT_NAME ON BML_BRANCHES(SHORT_NAME);
CREATE INDEX IDX_BML_BRANCHES_PROVINCE_ID ON BML_BRANCHES(PROVINCE_ID);
CREATE INDEX IDX_BML_BRANCHES_WARD_ID ON BML_BRANCHES(WARD_ID);
CREATE INDEX IDX_BML_BRANCHES_IS_ACTIVE ON BML_BRANCHES(IS_ACTIVE);
CREATE INDEX IDX_BML_BRANCHES_HOSPITAL_LEVEL ON BML_BRANCHES(HOSPITAL_LEVEL);
CREATE INDEX IDX_BML_BRANCHES_PHONE_NUMBER ON BML_BRANCHES(PHONE_NUMBER);
CREATE INDEX IDX_BML_BRANCHES_BHYT_CODE ON BML_BRANCHES(BHYT_CODE);
CREATE INDEX IDX_BML_BRANCHES_REPRESENTATIVE ON BML_BRANCHES(REPRESENTATIVE);
CREATE INDEX IDX_BML_BRANCHES_CREATED_AT ON BML_BRANCHES(CREATED_AT);
CREATE INDEX IDX_BML_BRANCHES_DELETED_AT ON BML_BRANCHES(DELETED_AT);

-- Composite indexes for common queries
CREATE INDEX IDX_BML_BRANCHES_PROVINCE_ACTIVE ON BML_BRANCHES(PROVINCE_ID, IS_ACTIVE);
CREATE INDEX IDX_BML_BRANCHES_WARD_ACTIVE ON BML_BRANCHES(WARD_ID, IS_ACTIVE);
CREATE INDEX IDX_BML_BRANCHES_LEVEL_ACTIVE ON BML_BRANCHES(HOSPITAL_LEVEL, IS_ACTIVE);
CREATE INDEX IDX_BML_BRANCHES_PROVINCE_WARD ON BML_BRANCHES(PROVINCE_ID, WARD_ID);

-- ============================================================================================================
-- CREATE TRIGGERS
-- ============================================================================================================

-- Trigger for UPDATED_AT and VERSION
CREATE OR REPLACE TRIGGER TR_BML_BRANCHES_UPDATED_AT
BEFORE UPDATE ON BML_BRANCHES
FOR EACH ROW
BEGIN
    :NEW.UPDATED_AT := CURRENT_TIMESTAMP;
    :NEW.VERSION := :OLD.VERSION + 1;
END;
/

-- Trigger for soft delete
CREATE OR REPLACE TRIGGER TR_BML_BRANCHES_SOFT_DELETE
BEFORE UPDATE OF DELETED_AT ON BML_BRANCHES
FOR EACH ROW
BEGIN
    IF :NEW.DELETED_AT IS NOT NULL AND :OLD.DELETED_AT IS NULL THEN
        :NEW.UPDATED_AT := CURRENT_TIMESTAMP;
        :NEW.VERSION := :OLD.VERSION + 1;
    END IF;
END;
/

-- ============================================================================================================
-- INSERT SAMPLE DATA
-- ============================================================================================================

-- Insert sample branches for Hà Nội
INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440200', 'HN001', 'Chi nhánh Hà Nội - Bệnh viện Bạch Mai', 'CN HN BM',
    '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440101',
    '78 Giải Phóng, Phường Phương Mai, Quận Đống Đa, Hà Nội', '02435743131',
    'Tuyến 1', 'GS.TS Nguyễn Văn A', '1234567890', 1, 'admin', 'admin'
);

INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440201', 'HN002', 'Chi nhánh Hà Nội - Bệnh viện Việt Đức', 'CN HN VD',
    '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440102',
    '40 Tràng Thi, Phường Hàng Bông, Quận Hoàn Kiếm, Hà Nội', '02438252141',
    'Tuyến 1', 'PGS.TS Trần Văn B', '1234567891', 1, 'admin', 'admin'
);

INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440202', 'HN003', 'Chi nhánh Hà Nội - Bệnh viện Nhi Trung ương', 'CN HN NT',
    '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440103',
    '18/879 La Thành, Phường Ô Chợ Dừa, Quận Đống Đa, Hà Nội', '02462738540',
    'Tuyến 1', 'TS.BS Lê Thị C', '1234567892', 1, 'admin', 'admin'
);

-- Insert sample branches for TP.HCM
INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440203', 'HCM001', 'Chi nhánh TP.HCM - Bệnh viện Chợ Rẫy', 'CN HCM CR',
    '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440201',
    '201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM', '02838554170',
    'Tuyến 1', 'GS.TS Phạm Văn D', '1234567893', 1, 'admin', 'admin'
);

INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440204', 'HCM002', 'Chi nhánh TP.HCM - Bệnh viện Nhi Đồng 1', 'CN HCM NĐ1',
    '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440202',
    '341 Sư Vạn Hạnh, Phường 10, Quận 10, TP.HCM', '02839271119',
    'Tuyến 1', 'TS.BS Nguyễn Thị E', '1234567894', 1, 'admin', 'admin'
);

INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440205', 'HCM003', 'Chi nhánh TP.HCM - Bệnh viện Đại học Y Dược', 'CN HCM ĐHYD',
    '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440203',
    '215 Hồng Bàng, Phường 11, Quận 5, TP.HCM', '02838554170',
    'Tuyến 2', 'PGS.TS Hoàng Văn F', '1234567895', 1, 'admin', 'admin'
);

-- Insert sample branches for Đà Nẵng
INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440206', 'DN001', 'Chi nhánh Đà Nẵng - Bệnh viện Đà Nẵng', 'CN DN DN',
    '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440301',
    '124 Hải Phòng, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng', '02363822288',
    'Tuyến 2', 'TS.BS Võ Thị G', '1234567896', 1, 'admin', 'admin'
);

INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440207', 'DN002', 'Chi nhánh Đà Nẵng - Bệnh viện Phụ sản - Nhi', 'CN DN PSN',
    '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440302',
    '402 Lê Văn Hiến, Phường Khuê Mỹ, Quận Ngũ Hành Sơn, Đà Nẵng', '02363822288',
    'Tuyến 2', 'BS.CKII Trần Văn H', '1234567897', 1, 'admin', 'admin'
);

-- Insert sample branches for Cần Thơ
INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440208', 'CT001', 'Chi nhánh Cần Thơ - Bệnh viện Đa khoa Trung ương Cần Thơ', 'CN CT ĐK',
    '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440401',
    '315 Nguyễn Văn Cừ, Phường An Khánh, Quận Ninh Kiều, Cần Thơ', '02923830088',
    'Tuyến 2', 'TS.BS Lê Thị I', '1234567898', 1, 'admin', 'admin'
);

INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440209', 'CT002', 'Chi nhánh Cần Thơ - Bệnh viện Nhi đồng Cần Thơ', 'CN CT NĐ',
    '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440402',
    '123 Nguyễn Thái Học, Phường Cái Khế, Quận Ninh Kiều, Cần Thơ', '02923830088',
    'Tuyến 2', 'BS.CKII Phạm Văn J', '1234567899', 1, 'admin', 'admin'
);

-- Insert sample branches for Hải Phòng
INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440210', 'HP001', 'Chi nhánh Hải Phòng - Bệnh viện Đa khoa Trung ương Hải Phòng', 'CN HP ĐK',
    '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440501',
    '14 Nguyễn Đức Cảnh, Phường Lê Lợi, Quận Ngô Quyền, Hải Phòng', '02253830088',
    'Tuyến 2', 'TS.BS Nguyễn Văn K', '1234567900', 1, 'admin', 'admin'
);

-- Insert sample branches for Huế
INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440211', 'HU001', 'Chi nhánh Huế - Bệnh viện Trung ương Huế', 'CN HU TW',
    '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440601',
    '16 Lê Lợi, Phường Phú Hội, Thành phố Huế, Thừa Thiên Huế', '02343830088',
    'Tuyến 2', 'PGS.TS Trần Thị L', '1234567901', 1, 'admin', 'admin'
);

-- Insert sample branches for Nha Trang
INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440212', 'NT001', 'Chi nhánh Nha Trang - Bệnh viện Đa khoa Trung ương Nha Trang', 'CN NT ĐK',
    '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440701',
    '57 Yersin, Phường Lộc Thọ, Thành phố Nha Trang, Khánh Hòa', '02583830088',
    'Tuyến 2', 'TS.BS Võ Văn M', '1234567902', 1, 'admin', 'admin'
);

-- Insert sample branches for Vũng Tàu
INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440213', 'VT001', 'Chi nhánh Vũng Tàu - Bệnh viện Đa khoa Trung ương Vũng Tàu', 'CN VT ĐK',
    '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440801',
    '123 Trần Phú, Phường 1, Thành phố Vũng Tàu, Bà Rịa - Vũng Tàu', '02543830088',
    'Tuyến 2', 'BS.CKII Lê Văn N', '1234567903', 1, 'admin', 'admin'
);

-- Insert sample branches for Quy Nhon
INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440214', 'QN001', 'Chi nhánh Quy Nhon - Bệnh viện Đa khoa Trung ương Quy Nhon', 'CN QN ĐK',
    '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440901',
    '456 Nguyễn Huệ, Phường Lê Lợi, Thành phố Quy Nhon, Bình Định', '02563830088',
    'Tuyến 2', 'TS.BS Phạm Thị O', '1234567904', 1, 'admin', 'admin'
);

-- Insert sample branches for Buôn Ma Thuột
INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440215', 'BMT001', 'Chi nhánh Buôn Ma Thuột - Bệnh viện Đa khoa Trung ương Buôn Ma Thuột', 'CN BMT ĐK',
    '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655441001',
    '789 Y Wang, Phường Tân An, Thành phố Buôn Ma Thuột, Đắk Lắk', '02623830088',
    'Tuyến 2', 'BS.CKII Hoàng Văn P', '1234567905', 1, 'admin', 'admin'
);

-- Insert sample branches for Pleiku
INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440216', 'PK001', 'Chi nhánh Pleiku - Bệnh viện Đa khoa Trung ương Pleiku', 'CN PK ĐK',
    '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655441101',
    '321 Trần Hưng Đạo, Phường Hội Phú, Thành phố Pleiku, Gia Lai', '02693830088',
    'Tuyến 2', 'TS.BS Nguyễn Thị Q', '1234567906', 1, 'admin', 'admin'
);

-- Insert sample branches for Đà Lạt
INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440217', 'DL001', 'Chi nhánh Đà Lạt - Bệnh viện Đa khoa Trung ương Đà Lạt', 'CN DL ĐK',
    '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655441201',
    '654 Phan Đình Phùng, Phường 1, Thành phố Đà Lạt, Lâm Đồng', '02633830088',
    'Tuyến 2', 'BS.CKII Trần Văn R', '1234567907', 1, 'admin', 'admin'
);

-- Insert sample branches for Long Xuyên
INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440218', 'LX001', 'Chi nhánh Long Xuyên - Bệnh viện Đa khoa Trung ương Long Xuyên', 'CN LX ĐK',
    '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655441301',
    '987 Nguyễn Thái Học, Phường Mỹ Bình, Thành phố Long Xuyên, An Giang', '02963830088',
    'Tuyến 2', 'TS.BS Lê Thị S', '1234567908', 1, 'admin', 'admin'
);

-- Insert sample branches for Rạch Giá
INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440219', 'RG001', 'Chi nhánh Rạch Giá - Bệnh viện Đa khoa Trung ương Rạch Giá', 'CN RG ĐK',
    '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655441401',
    '147 Nguyễn Trung Trực, Phường Vĩnh Thanh, Thành phố Rạch Giá, Kiên Giang', '02973830088',
    'Tuyến 2', 'BS.CKII Phạm Văn T', '1234567909', 1, 'admin', 'admin'
);

-- Insert sample branches for Cà Mau
INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440220', 'CM001', 'Chi nhánh Cà Mau - Bệnh viện Đa khoa Trung ương Cà Mau', 'CN CM ĐK',
    '550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655441501',
    '258 Phạm Ngũ Lão, Phường 1, Thành phố Cà Mau, Cà Mau', '02903830088',
    'Tuyến 2', 'TS.BS Hoàng Thị U', '1234567910', 1, 'admin', 'admin'
);

-- Insert sample branches for Sóc Trăng
INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440221', 'ST001', 'Chi nhánh Sóc Trăng - Bệnh viện Đa khoa Trung ương Sóc Trăng', 'CN ST ĐK',
    '550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655441601',
    '369 Lê Hồng Phong, Phường 1, Thành phố Sóc Trăng, Sóc Trăng', '02993830088',
    'Tuyến 2', 'BS.CKII Nguyễn Văn V', '1234567911', 1, 'admin', 'admin'
);

-- Insert sample branches for Bạc Liêu
INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440222', 'BL001', 'Chi nhánh Bạc Liêu - Bệnh viện Đa khoa Trung ương Bạc Liêu', 'CN BL ĐK',
    '550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655441701',
    '741 Trần Phú, Phường 1, Thành phố Bạc Liêu, Bạc Liêu', '02913830088',
    'Tuyến 2', 'TS.BS Trần Thị W', '1234567912', 1, 'admin', 'admin'
);

-- Insert sample branches for Cà Mau
INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440223', 'CM002', 'Chi nhánh Cà Mau - Bệnh viện Nhi đồng Cà Mau', 'CN CM NĐ',
    '550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655441502',
    '852 Lý Tự Trọng, Phường 2, Thành phố Cà Mau, Cà Mau', '02903830088',
    'Tuyến 2', 'BS.CKII Phạm Văn X', '1234567913', 1, 'admin', 'admin'
);

-- Insert sample branches for Sóc Trăng
INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440224', 'ST002', 'Chi nhánh Sóc Trăng - Bệnh viện Nhi đồng Sóc Trăng', 'CN ST NĐ',
    '550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655441602',
    '963 Nguyễn Chí Thanh, Phường 2, Thành phố Sóc Trăng, Sóc Trăng', '02993830088',
    'Tuyến 2', 'TS.BS Lê Thị Y', '1234567914', 1, 'admin', 'admin'
);

-- Insert sample branches for Bạc Liêu
INSERT INTO BML_BRANCHES (
    ID, BRANCH_CODE, BRANCH_NAME, SHORT_NAME, PROVINCE_ID, WARD_ID, 
    ADDRESS, PHONE_NUMBER, HOSPITAL_LEVEL, REPRESENTATIVE, BHYT_CODE, 
    IS_ACTIVE, CREATED_BY, UPDATED_BY
) VALUES (
    '550e8400-e29b-41d4-a716-446655440225', 'BL002', 'Chi nhánh Bạc Liêu - Bệnh viện Nhi đồng Bạc Liêu', 'CN BL NĐ',
    '550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655441702',
    '147 Nguyễn Thái Học, Phường 2, Thành phố Bạc Liêu, Bạc Liêu', '02913830088',
    'Tuyến 2', 'BS.CKII Hoàng Văn Z', '1234567915', 1, 'admin', 'admin'
);

-- ============================================================================================================
-- COMMIT TRANSACTION
-- ============================================================================================================

COMMIT;

-- ============================================================================================================
-- VERIFY DATA
-- ============================================================================================================

-- Check total branches
SELECT COUNT(*) AS TOTAL_BRANCHES FROM BML_BRANCHES;

-- Check branches by province
SELECT 
    p.PROVINCE_NAME,
    COUNT(b.ID) AS BRANCH_COUNT
FROM BML_PROVINCES p
LEFT JOIN BML_BRANCHES b ON p.ID = b.PROVINCE_ID AND b.DELETED_AT IS NULL
GROUP BY p.PROVINCE_NAME
ORDER BY BRANCH_COUNT DESC;

-- Check branches by hospital level
SELECT 
    HOSPITAL_LEVEL,
    COUNT(*) AS BRANCH_COUNT
FROM BML_BRANCHES
WHERE DELETED_AT IS NULL
GROUP BY HOSPITAL_LEVEL
ORDER BY BRANCH_COUNT DESC;

-- Check branches by status
SELECT 
    CASE 
        WHEN IS_ACTIVE = 1 THEN 'Active'
        ELSE 'Inactive'
    END AS STATUS,
    COUNT(*) AS BRANCH_COUNT
FROM BML_BRANCHES
WHERE DELETED_AT IS NULL
GROUP BY IS_ACTIVE
ORDER BY BRANCH_COUNT DESC;

-- Check sample branch data
SELECT 
    BRANCH_CODE,
    BRANCH_NAME,
    SHORT_NAME,
    HOSPITAL_LEVEL,
    REPRESENTATIVE,
    BHYT_CODE,
    IS_ACTIVE
FROM BML_BRANCHES
WHERE DELETED_AT IS NULL
ORDER BY BRANCH_CODE
FETCH FIRST 10 ROWS ONLY;
