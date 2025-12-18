-- Migration: Create BML_WORKFLOW_HISTORY table (Gộp Module 2 + Module 3)
-- Description: Lưu cả current state và history của workflow trong 1 bảng với IS_CURRENT flag

-- Drop table if exists (for clean migration)
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE BML_WORKFLOW_HISTORY CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN
            RAISE;
        END IF;
END;
/

-- Create table (Gộp Module 2 Current State + Module 3 History)
CREATE TABLE BML_WORKFLOW_HISTORY (
    ID VARCHAR2(36) PRIMARY KEY DEFAULT SYS_GUID(),
    
    -- References (từ Module 2)
    STORED_SERVICE_REQ_ID VARCHAR2(36) NOT NULL, -- Link đến Service Request
    STORED_SERVICE_ID VARCHAR2(36), -- NULL = áp dụng cho toàn bộ SR, NOT NULL = cho service cụ thể
    
    -- State Transition (từ Module 3)
    FROM_STATE_ID VARCHAR2(36), -- Trạng thái từ (FK → WorkflowState, nullable cho START)
    TO_STATE_ID VARCHAR2(36) NOT NULL, -- Trạng thái đến (FK → WorkflowState)
    
    -- Current State Info (từ Module 2 - chỉ có khi IS_CURRENT = 1)
    PREVIOUS_STATE_ID VARCHAR2(36), -- Trạng thái trước đó (denormalized cho current state)
    
    -- Timing Info (từ Module 2 + Module 3)
    STARTED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời gian bắt đầu workflow
    ACTION_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời điểm thực hiện action (từ Module 3)
    CURR_STATE_START_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời gian bắt đầu trạng thái hiện tại (chỉ khi IS_CURRENT = 1)
    COMPLETED_AT TIMESTAMP NULL, -- Thời gian hoàn thành workflow (chỉ khi IS_CURRENT = 1)
    EST_COMPLETION_TIME TIMESTAMP NULL, -- Thời gian dự kiến hoàn thành (chỉ khi IS_CURRENT = 1)
    DURATION_MINUTES NUMBER, -- Thời gian xử lý trạng thái (phút) - từ Module 3
    
    -- Action Info (từ Module 3)
    ACTION_TYPE VARCHAR2(50) NOT NULL, -- 'START', 'COMPLETE', 'SKIP', 'ROLLBACK', 'PAUSE', 'RESUME'
    ACTION_USER_ID VARCHAR2(36) NOT NULL, -- User thực hiện action
    ACTION_USERNAME VARCHAR2(50), -- Tên user (denormalized để query nhanh)
    ACTION_DEPT_ID VARCHAR2(36), -- Department thực hiện action
    ACTION_ROOM_ID VARCHAR2(36), -- Room thực hiện action
    
    -- Current Processing Info (từ Module 2 - chỉ có khi IS_CURRENT = 1)
    CURR_USER_ID VARCHAR2(36), -- User đang xử lý
    CURR_DEPT_ID VARCHAR2(36), -- Department đang xử lý
    CURR_ROOM_ID VARCHAR2(36), -- Room đang xử lý
    
    -- Transition Info (Thêm mới - ai đã chuyển workflow sang state hiện tại)
    TRANS_BY_USER_ID VARCHAR2(36), -- User đã chuyển workflow sang state hiện tại (chỉ khi IS_CURRENT = 1)
    TRANS_BY_DEPT_ID VARCHAR2(36), -- Department đã chuyển (chỉ khi IS_CURRENT = 1)
    TRANS_BY_ROOM_ID VARCHAR2(36), -- Room đã chuyển (chỉ khi IS_CURRENT = 1)
    
    -- Status (từ Module 2 + Module 3)
    IS_CURRENT NUMBER(1) DEFAULT 0, -- 1 = current state, 0 = history (QUAN TRỌNG!)
    IS_ACTIVE NUMBER(1) DEFAULT 1, -- Workflow đang active (chỉ khi IS_CURRENT = 1)
    IS_COMPLETED NUMBER(1) DEFAULT 0, -- Workflow đã hoàn thành (chỉ khi IS_CURRENT = 1)
    NOTES VARCHAR2(1000), -- Ghi chú
    
    -- Additional Info (từ Module 3)
    ATTACHMENT_URL VARCHAR2(500), -- Link file đính kèm nếu có
    METADATA CLOB, -- JSON metadata nếu cần thêm thông tin
    
    -- Base Entity fields
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DELETED_AT TIMESTAMP NULL,
    CREATED_BY VARCHAR2(50),
    UPDATED_BY VARCHAR2(50),
    VERSION NUMBER DEFAULT 1
);

