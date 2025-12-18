# Module Workflow Tracking - Triển Khai Quy Trình Xử Lý Mẫu

## 📋 Tổng Quan

Module này cho phép theo dõi và quản lý đường đi (workflow) của mẫu xét nghiệm từ khi lấy mẫu đến khi hoàn thành. Ví dụ: **Lấy mẫu → Bàn giao mẫu → Tách mẫu → Chạy máy → Đánh giá kết quả → Hoàn thành**

## 🗄️ Database Schema

### Module 1: Workflow States (Master Data)

#### Bảng: `BML_WORKFLOW_STATES`

**Mục đích**: Định nghĩa các trạng thái trong workflow (Master Data)

**Ý nghĩa**: 
- Lưu trữ danh sách các trạng thái có thể có trong quy trình xử lý mẫu
- Dữ liệu tĩnh, ít thay đổi (Master Data)
- Dùng làm lookup/reference cho các bước trong workflow

**Cấu trúc**:

```sql
CREATE TABLE BML_WORKFLOW_STATES (
    ID VARCHAR2(36) PRIMARY KEY DEFAULT SYS_GUID(),
    STATE_CODE VARCHAR2(50) NOT NULL UNIQUE, -- Ví dụ: 'SAMPLE_COLLECTION', 'SAMPLE_HANDOVER'
    STATE_NAME VARCHAR2(200) NOT NULL, -- 'Lấy mẫu', 'Bàn giao mẫu'
    STATE_DESCRIPTION VARCHAR2(1000), -- Mô tả chi tiết trạng thái
    STATE_ORDER NUMBER NOT NULL, -- Thứ tự trong workflow (1, 2, 3...)
    CAN_SKIP NUMBER(1) DEFAULT 0, -- Có thể bỏ qua không (0 = không, 1 = có)
    REQUIRES_APPROVAL NUMBER(1) DEFAULT 0, -- Cần phê duyệt không (0 = không, 1 = có)
    IS_ACTIVE NUMBER(1) DEFAULT 1, -- Trạng thái active/inactive
    
    -- Base Entity fields
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DELETED_AT TIMESTAMP NULL,
    CREATED_BY VARCHAR2(50),
    UPDATED_BY VARCHAR2(50),
    VERSION NUMBER DEFAULT 1,
    
    CONSTRAINT UK_WF_STATE_CODE UNIQUE (STATE_CODE)
);

-- Indexes
CREATE INDEX IDX_WF_STATES_CODE ON BML_WORKFLOW_STATES(STATE_CODE);
CREATE INDEX IDX_WF_STATES_ORDER ON BML_WORKFLOW_STATES(STATE_ORDER);
CREATE INDEX IDX_WF_STATES_ACTIVE ON BML_WORKFLOW_STATES(IS_ACTIVE);
```

**Sample Data**:

```sql
INSERT INTO BML_WORKFLOW_STATES (ID, STATE_CODE, STATE_NAME, STATE_DESCRIPTION, STATE_ORDER, CAN_SKIP, REQUIRES_APPROVAL) VALUES
(SYS_GUID(), 'SAMPLE_COLLECTION', 'Lấy mẫu', 'Bước lấy mẫu từ bệnh nhân', 1, 0, 0);

INSERT INTO BML_WORKFLOW_STATES (ID, STATE_CODE, STATE_NAME, STATE_DESCRIPTION, STATE_ORDER, CAN_SKIP, REQUIRES_APPROVAL) VALUES
(SYS_GUID(), 'SAMPLE_HANDOVER', 'Bàn giao mẫu', 'Bàn giao mẫu từ phòng lấy mẫu đến phòng xét nghiệm', 2, 0, 0);

INSERT INTO BML_WORKFLOW_STATES (ID, STATE_CODE, STATE_NAME, STATE_DESCRIPTION, STATE_ORDER, CAN_SKIP, REQUIRES_APPROVAL) VALUES
(SYS_GUID(), 'SAMPLE_SEPARATION', 'Tách mẫu', 'Tách mẫu thành các phần nhỏ để xử lý', 3, 0, 0);

INSERT INTO BML_WORKFLOW_STATES (ID, STATE_CODE, STATE_NAME, STATE_DESCRIPTION, STATE_ORDER, CAN_SKIP, REQUIRES_APPROVAL) VALUES
(SYS_GUID(), 'MACHINE_RUNNING', 'Chạy máy', 'Chạy máy xét nghiệm', 4, 0, 0);

INSERT INTO BML_WORKFLOW_STATES (ID, STATE_CODE, STATE_NAME, STATE_DESCRIPTION, STATE_ORDER, CAN_SKIP, REQUIRES_APPROVAL) VALUES
(SYS_GUID(), 'RESULT_EVALUATION', 'Đánh giá kết quả', 'Đánh giá và xác nhận kết quả', 5, 0, 1);

INSERT INTO BML_WORKFLOW_STATES (ID, STATE_CODE, STATE_NAME, STATE_DESCRIPTION, STATE_ORDER, CAN_SKIP, REQUIRES_APPROVAL) VALUES
(SYS_GUID(), 'RESULT_APPROVAL', 'Phê duyệt kết quả', 'Phê duyệt kết quả bởi bác sĩ', 6, 0, 1);

INSERT INTO BML_WORKFLOW_STATES (ID, STATE_CODE, STATE_NAME, STATE_DESCRIPTION, STATE_ORDER, CAN_SKIP, REQUIRES_APPROVAL) VALUES
(SYS_GUID(), 'COMPLETED', 'Hoàn thành', 'Hoàn thành quy trình', 7, 0, 0);
```

