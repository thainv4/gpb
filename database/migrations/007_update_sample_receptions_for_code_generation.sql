-- Migration: 007_update_sample_receptions_for_code_generation.sql
-- Cập nhật bảng BML_SAMPLE_RECEPTIONS để hỗ trợ cấu hình sinh mã mới

-- Thêm các cột để lưu cấu hình sinh mã (optional, để tracking)
ALTER TABLE BML_SAMPLE_RECEPTIONS ADD (
    CODE_PREFIX VARCHAR2(5),
    CODE_WIDTH NUMBER(1),
    ALLOW_DUPLICATE NUMBER(1),
    RESET_PERIOD VARCHAR2(20)
);

-- Thêm comments cho các cột mới
COMMENT ON COLUMN BML_SAMPLE_RECEPTIONS.CODE_PREFIX IS 'Tiền tố mã tiếp nhận (copy từ Sample Type)';
COMMENT ON COLUMN BML_SAMPLE_RECEPTIONS.CODE_WIDTH IS 'Độ rộng phần số (copy từ Sample Type)';
COMMENT ON COLUMN BML_SAMPLE_RECEPTIONS.ALLOW_DUPLICATE IS 'Cho phép mã trùng lặp (copy từ Sample Type)';
COMMENT ON COLUMN BML_SAMPLE_RECEPTIONS.RESET_PERIOD IS 'Chu kỳ reset số thứ tự (copy từ Sample Type)';

-- Cập nhật dữ liệu hiện có với thông tin từ Sample Type
UPDATE BML_SAMPLE_RECEPTIONS sr
SET (
    CODE_PREFIX,
    CODE_WIDTH,
    ALLOW_DUPLICATE,
    RESET_PERIOD
) = (
    SELECT 
        st.CODE_PREFIX, 
        st.CODE_WIDTH, 
        st.ALLOW_DUPLICATE, 
        st.RESET_PERIOD
    FROM BML_SAMPLE_TYPES st
    WHERE st.ID = sr.SAMPLE_TYPE_ID
)
WHERE EXISTS (
    SELECT 1 FROM BML_SAMPLE_TYPES st 
    WHERE st.ID = sr.SAMPLE_TYPE_ID
);

-- Thêm indexes cho performance (tên ngắn hơn 30 ký tự)
CREATE INDEX IDX_BML_SAMPLE_REC_PREFIX ON BML_SAMPLE_RECEPTIONS(CODE_PREFIX);
CREATE INDEX IDX_BML_SAMPLE_REC_PERIOD ON BML_SAMPLE_RECEPTIONS(RESET_PERIOD);

-- Thêm check constraints (tên ngắn hơn 30 ký tự)
ALTER TABLE BML_SAMPLE_RECEPTIONS ADD CONSTRAINT CK_BML_SAMPLE_REC_WIDTH
    CHECK (CODE_WIDTH IS NULL OR (CODE_WIDTH >= 1 AND CODE_WIDTH <= 5));

ALTER TABLE BML_SAMPLE_RECEPTIONS ADD CONSTRAINT CK_BML_SAMPLE_REC_PERIOD
    CHECK (RESET_PERIOD IS NULL OR RESET_PERIOD IN ('DAILY', 'MONTHLY', 'YEARLY', 'NEVER'));

-- Commit changes
COMMIT;

-- Log completion
SELECT 'Sample Receptions table updated for code generation configuration' AS status FROM DUAL;
