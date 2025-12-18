# 📋 PATIENT MODULE - TIẾN ĐỘ TRIỂN KHAI

## ✅ **ĐÃ HOÀN THÀNH (6/12)**

### 1. ✅ Patient Entity
- **File**: `src/modules/patient/entities/patient.entity.ts`
- **Nội dung**: 
  - Định nghĩa entity với tất cả field chính
  - Relationships với Province và Ward
  - Business methods: `calculateAge()`, `getFullAddress()`, `getDisplayName()`
- **Status**: ✅ Hoàn thành

### 2. ✅ Patient Repository Interface
- **File**: `src/modules/patient/interfaces/patient.repository.interface.ts`
- **Nội dung**:
  - Định nghĩa interface `IPatientRepository`
  - Các methods: findById, findByPatientCode, findByCmndNumber, existsByPatientCode, etc.
- **Status**: ✅ Hoàn thành

### 3. ✅ Patient Repository Implementation
- **File**: `src/modules/patient/patient.repository.ts`
- **Nội dung**:
  - Triển khai `IPatientRepository`
  - Logic database với TypeORM QueryBuilder
  - Support pagination, search, filtering
- **Status**: ✅ Hoàn thành

### 4. ✅ DTOs - Commands
- **Files**:
  - `src/modules/patient/dto/commands/create-patient.dto.ts`
  - `src/modules/patient/dto/commands/update-patient.dto.ts`
  - `src/modules/patient/dto/commands/delete-patient.dto.ts`
- **Nội dung**:
  - Validation rules cho tất cả fields
  - Swagger documentation
  - CMND validation (9-12 digits)
  - Phone validation
- **Status**: ✅ Hoàn thành

### 5. ✅ DTOs - Queries
- **Files**:
  - `src/modules/patient/dto/queries/get-patients.dto.ts`
  - `src/modules/patient/dto/queries/get-patient-by-id.dto.ts`
  - `src/modules/patient/dto/queries/search-patients.dto.ts`
  - `src/modules/patient/dto/queries/get-patients-by-cmnd.dto.ts`
- **Nội dung**:
  - Pagination, search, filtering
  - Sorting options
  - CMND search validation
- **Status**: ✅ Hoàn thành

### 6. ✅ DTOs - Responses
- **Files**:
  - `src/modules/patient/dto/responses/patient-response.dto.ts`
  - `src/modules/patient/dto/responses/patient-with-location-response.dto.ts`
  - `src/modules/patient/dto/responses/patients-list-response.dto.ts`
- **Nội dung**:
  - Response structure theo chuẩn đã đề xuất
  - Include calculated age
  - Location information
  - Pagination metadata
- **Status**: ✅ Hoàn thành

---

## 🔄 **ĐANG LÀM (1/12)**

### 7. 🔄 Patient Service
- **File**: `src/modules/patient/patient.service.ts`
- **Nội dung cần làm**:
  - Extend `BaseService` cho audit fields
  - CQRS pattern: Commands và Queries riêng biệt
  - Auto-generate patient code: `BN{YYYYMM}.{SEQUENCE}`
  - Business logic validation
  - Transaction management
- **Status**: 🔄 Đang tạo

---

## ⏳ **CÒN LẠI (5/12)**

### 8. ⏳ Patient Controller
- **File**: `src/modules/patient/patient.controller.ts`
- **Nội dung cần làm**:
  - API endpoints cho CRUD operations
  - JWT authentication guard
  - Swagger documentation
  - Response formatting với `ResponseBuilder`
  - Error handling
- **Endpoints cần tạo**:
  - `POST /api/v1/patients` - Tạo bệnh nhân
  - `GET /api/v1/patients` - Lấy danh sách bệnh nhân
  - `GET /api/v1/patients/:id` - Lấy bệnh nhân theo ID
  - `GET /api/v1/patients/:id/with-location` - Lấy bệnh nhân với thông tin địa điểm
  - `GET /api/v1/patients/search` - Tìm kiếm bệnh nhân
  - `GET /api/v1/patients/cmnd/:cmndNumber` - Lấy bệnh nhân theo CMND
  - `PUT /api/v1/patients/:id` - Cập nhật bệnh nhân
  - `DELETE /api/v1/patients/:id` - Xóa bệnh nhân