**Quan hệ**:
- Không có foreign key đến entity khác
- Được tham chiếu bởi:
  - `BML_STORED_SERVICE_REQ_WORKFLOW.CURRENT_STATE_ID`
  - `BML_STORED_SERVICE_REQ_WORKFLOW.PREVIOUS_STATE_ID`
  - `BML_WORKFLOW_HISTORY.FROM_STATE_ID`
  - `BML_WORKFLOW_HISTORY.TO_STATE_ID`

---

### Module 2: Workflow Current State (Transaction Data)

#### Bảng: `BML_STORED_SERVICE_REQ_WORKFLOW`

**Mục đích**: Lưu trạng thái hiện tại của workflow cho mỗi Service Request hoặc Service cụ thể

**Ý nghĩa**:
- Lưu trạng thái hiện tại (snapshot) của workflow
- Mỗi record = 1 workflow đang chạy cho 1 Service Request (hoặc 1 Service cụ thể)
- Có thể có nhiều workflows cho 1 Service Request nếu áp dụng workflow cho từng service riêng
- Dữ liệu động, thay đổi liên tục khi workflow chạy

**Cấu trúc**:

```sql
CREATE TABLE BML_STORED_SERVICE_REQ_WORKFLOW (
    ID VARCHAR2(36) PRIMARY KEY DEFAULT SYS_GUID(),
    
    -- References
    STORED_SERVICE_REQ_ID VARCHAR2(36) NOT NULL, -- Link đến Service Request
    STORED_SERVICE_ID VARCHAR2(36), -- NULL = áp dụng cho toàn bộ SR, NOT NULL = cho service cụ thể
    
    -- Current State Info
    CURRENT_STATE_ID VARCHAR2(36) NOT NULL, -- Trạng thái hiện tại (FK → WorkflowState)
    PREVIOUS_STATE_ID VARCHAR2(36), -- Trạng thái trước đó (FK → WorkflowState)
    
    -- Timing Info
    STARTED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời gian bắt đầu workflow
    CURRENT_STATE_STARTED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời gian bắt đầu trạng thái hiện tại
    COMPLETED_AT TIMESTAMP NULL, -- Thời gian hoàn thành workflow
    ESTIMATED_COMPLETION_TIME TIMESTAMP NULL, -- Thời gian dự kiến hoàn thành
    
    -- Current Processing Info
    CURRENT_USER_ID VARCHAR2(36), -- User đang xử lý
    CURRENT_DEPARTMENT_ID VARCHAR2(36), -- Department đang xử lý
    CURRENT_ROOM_ID VARCHAR2(36), -- Room đang xử lý
    
    -- Status
    NOTES VARCHAR2(1000), -- Ghi chú hiện tại
    IS_ACTIVE NUMBER(1) DEFAULT 1, -- Workflow đang active
    IS_COMPLETED NUMBER(1) DEFAULT 0, -- Workflow đã hoàn thành
    
    -- Base Entity fields
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DELETED_AT TIMESTAMP NULL,
    CREATED_BY VARCHAR2(50),
    UPDATED_BY VARCHAR2(50),
    VERSION NUMBER DEFAULT 1,
    
    CONSTRAINT FK_SSR_WF_REQ FOREIGN KEY (STORED_SERVICE_REQ_ID) 
        REFERENCES BML_STORED_SERVICE_REQUESTS(ID) ON DELETE CASCADE,
    CONSTRAINT FK_SSR_WF_SERVICE FOREIGN KEY (STORED_SERVICE_ID) 
        REFERENCES BML_STORED_SERVICE_REQ_SERVICES(ID) ON DELETE CASCADE,
    CONSTRAINT FK_SSR_WF_CURRENT_STATE FOREIGN KEY (CURRENT_STATE_ID) 
        REFERENCES BML_WORKFLOW_STATES(ID),
    CONSTRAINT FK_SSR_WF_PREV_STATE FOREIGN KEY (PREVIOUS_STATE_ID) 
        REFERENCES BML_WORKFLOW_STATES(ID)
);

-- Indexes
CREATE INDEX IDX_SSR_WF_REQ ON BML_STORED_SERVICE_REQ_WORKFLOW(STORED_SERVICE_REQ_ID);
CREATE INDEX IDX_SSR_WF_SERVICE ON BML_STORED_SERVICE_REQ_WORKFLOW(STORED_SERVICE_ID);
CREATE INDEX IDX_SSR_WF_CURRENT_STATE ON BML_STORED_SERVICE_REQ_WORKFLOW(CURRENT_STATE_ID);
CREATE INDEX IDX_SSR_WF_COMPLETED ON BML_STORED_SERVICE_REQ_WORKFLOW(IS_COMPLETED);
CREATE INDEX IDX_SSR_WF_ACTIVE ON BML_STORED_SERVICE_REQ_WORKFLOW(IS_ACTIVE);
CREATE INDEX IDX_SSR_WF_USER ON BML_STORED_SERVICE_REQ_WORKFLOW(CURRENT_USER_ID);
```

**Ví dụ dữ liệu**:

```
ID: wf-uuid-1
STORED_SERVICE_REQ_ID: sr-uuid-1
STORED_SERVICE_ID: NULL (áp dụng cho toàn bộ SR)
CURRENT_STATE_ID: uuid-2 (SAMPLE_HANDOVER)
PREVIOUS_STATE_ID: uuid-1 (SAMPLE_COLLECTION)
STARTED_AT: 2025-10-31 10:00:00
CURRENT_STATE_STARTED_AT: 2025-10-31 10:30:00
IS_COMPLETED: 0
CURRENT_USER_ID: user-uuid-1
```

