# Tích Hợp Tự Động Start Workflow Vào Module Save Service Request

## 📋 Tổng Quan

Khi lưu Service Request thành công, hệ thống sẽ **tự động khởi tạo workflow** bắt đầu từ trạng thái đầu tiên (SAMPLE_COLLECTION) mà không cần client gọi thêm API.

## 🔄 Flow Xử Lý Chi Tiết

```
┌─────────────────────────────────────────────────────────────┐
│ POST /api/v1/service-requests/store                        │
│ Request: {                                                  │
│   serviceReqCode: "000055537395",  // ← CHỈ CẦN MÃ         │
│   saveRawJson: false                                        │
│ }                                                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Validate Request                                    │
│    - Kiểm tra serviceReqCode không rỗng                    │
│    - Validate JWT token (currentUser)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Kiểm tra đã tồn tại chưa                           │
│    - Query: SELECT * FROM BML_STORED_SERVICE_REQUESTS      │
│            WHERE SERVICE_REQ_CODE = "000055537395"           │
│    - Nếu tồn tại → throw ConflictException                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Lấy dữ liệu từ HIS (Internal API Call)             │
│    serviceRequestService.getServiceRequestByCode({         │
│      serviceReqCode: "000055537395"                         │
│    })                                                       │
│    → enrichedData: ServiceRequestResponseDto {              │
│         id: 55537570,                                       │
│         serviceReqCode: "000055537395",                     │
│         executeDepartment: {                                │
│           lisDepartmentId: "uuid-dept-001" // ← DỮ LIỆU   │
│         },                                                  │
│         executeRoom: {                                      │
│           lisRoomId: "uuid-room-001" // ← DỮ LIỆU          │
│         },                                                  │
│         services: [...],                                    │
│         ...                                                 │
│       }                                                     │
│    ✅ ĐÂY LÀ NGUỒN DỮ LIỆU CHÍNH ĐỂ START WORKFLOW        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Lưu Service Request (TRONG TRANSACTION)            │
│    - Lưu vào BML_STORED_SERVICE_REQUESTS                   │
│    - Lưu services và tests vào BML_STORED_SERVICE_REQ_     │
│      SERVICES                                               │
│    → savedRequest.id = "uuid-sr-001" // ← CẦN CHO WORKFLOW │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Tự Động Start Workflow (TRONG CÙNG TRANSACTION)   │
│                                                             │
│ 5.1. Query First Workflow State:                           │
│    workflowStateRepo.getFirstState()                       │
│    → Query: SELECT * FROM BML_WORKFLOW_STATES             │
│             WHERE IS_ACTIVE = 1                            │
│             ORDER BY STATE_ORDER ASC                       │
│             LIMIT 1                                         │
│    → firstState = {                                         │
│         id: "uuid-state-001", // ← CẦN CHO WORKFLOW        │
│         stateCode: "SAMPLE_COLLECTION",                    │
│         stateOrder: 1                                       │
│       }                                                     │
│                                                             │
│ 5.2. Tạo StartWorkflowDto từ các nguồn dữ liệu:           │
│    {                                                        │
│      storedServiceReqId: savedRequest.id,                  │
│                   // ↑ Từ Step 4                            │
│      storedServiceId: null,                                │
│      toStateId: firstState.id,                             │
│               // ↑ Từ Step 5.1                             │
│      currentUserId: currentUser.id,                        │
│                   // ↑ Từ JWT token                        │
│      currentDepartmentId: enrichedData.executeDepartment  │
│                             .lisDepartmentId,              │
│                   // ↑ Từ Step 3                           │
│      currentRoomId: enrichedData.executeRoom.lisRoomId,    │
│                   // ↑ Từ Step 3                           │
│      notes: "Workflow tự động bắt đầu..."                  │
│    }                                                        │
│                                                             │
│ 5.3. Gọi workflowHistoryService.startWorkflow()            │
│    → Tạo record trong BML_WORKFLOW_HISTORY với            │
│       IS_CURRENT = 1, TO_STATE_ID = firstState.id          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 6: Commit Transaction                                 │
│    - Nếu tất cả thành công → COMMIT                        │
│    - Nếu có lỗi → ROLLBACK                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 7: Response                                            │
│    {                                                        │
│      id: "uuid-sr-001",                                    │
│      serviceReqCode: "000055537395",                       │
│      servicesCount: 14,                                    │
│      storedAt: "2025-11-01T10:30:00Z",                    │
│      workflowStarted: true  // ← true = workflow đã start  │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Mapping Data Sources cho Start Workflow

### Nguồn Dữ Liệu Đầy Đủ:

| Field trong StartWorkflowDto | Nguồn Dữ Liệu | Cách Lấy |
|------------------------------|---------------|----------|
| `storedServiceReqId` | ✅ **Từ Step 4** | `savedRequest.id` (UUID vừa lưu) |
| `storedServiceId` | ✅ **NULL** | `null` (áp dụng cho toàn bộ SR) |
| `toStateId` | ✅ **Từ Step 5.1** | `firstState.id` (query từ `BML_WORKFLOW_STATES`) |
| `currentUserId` | ✅ **Từ JWT Token** | `currentUser.id` (có sẵn trong controller) |
| `currentDepartmentId` | ✅ **Từ Step 3** | `enrichedData.executeDepartment.lisDepartmentId` |
| `currentRoomId` | ✅ **Từ Step 3** | `enrichedData.executeRoom.lisRoomId` |
| `notes` | ✅ **Auto-generated** | String template |
| `estimatedCompletionTime` | ❌ **Optional** | Có thể bỏ qua hoặc tính toán sau |

### ✅ KẾT LUẬN: ĐỦ DỮ LIỆU!

**Với request chỉ có `serviceReqCode`:**
1. ✅ Module tự động gọi `getServiceRequestByCode()` → có `enrichedData` (chứa department/room IDs)
2. ✅ Module tự động lưu Service Request → có `savedRequest.id`
3. ✅ Module tự động query first workflow state → có `firstState.id`
4. ✅ Module có sẵn `currentUser` từ JWT token → có `currentUser.id`

**→ TẤT CẢ THÔNG TIN CẦN THIẾT ĐỀU CÓ SẴN!**

## 🔧 Implementation

### 1. Update ServiceRequestModule

**File:** `src/modules/service-request/service-request.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequestService } from './services/service-request.service';
import { ServiceRequestController } from './controllers/service-request.controller';
import { ServiceRequestView } from './entities/service-request-view.entity';
import { ServiceRequestRepository } from './repositories/service-request.repository';
import { HisDatabaseModule } from '../his-database/his-database.module';
import { Department } from '../department/entities/department.entity';
import { Room } from '../room/entities/room.entity';
import { Patient } from '../patient/entities/patient.entity';
import { Province } from '../province/entities/province.entity';
import { Ward } from '../ward/entities/ward.entity';
import { Service } from '../service/entities/service.entity';
import { UnitOfMeasureModule } from '../unit-of-measure/unit-of-measure.module';
import { WorkflowHistoryModule } from '../workflow/workflow-history/workflow-history.module'; // ← Thêm
import { WorkflowModule } from '../workflow/workflow.module'; // ← Thêm

