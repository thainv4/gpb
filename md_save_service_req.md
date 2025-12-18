# Triển Khai API Store Service Request

## 📋 Tổng Quan

API này cho phép lưu trữ dữ liệu được trả về từ API `GET /api/v1/service-requests/code/{serviceReqCode}` vào database LIS. Dữ liệu bao gồm toàn bộ thông tin Service Request đã được enrich với dữ liệu từ LIS (mapping services, departments, rooms, patients, etc.)

## 🗄️ Database Schema

### 1. Bảng `BML_STORED_SERVICE_REQUESTS`

Lưu thông tin Service Request chính:

```sql
CREATE TABLE BML_STORED_SERVICE_REQUESTS (
    ID VARCHAR2(36) PRIMARY KEY DEFAULT SYS_GUID(),
    
    -- Reference to HIS
    HIS_SERVICE_REQ_CODE VARCHAR2(50) NOT NULL,
    HIS_SERVICE_REQ_ID NUMBER,
    
    -- Service Request Info
    SERVICE_REQ_CODE VARCHAR2(50) NOT NULL,
    SERVICE_REQ_STT_ID NUMBER,
    SERVICE_REQ_STT_CODE VARCHAR2(10),
    SERVICE_REQ_TYPE_ID NUMBER,
    SERVICE_REQ_TYPE_CODE VARCHAR2(10),
    INSTRUCTION_TIME NUMBER,
    INSTRUCTION_DATE NUMBER,
    ICD_CODE VARCHAR2(20),
    ICD_NAME VARCHAR2(500),
    ICD_SUB_CODE VARCHAR2(20),
    ICD_TEXT VARCHAR2(1000),
    TREATMENT_ID NUMBER,
    TREATMENT_CODE VARCHAR2(50),
    NOTE VARCHAR2(1000),
    
    -- Request Location
    REQUEST_ROOM_ID NUMBER,
    REQUEST_ROOM_CODE VARCHAR2(50),
    REQUEST_ROOM_NAME VARCHAR2(200),
    REQUEST_ROOM_LIS_ID VARCHAR2(36),
    REQUEST_DEPARTMENT_ID NUMBER,
    REQUEST_DEPARTMENT_CODE VARCHAR2(50),
    REQUEST_DEPARTMENT_NAME VARCHAR2(200),
    REQUEST_DEPARTMENT_LIS_ID VARCHAR2(36),
    
    -- Execute Location
    EXECUTE_ROOM_ID NUMBER,
    EXECUTE_ROOM_CODE VARCHAR2(50),
    EXECUTE_ROOM_NAME VARCHAR2(200),
    EXECUTE_ROOM_LIS_ID VARCHAR2(36),
    EXECUTE_DEPARTMENT_ID NUMBER,
    EXECUTE_DEPARTMENT_CODE VARCHAR2(50),
    EXECUTE_DEPARTMENT_NAME VARCHAR2(200),
    EXECUTE_DEPARTMENT_LIS_ID VARCHAR2(36),
    
    -- Patient Info
    PATIENT_ID NUMBER,
    PATIENT_CODE VARCHAR2(50),
    PATIENT_NAME VARCHAR2(200),
    PATIENT_DOB NUMBER,
    PATIENT_CMND_NUMBER VARCHAR2(20),
    PATIENT_CMND_DATE NUMBER,
    PATIENT_CMND_PLACE VARCHAR2(200),
    PATIENT_MOBILE VARCHAR2(20),
    PATIENT_PHONE VARCHAR2(20),
    PATIENT_PROVINCE_CODE VARCHAR2(10),
    PATIENT_PROVINCE_NAME VARCHAR2(200),
    PATIENT_PROVINCE_LIS_ID VARCHAR2(36),
    PATIENT_COMMUNE_CODE VARCHAR2(20),
    PATIENT_COMMUNE_NAME VARCHAR2(200),
    PATIENT_COMMUNE_LIS_ID VARCHAR2(36),
    PATIENT_ADDRESS VARCHAR2(500),
    PATIENT_GENDER_ID NUMBER,
    PATIENT_GENDER_NAME VARCHAR2(50),
    PATIENT_CAREER_NAME VARCHAR2(200),
    PATIENT_LIS_ID VARCHAR2(36),
    
    -- Metadata
    RAW_RESPONSE_JSON CLOB, -- Lưu toàn bộ JSON response (optional)
    STORED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    STORED_BY VARCHAR2(50),
    
    -- Base Entity fields
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DELETED_AT TIMESTAMP NULL,
    CREATED_BY VARCHAR2(50),
    UPDATED_BY VARCHAR2(50),
    VERSION NUMBER DEFAULT 1,
    
    CONSTRAINT UK_STORED_SR_CODE UNIQUE (SERVICE_REQ_CODE)
);

-- Indexes
CREATE INDEX IDX_SSR_CODE ON BML_STORED_SERVICE_REQUESTS(SERVICE_REQ_CODE);
CREATE INDEX IDX_SSR_HIS_CODE ON BML_STORED_SERVICE_REQUESTS(HIS_SERVICE_REQ_CODE);
CREATE INDEX IDX_SSR_STORED_AT ON BML_STORED_SERVICE_REQUESTS(STORED_AT);
CREATE INDEX IDX_SSR_PATIENT_CODE ON BML_STORED_SERVICE_REQUESTS(PATIENT_CODE);
```

