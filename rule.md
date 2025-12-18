---
alwaysApply: true
---
QUY ƯỚC PHÁT TRIỂN PHẦN MỀM (TypeScript, NestJS, CQRS, TypeORM)
1. Nguyên Tắc Kiến Trúc Cốt Lõi
Quy tắc này ưu tiên Khả năng Bảo trì (Maintainability), Khả năng Kiểm thử (Testability), và Khả năng Mở rộng (Scalability) bằng cách áp dụng Layered Architecture (3-Layer Architecture).

Tách biệt Trách nhiệm (Separation of Concerns): Phân chia rõ ràng thành 3 layer chính: Presentation Layer (Controllers), Business Logic Layer (Services), và Data Access Layer (Repositories).

Dependency Inversion Principle (DIP): Lớp cấp cao không được phụ thuộc vào lớp cấp thấp. Cả hai đều phải phụ thuộc vào Abstraction (TypeScript Interfaces hoặc Abstract Classes).

Dependency Injection (DI): Luôn tận dụng hệ thống DI của NestJS. Không sử dụng từ khóa new để tạo dependencies (ngoại trừ DTOs và Entities thuần túy).

CQRS: Tách biệt triệt để mô hình Ghi (Write Model - Commands) và Đọc (Read Model - Queries) trong Service Layer để tối ưu hóa hiệu suất và sự phức tạp của nghiệp vụ.

2. Cấu Trúc Thư Mục Dự Án (Folder Structure)
Cấu trúc dự án tuân thủ mô hình Feature-Based Modules của NestJS với Layered Architecture (3-Layer), nơi mỗi module được phân lớp theo kiến trúc đơn giản và dễ bảo trì.

src/
├── app.module.ts                   // Module gốc
├── main.ts                         // Khởi động ứng dụng

├── common/                         // Thư viện, tiện ích dùng chung (Exceptions, Filters, Decorators)
│   ├── filters/
│   │   └── exception.filter.ts     // Global Exception Filter
│   ├── interceptors/
│   ├── guards/
│   └── decorators/

├── config/                         // Configuration files
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── app.config.ts

├── shared/                         // Shared services và utilities
│   ├── database/
│   ├── auth/
│   ├── utils/
│   └── dataloaders/                // DataLoader implementations
│       ├── dataloader.module.ts
│       ├── dataloader.service.ts
│       ├── user.dataloader.ts
│       ├── order.dataloader.ts
│       └── product.dataloader.ts

├── modules/                        // 💡 TỔ CHỨC THEO TÍNH NĂNG (Feature Modules)
│   ├── user/
│   │   ├── user.module.ts          // Gói tất cả thành phần của tính năng "User"
│   │   ├── user.controller.ts      // 1. PRESENTATION LAYER (HTTP Handlers)
│   │   ├── user.service.ts         // 2. BUSINESS LOGIC LAYER (CQRS Implementation)
│   │   ├── user.repository.ts      // 3. DATA ACCESS LAYER (Database Operations)
│   │   ├── dto/                    // Data Transfer Objects
│   │   │   ├── commands/           // Command DTOs (Write Operations)
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   ├── update-user.dto.ts
│   │   │   │   └── activate-user.dto.ts
│   │   │   ├── queries/            // Query DTOs (Read Operations)
│   │   │   │   ├── get-users.dto.ts
│   │   │   │   ├── get-user-by-id.dto.ts
│   │   │   │   └── find-user-by-email.dto.ts
│   │   │   └── responses/           // Response DTOs
│   │   │       ├── user-response.dto.ts
│   │   │       └── users-list-response.dto.ts
│   │   ├── entities/               // Database entities
│   │   │   └── user.entity.ts
│   │   └── interfaces/             // Repository interfaces
│   │       └── user.repository.interface.ts
│   ├── order/
│   │   ├── order.module.ts
│   │   ├── order.controller.ts
│   │   ├── order.service.ts
│   │   ├── order.repository.ts
│   │   ├── dto/
│   │   │   ├── commands/
│   │   │   ├── queries/
│   │   │   └── responses/
│   │   ├── entities/
│   │   └── interfaces/
│   └── product/
│       ├── product.module.ts
│       ├── product.controller.ts
│       ├── product.service.ts
│       ├── product.repository.ts
│       ├── dto/
│       │   ├── commands/
│       │   ├── queries/
│       │   └── responses/
│       ├── entities/
│       └── interfaces/
3. Quy Ước Layered Architecture (3-Layer Architecture)
Kiến trúc được chia thành 3 layer chính với trách nhiệm rõ ràng và dễ bảo trì.

3.1. Presentation Layer (Controllers)
Mục đích: Xử lý HTTP requests/responses, validation đầu vào, và routing.

Quy tắc:
- Chỉ chứa logic HTTP handling
- Không chứa business logic
- Sử dụng DTOs cho validation
- Trả về response format chuẩn

3.2. Business Logic Layer (Services)
Mục đích: Chứa toàn bộ business logic, validation nghiệp vụ, và orchestration.

Quy tắc:
- Chứa tất cả business rules
- Có thể gọi nhiều repositories
- Xử lý transactions
- **Áp dụng CQRS pattern** với Commands (Write operations) và Queries (Read operations) riêng biệt

#### CQRS Implementation trong Service Layer:
- **Commands**: Methods bắt đầu bằng động từ (create, update, delete, activate, deactivate)
- **Queries**: Methods bắt đầu bằng get, find, list, search
- **Command Methods**: Chỉ thay đổi trạng thái, trả về void hoặc ID
- **Query Methods**: Chỉ đọc dữ liệu, trả về DTOs hoặc entities

3.3. Data Access Layer (Repositories)
Mục đích: Xử lý tất cả database operations, caching, và external data sources.

Quy tắc:
- Chỉ chứa database operations
- Không chứa business logic
- Sử dụng TypeORM QueryBuilder cho complex queries
- Implement interfaces cho testability

3.4. DTOs và Validations với CQRS Structure
**Command DTOs** (Write Operations): Sử dụng các lớp DTO riêng biệt trong thư mục dto/commands/ cho việc nhận dữ liệu từ Controller cho các thao tác ghi.

**Query DTOs** (Read Operations): Sử dụng các lớp DTO riêng biệt trong thư mục dto/queries/ cho việc nhận dữ liệu từ Controller cho các thao tác đọc.

**Response DTOs**: Tạo DTOs riêng trong thư mục dto/responses/ để kiểm soát dữ liệu trả về.

**Validation**: Luôn sử dụng class-validator và ValidationPipe toàn cục của NestJS để xác thực dữ liệu đầu vào.

**Naming Convention**:
- Command DTOs: `create-user.dto.ts`, `update-user.dto.ts`, `activate-user.dto.ts`
- Query DTOs: `get-users.dto.ts`, `get-user-by-id.dto.ts`, `find-user-by-email.dto.ts`
- Response DTOs: `user-response.dto.ts`, `users-list-response.dto.ts`

3.5. DataLoader Integration với CQRS
**DataLoader Pattern**: Sử dụng DataLoader để giải quyết vấn đề N+1 queries và tối ưu hóa performance.

**Implementation Strategy**:
- **Batch Loading**: Tập hợp các request cùng loại và thực hiện một query duy nhất
- **Caching**: Cache kết quả trong scope của request để tránh duplicate queries
- **Context Management**: Mỗi request có DataLoader instance riêng biệt

**DataLoader Structure**:
- **User DataLoader**: Batch load users by IDs
- **Order DataLoader**: Batch load orders by user IDs
- **Product DataLoader**: Batch load products by category IDs

**Integration với Service Layer**:
- DataLoader được inject vào Service layer
- Service methods sử dụng DataLoader cho batch operations
- Repository layer cung cấp batch query methods

4. Quy Ước Dữ Liệu và Cơ sở Hạ tầng (TypeORM & Infrastructure)
4.1. Repositories
Abstraction (Interface): Mỗi Repository phải được định nghĩa bằng một Interface (ví dụ: IUserRepository). Interface này được đặt trong thư mục interfaces/ của module.

Implementation: Lớp triển khai TypeORM Repository (ví dụ: UserRepository) phải implements Interface đã định nghĩa và được đặt trong thư mục entities/ của module.

DI Token: Sử dụng Interface làm DI Token để các Service chỉ phụ thuộc vào Abstraction, không phụ thuộc vào TypeORM cụ thể.

**File Structure**:
```
modules/user/
├── interfaces/
│   └── user.repository.interface.ts    // IUserRepository interface
├── entities/
│   └── user.entity.ts                   // User entity
└── user.repository.ts                   // UserRepository implementation
```

4.2. Entities
Các lớp TypeORM Entity (@Entity() classes) được đặt trong thư mục entities/ của mỗi module.

Entities nên chứa các business methods cơ bản (getters, validation methods) nhưng không chứa complex business logic.

4.3. Quản lý Giao dịch (Transactions)
Giao dịch phải được quản lý tại Service layer.

Sử dụng DataSource.transaction() của TypeORM hoặc @Transactional decorator để quản lý giao dịch một cách tường minh và an toàn.

4.4. Audit Fields Management (createdBy, updatedBy)
**Nguồn dữ liệu**: createdBy và updatedBy được lấy từ JWT token của user hiện tại.

**Implementation Strategy**:
- **Request Context**: Lưu user info từ JWT vào request context
- **Service Layer**: Inject user info vào Service methods
- **Repository Layer**: Tự động set audit fields khi save entity