**Quan hệ**:
- `STORED_SERVICE_REQ_ID` → `BML_STORED_SERVICE_REQUESTS.ID`
- `STORED_SERVICE_ID` → `BML_STORED_SERVICE_REQ_SERVICES.ID` (nullable)
- `CURRENT_STATE_ID` → `BML_WORKFLOW_STATES.ID`
- `PREVIOUS_STATE_ID` → `BML_WORKFLOW_STATES.ID` (nullable)
- One-to-Many với `BML_WORKFLOW_HISTORY` (1 workflow có nhiều history records)

---

### Module 3: Workflow History (Audit Trail)

#### Bảng: `BML_WORKFLOW_HISTORY`

**Mục đích**: Lưu lịch sử tất cả các hành động/thay đổi trạng thái trong workflow

**Ý nghĩa**:
- Lưu mọi sự kiện/chuyển trạng thái trong workflow (Audit Trail)
- Timeline/audit log đầy đủ của workflow
- Mỗi record = 1 hành động (START, COMPLETE, SKIP, ROLLBACK...)
- Dữ liệu chỉ append (không update/delete) - immutable

**Cấu trúc**:

```sql
CREATE TABLE BML_WORKFLOW_HISTORY (
    ID VARCHAR2(36) PRIMARY KEY DEFAULT SYS_GUID(),
    
    -- References
    WORKFLOW_ID VARCHAR2(36) NOT NULL, -- Link đến workflow (FK → StoredServiceRequestWorkflow)
    STORED_SERVICE_REQ_ID VARCHAR2(36) NOT NULL, -- Link trực tiếp đến SR (để query nhanh)
    STORED_SERVICE_ID VARCHAR2(36), -- Link đến service cụ thể (nullable)
    
    -- State Transition
    FROM_STATE_ID VARCHAR2(36), -- Trạng thái từ (FK → WorkflowState, nullable cho START)
    TO_STATE_ID VARCHAR2(36) NOT NULL, -- Trạng thái đến (FK → WorkflowState)
    
    -- Action Info
    ACTION_TYPE VARCHAR2(50) NOT NULL, -- 'START', 'COMPLETE', 'SKIP', 'ROLLBACK', 'PAUSE', 'RESUME'
    ACTION_USER_ID VARCHAR2(36) NOT NULL, -- User thực hiện action
    ACTION_USERNAME VARCHAR2(50), -- Tên user (denormalized để query nhanh)
    ACTION_DEPARTMENT_ID VARCHAR2(36), -- Department thực hiện
    ACTION_ROOM_ID VARCHAR2(36), -- Room thực hiện
    ACTION_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời điểm thực hiện
    
    -- Duration
    DURATION_MINUTES NUMBER, -- Thời gian xử lý trạng thái (phút) - chỉ có khi COMPLETE
    
    -- Additional Info
    NOTES VARCHAR2(1000), -- Ghi chú
    ATTACHMENT_URL VARCHAR2(500), -- Link file đính kèm nếu có
    METADATA CLOB, -- JSON metadata nếu cần thêm thông tin
    
    -- Base Entity fields (chỉ có created, không có updated vì immutable)
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CREATED_BY VARCHAR2(50),
    
    CONSTRAINT FK_WF_HISTORY_WORKFLOW FOREIGN KEY (WORKFLOW_ID) 
        REFERENCES BML_STORED_SERVICE_REQ_WORKFLOW(ID) ON DELETE CASCADE,
    CONSTRAINT FK_WF_HISTORY_REQ FOREIGN KEY (STORED_SERVICE_REQ_ID) 
        REFERENCES BML_STORED_SERVICE_REQUESTS(ID) ON DELETE CASCADE,
    CONSTRAINT FK_WF_HISTORY_FROM_STATE FOREIGN KEY (FROM_STATE_ID) 
        REFERENCES BML_WORKFLOW_STATES(ID),
    CONSTRAINT FK_WF_HISTORY_TO_STATE FOREIGN KEY (TO_STATE_ID) 
        REFERENCES BML_WORKFLOW_STATES(ID)
);

-- Indexes
CREATE INDEX IDX_WF_HISTORY_WORKFLOW ON BML_WORKFLOW_HISTORY(WORKFLOW_ID);
CREATE INDEX IDX_WF_HISTORY_REQ ON BML_WORKFLOW_HISTORY(STORED_SERVICE_REQ_ID);
CREATE INDEX IDX_WF_HISTORY_TIMESTAMP ON BML_WORKFLOW_HISTORY(ACTION_TIMESTAMP);
CREATE INDEX IDX_WF_HISTORY_USER ON BML_WORKFLOW_HISTORY(ACTION_USER_ID);
CREATE INDEX IDX_WF_HISTORY_ACTION_TYPE ON BML_WORKFLOW_HISTORY(ACTION_TYPE);
CREATE INDEX IDX_WF_HISTORY_TO_STATE ON BML_WORKFLOW_HISTORY(TO_STATE_ID);
```

**Ví dụ dữ liệu**:

```
Record 1:
WORKFLOW_ID: wf-uuid-1
FROM_STATE_ID: NULL
TO_STATE_ID: uuid-1 (SAMPLE_COLLECTION)
ACTION_TYPE: START
ACTION_TIMESTAMP: 2025-10-31 10:00:00
ACTION_USER: user1
DURATION_MINUTES: NULL

Record 2:
WORKFLOW_ID: wf-uuid-1
FROM_STATE_ID: uuid-1 (SAMPLE_COLLECTION)
TO_STATE_ID: uuid-2 (SAMPLE_HANDOVER)
ACTION_TYPE: COMPLETE
ACTION_TIMESTAMP: 2025-10-31 10:30:00
ACTION_USER: user1
DURATION_MINUTES: 30
```