### 9. ⏳ Patient Module
- **File**: `src/modules/patient/patient.module.ts`
- **Nội dung cần làm**:
  - Import TypeORM cho Patient entity
  - Import ProvinceModule và WardModule
  - Import ServicesModule và DataLoaderModule
  - Configure providers và exports
  - DI configuration

### 10. ⏳ Database Migration
- **File**: `database/migrations/005_create_bml_patients_table.sql`
- **Nội dung cần làm**:
  - Tạo table BML_PATIENTS
  - Foreign key constraints với BML_PROVINCES và BML_WARDS
  - Indexes cho performance
  - Sample data
- **Cập nhật**: `run_all_migrations.sql`

### 11. ⏳ Integration vào AppModule
- **File**: `src/app.module.ts`
- **Nội dung cần làm**:
  - Import PatientModule
  - Thêm vào imports array

### 12. ⏳ Testing
- **Nội dung cần làm**:
  - Build project và fix errors
  - Test tất cả API endpoints
  - Verify response structure
  - Test validation rules
  - Test business logic

---

## 🎯 **CHI TIẾT CẦN LÀM TIẾP**

### **A. Patient Service (Đang làm)**
```typescript
@Injectable()
export class PatientService extends BaseService {
    // Commands (Write Operations)
    async createPatient(createDto: CreatePatientDto, currentUser: CurrentUser): Promise<string>
    async updatePatient(id: string, updateDto: UpdatePatientDto, currentUser: CurrentUser): Promise<void>
    async deletePatient(id: string): Promise<void>
    
    // Queries (Read Operations)  
    async getPatientById(id: string): Promise<PatientResponseDto>
    async getPatients(query: GetPatientsDto): Promise<GetPatientsResult>
    async searchPatients(query: SearchPatientsDto): Promise<PatientResponseDto[]>
    async getPatientByCmnd(cmndNumber: string): Promise<PatientResponseDto>
    async getPatientWithLocation(id: string): Promise<PatientWithLocationResponseDto>
    
    // Private methods
    private async generatePatientCode(): Promise<string>
    private mapPatientToResponseDto(patient: Patient): PatientResponseDto
    private mapPatientToLocationResponseDto(patient: Patient): PatientWithLocationResponseDto
}
```

### **B. Patient Controller (Tiếp theo)**
```typescript
@Controller('api/v1/patients')
@UseGuards(JwtAuthGuard)
@ApiTags('Patients')
export class PatientController {
    // 8 API endpoints với Swagger documentation
    // Response formatting với ResponseBuilder
    // Error handling
}
```

### **C. Database Schema**
```sql
CREATE TABLE BML_PATIENTS (
    ID VARCHAR2(36) PRIMARY KEY,
    PATIENT_CODE VARCHAR2(50) NOT NULL UNIQUE,
    PATIENT_NAME VARCHAR2(200) NOT NULL,
    DATE_OF_BIRTH DATE NOT NULL,
    CMND_NUMBER VARCHAR2(20) NOT NULL UNIQUE,
    -- ... các field khác
    CONSTRAINT FK_BML_PATIENTS_PROVINCE FOREIGN KEY (PROVINCE_ID) REFERENCES BML_PROVINCES(ID),
    CONSTRAINT FK_BML_PATIENTS_WARD FOREIGN KEY (WARD_ID) REFERENCES BML_WARDS(ID)
);
```

---

## 📊 **TỔNG KẾT**

- **Hoàn thành**: 6/12 (50%)
- **Đang làm**: 1/12 (8.3%)
- **Còn lại**: 5/12 (41.7%)

**Ước tính thời gian còn lại**: 30-45 phút

**Ưu tiên tiếp theo**:
1. Hoàn thành Patient Service
2. Tạo Patient Controller
3. Tạo Patient Module
4. Database Migration
5. Integration và Testing