**Code Implementation**:
```typescript
// Request Context Middleware
@Injectable()
export class UserContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract user info from JWT token (đã được validate bởi JwtAuthGuard)
    const user = req.user; // User từ JWT Strategy
    if (user) {
      req['currentUser'] = {
        id: user.id,
        username: user.username,
        email: user.email,
      };
    }
    next();
  }
}

// Service với Audit Fields
@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly dataSource: DataSource,
  ) {}

  async createUser(createUserDto: CreateUserDto, currentUser: CurrentUser): Promise<string> {
    return this.dataSource.transaction(async (manager) => {
      const user = new User();
      user.username = createUserDto.username;
      user.email = createUserDto.email;
      user.passwordHash = await this.hashPassword(createUserDto.password);
      user.firstName = createUserDto.firstName;
      user.lastName = createUserDto.lastName;
      
      // Set audit fields
      user.createdBy = currentUser.id;
      user.updatedBy = currentUser.id;

      const savedUser = await manager.save(User, user);
      return savedUser.id;
    });
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto, currentUser: CurrentUser): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update user fields
      Object.assign(user, updateUserDto);
      user.updatedBy = currentUser.id; // Set updatedBy

      await manager.save(User, user);
    });
  }
}

// Controller với Current User
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Request() req: Request & { user: User }
  ) {
    const currentUser = {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
    };
    
    const userId = await this.userService.createUser(createUserDto, currentUser);
    return ResponseBuilder.success({ id: userId }, 201);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: Request & { user: User }
  ) {
    const currentUser = {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
    };
    
    await this.userService.updateUser(id, updateUserDto, currentUser);
    return ResponseBuilder.success({ message: 'User updated successfully' });
  }
}
```

**CurrentUser Interface**:
```typescript
export interface CurrentUser {
  id: string;
  username: string;
  email: string;
}
```

**Quy tắc Audit Fields**:
- **createdBy**: Set khi tạo record mới, lấy từ current user
- **updatedBy**: Set mỗi khi update record, lấy từ current user
- **createdAt/updatedAt**: Tự động bởi TypeORM decorators
- **deletedAt**: Set khi soft delete, không cần audit user

5. Quy Ước Lập trình TypeScript & NestJS
5.1. TypeScript
Strict Typing: Luôn bật chế độ strict: true trong tsconfig.json.

Interfaces: Ưu tiên sử dụng TypeScript Interfaces cho việc định nghĩa hợp đồng của Service, Repository, và DTOs.

Readonly: Sử dụng từ khóa readonly cho các thuộc tính không được thay đổi sau khi khởi tạo.

5.2. NestJS Conventions
Decorators: Sử dụng Decorators (@Injectable(), @Module(), v.v.) một cách chính xác theo quy ước của NestJS.

Providers: Sử dụng useClass, useFactory, hoặc useValue trong file *.module.ts để cấu hình Dependency Injection, đặc biệt là khi inject Repository Interface.

Pipes, Guards, Interceptors: Tận dụng tối đa các thành phần này để xử lý các vấn đề xuyên suốt (cross-cutting concerns) như Validation, Authentication, Authorization, và Response Transformation.

6. Xử Lý Lỗi và Khả năng Quan sát (Error Handling & Observability)
6.1. Xử Lý Lỗi Có Cấu Trúc (Standardized Error Handling)
Custom Base Exception (AppError):

Định nghĩa một lớp cơ sở AppError mở rộng từ HttpException của NestJS.

Lớp này phải chứa các thuộc tính để phân loại lỗi: code (Mã lỗi nghiệp vụ/hệ thống) và message (Thông điệp lỗi).

Mã Lỗi Tiêu Chuẩn: Sử dụng phân loại mã lỗi thống nhất:
| Mã Tiền tố | Ý nghĩa | Mô tả |
| :--- | :--- | :--- |
| SYS | System | Lỗi hệ thống/cơ sở hạ tầng (ví dụ: mất kết nối DB) |
| VAL | Validation | Lỗi xác thực dữ liệu đầu vào |
| BIZ | Business | Lỗi logic nghiệp vụ (ví dụ: không tìm thấy người dùng) |
| AUTH | Authentication/Authorization | Lỗi liên quan đến quyền truy cập |

Exception Filter: Triển khai Global Exception Filter để bắt AppError và chuẩn hóa phản hồi API (trả về JSON thống nhất) cho tất cả lỗi.

6.2. Observability (Tracing, Logging, Metrics)
Distributed Tracing (Truy vết Phân tán):

Sử dụng OpenTelemetry hoặc thư viện tương đương để triển khai Tracing.

Đảm bảo mỗi request được gán một Trace ID duy nhất. Trace ID phải được truyền qua HTTP Headers (traceparent) và được ghi lại trong Logs.

Structured Logging:

Sử dụng logger có cấu trúc (ví dụ: Pino hoặc Winston) tích hợp với NestJS.

Logs phải là định dạng JSON để dễ dàng phân tích và truy vấn.

Ghi lại thông tin cần thiết: Trace ID, Span ID, Level, Timestamp, Message, Context (user ID, request path).

Metrics: Sử dụng Prometheus hoặc OpenTelemetry Metrics để thu thập các số liệu chính (độ trễ, tỷ lệ lỗi, thông lượng) từ Controller, Command/Query Handler, và External Call.

## 7. API Design & JWT Authentication

### 7.1. RESTful API Standards
- Sử dụng **HTTP methods** đúng cách: GET (read), POST (create), PUT (update), PATCH (partial update), DELETE (remove)
- Theo **resource-based URLs** với API prefix: `/api/v1/users/{id}` thay vì `/api/v1/getUser`
- Sử dụng **plural nouns** cho collections: `/users`, `/orders`, `/products`
- Implement **proper HTTP status codes**: 200, 201, 400, 401, 403, 404, 409, 422, 500
- Sử dụng **consistent response format** với envelope pattern và status code:
  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {...},
    "meta": {
      "pagination": {...},
      "timestamp": "2024-01-15T10:30:00Z",
      "request_id": "req_123456789",
      "trace_id": "trace_987654321"
    }
  }
  ```

### 7.2. API URL Structure
```
# Public API Endpoints (no authentication required)
/api/v1/auth/login                       # POST - User login
/api/v1/auth/register                    # POST - User registration
/api/v1/auth/refresh                     # POST - Refresh token

# Protected API Endpoints (JWT authentication required)
/api/v1/users                           # GET, POST
/api/v1/users/{id}                      # GET, PUT, PATCH, DELETE
/api/v1/orders                          # GET, POST
/api/v1/orders/{id}                     # GET, PUT, PATCH, DELETE
/api/v1/products                        # GET, POST
/api/v1/products/{id}                   # GET, PUT, PATCH, DELETE

# Internal API Endpoints (direct access)
/api/v1/health                          # Health check
/api/v1/metrics                         # Prometheus metrics
/api/v1/ready                           # Readiness probe
```

### 7.3. NestJS Controller Configuration
```typescript
// Controller setup with JWT authentication
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(@Query() query: GetUsersDto) {
    const result = await this.userService.getUsers(query);
    return ResponseBuilder.success(result);
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const userId = await this.userService.createUser(createUserDto);
    return ResponseBuilder.success({ id: userId }, 201);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    return ResponseBuilder.success(user);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    await this.userService.updateUser(id, updateUserDto);
    return ResponseBuilder.success({ message: 'User updated successfully' });
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.userService.deleteUser(id);
    return ResponseBuilder.success({ message: 'User deleted successfully' });
  }
}
```

## 8. Response Structure Standards

### 8.1. TypeScript Interface Definitions
```typescript
// Base Response Structure
export interface BaseResponse<T = any> {
  success: boolean;
  status_code: number;
  data?: T;
  meta?: Meta;
  error?: AppError;
}

// Meta Information
export interface Meta {
  pagination?: Pagination;
  timestamp: string;
  request_id?: string;
  trace_id?: string;
}

// Pagination Information
export interface Pagination {
  limit: number;
  offset: number;
  total: number;
  has_next: boolean;
  has_prev: boolean;
}