### 2. Bảng `BML_STORED_SERVICE_REQ_SERVICES`

Lưu cả parent services và child tests trong một bảng (quan hệ cha-con):

```sql
CREATE TABLE BML_STORED_SERVICE_REQ_SERVICES (
    ID VARCHAR2(36) PRIMARY KEY DEFAULT SYS_GUID(),
    
    -- Reference to Service Request
    STORED_SERVICE_REQ_ID VARCHAR2(36) NOT NULL,
    
    -- Parent Service Reference (NULL nếu là parent, NOT NULL nếu là child/test)
    PARENT_SERVICE_ID VARCHAR2(36),
    
    -- HIS Service Info
    HIS_SERE_SERV_ID NUMBER,
    SERVICE_ID NUMBER,
    SERVICE_CODE VARCHAR2(50),
    SERVICE_NAME VARCHAR2(200),
    PRICE NUMBER(15,2),
    
    -- LIS Service Info
    LIS_SERVICE_ID VARCHAR2(36),
    UNIT_OF_MEASURE_ID VARCHAR2(36),
    UNIT_OF_MEASURE_CODE VARCHAR2(50),
    UNIT_OF_MEASURE_NAME VARCHAR2(200),
    
    -- Additional fields
    RANGE_TEXT VARCHAR2(500),
    RANGE_LOW NUMBER(15,2),
    RANGE_HIGH NUMBER(15,2),
    MAPPING CLOB,
    TEST_ORDER NUMBER,
    SHORT_NAME VARCHAR2(100),
    DESCRIPTION CLOB,
    
    -- Result Text (kết quả xét nghiệm dạng text, 3-5 trang A4)
    RESULT_TEXT CLOB, -- ~7500-15000 ký tự
    
    -- Child-specific fields (chỉ có giá trị khi PARENT_SERVICE_ID IS NOT NULL)
    TEST_ID VARCHAR2(36),
    IS_ACTIVE NUMBER(1),
    TEST_CREATED_AT TIMESTAMP,
    TEST_UPDATED_AT TIMESTAMP,
    TEST_CREATED_BY VARCHAR2(50),
    TEST_UPDATED_BY VARCHAR2(50),
    TEST_VERSION NUMBER,
    
    -- Service Type Flag
    IS_CHILD_SERVICE NUMBER(1) DEFAULT 0, -- 0 = parent, 1 = child
    
    -- Base Entity fields
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DELETED_AT TIMESTAMP NULL,
    CREATED_BY VARCHAR2(50),
    UPDATED_BY VARCHAR2(50),
    VERSION NUMBER DEFAULT 1,
    
    CONSTRAINT FK_SSR_SERVICES_REQ FOREIGN KEY (STORED_SERVICE_REQ_ID) 
        REFERENCES BML_STORED_SERVICE_REQUESTS(ID) ON DELETE CASCADE,
    CONSTRAINT FK_SSR_SERVICES_PARENT FOREIGN KEY (PARENT_SERVICE_ID) 
        REFERENCES BML_STORED_SERVICE_REQ_SERVICES(ID) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IDX_SSR_SERVICES_REQ ON BML_STORED_SERVICE_REQ_SERVICES(STORED_SERVICE_REQ_ID);
CREATE INDEX IDX_SSR_SERVICES_PARENT ON BML_STORED_SERVICE_REQ_SERVICES(PARENT_SERVICE_ID);
CREATE INDEX IDX_SSR_SERVICES_IS_CHILD ON BML_STORED_SERVICE_REQ_SERVICES(IS_CHILD_SERVICE);
CREATE INDEX IDX_SSR_SERVICES_CODE ON BML_STORED_SERVICE_REQ_SERVICES(SERVICE_CODE);
CREATE INDEX IDX_SSR_SERVICES_LIS_ID ON BML_STORED_SERVICE_REQ_SERVICES(LIS_SERVICE_ID);
```