**Quan hệ**:
- `WORKFLOW_ID` → `BML_STORED_SERVICE_REQ_WORKFLOW.ID`
- `STORED_SERVICE_REQ_ID` → `BML_STORED_SERVICE_REQUESTS.ID`
- `STORED_SERVICE_ID` → `BML_STORED_SERVICE_REQ_SERVICES.ID` (nullable)
- `FROM_STATE_ID` → `BML_WORKFLOW_STATES.ID` (nullable)
- `TO_STATE_ID` → `BML_WORKFLOW_STATES.ID`
- Many-to-One với `BML_STORED_SERVICE_REQ_WORKFLOW`

---

## 📊 Sơ Đồ Quan Hệ Giữa Các Entities

```
┌─────────────────────────────────────┐
│  BML_STORED_SERVICE_REQUESTS        │
│  (Entity đã có từ Store API)       │
└──────────────┬──────────────────────┘
               │
               │ 1:N
               │
┌──────────────▼──────────────────────────────────────┐
│  BML_STORED_SERVICE_REQ_SERVICES                   │
│  (Entity đã có từ Store API)                       │
└───────┬─────────────────────┬──────────────────────┘
        │                     │
        │                     │
        │                     │
┌───────▼──────────────────────▼──────────────────────┐
│  BML_STORED_SERVICE_REQ_WORKFLOW                   │
│  (Entity MỚI - Module 2)                           │
│  - STORED_SERVICE_REQ_ID → SR                      │
│  - STORED_SERVICE_ID → Service (nullable)          │
│  - CURRENT_STATE_ID → WorkflowState                │
│  - PREVIOUS_STATE_ID → WorkflowState                │
└───────┬──────────────────────┬──────────────────────┘
        │                      │
        │ 1:N                  │ N:1
        │                      │
┌───────▼──────────────────────▼──────────────────────┐
│  BML_WORKFLOW_HISTORY                               │
│  (Entity MỚI - Module 3)                           │
│  - WORKFLOW_ID → Workflow                          │
│  - FROM_STATE_ID → WorkflowState                    │
│  - TO_STATE_ID → WorkflowState                      │
└──────────────────────────────────────────────────────┘
        │
        │ N:1
        │
┌───────▼──────────────────────┐
│  BML_WORKFLOW_STATES          │
│  (Entity MỚI - Module 1)      │
│  - STATE_CODE                 │
│  - STATE_ORDER                │
│  - Master Data                │
└───────────────────────────────┘
```

---

## 📁 Cấu Trúc Folder

```
src/modules/workflow/
├── entities/
│   ├── workflow-state.entity.ts              # Module 1: BML_WORKFLOW_STATES
│   ├── stored-service-req-workflow.entity.ts # Module 2: BML_STORED_SERVICE_REQ_WORKFLOW
│   └── workflow-history.entity.ts            # Module 3: BML_WORKFLOW_HISTORY
├── dto/
│   ├── commands/
│   │   ├── create-workflow-state.dto.ts
│   │   ├── update-workflow-state.dto.ts
│   │   ├── start-workflow.dto.ts
│   │   ├── update-workflow-state.dto.ts
│   │   ├── complete-workflow-state.dto.ts
│   │   ├── skip-workflow-state.dto.ts
│   │   └── rollback-workflow-state.dto.ts
│   ├── queries/
│   │   ├── get-workflow-states.dto.ts
│   │   ├── get-workflow.dto.ts
│   │   └── get-workflow-history.dto.ts
│   └── responses/
│       ├── workflow-state-response.dto.ts
│       ├── workflow-response.dto.ts
│       ├── workflow-history-response.dto.ts
│       └── workflow-timeline-response.dto.ts
├── interfaces/
│   └── workflow.repository.interface.ts
├── repositories/
│   └── workflow.repository.ts
├── services/
│   └── workflow.service.ts
├── controllers/
│   └── workflow.controller.ts
└── workflow.module.ts
```

---

## 🔧 Implementation Plan

### Phase 1: Module 1 - Workflow States (Master Data)

**Mục tiêu**: Tạo entity và CRUD APIs cho Workflow States

**Tasks**:
1. ✅ Tạo migration script cho `BML_WORKFLOW_STATES`
2. ✅ Tạo `WorkflowState` entity
3. ✅ Tạo DTOs (Create, Update, Get, List)
4. ✅ Tạo Repository Interface và Implementation
5. ✅ Tạo Service với CRUD operations
6. ✅ Tạo Controller với REST APIs
7. ✅ Tạo Module và integrate vào AppModule
8. ✅ Insert sample data (7 states)
9. ✅ Test APIs

**APIs**:
- `GET /api/v1/workflow-states` - List all states
- `GET /api/v1/workflow-states/:id` - Get state by ID
- `GET /api/v1/workflow-states/code/:code` - Get state by code
- `POST /api/v1/workflow-states` - Create new state
- `PUT /api/v1/workflow-states/:id` - Update state
- `DELETE /api/v1/workflow-states/:id` - Delete state (soft delete)

---

### Phase 2: Module 2 - Workflow Current State

**Mục tiêu**: Tạo entity và APIs để quản lý trạng thái hiện tại của workflow

**Tasks**:
1. ⬜ Tạo migration script cho `BML_STORED_SERVICE_REQ_WORKFLOW`
2. ⬜ Tạo `StoredServiceRequestWorkflow` entity
3. ⬜ Tạo DTOs (Start, Update, Get)
4. ⬜ Tạo Repository Interface và Implementation
5. ⬜ Tạo Service với logic:
   - `startWorkflow()` - Bắt đầu workflow
   - `getCurrentWorkflow()` - Lấy workflow hiện tại
   - `updateWorkflow()` - Update thông tin workflow