// Success Response Constructor
export class ResponseBuilder {
  static success<T>(data: T, statusCode: number = 200): BaseResponse<T> {
    return {
      success: true,
      status_code: statusCode,
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  static error(error: AppError, statusCode: number): BaseResponse {
    return {
      success: false,
      status_code: statusCode,
      error,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}
```

### 8.2. HTTP Status Code Mapping
```typescript
// Success Status Codes
export const HTTP_STATUS = {
  OK: 200,                    // GET, PUT, PATCH success
  CREATED: 201,              // POST success
  ACCEPTED: 202,             // Async operation accepted
  NO_CONTENT: 204,           // DELETE success
  PARTIAL_CONTENT: 206,      // Partial GET success
} as const;

// Client Error Status Codes
export const HTTP_CLIENT_ERROR = {
  BAD_REQUEST: 400,          // Validation errors, malformed request
  UNAUTHORIZED: 401,         // Authentication required
  FORBIDDEN: 403,            // Insufficient permissions
  NOT_FOUND: 404,            // Resource not found
  METHOD_NOT_ALLOWED: 405,   // HTTP method not allowed
  CONFLICT: 409,             // Business rule conflict
  UNPROCESSABLE_ENTITY: 422, // Validation failed
  TOO_MANY_REQUESTS: 429,    // Rate limit exceeded
} as const;

// Server Error Status Codes
export const HTTP_SERVER_ERROR = {
  INTERNAL_SERVER_ERROR: 500, // Internal system error
  NOT_IMPLEMENTED: 501,       // Feature not implemented
  BAD_GATEWAY: 502,           // External service error
  SERVICE_UNAVAILABLE: 503,   // Service temporarily unavailable
  GATEWAY_TIMEOUT: 504,       // External service timeout
} as const;
```

### 8.3. Error Code to Status Code Mapping
```typescript
// Error Code to HTTP Status Code Mapping
export const ERROR_CODE_TO_STATUS_MAP: Record<string, number> = {
  // 1xxx - System Errors -> 500
  'SYS_001': 500, // Internal system error
  'SYS_002': 504, // Request timeout
  'SYS_003': 503, // Service unavailable
  
  // 2xxx - Validation Errors -> 400/422
  'VAL_001': 400, // Required field missing
  'VAL_002': 422, // Invalid format
  'VAL_003': 422, // Value out of range
  
  // 3xxx - Authentication/Authorization -> 401/403
  'AUTH_001': 401, // Invalid token
  'AUTH_002': 401, // Token expired
  'AUTH_003': 403, // Insufficient permissions
  
  // 4xxx - Business Logic -> 404/409/422
  'BIZ_001': 404, // Resource not found
  'BIZ_002': 409, // Business rule conflict
  'BIZ_003': 422, // Business limit exceeded
  
  // 5xxx - External Dependencies -> 502/503/504
  'EXT_001': 504, // External service timeout
  'EXT_002': 503, // External service unavailable
  'EXT_003': 502, // External service error
};

// Get HTTP Status Code from Error Code
export function getStatusFromErrorCode(errorCode: string): number {
  return ERROR_CODE_TO_STATUS_MAP[errorCode] || 500;
}
```

### 8.4. Response Structure cho Join Data (Multi-table Joins)
**Cấu trúc response cho dữ liệu được join từ nhiều bảng với các patterns khác nhau:**

#### A. Nested Objects Pattern (Cho 1-to-Many relationships):
```typescript
// dto/responses/user-with-orders-response.dto.ts
export class UserWithOrdersResponseDto {
  // User fields
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Nested Orders array
  orders: OrderResponseDto[];
}

// dto/responses/order-response.dto.ts
export class OrderResponseDto {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  orderDate: Date;
  shippingAddress: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### B. Hierarchical Structure Pattern (Cho complex joins):
```typescript
// dto/responses/order-with-items-response.dto.ts
export class OrderWithItemsResponseDto {
  // Order fields
  id: string;
  orderNumber: string;
  userId: string;
  totalAmount: number;
  status: string;
  orderDate: Date;
  shippingAddress: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  // Nested User info
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string;
  };

  // Nested OrderItems array
  orderItems: OrderItemWithProductResponseDto[];
}

// dto/responses/order-item-with-product-response.dto.ts
export class OrderItemWithProductResponseDto {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;

  // Nested Product info
  product: {
    id: string;
    productCode: string;
    productName: string;
    price: number;
    description?: string;
  };
}
```

#### C. Flat Structure Pattern (Cho simple joins):
```typescript
// dto/responses/user-order-flat-response.dto.ts
export class UserOrderFlatResponseDto {
  // User fields
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  
  // Order fields (flattened)
  orderId?: string;
  orderNumber?: string;
  orderTotal?: number;
  orderStatus?: string;
  orderDate?: Date;
}
```

#### D. Response Builder cho Join Data:
```typescript
// Join Response Builder
export class JoinResponseBuilder {
  static successWithJoin<T>(
    data: T, 
    joinInfo: {
      totalJoins: number;
      joinTables: string[];
      executionTime: number;
    },
    statusCode: number = 200
  ): BaseResponse<T> {
    return {
      success: true,
      status_code: statusCode,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        joinInfo,
      },
    };
  }

  static successWithPagination<T>(
    data: T[],
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasNext: boolean;
      hasPrev: boolean;
    },
    joinInfo?: {
      totalJoins: number;
      joinTables: string[];
      executionTime: number;
    }
  ): BaseResponse<{ items: T[]; pagination: typeof pagination }> {
    return {
      success: true,
      status_code: 200,
      data: {
        items: data,
        pagination,
      },
      meta: {
        timestamp: new Date().toISOString(),
        ...(joinInfo && { joinInfo }),
      },
    };
  }
}
```

#### E. API Response Examples:

**GET /api/v1/users/with-orders:**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "items": [
      {
        "id": "user-123",
        "username": "john_doe",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "fullName": "John Doe",
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "orders": [
          {
            "id": "order-456",
            "orderNumber": "ORD-2024-001",
            "totalAmount": 299.99,
            "status": "COMPLETED",
            "orderDate": "2024-01-15T10:30:00Z",
            "shippingAddress": "123 Main St, City, Country",
            "createdAt": "2024-01-15T10:30:00Z",
            "updatedAt": "2024-01-15T10:30:00Z"
          }
        ]
      }
    ],
    "pagination": {
      "total": 1,
      "limit": 10,
      "offset": 0,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "joinInfo": {
      "totalJoins": 2,
      "joinTables": ["BMM_USERS", "BMM_ORDERS"],
      "executionTime": 45
    }
  }
}
```

**GET /api/v1/orders/:id/with-items:**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "order-456",
    "orderNumber": "ORD-2024-001",
    "userId": "user-123",
    "totalAmount": 299.99,
    "status": "COMPLETED",
    "orderDate": "2024-01-15T10:30:00Z",
    "shippingAddress": "123 Main St, City, Country",
    "notes": "Please deliver after 5 PM",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "user": {
      "id": "user-123",
      "username": "john_doe",
      "email": "john@example.com",
      "fullName": "John Doe"
    },
    "orderItems": [
      {
        "id": "item-789",
        "quantity": 2,
        "unitPrice": 99.99,
        "subtotal": 199.98,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "product": {
          "id": "product-101",
          "productCode": "PROD-001",
          "productName": "Wireless Headphones",
          "price": 99.99,
          "description": "High-quality wireless headphones"
        }
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "joinInfo": {
      "totalJoins": 3,
      "joinTables": ["BMM_ORDERS", "BMM_ORDER_ITEMS", "BMM_PRODUCTS"],
      "executionTime": 78
    }
  }
}
```

#### F. Join Data Naming Conventions:
- **Response DTOs**: `{Entity}With{RelatedEntity}ResponseDto` (ví dụ: `UserWithOrdersResponseDto`)
- **Flat DTOs**: `{Entity}{RelatedEntity}FlatResponseDto` (ví dụ: `UserOrderFlatResponseDto`)
- **Complex DTOs**: `{Entity}With{RelatedEntity}And{AnotherEntity}ResponseDto` (ví dụ: `OrderWithItemsAndProductsResponseDto`)
- **Nested Objects**: Sử dụng camelCase cho nested properties
- **Arrays**: Sử dụng plural names cho arrays (orders, orderItems, products)

## 9. Authentication & Security

### 9.1. JWT Authentication Strategy

#### JWT Implementation:
- **JWT Token** được tạo và validate trực tiếp trong NestJS application
- **Public endpoints** = Không cần authentication (login, register, health)
- **Protected endpoints** = JWT authentication required
- **NestJS JWT Guard** validate token và extract user info

#### JWT Configuration:
```typescript
// JWT Module Configuration
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { 
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        issuer: process.env.JWT_ISSUER || 'your-app',
        audience: process.env.JWT_AUDIENCE || 'your-app-users'
      },
    }),
  ],
  providers: [JwtAuthGuard, JwtStrategy],
  exports: [JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
```

### 9.2. JWT Authentication Implementation
```typescript
// JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.isAccountActive()) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }
}

// JWT Auth Guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
```

### 9.3. Authentication Requirements by Endpoint Type

#### Public Endpoints (No Authentication Required):
```typescript
// Public endpoints - No JWT authentication required
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return ResponseBuilder.success(result);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const userId = await this.authService.register(registerDto);
    return ResponseBuilder.success({ id: userId }, 201);
  }

  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(refreshDto);
    return ResponseBuilder.success(result);
  }
}

// Health endpoints
@Controller('api/v1')
export class HealthController {
  @Get('health')
  async healthCheck() {
    return ResponseBuilder.success({ status: 'healthy' });
  }

  @Get('ready')
  async readinessCheck() {
    return ResponseBuilder.success({ status: 'ready' });
  }
}
```

#### Protected Endpoints (JWT Authentication Required):
```typescript
// Protected endpoints - JWT authentication required
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(@Query() query: GetUsersDto) {
    const result = await this.userService.getUsers(query);
    return ResponseBuilder.success(result);
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const userId = await this.userService.createUser(createUserDto);
    return ResponseBuilder.success({ id: userId }, 201);
  }
}
```

### 9.4. Role-based Authorization
```typescript
// Role-based Authorization Guard
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // User from JWT strategy

    return requiredRoles.some((role) => user.role === role);
  }
}

// Role Decorator
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Usage in Controller
@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Get('users')
  async getAllUsers() {
    const result = await this.userService.getAllUsers();
    return ResponseBuilder.success(result);
  }
}
```

### 9.5. Password Security Implementation
```typescript
// Password Service
@Injectable()
export class PasswordService {
  private readonly saltRounds = 12;

  async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcrypt');
    return bcrypt.hash(password, this.saltRounds);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const bcrypt = await import('bcrypt');
    return bcrypt.compare(password, hashedPassword);
  }

  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Auth Service với password validation
@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string; user: UserResponseDto }> {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.verifyPassword(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isAccountActive()) {
      throw new UnauthorizedException('Account is inactive');
    }

    const tokens = await this.generateTokens(user);
    const userResponse = this.mapUserToResponseDto(user);

    return {
      ...tokens,
      user: userResponse,
    };
  }

  async register(registerDto: RegisterDto): Promise<string> {
    // Validate password strength
    const passwordValidation = this.passwordService.validatePasswordStrength(registerDto.password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.passwordService.hashPassword(registerDto.password);

    // Create user
    const user = new User();
    user.username = registerDto.username;
    user.email = registerDto.email;
    user.passwordHash = hashedPassword;
    user.firstName = registerDto.firstName;
    user.lastName = registerDto.lastName;

    const savedUser = await this.userRepository.save(user);
    return savedUser.id;
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
  }

  private mapUserToResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.getFullName(),
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
```

### 9.6. JWT Token Management
```typescript
// JWT Token Service (renamed to avoid conflict)
@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

## 10. Database Best Practices với TypeORM

### 10.1. Database Naming Conventions

#### Table Naming Standards:
- **Tất cả tables** phải bắt đầu với prefix `BMM_` (hoặc `BML_` cho LIS GPB project)
- Sử dụng **UPPERCASE** cho tất cả table names
- Sử dụng **UNDERSCORE** để phân tách từ
- Sử dụng **SINGULAR** table names
- Ví dụ: `BMM_USERS`, `BMM_ORDERS`, `BMM_PRODUCTS` (hoặc `BML_USERS`, `BML_ORDERS`, `BML_PRODUCTS`)

#### Column Naming Standards:
- **Tất cả columns** phải sử dụng **UPPERCASE**
- Sử dụng **UNDERSCORE** để phân tách từ
- Sử dụng **descriptive** column names
- Ví dụ: `USER_ID`, `CREATED_AT`, `UPDATED_AT`, `FIRST_NAME`, `LAST_NAME`

#### Index Naming Standards:
- **Primary Key**: `PK_BMM_TABLENAME` (ví dụ: `PK_BMM_USERS`)
- **Unique Index**: `UK_BMM_TABLENAME_COLUMN` (ví dụ: `UK_BMM_USERS_USERNAME`)
- **Foreign Key**: `FK_BMM_TABLENAME_REFERENCEDTABLE` (ví dụ: `FK_BMM_ORDERS_BMM_USERS`)
- **Regular Index**: `IDX_BMM_TABLENAME_COLUMN` (ví dụ: `IDX_BMM_USERS_EMAIL`)

#### Oracle 12c Naming Constraints (Dưới 30 ký tự):
**Quan trọng**: Oracle 12c có giới hạn tên index, constraint, trigger dưới 30 ký tự.

**Quy tắc đặt tên cho Oracle:**
- **Primary Key**: `PK_BMM_TBL` (ví dụ: `PK_BMM_USERS` = 12 ký tự) hoặc `PK_BML_TBL` (ví dụ: `PK_BML_USERS` = 12 ký tự)
- **Unique Index**: `UK_BMM_TBL_COL` (ví dụ: `UK_BMM_USERS_USERNAME` = 20 ký tự) hoặc `UK_BML_TBL_COL` (ví dụ: `UK_BML_USERS_USERNAME` = 20 ký tự)
- **Foreign Key**: `FK_BMM_TBL_REF` (ví dụ: `FK_BMM_ORDERS_USERS` = 18 ký tự) hoặc `FK_BML_TBL_REF` (ví dụ: `FK_BML_ORDERS_USERS` = 18 ký tự)
- **Regular Index**: `IDX_BMM_TBL_COL` (ví dụ: `IDX_BMM_USERS_EMAIL` = 19 ký tự) hoặc `IDX_BML_TBL_COL` (ví dụ: `IDX_BML_USERS_EMAIL` = 19 ký tự)
- **Check Constraint**: `CK_BMM_TBL_COL` (ví dụ: `CK_BMM_USERS_ACTIVE` = 18 ký tự) hoặc `CK_BML_TBL_COL` (ví dụ: `CK_BML_USERS_ACTIVE` = 18 ký tự)
- **Trigger**: `TR_BMM_TBL_ACTION` (ví dụ: `TR_BMM_USERS_AUDIT` = 18 ký tự) hoặc `TR_BML_TBL_ACTION` (ví dụ: `TR_BML_USERS_AUDIT` = 18 ký tự)

**Ví dụ cụ thể cho Oracle:**
```sql
-- Table: BMM_USERS (8 ký tự) hoặc BML_USERS (8 ký tự)
-- Primary Key: PK_BMM_USERS (12 ký tự) hoặc PK_BML_USERS (12 ký tự)
-- Unique Index: UK_BMM_USERS_USERNAME (20 ký tự) hoặc UK_BML_USERS_USERNAME (20 ký tự)
-- Foreign Key: FK_BMM_ORDERS_USERS (18 ký tự) hoặc FK_BML_ORDERS_USERS (18 ký tự)
-- Regular Index: IDX_BMM_USERS_EMAIL (19 ký tự) hoặc IDX_BML_USERS_EMAIL (19 ký tự)
-- Check Constraint: CK_BMM_USERS_ACTIVE (18 ký tự) hoặc CK_BML_USERS_ACTIVE (18 ký tự)
-- Trigger: TR_BMM_USERS_AUDIT (18 ký tự) hoặc TR_BML_USERS_AUDIT (18 ký tự)
```

**Lưu ý đặc biệt:**
- **Tên table** có thể dài hơn 30 ký tự (không bị giới hạn)
- **Tên column** có thể dài hơn 30 ký tự (không bị giới hạn)
- **Chỉ có index, constraint, trigger** bị giới hạn 30 ký tự
- **Sử dụng viết tắt** cho các từ dài: `USERNAME` → `USR`, `CREATED_AT` → `CRT_AT`

### 10.2. Entity Design Standards
```typescript
// Base Entity với common fields
@Entity('BMM_BASE_ENTITY')
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Column({ name: 'ID', type: 'uuid' })
  id: string;

  @CreateDateColumn({ name: 'CREATED_AT' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'UPDATED_AT' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'DELETED_AT', nullable: true })
  deletedAt?: Date;

  @Column({ name: 'CREATED_BY', nullable: true })
  createdBy?: string;

  @Column({ name: 'UPDATED_BY', nullable: true })
  updatedBy?: string;

  @VersionColumn({ name: 'VERSION' })
  version: number;
}

// User Entity example
@Entity('BMM_USERS')
export class User extends BaseEntity {
  @Column({ name: 'USERNAME', unique: true })
  username: string;

  @Column({ name: 'EMAIL', unique: true })
  email: string;

  @Column({ name: 'PASSWORD_HASH' })
  passwordHash: string;

  @Column({ name: 'FIRST_NAME' })
  firstName: string;

  @Column({ name: 'LAST_NAME' })
  lastName: string;

  @Column({ name: 'IS_ACTIVE', default: true })
  isActive: boolean;

  @Column({ name: 'PHONE_NUMBER', nullable: true })
  phoneNumber?: string;

  @Column({ name: 'DATE_OF_BIRTH', type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ name: 'ADDRESS', type: 'text', nullable: true })
  address?: string;

  // Business methods
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isAccountActive(): boolean {
    return this.isActive && !this.deletedAt;
  }
}

// Order Entity example với relationships
@Entity('BMM_ORDERS')
export class Order extends BaseEntity {
  @Column({ name: 'ORDER_NUMBER', unique: true })
  orderNumber: string;

  @Column({ name: 'USER_ID', type: 'uuid' })
  userId: string;

  @Column({ name: 'TOTAL_AMOUNT', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'STATUS', default: 'PENDING' })
  status: string;

  @Column({ name: 'ORDER_DATE', type: 'timestamp' })
  orderDate: Date;

  @Column({ name: 'SHIPPING_ADDRESS', type: 'text' })
  shippingAddress: string;

  @Column({ name: 'NOTES', type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({ name: 'USER_ID' })
  user: User;

  @OneToMany(() => OrderItem, orderItem => orderItem.order)
  orderItems: OrderItem[];

  // Business methods
  calculateTotal(): number {
    return this.orderItems?.reduce((total, item) => total + item.subtotal, 0) || 0;
  }

  isCompleted(): boolean {
    return this.status === 'COMPLETED';
  }
}

// OrderItem Entity example
@Entity('BMM_ORDER_ITEMS')
export class OrderItem extends BaseEntity {
  @Column({ name: 'ORDER_ID', type: 'uuid' })
  orderId: string;

  @Column({ name: 'PRODUCT_ID', type: 'uuid' })
  productId: string;

  @Column({ name: 'QUANTITY', type: 'int' })
  quantity: number;

  @Column({ name: 'UNIT_PRICE', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: 'SUBTOTAL', type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  // Relationships
  @ManyToOne(() => Order, order => order.orderItems)
  @JoinColumn({ name: 'ORDER_ID' })
  order: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'PRODUCT_ID' })
  product: Product;

  // Business methods
  calculateSubtotal(): number {
    return this.quantity * this.unitPrice;
  }
}

// Product Entity example
@Entity('BMM_PRODUCTS')
export class Product extends BaseEntity {
  @Column({ name: 'PRODUCT_CODE', unique: true })
  productCode: string;

  @Column({ name: 'PRODUCT_NAME' })
  productName: string;

  @Column({ name: 'DESCRIPTION', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'PRICE', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'STOCK_QUANTITY', type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ name: 'CATEGORY_ID', type: 'uuid', nullable: true })
  categoryId?: string;

  @Column({ name: 'IS_ACTIVE', default: true })
  isActive: boolean;

  // Relationships
  @ManyToOne(() => Category)
  @JoinColumn({ name: 'CATEGORY_ID' })
  category?: Category;

  // Business methods
  isInStock(): boolean {
    return this.stockQuantity > 0;
  }

  isAvailable(): boolean {
    return this.isActive && this.isInStock();
  }
}

// Category Entity example
@Entity('BMM_CATEGORIES')
export class Category extends BaseEntity {
  @Column({ name: 'CATEGORY_NAME' })
  categoryName: string;

  @Column({ name: 'DESCRIPTION', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'PARENT_CATEGORY_ID', type: 'uuid', nullable: true })
  parentCategoryId?: string;

  @Column({ name: 'IS_ACTIVE', default: true })
  isActive: boolean;

  // Relationships
  @ManyToOne(() => Category, category => category.subCategories)
  @JoinColumn({ name: 'PARENT_CATEGORY_ID' })
  parentCategory?: Category;

  @OneToMany(() => Category, category => category.parentCategory)
  subCategories: Category[];

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}
```

### 10.2. Repository Pattern với TypeORM
```typescript
// Repository Interface
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  findActiveUsers(limit: number, offset: number): Promise<[User[], number]>;
}

// Repository Implementation
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, deletedAt: IsNull() },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username, deletedAt: IsNull() },
    });
  }

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.softDelete(id);
  }

  async findActiveUsers(limit: number, offset: number): Promise<[User[], number]> {
    return this.userRepository.findAndCount({
      where: { isActive: true, deletedAt: IsNull() },
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
  }
}
```

### 10.3. CQRS Implementation trong Service Layer
```typescript
// Service với CQRS Pattern
@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('INotificationService')
    private readonly notificationService: INotificationService,
    private readonly dataSource: DataSource,
  ) {}

  // ========== COMMANDS (Write Operations) ==========
  
  async createUser(createUserDto: CreateUserDto, currentUser: CurrentUser): Promise<string> {
    return this.dataSource.transaction(async (manager) => {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Create user
      const user = new User();
      user.username = createUserDto.username;
      user.email = createUserDto.email;
      user.passwordHash = await this.hashPassword(createUserDto.password);
      user.firstName = createUserDto.firstName;
      user.lastName = createUserDto.lastName;
      
      // Set audit fields
      user.createdBy = currentUser.id;
      user.updatedBy = currentUser.id;

      const savedUser = await manager.save(User, user);

      // Send welcome notification (async)
      this.notificationService.sendWelcomeEmail(savedUser.email).catch((error) => {
        console.error('Failed to send welcome email:', error);
      });

      return savedUser.id;
    });
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto, currentUser: CurrentUser): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update user fields
      Object.assign(user, updateUserDto);
      user.updatedBy = currentUser.id; // Set updatedBy

      await manager.save(User, user);
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.userRepository.delete(id);
    });
  }

  async activateUser(id: string): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.isActive = true;
      await manager.save(User, user);
    });
  }

  // ========== QUERIES (Read Operations) ==========

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapUserToResponseDto(user);
  }

  async getUsers(query: GetUsersDto): Promise<GetUsersResult> {
    const { limit = 10, offset = 0, search, status } = query;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.deletedAt IS NULL')
      .orderBy('user.createdAt', 'DESC')
      .limit(limit)
      .offset(offset);

    // Add search condition
    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Add status filter
    if (status !== undefined) {
      queryBuilder.andWhere('user.isActive = :status', { status });
    }

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users: users.map(user => this.mapUserToResponseDto(user)),
      total,
      limit,
      offset,
    };
  }

  async findUserByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findByEmail(email);
    return user ? this.mapUserToResponseDto(user) : null;
  }

  // ========== PRIVATE METHODS ==========

  private async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcrypt');
    const saltRounds = 12; // High security salt rounds
    return bcrypt.hash(password, saltRounds);
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const bcrypt = await import('bcrypt');
    return bcrypt.compare(password, hashedPassword);
  }

  private mapUserToResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.getFullName(),
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
```

### 10.4. DataLoader Implementation
```typescript
// DataLoader Service
@Injectable()
export class DataLoaderService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
  ) {}

  createUserLoader(): DataLoader<string, User> {
    return new DataLoader<string, User>(async (userIds: string[]) => {
      const users = await this.userRepository.findByIds(userIds);
      const userMap = new Map(users.map(user => [user.id, user]));
      return userIds.map(id => userMap.get(id) || null);
    });
  }

  createOrderLoader(): DataLoader<string, Order[]> {
    return new DataLoader<string, Order[]>(async (userIds: string[]) => {
      const orders = await this.orderRepository.findByUserIds(userIds);
      const orderMap = new Map<string, Order[]>();
      
      orders.forEach(order => {
        if (!orderMap.has(order.userId)) {
          orderMap.set(order.userId, []);
        }
        orderMap.get(order.userId)!.push(order);
      });
      
      return userIds.map(userId => orderMap.get(userId) || []);
    });
  }

  createLoaders() {
    return {
      userLoader: this.createUserLoader(),
      orderLoader: this.createOrderLoader(),
    };
  }
}