## 📁 Cấu Trúc Folder

```
src/modules/service-request/
├── entities/
│   ├── stored-service-request.entity.ts          # Entity cho BML_STORED_SERVICE_REQUESTS
│   └── stored-service-request-service.entity.ts # Entity cho BML_STORED_SERVICE_REQ_SERVICES
├── dto/
│   ├── commands/
│   │   └── store-service-request.dto.ts         # DTO cho request lưu
│   └── responses/
│       └── stored-service-request-response.dto.ts # DTO cho response
├── interfaces/
│   └── stored-service-request.repository.interface.ts
├── repositories/
│   └── stored-service-request.repository.ts
└── services/
    └── stored-service-request.service.ts         # Logic xử lý lưu trữ
```

## 🔧 Implementation Details

### 1. Entities

#### `StoredServiceRequest` Entity

```typescript
import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { StoredServiceRequestService } from './stored-service-request-service.entity';

@Entity('BML_STORED_SERVICE_REQUESTS')
@Index('IDX_SSR_CODE', ['serviceReqCode'])
@Index('IDX_SSR_HIS_CODE', ['hisServiceReqCode'])
export class StoredServiceRequest extends BaseEntity {
    @Column({ name: 'HIS_SERVICE_REQ_CODE', type: 'varchar2', length: 50 })
    hisServiceReqCode: string;

    @Column({ name: 'HIS_SERVICE_REQ_ID', type: 'number', nullable: true })
    hisServiceReqId?: number;

    @Column({ name: 'SERVICE_REQ_CODE', type: 'varchar2', length: 50, unique: true })
    serviceReqCode: string;

    @Column({ name: 'SERVICE_REQ_STT_ID', type: 'number', nullable: true })
    serviceReqSttId?: number;

    @Column({ name: 'SERVICE_REQ_STT_CODE', type: 'varchar2', length: 10, nullable: true })
    serviceReqSttCode?: string;

    // ... tất cả các field khác từ ServiceRequestResponseDto ...

    @Column({ name: 'RAW_RESPONSE_JSON', type: 'clob', nullable: true })
    rawResponseJson?: string | null;

    @Column({ name: 'STORED_AT', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    storedAt: Date;

    @Column({ name: 'STORED_BY', type: 'varchar2', length: 50, nullable: true })
    storedBy?: string;

    @OneToMany(() => StoredServiceRequestService, service => service.storedServiceRequest)
    services: StoredServiceRequestService[];
}
```

#### `StoredServiceRequestService` Entity