@Module({
    imports: [
        HisDatabaseModule,
        UnitOfMeasureModule,
        WorkflowHistoryModule, // ← Import để inject WorkflowHistoryService
        WorkflowModule, // ← Import để inject IWorkflowStateRepository
        TypeOrmModule.forFeature(
            [ServiceRequestView],
            'hisConnection'
        ),
        TypeOrmModule.forFeature([Department, Room, Patient, Province, Ward, Service]),
    ],
    controllers: [ServiceRequestController],
    providers: [
        ServiceRequestService,
        {
            provide: 'IServiceRequestRepository',
            useClass: ServiceRequestRepository,
        },
    ],
    exports: [ServiceRequestService],
})
export class ServiceRequestModule { }
```

### 2. Update StoredServiceRequestService

**File:** `src/modules/service-request/services/stored-service-request.service.ts`

```typescript
import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IStoredServiceRequestRepository } from '../interfaces/stored-service-request.repository.interface';
import { ServiceRequestService } from './service-request.service';
import { StoreServiceRequestDto } from '../dto/commands/store-service-request.dto';
import { StoredServiceRequestResponseDto } from '../dto/responses/stored-service-request-response.dto';
import { CurrentUser } from '../../../common/interfaces/current-user.interface';
import { WorkflowHistoryService } from '../../workflow/workflow-history/services/workflow-history.service'; // ← Thêm
import { IWorkflowStateRepository } from '../../workflow/interfaces/workflow-state.repository.interface'; // ← Thêm
import { StartWorkflowDto } from '../../workflow/workflow-history/dto/commands/start-workflow.dto'; // ← Thêm