// DataLoader Module
@Module({
  providers: [DataLoaderService],
  exports: [DataLoaderService],
})
export class DataLoaderModule {}
```

### 10.5. Service Integration với DataLoader
```typescript
// Service với DataLoader
@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly dataLoaderService: DataLoaderService,
  ) {}

  // ========== QUERIES với DataLoader ==========

  async getUsersWithOrders(query: GetUsersDto): Promise<GetUsersResult> {
    const { limit = 10, offset = 0 } = query;
    
    // Get users
    const [users, total] = await this.userRepository.findActiveUsers(limit, offset);
    
    // Create DataLoader instance for this request
    const loaders = this.dataLoaderService.createLoaders();
    
    // Load orders for each user using DataLoader
    const usersWithOrders = await Promise.all(
      users.map(async (user) => {
        const orders = await loaders.orderLoader.load(user.id);
        return {
          ...user,
          orders,
        };
      })
    );

    return {
      users: usersWithOrders,
      total,
      limit,
      offset,
    };
  }

  async getUserWithOrders(id: string): Promise<UserWithOrdersResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create DataLoader instance for this request
    const loaders = this.dataLoaderService.createLoaders();
    
    // Load orders using DataLoader
    const orders = await loaders.orderLoader.load(user.id);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.getFullName(),
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        orderDate: order.orderDate,
        shippingAddress: order.shippingAddress,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
    };
  }
}
```

### 10.6. Controller Implementation với CQRS
```typescript
// Controller với CQRS Pattern
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ========== COMMAND ENDPOINTS (Write Operations) ==========

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const userId = await this.userService.createUser(createUserDto);
    return ResponseBuilder.success({ id: userId }, 201);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.userService.updateUser(id, updateUserDto);
    return ResponseBuilder.success({ message: 'User updated successfully' });
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.userService.deleteUser(id);
    return ResponseBuilder.success({ message: 'User deleted successfully' });
  }

  @Patch(':id/activate')
  async activateUser(@Param('id') id: string) {
    await this.userService.activateUser(id);
    return ResponseBuilder.success({ message: 'User activated successfully' });
  }

  // ========== QUERY ENDPOINTS (Read Operations) ==========

  @Get()
  async getUsers(@Query() query: GetUsersDto) {
    const result = await this.userService.getUsers(query);
    return ResponseBuilder.success(result);
  }

  @Get('with-orders')
  async getUsersWithOrders(@Query() query: GetUsersDto) {
    const result = await this.userService.getUsersWithOrders(query);
    return JoinResponseBuilder.successWithPagination(
      result.users,
      {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasNext: result.offset + result.limit < result.total,
        hasPrev: result.offset > 0,
      },
      {
        totalJoins: 2,
        joinTables: ['BMM_USERS', 'BMM_ORDERS'],
        executionTime: 45, // This would be calculated in real implementation
      }
    );
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    return ResponseBuilder.success(user);
  }

  @Get(':id/with-orders')
  async getUserWithOrders(@Param('id') id: string) {
    const user = await this.userService.getUserWithOrders(id);
    return JoinResponseBuilder.successWithJoin(
      user,
      {
        totalJoins: 2,
        joinTables: ['BMM_USERS', 'BMM_ORDERS'],
        executionTime: 32, // This would be calculated in real implementation
      }
    );
  }

  @Get('email/:email')
  async findUserByEmail(@Param('email') email: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return ResponseBuilder.success(user);
  }
}
```

### 10.5. Database Migration Examples
```sql
-- Migration: 001_create_bmm_users_table.sql
CREATE TABLE BMM_USERS (
    ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    USERNAME VARCHAR(50) NOT NULL UNIQUE,
    EMAIL VARCHAR(100) NOT NULL UNIQUE,
    PASSWORD_HASH VARCHAR(255) NOT NULL,
    FIRST_NAME VARCHAR(50) NOT NULL,
    LAST_NAME VARCHAR(50) NOT NULL,
    PHONE_NUMBER VARCHAR(20),
    DATE_OF_BIRTH DATE,
    ADDRESS TEXT,
    IS_ACTIVE BOOLEAN DEFAULT TRUE,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DELETED_AT TIMESTAMP NULL,
    CREATED_BY VARCHAR(50),
    UPDATED_BY VARCHAR(50),
    VERSION INTEGER DEFAULT 1
);