```typescript
import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { StoredServiceRequest } from './stored-service-request.entity';

@Entity('BML_STORED_SERVICE_REQ_SERVICES')
@Index('IDX_SSR_SERVICES_REQ', ['storedServiceRequestId'])
@Index('IDX_SSR_SERVICES_PARENT', ['parentServiceId'])
export class StoredServiceRequestService extends BaseEntity {
    @Column({ name: 'STORED_SERVICE_REQ_ID', type: 'varchar2', length: 36 })
    storedServiceRequestId: string;

    @Column({ name: 'PARENT_SERVICE_ID', type: 'varchar2', length: 36, nullable: true })
    parentServiceId?: string | null;

    @Column({ name: 'HIS_SERE_SERV_ID', type: 'number', nullable: true })
    hisSereServId?: number;

    @Column({ name: 'SERVICE_ID', type: 'number', nullable: true })
    serviceId?: number;

    @Column({ name: 'SERVICE_CODE', type: 'varchar2', length: 50, nullable: true })
    serviceCode?: string;

    @Column({ name: 'SERVICE_NAME', type: 'varchar2', length: 200, nullable: true })
    serviceName?: string;

    @Column({ name: 'PRICE', type: 'number', precision: 15, scale: 2, nullable: true })
    price?: number;

    @Column({ name: 'LIS_SERVICE_ID', type: 'varchar2', length: 36, nullable: true })
    lisServiceId?: string | null;

    @Column({ name: 'UNIT_OF_MEASURE_ID', type: 'varchar2', length: 36, nullable: true })
    unitOfMeasureId?: string | null;

    @Column({ name: 'UNIT_OF_MEASURE_CODE', type: 'varchar2', length: 50, nullable: true })
    unitOfMeasureCode?: string | null;

    @Column({ name: 'UNIT_OF_MEASURE_NAME', type: 'varchar2', length: 200, nullable: true })
    unitOfMeasureName?: string | null;

    @Column({ name: 'RANGE_TEXT', type: 'varchar2', length: 500, nullable: true })
    rangeText?: string | null;

    @Column({ name: 'RANGE_LOW', type: 'number', precision: 15, scale: 2, nullable: true })
    rangeLow?: number | null;

    @Column({ name: 'RANGE_HIGH', type: 'number', precision: 15, scale: 2, nullable: true })
    rangeHigh?: number | null;

    @Column({ name: 'MAPPING', type: 'clob', nullable: true })
    mapping?: string | null;

    @Column({ name: 'TEST_ORDER', type: 'number', nullable: true })
    testOrder?: number | null;

    @Column({ name: 'SHORT_NAME', type: 'varchar2', length: 100, nullable: true })
    shortName?: string | null;

    @Column({ name: 'DESCRIPTION', type: 'clob', nullable: true })
    description?: string | null;

    @Column({ name: 'RESULT_TEXT', type: 'clob', nullable: true })
    resultText?: string | null; // Kết quả xét nghiệm (3-5 trang A4)

    @Column({ name: 'TEST_ID', type: 'varchar2', length: 36, nullable: true })
    testId?: string | null;

    @Column({ name: 'IS_ACTIVE', type: 'number', nullable: true })
    isActive?: number | null;

    @Column({ name: 'TEST_CREATED_AT', type: 'timestamp', nullable: true })
    testCreatedAt?: Date | null;

    @Column({ name: 'TEST_UPDATED_AT', type: 'timestamp', nullable: true })
    testUpdatedAt?: Date | null;

    @Column({ name: 'TEST_CREATED_BY', type: 'varchar2', length: 50, nullable: true })
    testCreatedBy?: string | null;

    @Column({ name: 'TEST_UPDATED_BY', type: 'varchar2', length: 50, nullable: true })
    testUpdatedBy?: string | null;

    @Column({ name: 'TEST_VERSION', type: 'number', nullable: true })
    testVersion?: number | null;

    @Column({ name: 'IS_CHILD_SERVICE', type: 'number', default: 0 })
    isChildService: number; // 0 = parent, 1 = child

    @ManyToOne(() => StoredServiceRequest, sr => sr.services)
    @JoinColumn({ name: 'STORED_SERVICE_REQ_ID' })
    storedServiceRequest: StoredServiceRequest;

    @ManyToOne(() => StoredServiceRequestService, service => service.children)
    @JoinColumn({ name: 'PARENT_SERVICE_ID' })
    parentService?: StoredServiceRequestService;

    @OneToMany(() => StoredServiceRequestService, service => service.parentService)
    children: StoredServiceRequestService[];

    // Business methods
    isParent(): boolean {
        return this.isChildService === 0 && !this.parentServiceId;
    }

    isChild(): boolean {
        return this.isChildService === 1 && !!this.parentServiceId;
    }
}
```

### 2. DTOs

#### `StoreServiceRequestDto`

```typescript
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StoreServiceRequestDto {
    @ApiProperty({ 
        description: 'Mã yêu cầu dịch vụ từ HIS', 
        example: '000055537395' 
    })
    @IsNotEmpty({ message: 'Mã yêu cầu dịch vụ là bắt buộc' })
    @IsString()
    serviceReqCode: string;

    @ApiPropertyOptional({ 
        description: 'Có lưu toàn bộ JSON response không', 
        default: false 
    })
    @IsOptional()
    saveRawJson?: boolean = false;
}
```

#### `StoredServiceRequestResponseDto`

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
}
```

### 3. Repository Interface

```typescript
import { StoredServiceRequest } from '../entities/stored-service-request.entity';
import { GetStoredServiceRequestsDto } from '../dto/queries/get-stored-service-requests.dto';

export interface IStoredServiceRequestRepository {
    findById(id: string): Promise<StoredServiceRequest | null>;
    findByServiceReqCode(serviceReqCode: string): Promise<StoredServiceRequest | null>;
    findAll(query: GetStoredServiceRequestsDto): Promise<{ items: StoredServiceRequest[]; total: number }>;
    save(entity: StoredServiceRequest): Promise<StoredServiceRequest>;
    remove(id: string): Promise<void>;
}
```

### 4. Service Logic

```typescript
@Injectable()
export class StoredServiceRequestService extends BaseService {
    constructor(
        @Inject('IStoredServiceRequestRepository')
        private readonly storedRepo: IStoredServiceRequestRepository,
        private readonly serviceRequestService: ServiceRequestService,
        protected readonly dataSource: DataSource,
        protected readonly currentUserContext: CurrentUserContextService,
    ) {
        super(dataSource, currentUserContext);
    }