-- Add Foreign Keys
-- Lưu ý: Các FK đến BML_STORED_SERVICE_REQUESTS và BML_STORED_SR_SERVICES 
-- sẽ được thêm sau khi tạo các table đó trong migration tiếp theo

-- FK đến Workflow States (table đã tồn tại)
ALTER TABLE BML_WORKFLOW_HISTORY ADD CONSTRAINT FK_WF_HIST_FROM 
    FOREIGN KEY (FROM_STATE_ID) REFERENCES BML_WORKFLOW_STATES(ID);

ALTER TABLE BML_WORKFLOW_HISTORY ADD CONSTRAINT FK_WF_HIST_TO 
    FOREIGN KEY (TO_STATE_ID) REFERENCES BML_WORKFLOW_STATES(ID);

ALTER TABLE BML_WORKFLOW_HISTORY ADD CONSTRAINT FK_WF_HIST_PREV 
    FOREIGN KEY (PREVIOUS_STATE_ID) REFERENCES BML_WORKFLOW_STATES(ID);

-- FK đến Stored Service Requests (sẽ thêm sau khi tạo table)
-- ALTER TABLE BML_WORKFLOW_HISTORY ADD CONSTRAINT FK_WF_HIST_REQ 
--     FOREIGN KEY (STORED_SERVICE_REQ_ID) REFERENCES BML_STORED_SERVICE_REQUESTS(ID) ON DELETE CASCADE;

-- FK đến Stored Service Request Services (sẽ thêm sau khi tạo table)
-- ALTER TABLE BML_WORKFLOW_HISTORY ADD CONSTRAINT FK_WF_HIST_SVC 
--     FOREIGN KEY (STORED_SERVICE_ID) REFERENCES BML_STORED_SR_SERVICES(ID) ON DELETE CASCADE;

-- Indexes cho performance (Rút ngắn tên để phù hợp Oracle 30 ký tự)
CREATE INDEX IDX_WF_HIST_REQ ON BML_WORKFLOW_HISTORY(STORED_SERVICE_REQ_ID);
CREATE INDEX IDX_WF_HIST_SERVICE ON BML_WORKFLOW_HISTORY(STORED_SERVICE_ID);
CREATE INDEX IDX_WF_HIST_CURRENT ON BML_WORKFLOW_HISTORY(IS_CURRENT);
CREATE INDEX IDX_WF_HIST_TO_STATE ON BML_WORKFLOW_HISTORY(TO_STATE_ID);
CREATE INDEX IDX_WF_HIST_FROM_STATE ON BML_WORKFLOW_HISTORY(FROM_STATE_ID);
CREATE INDEX IDX_WF_HIST_TIMESTAMP ON BML_WORKFLOW_HISTORY(ACTION_TIMESTAMP);
CREATE INDEX IDX_WF_HIST_USER ON BML_WORKFLOW_HISTORY(ACTION_USER_ID);
CREATE INDEX IDX_WF_HIST_ACTION_TYPE ON BML_WORKFLOW_HISTORY(ACTION_TYPE);
CREATE INDEX IDX_WF_HIST_COMPLETED ON BML_WORKFLOW_HISTORY(IS_COMPLETED);
CREATE INDEX IDX_WF_HIST_ACTIVE ON BML_WORKFLOW_HISTORY(IS_ACTIVE);

-- Composite index cho query current state (quan trọng!)
-- Rút ngắn tên index để phù hợp Oracle 30 ký tự
CREATE INDEX IDX_WF_REQ_CURRENT ON BML_WORKFLOW_HISTORY(STORED_SERVICE_REQ_ID, STORED_SERVICE_ID, IS_CURRENT);

-- Comments
COMMENT ON TABLE BML_WORKFLOW_HISTORY IS 'Bảng lưu cả current state và history của workflow (gộp Module 2 + Module 3)';
COMMENT ON COLUMN BML_WORKFLOW_HISTORY.IS_CURRENT IS '1 = current state, 0 = history';
COMMENT ON COLUMN BML_WORKFLOW_HISTORY.TRANS_BY_USER_ID IS 'User đã chuyển workflow sang state hiện tại (chỉ khi IS_CURRENT = 1)';
COMMENT ON COLUMN BML_WORKFLOW_HISTORY.TRANS_BY_DEPT_ID IS 'Department đã chuyển workflow (chỉ khi IS_CURRENT = 1)';
COMMENT ON COLUMN BML_WORKFLOW_HISTORY.TRANS_BY_ROOM_ID IS 'Room đã chuyển workflow (chỉ khi IS_CURRENT = 1)';

COMMIT;