-- Indexes for BMM_USERS
CREATE INDEX IDX_BMM_USERS_EMAIL ON BMM_USERS(EMAIL);
CREATE INDEX IDX_BMM_USERS_USERNAME ON BMM_USERS(USERNAME);
CREATE INDEX IDX_BMM_USERS_IS_ACTIVE ON BMM_USERS(IS_ACTIVE);
CREATE INDEX IDX_BMM_USERS_CREATED_AT ON BMM_USERS(CREATED_AT);

-- Migration: 002_create_bmm_categories_table.sql
CREATE TABLE BMM_CATEGORIES (
    ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    CATEGORY_NAME VARCHAR(100) NOT NULL,
    DESCRIPTION TEXT,
    PARENT_CATEGORY_ID UUID,
    IS_ACTIVE BOOLEAN DEFAULT TRUE,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DELETED_AT TIMESTAMP NULL,
    CREATED_BY VARCHAR(50),
    UPDATED_BY VARCHAR(50),
    VERSION INTEGER DEFAULT 1,
    
    CONSTRAINT FK_BMM_CATEGORIES_BMM_CATEGORIES 
        FOREIGN KEY (PARENT_CATEGORY_ID) 
        REFERENCES BMM_CATEGORIES(ID)
);

-- Indexes for BMM_CATEGORIES
CREATE INDEX IDX_BMM_CATEGORIES_CATEGORY_NAME ON BMM_CATEGORIES(CATEGORY_NAME);
CREATE INDEX IDX_BMM_CATEGORIES_PARENT_CATEGORY_ID ON BMM_CATEGORIES(PARENT_CATEGORY_ID);
CREATE INDEX IDX_BMM_CATEGORIES_IS_ACTIVE ON BMM_CATEGORIES(IS_ACTIVE);

-- Migration: 003_create_bmm_products_table.sql
CREATE TABLE BMM_PRODUCTS (
    ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    PRODUCT_CODE VARCHAR(50) NOT NULL UNIQUE,
    PRODUCT_NAME VARCHAR(200) NOT NULL,
    DESCRIPTION TEXT,
    PRICE DECIMAL(10,2) NOT NULL,
    STOCK_QUANTITY INTEGER DEFAULT 0,
    CATEGORY_ID UUID,
    IS_ACTIVE BOOLEAN DEFAULT TRUE,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DELETED_AT TIMESTAMP NULL,
    CREATED_BY VARCHAR(50),
    UPDATED_BY VARCHAR(50),
    VERSION INTEGER DEFAULT 1,
    
    CONSTRAINT FK_BMM_PRODUCTS_BMM_CATEGORIES 
        FOREIGN KEY (CATEGORY_ID) 
        REFERENCES BMM_CATEGORIES(ID)
);