6. ⬜ Tạo Controller với REST APIs
7. ⬜ Integrate vào AppModule
8. ⬜ Test APIs

**APIs**:
- `POST /api/v1/workflows/start` - Bắt đầu workflow
- `GET /api/v1/workflows/:id` - Get workflow by ID
- `GET /api/v1/workflows/service-request/:storedServiceReqId` - Get workflows của SR
- `PUT /api/v1/workflows/:id` - Update workflow info

---

### Phase 3: Module 3 - Workflow History

**Mục tiêu**: Tạo entity và APIs để lưu lịch sử workflow

**Tasks**:
1. ⬜ Tạo migration script cho `BML_WORKFLOW_HISTORY`
2. ⬜ Tạo `WorkflowHistory` entity
3. ⬜ Tạo DTOs (Create, Get, List)
4. ⬜ Tạo Repository Interface và Implementation
5. ⬜ Tạo Service với logic:
   - `recordHistory()` - Ghi lại hành động
   - `getWorkflowHistory()` - Lấy lịch sử
   - `getWorkflowTimeline()` - Lấy timeline
6. ⬜ Tạo Controller với REST APIs
7. ⬜ Integrate vào AppModule
8. ⬜ Test APIs

**APIs**:
- `GET /api/v1/workflows/:workflowId/history` - Get history của workflow
- `GET /api/v1/workflows/:workflowId/timeline` - Get timeline (formatted)

---

### Phase 4: Workflow State Transitions

**Mục tiêu**: Implement logic chuyển trạng thái

**Tasks**:
1. ⬜ Implement `moveToNextState()` - Chuyển sang trạng thái tiếp theo
2. ⬜ Implement `completeCurrentState()` - Hoàn thành trạng thái hiện tại
3. ⬜ Implement `skipState()` - Bỏ qua trạng thái
4. ⬜ Implement `rollbackState()` - Quay lại trạng thái trước
5. ⬜ Implement `pauseWorkflow()` - Tạm dừng workflow
6. ⬜ Implement `resumeWorkflow()` - Tiếp tục workflow
7. ⬜ Validation logic:
   - Kiểm tra state transition hợp lệ
   - Kiểm tra user permissions
   - Kiểm tra required approvals
8. ⬜ Auto-update workflow và history

**APIs**:
- `PUT /api/v1/workflows/:id/next-state` - Chuyển sang trạng thái tiếp theo
- `PUT /api/v1/workflows/:id/complete-state` - Hoàn thành trạng thái hiện tại
- `PUT /api/v1/workflows/:id/skip-state` - Bỏ qua trạng thái
- `PUT /api/v1/workflows/:id/rollback` - Quay lại trạng thái trước
- `PUT /api/v1/workflows/:id/pause` - Tạm dừng
- `PUT /api/v1/workflows/:id/resume` - Tiếp tục

---

### Phase 5: Integration với Store API

**Mục tiêu**: Tự động tạo workflow khi store Service Request

**Tasks**:
1. ⬜ Update `StoredServiceRequestService.storeServiceRequest()`:
   - Sau khi save SR thành công
   - Tự động gọi `WorkflowService.startWorkflow()`
   - Tạo workflow cho toàn bộ SR hoặc từng service
2. ⬜ Test integration

---

### Phase 6: Advanced Features

**Mục tiêu**: Tính năng nâng cao

**Tasks**:
1. ⬜ Dashboard APIs:
   - Get workflows by state
   - Get workflows by user
   - Get workflows by department
   - Statistics (số lượng workflow theo state, thời gian trung bình...)
2. ⬜ Notifications:
   - Thông báo khi workflow chuyển state
   - Thông báo khi workflow bị stuck
3. ⬜ Reporting:
   - Export workflow report
   - Export timeline report
4. ⬜ Optimization:
   - Cache workflow states
   - Optimize queries

---

## 📝 Entity Details

### 1. WorkflowState Entity

```typescript
import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('BML_WORKFLOW_STATES')
@Index('IDX_WF_STATES_CODE', ['stateCode'])
@Index('IDX_WF_STATES_ORDER', ['stateOrder'])
export class WorkflowState extends BaseEntity {
    @Column({ name: 'STATE_CODE', type: 'varchar2', length: 50, unique: true })
    stateCode: string;

    @Column({ name: 'STATE_NAME', type: 'varchar2', length: 200 })
    stateName: string;

    @Column({ name: 'STATE_DESCRIPTION', type: 'varchar2', length: 1000, nullable: true })
    stateDescription?: string;

    @Column({ name: 'STATE_ORDER', type: 'number' })
    stateOrder: number;

    @Column({ name: 'CAN_SKIP', type: 'number', default: 0 })
    canSkip: number; // 0 = không thể bỏ qua, 1 = có thể bỏ qua

    @Column({ name: 'REQUIRES_APPROVAL', type: 'number', default: 0 })
    requiresApproval: number; // 0 = không cần phê duyệt, 1 = cần phê duyệt

    @Column({ name: 'IS_ACTIVE', type: 'number', default: 1 })
    isActive: number;

    // Business methods
    canBeSkipped(): boolean {
        return this.canSkip === 1;
    }

    needsApproval(): boolean {
        return this.requiresApproval === 1;
    }

    isStateActive(): boolean {
        return this.isActive === 1 && !this.deletedAt;
    }
}
```

### 2. StoredServiceRequestWorkflow Entity