    async storeServiceRequest(
        dto: StoreServiceRequestDto,
        currentUser: CurrentUser
    ): Promise<StoredServiceRequestResponseDto> {
        return this.dataSource.transaction(async (manager) => {
            // 1. Kiểm tra đã tồn tại chưa
            const existing = await this.storedRepo.findByServiceReqCode(dto.serviceReqCode);
            if (existing) {
                throw new ConflictException(`Service Request ${dto.serviceReqCode} đã được lưu trữ`);
            }

            // 2. Lấy dữ liệu từ API service-requests/code
            const enrichedData = await this.serviceRequestService.getServiceRequestByCode({
                serviceReqCode: dto.serviceReqCode
            });

            // 3. Tạo StoredServiceRequest entity
            const storedRequest = new StoredServiceRequest();
            storedRequest.hisServiceReqCode = enrichedData.serviceReqCode;
            storedRequest.hisServiceReqId = enrichedData.id;
            storedRequest.serviceReqCode = enrichedData.serviceReqCode;
            storedRequest.serviceReqSttId = enrichedData.serviceReqSttId;
            storedRequest.serviceReqSttCode = enrichedData.serviceReqSttCode;
            // ... map tất cả các field từ enrichedData
            storedRequest.storedAt = new Date();
            storedRequest.storedBy = currentUser.username;
            storedRequest.createdBy = currentUser.id;
            storedRequest.updatedBy = currentUser.id;

            // 4. Lưu raw JSON nếu cần
            if (dto.saveRawJson) {
                storedRequest.rawResponseJson = JSON.stringify(enrichedData);
            }

            const savedRequest = await manager.save(StoredServiceRequest, storedRequest);

            // 5. Lưu services (parents và children)
            let servicesCount = 0;
            for (const service of enrichedData.services) {
                // 5.1. Lưu parent service
                const storedService = new StoredServiceRequestService();
                storedService.storedServiceRequestId = savedRequest.id;
                storedService.parentServiceId = null;
                storedService.isChildService = 0;
                storedService.hisSereServId = service.hisSereServId;
                storedService.serviceId = service.serviceId;
                storedService.serviceCode = service.serviceCode;
                storedService.serviceName = service.serviceName;
                storedService.price = service.price;
                storedService.lisServiceId = service.lisServiceId ?? null;
                storedService.unitOfMeasureId = service.unitOfMeasureId ?? null;
                storedService.unitOfMeasureCode = service.unitOfMeasureCode ?? null;
                storedService.unitOfMeasureName = service.unitOfMeasureName ?? null;
                storedService.rangeText = service.rangeText ?? null;
                storedService.rangeLow = service.rangeLow ?? null;
                storedService.rangeHigh = service.rangeHigh ?? null;
                storedService.mapping = service.mapping ?? null;
                storedService.testOrder = service.testOrder ?? null;
                storedService.resultText = null; // Để trống, sẽ update sau
                storedService.createdBy = currentUser.id;
                storedService.updatedBy = currentUser.id;

                const savedService = await manager.save(StoredServiceRequestService, storedService);
                servicesCount++;

                // 5.2. Lưu serviceTests (children)
                if (service.serviceTests && service.serviceTests.length > 0) {
                    for (const test of service.serviceTests) {
                        const storedTest = new StoredServiceRequestService();
                        storedTest.storedServiceRequestId = savedRequest.id;
                        storedTest.parentServiceId = savedService.id; // Link to parent
                        storedTest.isChildService = 1;
                        storedTest.testId = test.id;
                        storedTest.serviceCode = test.testCode;
                        storedService.serviceName = test.testName;
                        storedTest.shortName = test.shortName ?? null;
                        storedTest.description = test.description ?? null;
                        storedTest.unitOfMeasureId = test.unitOfMeasureId ?? null;
                        storedTest.unitOfMeasureCode = test.unitOfMeasureCode ?? null;
                        storedTest.unitOfMeasureName = test.unitOfMeasureName ?? null;
                        storedTest.rangeText = test.rangeText ?? null;
                        storedTest.rangeLow = test.rangeLow ?? null;
                        storedTest.rangeHigh = test.rangeHigh ?? null;
                        storedTest.mapping = test.mapping ?? null;
                        storedTest.testOrder = test.testOrder ?? 0;
                        storedTest.price = test.price ?? 0;
                        storedTest.isActive = test.isActive ?? 1;
                        storedTest.resultText = null; // Để trống, sẽ update sau
                        storedTest.testCreatedAt = test.createdAt;
                        storedTest.testUpdatedAt = test.updatedAt;
                        storedTest.testCreatedBy = test.createdBy;
                        storedTest.testUpdatedBy = test.updatedBy;
                        storedTest.testVersion = test.version;
                        storedTest.createdBy = currentUser.id;
                        storedTest.updatedBy = currentUser.id;

                        await manager.save(StoredServiceRequestService, storedTest);
                    }
                }
            }

            return {
                id: savedRequest.id,
                serviceReqCode: savedRequest.serviceReqCode,
                servicesCount,
                storedAt: savedRequest.storedAt,
            };
        });
    }