-- Indexes for BMM_PRODUCTS
CREATE INDEX IDX_BMM_PRODUCTS_PRODUCT_CODE ON BMM_PRODUCTS(PRODUCT_CODE);
CREATE INDEX IDX_BMM_PRODUCTS_PRODUCT_NAME ON BMM_PRODUCTS(PRODUCT_NAME);
CREATE INDEX IDX_BMM_PRODUCTS_CATEGORY_ID ON BMM_PRODUCTS(CATEGORY_ID);
CREATE INDEX IDX_BMM_PRODUCTS_IS_ACTIVE ON BMM_PRODUCTS(IS_ACTIVE);
CREATE INDEX IDX_BMM_PRODUCTS_STOCK_QUANTITY ON BMM_PRODUCTS(STOCK_QUANTITY);

-- Migration: 004_create_bmm_orders_table.sql
CREATE TABLE BMM_ORDERS (
    ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ORDER_NUMBER VARCHAR(50) NOT NULL UNIQUE,
    USER_ID UUID NOT NULL,
    TOTAL_AMOUNT DECIMAL(10,2) NOT NULL,
    STATUS VARCHAR(20) DEFAULT 'PENDING',
    ORDER_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    SHIPPING_ADDRESS TEXT NOT NULL,
    NOTES TEXT,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DELETED_AT TIMESTAMP NULL,
    CREATED_BY VARCHAR(50),
    UPDATED_BY VARCHAR(50),
    VERSION INTEGER DEFAULT 1,
    
    CONSTRAINT FK_BMM_ORDERS_BMM_USERS 
        FOREIGN KEY (USER_ID) 
        REFERENCES BMM_USERS(ID)
);

-- Indexes for BMM_ORDERS
CREATE INDEX IDX_BMM_ORDERS_ORDER_NUMBER ON BMM_ORDERS(ORDER_NUMBER);
CREATE INDEX IDX_BMM_ORDERS_USER_ID ON BMM_ORDERS(USER_ID);
CREATE INDEX IDX_BMM_ORDERS_STATUS ON BMM_ORDERS(STATUS);
CREATE INDEX IDX_BMM_ORDERS_ORDER_DATE ON BMM_ORDERS(ORDER_DATE);

-- Migration: 005_create_bmm_order_items_table.sql
CREATE TABLE BMM_ORDER_ITEMS (
    ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ORDER_ID UUID NOT NULL,
    PRODUCT_ID UUID NOT NULL,
    QUANTITY INTEGER NOT NULL,
    UNIT_PRICE DECIMAL(10,2) NOT NULL,
    SUBTOTAL DECIMAL(10,2) NOT NULL,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DELETED_AT TIMESTAMP NULL,
    CREATED_BY VARCHAR(50),
    UPDATED_BY VARCHAR(50),
    VERSION INTEGER DEFAULT 1,
    
    CONSTRAINT FK_BMM_ORDER_ITEMS_BMM_ORDERS 
        FOREIGN KEY (ORDER_ID) 
        REFERENCES BMM_ORDERS(ID),
    CONSTRAINT FK_BMM_ORDER_ITEMS_BMM_PRODUCTS 
        FOREIGN KEY (PRODUCT_ID) 
        REFERENCES BMM_PRODUCTS(ID)
);

-- Indexes for BMM_ORDER_ITEMS
CREATE INDEX IDX_BMM_ORDER_ITEMS_ORDER_ID ON BMM_ORDER_ITEMS(ORDER_ID);
CREATE INDEX IDX_BMM_ORDER_ITEMS_PRODUCT_ID ON BMM_ORDER_ITEMS(PRODUCT_ID);
```

### 10.6. TypeORM Configuration với BMM_ Naming

#### PostgreSQL Configuration:
```typescript
// TypeORM Configuration for PostgreSQL
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'bmm_db',
  entities: [User, Order, OrderItem, Product, Category],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  namingStrategy: new SnakeNamingStrategy(), // Converts camelCase to snake_case
  migrations: ['dist/migrations/*.js'],
  migrationsRun: true,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};
