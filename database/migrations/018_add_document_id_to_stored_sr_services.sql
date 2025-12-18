-- Migration: 018_add_document_id_to_stored_sr_services.sql
-- Description: Thêm field DOCUMENT_ID (kiểu số) vào BML_STORED_SR_SERVICES để lưu ID văn bản EMR

-- Add DOCUMENT_ID column
ALTER TABLE BML_STORED_SR_SERVICES ADD (
    DOCUMENT_ID NUMBER
);

-- Index for performance
CREATE INDEX IDX_SSR_SERV_DOC_ID ON BML_STORED_SR_SERVICES(DOCUMENT_ID);

-- Comment
COMMENT ON COLUMN BML_STORED_SR_SERVICES.DOCUMENT_ID IS 'ID văn bản EMR (từ bảng EMR_DOCUMENT)';

COMMIT;