```typescript
import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { StoredServiceRequest } from '../../service-request/entities/stored-service-request.entity';
import { StoredServiceRequestService } from '../../service-request/entities/stored-service-request-service.entity';
import { WorkflowState } from './workflow-state.entity';
import { WorkflowHistory } from './workflow-history.entity';

@Entity('BML_STORED_SERVICE_REQ_WORKFLOW')
@Index('IDX_SSR_WF_REQ', ['storedServiceRequestId'])
@Index('IDX_SSR_WF_SERVICE', ['storedServiceId'])
export class StoredServiceRequestWorkflow extends BaseEntity {
    @Column({ name: 'STORED_SERVICE_REQ_ID', type: 'varchar2', length: 36 })
    storedServiceRequestId: string;

    @Column({ name: 'STORED_SERVICE_ID', type: 'varchar2', length: 36, nullable: true })
    storedServiceId?: string | null;

    @Column({ name: 'CURRENT_STATE_ID', type: 'varchar2', length: 36 })
    currentStateId: string;

    @Column({ name: 'PREVIOUS_STATE_ID', type: 'varchar2', length: 36, nullable: true })
    previousStateId?: string | null;

    @Column({ name: 'STARTED_AT', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    startedAt: Date;

    @Column({ name: 'CURRENT_STATE_STARTED_AT', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    currentStateStartedAt: Date;

    @Column({ name: 'COMPLETED_AT', type: 'timestamp', nullable: true })
    completedAt?: Date | null;

    @Column({ name: 'ESTIMATED_COMPLETION_TIME', type: 'timestamp', nullable: true })
    estimatedCompletionTime?: Date | null;

    @Column({ name: 'CURRENT_USER_ID', type: 'varchar2', length: 36, nullable: true })
    currentUserId?: string | null;

    @Column({ name: 'CURRENT_DEPARTMENT_ID', type: 'varchar2', length: 36, nullable: true })
    currentDepartmentId?: string | null;

    @Column({ name: 'CURRENT_ROOM_ID', type: 'varchar2', length: 36, nullable: true })
    currentRoomId?: string | null;

    @Column({ name: 'NOTES', type: 'varchar2', length: 1000, nullable: true })
    notes?: string | null;

    @Column({ name: 'IS_ACTIVE', type: 'number', default: 1 })
    isActive: number;

    @Column({ name: 'IS_COMPLETED', type: 'number', default: 0 })
    isCompleted: number;

    @ManyToOne(() => StoredServiceRequest)
    @JoinColumn({ name: 'STORED_SERVICE_REQ_ID' })
    storedServiceRequest: StoredServiceRequest;

    @ManyToOne(() => StoredServiceRequestService, { nullable: true })
    @JoinColumn({ name: 'STORED_SERVICE_ID' })
    storedService?: StoredServiceRequestService | null;

    @ManyToOne(() => WorkflowState)
    @JoinColumn({ name: 'CURRENT_STATE_ID' })
    currentState: WorkflowState;

    @ManyToOne(() => WorkflowState, { nullable: true })
    @JoinColumn({ name: 'PREVIOUS_STATE_ID' })
    previousState?: WorkflowState | null;

    @OneToMany(() => WorkflowHistory, history => history.workflow)
    history: WorkflowHistory[];

    // Business methods
    isWorkflowCompleted(): boolean {
        return this.isCompleted === 1;
    }

    getDurationMinutes(): number {
        if (this.completedAt) {
            return Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / 60000);
        }
        return Math.floor((Date.now() - this.startedAt.getTime()) / 60000);
    }

    getCurrentStateDurationMinutes(): number {
        return Math.floor((Date.now() - this.currentStateStartedAt.getTime()) / 60000);
    }
}
```

### 3. WorkflowHistory Entity

```typescript
import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { StoredServiceRequestWorkflow } from './stored-service-req-workflow.entity';
import { WorkflowState } from './workflow-state.entity';

@Entity('BML_WORKFLOW_HISTORY')
@Index('IDX_WF_HISTORY_WORKFLOW', ['workflowId'])
@Index('IDX_WF_HISTORY_REQ', ['storedServiceRequestId'])
export class WorkflowHistory extends BaseEntity {
    @Column({ name: 'WORKFLOW_ID', type: 'varchar2', length: 36 })
    workflowId: string;

    @Column({ name: 'STORED_SERVICE_REQ_ID', type: 'varchar2', length: 36 })
    storedServiceRequestId: string;

    @Column({ name: 'STORED_SERVICE_ID', type: 'varchar2', length: 36, nullable: true })
    storedServiceId?: string | null;

    @Column({ name: 'FROM_STATE_ID', type: 'varchar2', length: 36, nullable: true })
    fromStateId?: string | null;

    @Column({ name: 'TO_STATE_ID', type: 'varchar2', length: 36 })
    toStateId: string;

    @Column({ name: 'ACTION_TYPE', type: 'varchar2', length: 50 })
    actionType: string; // 'START', 'COMPLETE', 'SKIP', 'ROLLBACK', 'PAUSE', 'RESUME'

    @Column({ name: 'ACTION_USER_ID', type: 'varchar2', length: 36 })
    actionUserId: string;

    @Column({ name: 'ACTION_USERNAME', type: 'varchar2', length: 50 })
    actionUsername: string;

    @Column({ name: 'ACTION_DEPARTMENT_ID', type: 'varchar2', length: 36, nullable: true })
    actionDepartmentId?: string | null;

    @Column({ name: 'ACTION_ROOM_ID', type: 'varchar2', length: 36, nullable: true })
    actionRoomId?: string | null;

    @Column({ name: 'ACTION_TIMESTAMP', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    actionTimestamp: Date;

    @Column({ name: 'DURATION_MINUTES', type: 'number', nullable: true })
    durationMinutes?: number | null;

    @Column({ name: 'NOTES', type: 'varchar2', length: 1000, nullable: true })
    notes?: string | null;

    @Column({ name: 'ATTACHMENT_URL', type: 'varchar2', length: 500, nullable: true })
    attachmentUrl?: string | null;

    @Column({ name: 'METADATA', type: 'clob', nullable: true })
    metadata?: string | null;

    @ManyToOne(() => StoredServiceRequestWorkflow, workflow => workflow.history)
    @JoinColumn({ name: 'WORKFLOW_ID' })
    workflow: StoredServiceRequestWorkflow;

    @ManyToOne(() => WorkflowState, { nullable: true })
    @JoinColumn({ name: 'FROM_STATE_ID' })
    fromState?: WorkflowState | null;

    @ManyToOne(() => WorkflowState)
    @JoinColumn({ name: 'TO_STATE_ID' })
    toState: WorkflowState;
}
```