```

#### Oracle Configuration:
```typescript
// TypeORM Configuration for Oracle 12c
export const oracleConfig: TypeOrmModuleOptions = {
  type: 'oracle',
  host: process.env.ORACLE_HOST || 'localhost',
  port: parseInt(process.env.ORACLE_PORT) || 1521,
  username: process.env.ORACLE_USERNAME || 'HIS_RS',
  password: process.env.ORACLE_PASSWORD || 'HIS_RS',
  serviceName: process.env.ORACLE_SERVICE_NAME || 'orclstb',
  entities: [User, Order, OrderItem, Product, Category],
  synchronize: false, // Oracle không support synchronize
  logging: process.env.NODE_ENV === 'development',
  namingStrategy: new OracleNamingStrategy(), // Custom Oracle naming strategy
  migrations: ['dist/migrations/*.js'],
  migrationsRun: true,
  extra: {
    connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE_NAME}`,
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1,
    poolTimeout: 60,
    poolPingInterval: 60,
  },
};

// Custom Naming Strategy để handle BMM_ prefix (hoặc BML_ cho LIS GPB)
export class BMMNamingStrategy extends SnakeNamingStrategy {
  tableName(className: string, customName?: string): string {
    if (customName) {
      return customName;
    }
    // Convert ClassName to BMM_TABLE_NAME format (hoặc BML_ cho LIS GPB)
    const snakeCase = className.replace(/([A-Z])/g, '_$1').toLowerCase();
    const prefix = process.env.DB_PREFIX || 'BMM_';
    return `${prefix}${snakeCase.substring(1).toUpperCase()}`;
  }

  columnName(propertyName: string, customName?: string, embeddedPrefixes: string[] = []): string {
    if (customName) {
      return customName;
    }
    // Convert propertyName to COLUMN_NAME format
    const snakeCase = propertyName.replace(/([A-Z])/g, '_$1').toLowerCase();
    return snakeCase.substring(1).toUpperCase();
  }

  indexName(tableOrName: string, columns: string[], where?: string): string {
    const tableName = typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    const columnNames = columns.join('_');
    return `IDX_${tableName}_${columnNames}`;
  }

  primaryKeyName(tableOrName: string, columnNames: string[]): string {
    const tableName = typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    return `PK_${tableName}`;
  }

  uniqueConstraintName(tableOrName: string, columnNames: string[]): string {
    const tableName = typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    const columnNamesStr = columnNames.join('_');
    return `UK_${tableName}_${columnNamesStr}`;
  }

  foreignKeyName(tableOrName: string, columnNames: string[], referencedTablePath?: string, referencedColumnNames?: string[]): string {
    const tableName = typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    const referencedTableName = referencedTablePath?.split('.').pop();
    return `FK_${tableName}_${referencedTableName}`;
  }
}

// Oracle Naming Strategy với giới hạn 30 ký tự
export class OracleNamingStrategy extends BMMNamingStrategy {
  // Override để đảm bảo tên không vượt quá 30 ký tự
  indexName(tableOrName: string, columns: string[], where?: string): string {
    const tableName = typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    const columnNames = columns.join('_');
    const fullName = `IDX_${tableName}_${columnNames}`;
    
    // Nếu vượt quá 30 ký tự, sử dụng viết tắt
    if (fullName.length > 30) {
      const shortTableName = this.shortenName(tableName);
      const shortColumnNames = columns.map(col => this.shortenName(col)).join('_');
      return `IDX_${shortTableName}_${shortColumnNames}`.substring(0, 30);
    }
    
    return fullName;
  }

  primaryKeyName(tableOrName: string, columnNames: string[]): string {
    const tableName = typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    const fullName = `PK_${tableName}`;
    
    if (fullName.length > 30) {
      const shortTableName = this.shortenName(tableName);
      return `PK_${shortTableName}`.substring(0, 30);
    }
    
    return fullName;
  }

  uniqueConstraintName(tableOrName: string, columnNames: string[]): string {
    const tableName = typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    const columnNamesStr = columnNames.join('_');
    const fullName = `UK_${tableName}_${columnNamesStr}`;
    
    if (fullName.length > 30) {
      const shortTableName = this.shortenName(tableName);
      const shortColumnNames = columns.map(col => this.shortenName(col)).join('_');
      return `UK_${shortTableName}_${shortColumnNames}`.substring(0, 30);
    }
    
    return fullName;
  }

  foreignKeyName(tableOrName: string, columnNames: string[], referencedTablePath?: string, referencedColumnNames?: string[]): string {
    const tableName = typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    const referencedTableName = referencedTablePath?.split('.').pop();
    const fullName = `FK_${tableName}_${referencedTableName}`;
    
    if (fullName.length > 30) {
      const shortTableName = this.shortenName(tableName);
      const shortRefTableName = this.shortenName(referencedTableName);
      return `FK_${shortTableName}_${shortRefTableName}`.substring(0, 30);
    }
    
    return fullName;
  }

  // Helper method để rút gọn tên
  private shortenName(name: string): string {
    const abbreviations: { [key: string]: string } = {
      'USERNAME': 'USR',
      'CREATED_AT': 'CRT_AT',
      'UPDATED_AT': 'UPD_AT',
      'DELETED_AT': 'DEL_AT',
      'FIRST_NAME': 'FST_NM',
      'LAST_NAME': 'LST_NM',
      'PHONE_NUMBER': 'PHN_NUM',
      'DATE_OF_BIRTH': 'DOB',
      'IS_ACTIVE': 'ACTIVE',
      'PASSWORD_HASH': 'PWD_HASH',
      'ORDER_NUMBER': 'ORD_NUM',
      'TOTAL_AMOUNT': 'TOT_AMT',
      'SHIPPING_ADDRESS': 'SHIP_ADDR',
      'PRODUCT_CODE': 'PROD_CD',
      'PRODUCT_NAME': 'PROD_NM',
      'STOCK_QUANTITY': 'STK_QTY',
      'CATEGORY_NAME': 'CAT_NM',
      'PARENT_CATEGORY_ID': 'PARENT_CAT_ID',
      'ORDER_ITEMS': 'ORD_ITEMS',
      'UNIT_PRICE': 'UNIT_PRC',
      'SUBTOTAL': 'SUB_TOT',
    };

    return abbreviations[name] || name.substring(0, 8);
  }
}
```

## 11. Testing & Quality Assurance

### 11.1. Unit Testing với Jest (CQRS Pattern)
```typescript
// Service Test với CQRS
describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<IUserRepository>;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'IUserRepository',
          useValue: {
            save: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get('IUserRepository');
    dataSource = module.get(DataSource);
  });

  describe('Commands (Write Operations)', () => {
    it('should create user successfully', async () => {
      // Arrange
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockUser = new User();
      mockUser.id = 'user-id';
      mockUser.username = createUserDto.username;

      userRepository.findByEmail.mockResolvedValue(null);
      dataSource.transaction.mockImplementation(async (callback) => {
        return callback({
          save: jest.fn().mockResolvedValue(mockUser),
        });
      });

      // Act
      const result = await service.createUser(createUserDto);

      // Assert
      expect(result).toBe('user-id');
      expect(userRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      const createUserDto = {
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const existingUser = new User();
      userRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.createUser(createUserDto)).rejects.toThrow('User with this email already exists');
    });

    it('should update user successfully', async () => {
      // Arrange
      const userId = 'user-id';
      const updateUserDto = { firstName: 'Updated' };
      const mockUser = new User();
      mockUser.id = userId;

      userRepository.findById.mockResolvedValue(mockUser);
      dataSource.transaction.mockImplementation(async (callback) => {
        return callback({
          save: jest.fn().mockResolvedValue(mockUser),
        });
      });

      // Act
      await service.updateUser(userId, updateUserDto);

      // Assert
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('Queries (Read Operations)', () => {
    it('should get user by id', async () => {
      // Arrange
      const userId = 'user-id';
      const mockUser = new User();
      mockUser.id = userId;
      mockUser.username = 'testuser';

      userRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw error if user not found', async () => {
      // Arrange
      const userId = 'non-existent-id';
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserById(userId)).rejects.toThrow('User not found');
    });
  });
});
```

### 11.2. Integration Testing
```typescript
// Integration Test
describe('UserController (Integration)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'test',
          password: 'test',
          database: 'test_db',
          entities: [User],
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await userRepository.clear();
  });

  it('POST /api/v1/users should create user', async () => {
    // Arrange
    const createUserDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    // Act
    const response = await request(app.getHttpServer())
      .post('/api/v1/users')
      .send(createUserDto)
      .expect(201);

    // Assert
    expect(response.body.success).toBe(true);
    expect(response.body.data.username).toBe(createUserDto.username);

    // Verify in database
    const user = await userRepository.findOne({
      where: { username: createUserDto.username },
    });
    expect(user).toBeDefined();
  });

  it('GET /api/v1/users should return users list', async () => {
    // Arrange
    const user = new User();
    user.username = 'testuser';
    user.email = 'test@example.com';
    user.passwordHash = 'hashed';
    user.firstName = 'Test';
    user.lastName = 'User';
    await userRepository.save(user);

    // Act
    const response = await request(app.getHttpServer())
      .get('/api/v1/users')
      .expect(200);

    // Assert
    expect(response.body.success).toBe(true);
    expect(response.body.data.users).toHaveLength(1);
    expect(response.body.data.users[0].username).toBe('testuser');
  });
});
```

### 11.3. E2E Testing
```typescript
// E2E Test
describe('User E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/users')
      .send({
        username: 'e2euser',
        email: 'e2e@example.com',
        password: 'password123',
        firstName: 'E2E',
        lastName: 'User',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.username).toBe('e2euser');
      });
  });

  it('/api/v1/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/users')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data.users)).toBe(true);
      });
  });
});
```

### 11.4. Code Quality Standards
```typescript
// ESLint Configuration (.eslintrc.js)
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    '@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};

// Prettier Configuration (.prettierrc)
{
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100
}

// Jest Configuration (jest.config.js)
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.interface.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

## 12. Deployment & DevOps

### 12.1. Docker Configuration
```dockerfile
# Multi-stage Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

### 12.2. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_HOST=postgres
      - DATABASE_PORT=5432
      - DATABASE_NAME=app_db
      - DATABASE_USER=app_user
      - DATABASE_PASSWORD=app_password
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=app_db
      - POSTGRES_USER=app_user
      - POSTGRES_PASSWORD=app_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app_user -d app_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 12.3. Kubernetes Deployment
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nestjs-app
  labels:
    app: nestjs-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nestjs-app
  template:
    metadata:
      labels:
        app: nestjs-app
    spec:
      containers:
      - name: nestjs-app
        image: your-registry/nestjs-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_HOST
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-host
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-password
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL

---
apiVersion: v1
kind: Service
metadata:
  name: nestjs-app-service
spec:
  selector:
    app: nestjs-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nestjs-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.yourdomain.com
    secretName: nestjs-app-tls
  rules:
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nestjs-app-service
            port:
              number: 80
```

### 12.4. CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run type checking
      run: npm run type-check

    - name: Run unit tests
      run: npm run test:unit
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379

    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379

    - name: Generate coverage report
      run: npm run test:cov

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build application
      run: npm run build

    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}

    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}

    - name: Deploy to Kubernetes
      uses: azure/k8s-deploy@v1
      with:
        manifests: |
          k8s-deployment.yaml
        images: |
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
```

### 12.5. Monitoring & Observability
```typescript
// Health Check Controller
@Controller('api/v1')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly redis: RedisHealthIndicator,
  ) {}

  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.pingCheck('redis'),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.pingCheck('redis'),
    ]);
  }

  @Get('live')
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

// Prometheus Metrics
@Injectable()
export class MetricsService {
  private readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
  });

  private readonly httpRequestTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });

  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestTotal.inc({ method, route, status_code: statusCode.toString() });
    this.httpRequestDuration.observe({ method, route, status_code: statusCode.toString() }, duration);
  }
}
```

## 13. Project Context & Configuration

### 13.1. LIS GPB Project Configuration
**Project Name**: LIS GPB Backend
**Description**: Backend API for LIS GPB platform
**Version**: 1.0.0

#### Database Configuration:
- **Type**: Oracle 12c
- **Host**: 192.168.7.248
- **Port**: 1521
- **Username**: HIS_RS
- **Password**: HIS_RS
- **Service Name**: orclstb
- **Prefix**: BML_ (thay vì BMM_)

#### Authentication:
- **JWT Secret**: your-super-secret-key-here
- **Access Token**: 15m
- **Refresh Token**: 7d
- **Password Validation**: Yes

#### API Configuration:
- **Version**: v1
- **Prefix**: /api/v1
- **CORS**: http://localhost:3000
- **Rate Limiting**: Yes

#### Modules:
- **User** (với CQRS pattern)
- **Auth** (với JWT)

#### Project Structure:
```
lis-gpb-backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── common/builders/response.builder.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── oracle-naming.strategy.ts
│   ├── shared/dataloaders/
│   └── modules/
│       ├── user/ (với CQRS pattern)
│       └── auth/ (với JWT)
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

#### Key Features:
- **Layered Architecture** với 3-layer structure
- **CQRS Pattern** trong Service layer
- **JWT Authentication** với Passport Strategy
- **Oracle Database** với BML_ prefix
- **DataLoader Pattern** cho N+1 optimization
- **Docker Configuration** với multi-stage build
- **Response Builder** với standardized format

#### Environment Variables:
```bash
# Database Oracle
DB_TYPE=oracle
DB_HOST=192.168.7.248
DB_PORT=1521
DB_USERNAME=HIS_RS
DB_PASSWORD=HIS_RS
DB_SERVICE_NAME=orclstb
DB_PREFIX=BML_

# JWT
JWT_SECRET=your-super-secret-key-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# API
API_VERSION=v1
API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

#### API Endpoints:
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/users` - Get users list (Protected)
- `GET /api/v1/users/:id` - Get user by ID (Protected)
- `POST /api/v1/users` - Create user (Protected)
- `PUT /api/v1/users/:id` - Update user (Protected)
- `DELETE /api/v1/users/:id` - Delete user (Protected)
- `PATCH /api/v1/users/:id/activate` - Activate user (Protected)

## 14. Rate Limiting & Advanced Caching

### 13.1. Rate Limiting Implementation
**Redis-based Rate Limiting với multiple strategies:**

```typescript
// Rate Limiting Service
@Injectable()
export class RateLimitService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  // Fixed Window Rate Limiting
  async checkFixedWindow(
    key: string, 
    limit: number, 
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, Math.ceil(windowMs / 1000));
    }
    
    const ttl = await this.redis.ttl(key);
    const remaining = Math.max(0, limit - current);
    const resetTime = Date.now() + (ttl * 1000);
    
    return {
      allowed: current <= limit,
      remaining,
      resetTime,
    };
  }

  // Sliding Window Rate Limiting
  async checkSlidingWindow(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Remove old entries
    await this.redis.zremrangebyscore(key, 0, windowStart);
    
    // Count current requests
    const current = await this.redis.zcard(key);
    
    if (current < limit) {
      // Add new request
      await this.redis.zadd(key, now, `${now}-${Math.random()}`);
      await this.redis.expire(key, Math.ceil(windowMs / 1000));
      
      return {
        allowed: true,
        remaining: limit - current - 1,
        resetTime: now + windowMs,
      };
    }
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: now + windowMs,
    };
  }

  // Token Bucket Rate Limiting
  async checkTokenBucket(
    key: string,
    capacity: number,
    refillRate: number, // tokens per second
    tokens: number = 1
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const bucket = await this.redis.hmget(key, 'tokens', 'lastRefill');
    
    let currentTokens = capacity;
    let lastRefill = now;
    
    if (bucket[0] && bucket[1]) {
      currentTokens = parseFloat(bucket[0]);
      lastRefill = parseInt(bucket[1]);
      
      // Calculate tokens to add based on time passed
      const timePassed = (now - lastRefill) / 1000;
      const tokensToAdd = timePassed * refillRate;
      currentTokens = Math.min(capacity, currentTokens + tokensToAdd);
    }
    
    if (currentTokens >= tokens) {
      currentTokens -= tokens;
      await this.redis.hmset(key, 'tokens', currentTokens, 'lastRefill', now);
      await this.redis.expire(key, 3600); // 1 hour TTL
      
      return {
        allowed: true,
        remaining: Math.floor(currentTokens),
        resetTime: now + ((capacity - currentTokens) / refillRate * 1000),
      };
    }
    
    return {
      allowed: false,
      remaining: Math.floor(currentTokens),
      resetTime: now + ((tokens - currentTokens) / refillRate * 1000),
    };
  }
}