@Injectable()
export class StoredServiceRequestService {
    constructor(
        @Inject('IStoredServiceRequestRepository')
        private readonly storedRepo: IStoredServiceRequestRepository,
        private readonly serviceRequestService: ServiceRequestService,
        private readonly workflowHistoryService: WorkflowHistoryService, // ← Inject
        @Inject('IWorkflowStateRepository')
        private readonly workflowStateRepo: IWorkflowStateRepository, // ← Inject
        private readonly dataSource: DataSource,
    ) {}

    async storeServiceRequest(
        dto: StoreServiceRequestDto,
        currentUser: CurrentUser
    ): Promise<StoredServiceRequestResponseDto> {
        return this.dataSource.transaction(async (manager) => {
            // 1. Kiểm tra đã tồn tại chưa
            const existing = await this.storedRepo.findByServiceReqCode(dto.serviceReqCode);
            if (existing) {
                throw new ConflictException(
                    `Service Request ${dto.serviceReqCode} đã được lưu trữ`
                );
            }

            // 2. Lấy dữ liệu từ API service-requests/code
            const enrichedData = await this.serviceRequestService.getServiceRequestByCode({
                serviceReqCode: dto.serviceReqCode
            });

            // 3. Lưu StoredServiceRequest (đã có code từ trước)
            const savedRequest = await this.saveServiceRequest(enrichedData, dto, currentUser);

            // 4. Lưu Services và Tests (đã có code từ trước)
            const servicesCount = await this.saveServices(
                savedRequest.id,
                enrichedData.services,
                currentUser
            );

            // 5. TỰ ĐỘNG START WORKFLOW (Bước 1 của workflow = SAMPLE_COLLECTION)
            let workflowStarted = false;
            try {
                // 5.1. Lấy first workflow state (SAMPLE_COLLECTION - Bước 1)
                // Query: SELECT * FROM BML_WORKFLOW_STATES WHERE IS_ACTIVE = 1 ORDER BY STATE_ORDER ASC LIMIT 1
                const firstState = await this.workflowStateRepo.getFirstState();
                
                if (!firstState) {
                    console.warn('Không tìm thấy workflow state đầu tiên, bỏ qua auto-start workflow');
                } else {
                    // 5.2. Tạo StartWorkflowDto với đầy đủ thông tin từ enrichedData và currentUser
                    const startWorkflowDto: StartWorkflowDto = {
                        // ✅ Lấy từ savedRequest.id (vừa lưu xong)
                        storedServiceReqId: savedRequest.id,
                        
                        // ✅ NULL = áp dụng cho toàn bộ Service Request (không chỉ cho 1 service cụ thể)
                        storedServiceId: null,
                        
                        // ✅ Lấy từ firstState.id (query từ database)
                        toStateId: firstState.id,
                        
                        // ✅ Lấy từ currentUser.id (JWT token trong request)
                        currentUserId: currentUser.id,
                        
                        // ✅ Lấy từ enrichedData.executeDepartment.lisDepartmentId (đã enrich từ LIS)
                        // Nếu không có LIS mapping → null (vẫn start được workflow)
                        currentDepartmentId: enrichedData.executeDepartment.lisDepartmentId ?? null,
                        
                        // ✅ Lấy từ enrichedData.executeRoom.lisRoomId (đã enrich từ LIS)
                        // Nếu không có LIS mapping → null (vẫn start được workflow)
                        currentRoomId: enrichedData.executeRoom.lisRoomId ?? null,
                        
                        // ✅ Auto-generated notes
                        notes: `Workflow tự động bắt đầu khi lưu Service Request ${dto.serviceReqCode}`,
                    };

                    // 5.3. Start workflow (trong cùng transaction)
                    await this.workflowHistoryService.startWorkflow(startWorkflowDto, currentUser);
                    workflowStarted = true;
                }
            } catch (error) {
                // Log error nhưng không throw để không rollback toàn bộ transaction
                // Workflow có thể start sau bằng API riêng nếu cần
                console.error('Failed to auto-start workflow:', error);
                // Có thể thêm notification/logging ở đây
            }

            return {
                id: savedRequest.id,
                serviceReqCode: savedRequest.serviceReqCode,
                servicesCount,
                storedAt: savedRequest.storedAt,
                workflowStarted, // ← Thêm field mới
            };
        });
    }