---

## 📡 API Endpoints (Chi tiết)

### Module 1 APIs: Workflow States

#### GET `/api/v1/workflow-states`
Lấy danh sách tất cả workflow states

**Query Parameters**:
- `limit`: Số lượng (default: 10)
- `offset`: Vị trí bắt đầu (default: 0)
- `isActive`: Lọc theo trạng thái active (0/1)
- `search`: Tìm kiếm theo tên/mã

**Response**:
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "items": [
      {
        "id": "uuid",
        "stateCode": "SAMPLE_COLLECTION",
        "stateName": "Lấy mẫu",
        "stateDescription": "Bước lấy mẫu từ bệnh nhân",
        "stateOrder": 1,
        "canSkip": 0,
        "requiresApproval": 0,
        "isActive": 1
      }
    ],
    "total": 7,
    "limit": 10,
    "offset": 0
  }
}
```

#### POST `/api/v1/workflow-states`
Tạo workflow state mới

**Request**:
```json
{
  "stateCode": "NEW_STATE",
  "stateName": "Trạng thái mới",
  "stateDescription": "Mô tả",
  "stateOrder": 8,
  "canSkip": 0,
  "requiresApproval": 0
}
```

---

### Module 2 APIs: Workflow Management

#### POST `/api/v1/workflows/start`
Bắt đầu workflow cho Service Request

**Request**:
```json
{
  "storedServiceRequestId": "uuid",
  "storedServiceId": "uuid", // Optional: nếu chỉ áp dụng cho service cụ thể
  "initialStateCode": "SAMPLE_COLLECTION", // Optional, default = state đầu tiên
  "notes": "Bắt đầu quy trình lấy mẫu"
}
```

**Response**:
```json
{
  "success": true,
  "status_code": 201,
  "data": {
    "id": "uuid",
    "storedServiceRequestId": "uuid",
    "storedServiceId": null,
    "currentState": {
      "id": "uuid",
      "stateCode": "SAMPLE_COLLECTION",
      "stateName": "Lấy mẫu",
      "stateOrder": 1
    },
    "startedAt": "2025-10-31T10:00:00Z",
    "isCompleted": false
  }
}
```

#### GET `/api/v1/workflows/:id`
Lấy thông tin workflow hiện tại

**Response**:
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "uuid",
    "storedServiceRequestId": "uuid",
    "storedServiceId": null,
    "currentState": {
      "id": "uuid",
      "stateCode": "SAMPLE_HANDOVER",
      "stateName": "Bàn giao mẫu",
      "stateOrder": 2
    },
    "previousState": {
      "id": "uuid",
      "stateCode": "SAMPLE_COLLECTION",
      "stateName": "Lấy mẫu",
      "stateOrder": 1
    },
    "startedAt": "2025-10-31T10:00:00Z",
    "currentStateStartedAt": "2025-10-31T10:30:00Z",
    "durationMinutes": 45,
    "currentStateDurationMinutes": 15,
    "isCompleted": false,
    "currentUser": {
      "id": "uuid",
      "username": "user1"
    }
  }
}
```

---

### Module 3 APIs: State Transitions

#### PUT `/api/v1/workflows/:id/next-state`
Chuyển sang trạng thái tiếp theo

**Request**:
```json
{
  "nextStateCode": "SAMPLE_HANDOVER",
  "notes": "Đã lấy mẫu xong, chuyển đến bàn giao",
  "departmentId": "uuid",
  "roomId": "uuid"
}
```

#### PUT `/api/v1/workflows/:id/complete-state`
Hoàn thành trạng thái hiện tại (tự động chuyển sang trạng thái tiếp theo)

**Request**:
```json
{
  "notes": "Hoàn thành lấy mẫu",
  "resultText": "Kết quả chi tiết...", // Optional: nếu cần update result_text
  "attachmentUrl": "https://...",
  "departmentId": "uuid",
  "roomId": "uuid"
}
```

#### PUT `/api/v1/workflows/:id/skip-state`
Bỏ qua trạng thái hiện tại

**Request**:
```json
{
  "notes": "Bỏ qua bước này do...",
  "nextStateCode": "MACHINE_RUNNING"
}
```

#### PUT `/api/v1/workflows/:id/rollback`
Quay lại trạng thái trước

**Request**:
```json
{
  "targetStateCode": "SAMPLE_COLLECTION",
  "notes": "Quay lại để lấy mẫu lại"
}
```

---

### Module 3 APIs: History & Timeline

#### GET `/api/v1/workflows/:id/history`
Lấy lịch sử chi tiết của workflow