// Rate Limiting Guard
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Get rate limit config from decorator
    const rateLimitConfig = this.reflector.get<RateLimitConfig>('rateLimit', context.getHandler());
    if (!rateLimitConfig) {
      return true;
    }

    // Generate key based on IP and user
    const ip = request.ip;
    const userId = request.user?.id || 'anonymous';
    const key = `rate_limit:${rateLimitConfig.type}:${ip}:${userId}`;

    let result;
    switch (rateLimitConfig.type) {
      case 'fixed_window':
        result = await this.rateLimitService.checkFixedWindow(
          key,
          rateLimitConfig.limit,
          rateLimitConfig.windowMs
        );
        break;
      case 'sliding_window':
        result = await this.rateLimitService.checkSlidingWindow(
          key,
          rateLimitConfig.limit,
          rateLimitConfig.windowMs
        );
        break;
      case 'token_bucket':
        result = await this.rateLimitService.checkTokenBucket(
          key,
          rateLimitConfig.capacity,
          rateLimitConfig.refillRate,
          rateLimitConfig.tokens
        );
        break;
      default:
        return true;
    }

    // Set rate limit headers
    response.setHeader('X-RateLimit-Limit', rateLimitConfig.limit);
    response.setHeader('X-RateLimit-Remaining', result.remaining);
    response.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

    if (!result.allowed) {
      throw new TooManyRequestsException('Rate limit exceeded');
    }

    return true;
  }
}

// Rate Limit Decorator
export interface RateLimitConfig {
  type: 'fixed_window' | 'sliding_window' | 'token_bucket';
  limit?: number;
  windowMs?: number;
  capacity?: number;
  refillRate?: number;
  tokens?: number;
}

export const RateLimit = (config: RateLimitConfig) => SetMetadata('rateLimit', config);

// Usage Examples
@Controller('api/v1/auth')
export class AuthController {
  @Post('login')
  @RateLimit({ type: 'sliding_window', limit: 5, windowMs: 60000 }) // 5 attempts per minute
  async login(@Body() loginDto: LoginDto) {
    // Login logic
  }

  @Post('register')
  @RateLimit({ type: 'fixed_window', limit: 3, windowMs: 3600000 }) // 3 registrations per hour
  async register(@Body() registerDto: RegisterDto) {
    // Registration logic
  }
}

@Controller('api/v1/users')
export class UserController {
  @Get()
  @RateLimit({ type: 'token_bucket', capacity: 100, refillRate: 10, tokens: 1 }) // 10 requests per second
  async getUsers(@Query() query: GetUsersDto) {
    // Get users logic
  }
}
```

### 13.2. Advanced Caching Strategies
**Multi-layer caching với Redis và in-memory:**

```typescript
// Cache Service với multiple strategies
@Injectable()
export class CacheService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  // Simple Cache với TTL
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  // Cache với Pattern Matching
  async delPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  // Cache với Tags (for invalidation)
  async setWithTags<T>(key: string, value: T, tags: string[], ttlSeconds?: number): Promise<void> {
    await this.set(key, value, ttlSeconds);
    
    // Store tags for this key
    for (const tag of tags) {
      await this.redis.sadd(`tag:${tag}`, key);
      if (ttlSeconds) {
        await this.redis.expire(`tag:${tag}`, ttlSeconds);
      }
    }
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    for (const tag of tags) {
      const keys = await this.redis.smembers(`tag:${tag}`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        await this.redis.del(`tag:${tag}`);
      }
    }
  }

  // Cache với Write-through strategy
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds?: number,
    tags?: string[]
  ): Promise<T> {
    let value = await this.get<T>(key);
    
    if (value === null) {
      value = await fetcher();
      if (tags) {
        await this.setWithTags(key, value, tags, ttlSeconds);
      } else {
        await this.set(key, value, ttlSeconds);
      }
    }
    
    return value;
  }

  // Cache với Write-behind strategy
  async getOrSetAsync<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    let value = await this.get<T>(key);
    
    if (value === null) {
      value = await fetcher();
      await this.set(key, value, ttlSeconds);
    } else {
      // Async refresh in background
      setImmediate(async () => {
        try {
          const freshValue = await fetcher();
          await this.set(key, freshValue, ttlSeconds);
        } catch (error) {
          console.error('Background cache refresh failed:', error);
        }
      });
    }
    
    return value;
  }
}

// Cache Decorator
export const Cache = (key: string, ttlSeconds?: number, tags?: string[]) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheService = this.cacheService as CacheService;
      const cacheKey = `${key}:${JSON.stringify(args)}`;
      
      return cacheService.getOrSet(
        cacheKey,
        () => method.apply(this, args),
        ttlSeconds,
        tags
      );
    };
  };
};

// Cache Invalidation Decorator
export const CacheInvalidate = (pattern: string) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args);
      const cacheService = this.cacheService as CacheService;
      await cacheService.delPattern(pattern);
      return result;
    };
  };
};

// Usage Examples
@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly cacheService: CacheService,
  ) {}

  @Cache('user', 300, ['users']) // 5 minutes cache with 'users' tag
  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.mapUserToResponseDto(user);
  }

  @Cache('users', 600, ['users']) // 10 minutes cache
  async getUsers(query: GetUsersDto): Promise<GetUsersResult> {
    // Implementation
  }

  @CacheInvalidate('user:*') // Invalidate all user caches
  async updateUser(id: string, updateUserDto: UpdateUserDto, currentUser: CurrentUser): Promise<void> {
    // Implementation
  }

  @CacheInvalidate('users:*') // Invalidate all users list caches
  async createUser(createUserDto: CreateUserDto, currentUser: CurrentUser): Promise<string> {
    // Implementation
  }
}

// Cache Configuration
export const cacheConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB) || 0,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
  },
  defaultTTL: 300, // 5 minutes
  maxMemory: '256mb',
  evictionPolicy: 'allkeys-lru',
};
```

### 13.3. Database Connection Pooling
**Advanced connection pooling configuration:**

```typescript
// Database Configuration với Connection Pooling
export const databaseConfig = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'bmm_db',
  entities: [User, Order, OrderItem, Product, Category],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  namingStrategy: new BMMNamingStrategy(),
  migrations: ['dist/migrations/*.js'],
  migrationsRun: true,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  // Connection Pooling Configuration
  extra: {
    // Connection pool settings
    max: 20, // Maximum number of connections in pool
    min: 5,  // Minimum number of connections in pool
    idle: 10000, // Close idle connections after 10 seconds
    acquire: 30000, // Maximum time to wait for connection (30 seconds)
    evict: 1000, // Check for idle connections every 1 second
    
    // Connection timeout settings
    connectionTimeoutMillis: 2000, // 2 seconds
    idleTimeoutMillis: 30000, // 30 seconds
    query_timeout: 60000, // 60 seconds
    
    // Performance settings
    statement_timeout: 30000, // 30 seconds
    application_name: 'nestjs-app',
    
    // SSL settings for production
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false,
      ca: process.env.DATABASE_SSL_CA,
      cert: process.env.DATABASE_SSL_CERT,
      key: process.env.DATABASE_SSL_KEY,
    } : false,
  },
  
  // Query optimization
  cache: {
    type: 'redis',
    options: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
    },
    duration: 30000, // 30 seconds query cache
  },
  
  // Performance monitoring
  subscribers: [],
  migrations: ['dist/migrations/*.js'],
  cli: {
    migrationsDir: 'src/migrations',
  },
};
```

## 14. Key Conventions Summary

### 13.1. Architecture Principles
1. **Layered Architecture** với 3 layer rõ ràng: Controller → Service → Repository
2. **CQRS Pattern** trong Service layer để tách biệt Read/Write operations
   - **Commands**: Methods thay đổi trạng thái (create, update, delete, activate)
   - **Queries**: Methods đọc dữ liệu (get, find, list, search)
3. **DataLoader Pattern** để giải quyết N+1 queries và tối ưu performance
   - **Batch Loading**: Tập hợp các request cùng loại
   - **Caching**: Cache kết quả trong scope của request
   - **Context Management**: Mỗi request có DataLoader instance riêng
4. **Join Data Response Patterns** cho multi-table queries
   - **Nested Objects**: Cho 1-to-Many relationships
   - **Hierarchical Structure**: Cho complex joins với multiple levels
   - **Flat Structure**: Cho simple joins với flattened fields
   - **Response Builders**: Specialized builders cho join data với metadata
5. **Dependency Injection** sử dụng NestJS DI container
6. **Repository Pattern** với TypeORM
7. **Separation of Concerns** với business logic trong Service layer
8. **Transaction Management** trong Service layer cho Commands

### 13.2. Code Quality Standards
1. **TypeScript strict mode** enabled
2. **ESLint + Prettier** cho code formatting
3. **Jest** cho testing với coverage threshold 80%
4. **Docker** cho containerization
5. **Kubernetes** cho orchestration

### 13.3. API Standards
1. **RESTful API** với proper HTTP methods
2. **JWT Authentication** trực tiếp trong NestJS
3. **Consistent response format** với success/error structure
4. **Proper HTTP status codes** mapping
5. **API versioning** với `/api/v1/` prefix

### 13.4. Security Best Practices
1. **JWT Authentication** với Passport Strategy
2. **Role-based authorization** trong NestJS
3. **Input validation** với class-validator
4. **SQL injection prevention** với TypeORM
5. **HTTPS only** trong production

### 13.5. Performance & Scalability
1. **Database indexing** strategies
2. **Query optimization** với TypeORM QueryBuilder
3. **Caching** với Redis
4. **Connection pooling** cho database
5. **Horizontal scaling** với Kubernetes
6. **Rate limiting** với Redis-based throttling
7. **Advanced caching** strategies với TTL và invalidation
```