    // API để update result text
    async updateServiceResult(
        storedServiceId: string,
        resultText: string,
        currentUser: CurrentUser
    ): Promise<void> {
        return this.dataSource.transaction(async (manager) => {
            const service = await manager.findOne(StoredServiceRequestService, {
                where: { id: storedServiceId }
            });

            if (!service) {
                throw new NotFoundException('Service not found');
            }

            service.resultText = resultText;
            service.updatedBy = currentUser.id;
            await manager.save(StoredServiceRequestService, service);
        });
    }
}
```

### 5. Controller

```typescript
@Controller('service-requests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('Service Requests')
export class ServiceRequestController {
    constructor(
        private readonly serviceRequestService: ServiceRequestService,
        private readonly storedServiceRequestService: StoredServiceRequestService,
    ) {}

    @Post('store')
    @ApiOperation({ summary: 'Lưu trữ Service Request từ HIS' })
    @ApiResponse({ status: 201, description: 'Lưu trữ thành công' })
    @ApiResponse({ status: 409, description: 'Service Request đã tồn tại' })
    async storeServiceRequest(
        @Body() dto: StoreServiceRequestDto,
        @CurrentUser() currentUser: CurrentUser,
    ) {
        const result = await this.storedServiceRequestService.storeServiceRequest(dto, currentUser);
        return ResponseBuilder.success(result, 201);
    }

    @Put(':storedServiceId/services/:serviceId/result')
    @ApiOperation({ summary: 'Cập nhật kết quả xét nghiệm cho service' })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
    async updateServiceResult(
        @Param('storedServiceId') storedServiceId: string,
        @Param('serviceId') serviceId: string,
        @Body() dto: UpdateServiceResultDto,
        @CurrentUser() currentUser: CurrentUser,
    ) {
        await this.storedServiceRequestService.updateServiceResult(
            serviceId,
            dto.resultText,
            currentUser
        );
        return ResponseBuilder.success({ message: 'Cập nhật kết quả thành công' });
    }
}
```

## 🗄️ Migration Scripts

### Migration 1: Tạo bảng `BML_STORED_SERVICE_REQUESTS`

File: `database/migrations/XXX_create_bml_stored_service_requests.sql`

```sql
-- Tạo bảng BML_STORED_SERVICE_REQUESTS
CREATE TABLE BML_STORED_SERVICE_REQUESTS (
    -- ID và References
    ID VARCHAR2(36) PRIMARY KEY DEFAULT SYS_GUID(),
    HIS_SERVICE_REQ_CODE VARCHAR2(50) NOT NULL,
    HIS_SERVICE_REQ_ID NUMBER,
    
    -- Service Request Info
    SERVICE_REQ_CODE VARCHAR2(50) NOT NULL,
    SERVICE_REQ_STT_ID NUMBER,
    SERVICE_REQ_STT_CODE VARCHAR2(10),
    SERVICE_REQ_TYPE_ID NUMBER,
    SERVICE_REQ_TYPE_CODE VARCHAR2(10),
    INSTRUCTION_TIME NUMBER,
    INSTRUCTION_DATE NUMBER,
    ICD_CODE VARCHAR2(20),
    ICD_NAME VARCHAR2(500),
    ICD_SUB_CODE VARCHAR2(20),
    ICD_TEXT VARCHAR2(1000),
    TREATMENT_ID NUMBER,
    TREATMENT_CODE VARCHAR2(50),
    NOTE VARCHAR2(1000),
    
    -- Request Location
    REQUEST_ROOM_ID NUMBER,
    REQUEST_ROOM_CODE VARCHAR2(50),
    REQUEST_ROOM_NAME VARCHAR2(200),
    REQUEST_ROOM_LIS_ID VARCHAR2(36),
    REQUEST_DEPARTMENT_ID NUMBER,
    REQUEST_DEPARTMENT_CODE VARCHAR2(50),
    REQUEST_DEPARTMENT_NAME VARCHAR2(200),
    REQUEST_DEPARTMENT_LIS_ID VARCHAR2(36),
    
    -- Execute Location
    EXECUTE_ROOM_ID NUMBER,
    EXECUTE_ROOM_CODE VARCHAR2(50),
    EXECUTE_ROOM_NAME VARCHAR2(200),
    EXECUTE_ROOM_LIS_ID VARCHAR2(36),
    EXECUTE_DEPARTMENT_ID NUMBER,
    EXECUTE_DEPARTMENT_CODE VARCHAR2(50),
    EXECUTE_DEPARTMENT_NAME VARCHAR2(200),
    EXECUTE_DEPARTMENT_LIS_ID VARCHAR2(36),
    
    -- Patient Info
    PATIENT_ID NUMBER,
    PATIENT_CODE VARCHAR2(50),
    PATIENT_NAME VARCHAR2(200),
    PATIENT_DOB NUMBER,
    PATIENT_CMND_NUMBER VARCHAR2(20),
    PATIENT_CMND_DATE NUMBER,
    PATIENT_CMND_PLACE VARCHAR2(200),
    PATIENT_MOBILE VARCHAR2(20),
    PATIENT_PHONE VARCHAR2(20),
    PATIENT_PROVINCE_CODE VARCHAR2(10),
    PATIENT_PROVINCE_NAME VARCHAR2(200),
    PATIENT_PROVINCE_LIS_ID VARCHAR2(36),
    PATIENT_COMMUNE_CODE VARCHAR2(20),
    PATIENT_COMMUNE_NAME VARCHAR2(200),
    PATIENT_COMMUNE_LIS_ID VARCHAR2(36),
    PATIENT_ADDRESS VARCHAR2(500),
    PATIENT_GENDER_ID NUMBER,
    PATIENT_GENDER_NAME VARCHAR2(50),
    PATIENT_CAREER_NAME VARCHAR2(200),
    PATIENT_LIS_ID VARCHAR2(36),
    
    -- Metadata
    RAW_RESPONSE_JSON CLOB,
    STORED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    STORED_BY VARCHAR2(50),
    
    -- Base Entity
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DELETED_AT TIMESTAMP NULL,
    CREATED_BY VARCHAR2(50),
    UPDATED_BY VARCHAR2(50),
    VERSION NUMBER DEFAULT 1,
    
    CONSTRAINT UK_STORED_SR_CODE UNIQUE (SERVICE_REQ_CODE)
);

-- Indexes
CREATE INDEX IDX_SSR_CODE ON BML_STORED_SERVICE_REQUESTS(SERVICE_REQ_CODE);
CREATE INDEX IDX_SSR_HIS_CODE ON BML_STORED_SERVICE_REQUESTS(HIS_SERVICE_REQ_CODE);
CREATE INDEX IDX_SSR_STORED_AT ON BML_STORED_SERVICE_REQUESTS(STORED_AT);
CREATE INDEX IDX_SSR_PATIENT_CODE ON BML_STORED_SERVICE_REQUESTS(PATIENT_CODE);
```

### Migration 2: Tạo bảng `BML_STORED_SERVICE_REQ_SERVICES`

File: `database/migrations/XXX_create_bml_stored_service_req_services.sql`

```sql
-- Tạo bảng BML_STORED_SERVICE_REQ_SERVICES
CREATE TABLE BML_STORED_SERVICE_REQ_SERVICES (
    ID VARCHAR2(36) PRIMARY KEY DEFAULT SYS_GUID(),
    STORED_SERVICE_REQ_ID VARCHAR2(36) NOT NULL,
    PARENT_SERVICE_ID VARCHAR2(36),
    
    -- HIS Service Info
    HIS_SERE_SERV_ID NUMBER,
    SERVICE_ID NUMBER,
    SERVICE_CODE VARCHAR2(50),
    SERVICE_NAME VARCHAR2(200),
    PRICE NUMBER(15,2),
    
    -- LIS Service Info
    LIS_SERVICE_ID VARCHAR2(36),
    UNIT_OF_MEASURE_ID VARCHAR2(36),
    UNIT_OF_MEASURE_CODE VARCHAR2(50),
    UNIT_OF_MEASURE_NAME VARCHAR2(200),
    
    -- Additional fields
    RANGE_TEXT VARCHAR2(500),
    RANGE_LOW NUMBER(15,2),
    RANGE_HIGH NUMBER(15,2),
    MAPPING CLOB,
    TEST_ORDER NUMBER,
    SHORT_NAME VARCHAR2(100),
    DESCRIPTION CLOB,
    RESULT_TEXT CLOB, -- Kết quả xét nghiệm (3-5 trang A4)
    
    -- Child-specific fields
    TEST_ID VARCHAR2(36),
    IS_ACTIVE NUMBER(1),
    TEST_CREATED_AT TIMESTAMP,
    TEST_UPDATED_AT TIMESTAMP,
    TEST_CREATED_BY VARCHAR2(50),
    TEST_UPDATED_BY VARCHAR2(50),
    TEST_VERSION NUMBER,
    
    -- Service Type Flag
    IS_CHILD_SERVICE NUMBER(1) DEFAULT 0,
    
    -- Base Entity
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DELETED_AT TIMESTAMP NULL,
    CREATED_BY VARCHAR2(50),
    UPDATED_BY VARCHAR2(50),
    VERSION NUMBER DEFAULT 1,
    
    CONSTRAINT FK_SSR_SERVICES_REQ FOREIGN KEY (STORED_SERVICE_REQ_ID) 
        REFERENCES BML_STORED_SERVICE_REQUESTS(ID) ON DELETE CASCADE,
    CONSTRAINT FK_SSR_SERVICES_PARENT FOREIGN KEY (PARENT_SERVICE_ID) 
        REFERENCES BML_STORED_SERVICE_REQ_SERVICES(ID) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IDX_SSR_SERVICES_REQ ON BML_STORED_SERVICE_REQ_SERVICES(STORED_SERVICE_REQ_ID);
CREATE INDEX IDX_SSR_SERVICES_PARENT ON BML_STORED_SERVICE_REQ_SERVICES(PARENT_SERVICE_ID);
CREATE INDEX IDX_SSR_SERVICES_CHILD ON BML_STORED_SERVICE_REQ_SERVICES(IS_CHILD_SERVICE);
CREATE INDEX IDX_SSR_SERVICES_CODE ON BML_STORED_SERVICE_REQ_SERVICES(SERVICE_CODE);
CREATE INDEX IDX_SSR_SERVICES_LIS_ID ON BML_STORED_SERVICE_REQ_SERVICES(LIS_SERVICE_ID);
```

## 📡 API Endpoints

### 1. POST `/api/v1/service-requests/store`

Lưu trữ Service Request từ HIS vào LIS database.

**Request:**
```json
{
  "serviceReqCode": "000055537395",
  "saveRawJson": false
}
```

**Response:**
```json
{
  "success": true,
  "status_code": 201,
  "data": {
    "id": "uuid",
    "serviceReqCode": "000055537395",
    "servicesCount": 14,
    "storedAt": "2025-10-31T10:30:00Z"
  }
}
```

### 2. PUT `/api/v1/service-requests/:storedServiceId/services/:serviceId/result`

Cập nhật kết quả xét nghiệm cho service.

**Request:**
```json
{
  "resultText": "Kết quả xét nghiệm chi tiết..."
}
```

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "message": "Cập nhật kết quả thành công"
  }
}
```

### 3. GET `/api/v1/service-requests/stored`

Lấy danh sách Service Requests đã lưu trữ.

**Query Parameters:**
- `limit`: Số lượng (default: 10)
- `offset`: Vị trí bắt đầu (default: 0)
- `serviceReqCode`: Tìm theo mã
- `patientCode`: Tìm theo mã bệnh nhân
- `fromDate`: Từ ngày
- `toDate`: Đến ngày

## 🔄 Workflow

1. Client gọi `POST /api/v1/service-requests/store` với `serviceReqCode`
2. Service gọi `getServiceRequestByCode()` để lấy dữ liệu đã enrich
3. Kiểm tra xem đã tồn tại chưa (theo `serviceReqCode`)
4. Tạo transaction để lưu:
   - Lưu `StoredServiceRequest` (chính)
   - Lưu từng `StoredServiceRequestService` (parent services)
   - Lưu từng `StoredServiceRequestService` (child tests với `parentServiceId`)
5. Trả về kết quả

## ✅ Checklist Triển Khai

- [ ] Tạo migration scripts cho 2 bảng
- [ ] Tạo entities (StoredServiceRequest, StoredServiceRequestService)
- [ ] Tạo DTOs (StoreServiceRequestDto, UpdateServiceResultDto, responses)
- [ ] Tạo Repository Interface và Implementation
- [ ] Tạo Service với logic mapping
- [ ] Tạo Controller với API endpoints
- [ ] Update ServiceRequestModule để include StoredServiceRequestService
- [ ] Test API endpoints
- [ ] Update Swagger documentation

## 📝 Notes

- Field `RESULT_TEXT` dùng `CLOB` để lưu text dài (3-5 trang A4)
- Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
- Có thể lưu raw JSON nếu cần audit/backup
- Parent và child services cùng một bảng, phân biệt bằng `IS_CHILD_SERVICE` và `PARENT_SERVICE_ID`
- Cascade delete: xóa Service Request sẽ tự động xóa tất cả services và tests
```

Bạn muốn tôi tạo file này với tên cụ thể không? Hoặc có cần điều chỉnh gì thêm không?