**Response**:
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "items": [
      {
        "id": "uuid",
        "fromState": null,
        "toState": {
          "id": "uuid",
          "stateCode": "SAMPLE_COLLECTION",
          "stateName": "Lấy mẫu"
        },
        "actionType": "START",
        "actionTimestamp": "2025-10-31T10:00:00Z",
        "actionUser": {
          "id": "uuid",
          "username": "user1"
        },
        "durationMinutes": null,
        "notes": "Bắt đầu workflow"
      },
      {
        "id": "uuid",
        "fromState": {
          "id": "uuid",
          "stateCode": "SAMPLE_COLLECTION",
          "stateName": "Lấy mẫu"
        },
        "toState": {
          "id": "uuid",
          "stateCode": "SAMPLE_HANDOVER",
          "stateName": "Bàn giao mẫu"
        },
        "actionType": "COMPLETE",
        "actionTimestamp": "2025-10-31T10:30:00Z",
        "actionUser": {
          "id": "uuid",
          "username": "user1"
        },
        "durationMinutes": 30,
        "notes": "Hoàn thành lấy mẫu"
      }
    ],
    "total": 2
  }
}
```

#### GET `/api/v1/workflows/:id/timeline`
Lấy timeline (formatted cho UI)

**Response**:
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "timeline": [
      {
        "step": 1,
        "stateCode": "SAMPLE_COLLECTION",
        "stateName": "Lấy mẫu",
        "startedAt": "2025-10-31T10:00:00Z",
        "completedAt": "2025-10-31T10:30:00Z",
        "durationMinutes": 30,
        "status": "completed",
        "user": {
          "id": "uuid",
          "username": "user1"
        },
        "notes": "Đã lấy mẫu thành công"
      },
      {
        "step": 2,
        "stateCode": "SAMPLE_HANDOVER",
        "stateName": "Bàn giao mẫu",
        "startedAt": "2025-10-31T10:30:00Z",
        "completedAt": null,
        "durationMinutes": 15,
        "status": "in_progress",
        "user": {
          "id": "uuid",
          "username": "user2"
        },
        "notes": "Đang bàn giao..."
      }
    ]
  }
}
```

---

## 🔄 Workflow Logic Flow

### Khi start workflow:
1. Tạo record trong `BML_STORED_SERVICE_REQ_WORKFLOW`
2. Set `CURRENT_STATE_ID` = state đầu tiên
3. Tạo history record với `ACTION_TYPE = 'START'`

### Khi chuyển trạng thái:
1. Validate state transition hợp lệ
2. Tính `DURATION_MINUTES` của state hiện tại
3. Tạo history record với `ACTION_TYPE = 'COMPLETE'`
4. Update workflow:
   - `PREVIOUS_STATE_ID` = `CURRENT_STATE_ID`
   - `CURRENT_STATE_ID` = next state
   - `CURRENT_STATE_STARTED_AT` = now
5. Nếu đến state cuối → set `IS_COMPLETED = 1`

### Khi skip state:
1. Validate state có thể skip (`CAN_SKIP = 1`)
2. Tạo history record với `ACTION_TYPE = 'SKIP'`
3. Update workflow như trên

### Khi rollback:
1. Validate có thể rollback (không được rollback quá xa)
2. Tạo history record với `ACTION_TYPE = 'ROLLBACK'`
3. Update workflow về state trước

---

## ✅ Checklist Triển Khai

### Phase 1: Workflow States (Module 1)
- [ ] Tạo migration script `XXX_create_bml_workflow_states.sql`
- [ ] Tạo `WorkflowState` entity
- [ ] Tạo DTOs (Create, Update, Get, List)
- [ ] Tạo Repository Interface và Implementation
- [ ] Tạo Service với CRUD operations
- [ ] Tạo Controller với REST APIs
- [ ] Tạo Module và integrate vào AppModule
- [ ] Insert sample data (7 states)
- [ ] Test APIs

### Phase 2: Workflow Current State (Module 2)
- [ ] Tạo migration script `XXX_create_bml_stored_service_req_workflow.sql`
- [ ] Tạo `StoredServiceRequestWorkflow` entity
- [ ] Tạo DTOs (Start, Update, Get)
- [ ] Tạo Repository Interface và Implementation
- [ ] Tạo Service với logic start/update/get
- [ ] Tạo Controller với REST APIs
- [ ] Integrate vào AppModule
- [ ] Test APIs

### Phase 3: Workflow History (Module 3)
- [ ] Tạo migration script `XXX_create_bml_workflow_history.sql`
- [ ] Tạo `WorkflowHistory` entity
- [ ] Tạo DTOs (Create, Get, List)
- [ ] Tạo Repository Interface và Implementation
- [ ] Tạo Service với logic record/get history
- [ ] Tạo Controller với REST APIs
- [ ] Integrate vào AppModule
- [ ] Test APIs

### Phase 4: State Transitions
- [ ] Implement `moveToNextState()`
- [ ] Implement `completeCurrentState()`
- [ ] Implement `skipState()`
- [ ] Implement `rollbackState()`
- [ ] Implement `pauseWorkflow()` / `resumeWorkflow()`
- [ ] Validation logic
- [ ] Test state transitions

### Phase 5: Integration
- [ ] Update `StoredServiceRequestService` để auto-start workflow
- [ ] Test integration

---

## 📝 Notes

1. **Workflow States** là Master Data, ít thay đổi, nên cache được
2. **Workflow Current State** là snapshot, query nhanh để biết trạng thái hiện tại
3. **Workflow History** là audit trail, chỉ append, không update/delete
4. Có thể có nhiều workflows cho 1 Service Request nếu áp dụng cho từng service riêng
5. Cascade delete: xóa Service Request → tự động xóa workflows và history
6. Field `DURATION_MINUTES` chỉ có khi `ACTION_TYPE = 'COMPLETE'`
7. Field `FROM_STATE_ID` là NULL khi `ACTION_TYPE = 'START'`