    // ... các method khác (saveServiceRequest, saveServices, etc.)
}
```

### 3. Update Response DTO

**File:** `src/modules/service-request/dto/responses/stored-service-request-response.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class StoredServiceRequestResponseDto {
    @ApiProperty({ description: 'ID Service Request đã lưu' })
    id: string;

    @ApiProperty({ description: 'Mã Service Request' })
    serviceReqCode: string;

    @ApiProperty({ description: 'Số lượng services đã lưu' })
    servicesCount: number;

    @ApiProperty({ description: 'Thời gian lưu' })
    storedAt: Date;

    @ApiProperty({ description: 'Workflow đã được tự động khởi tạo', default: false })
    workflowStarted: boolean; // ← Thêm field mới
}
```

## 📝 Notes

1. **Transaction Scope**: Workflow start nằm trong cùng transaction với store service request
   - Nếu workflow start fail → toàn bộ transaction rollback
   - Hoặc có thể catch error và chỉ log (tùy business logic)

2. **Error Handling**: 
   - Option 1: Throw error → rollback toàn bộ (an toàn hơn)
   - Option 2: Catch error → log và tiếp tục (linh hoạt hơn, workflow có thể start sau)

3. **Workflow State**: 
   - Luôn start từ first state (SAMPLE_COLLECTION)
   - `getFirstState()` query theo `stateOrder ASC` và `isActive = 1`

4. **Department/Room Mapping**:
   - Sử dụng `lisDepartmentId` và `lisRoomId` từ enriched data
   - Nếu không có → truyền `null` (workflow vẫn start được)

5. **Optional Auto-Start**:
   - Có thể thêm flag `autoStartWorkflow?: boolean` trong DTO để cho phép bật/tắt tính năng này

## ✅ Checklist

- [ ] Update `ServiceRequestModule` - Import `WorkflowHistoryModule` và `WorkflowModule`
- [ ] Update `StoredServiceRequestService` - Inject `WorkflowHistoryService` và `IWorkflowStateRepository`
- [ ] Thêm logic auto-start workflow trong `storeServiceRequest()`
- [ ] Update `StoredServiceRequestResponseDto` - Thêm field `workflowStarted`
- [ ] Test với transaction rollback khi workflow start fail
- [ ] Test với workflow start success
- [ ] Update Swagger documentation

