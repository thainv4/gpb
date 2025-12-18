# Authentication Guards

Project này hỗ trợ 3 loại authentication guards:

## 1. JwtAuthGuard

**Chỉ chấp nhận JWT token từ Backend**

- Sử dụng cho: Hầu hết các API endpoints
- Header: `Authorization: Bearer <jwt-token>`
- Validate: JWT token được ký bởi backend

**Ví dụ:**
```typescript
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController { }
```

## 2. HisAuthGuard

**Chỉ chấp nhận HIS token**

- Sử dụng cho: API chỉ cần HIS authentication
- Headers: 
  - `TokenCode: <his-token-code>`
  - `ApplicationCode: <application-code>`
- Validate: Chỉ kiểm tra sự tồn tại của headers

**Ví dụ:**
```typescript
@UseGuards(HisAuthGuard)
@Controller('his-api')
export class HisController { }
```

## 3. DualAuthGuard ⭐

**Chấp nhận CẢ JWT token VÀ HIS token**

- Sử dụng cho: API cần linh hoạt authentication (ví dụ: EMR API)
- Logic:
  1. Ưu tiên kiểm tra JWT token (nếu có trong `Authorization` header)
  2. Nếu JWT không có hoặc không hợp lệ, kiểm tra HIS `TokenCode` header
  3. Nếu có một trong hai token hợp lệ thì cho phép truy cập

**Cách sử dụng:**

### Option 1: Dùng JWT Token
```http
POST /api/v1/emr/create-and-sign-hsm
Authorization: Bearer <jwt-token>
TokenCode: <his-token-code>
ApplicationCode: <application-code>
Content-Type: application/json
```

### Option 2: Chỉ dùng HIS Token
```http
POST /api/v1/emr/create-and-sign-hsm
TokenCode: <his-token-code>
ApplicationCode: <application-code>
Content-Type: application/json
```

**Ví dụ trong Controller:**
```typescript
@UseGuards(DualAuthGuard)
@Controller('emr')
export class EmrController {
    async createAndSignHsm(
        @Body() dto: CreateAndSignHsmDto,
        @Request() req: any,
    ) {
        // Guard đã set req.authType = 'JWT' hoặc 'HIS'
        // Guard đã set req.hisTokenCode và req.applicationCode nếu dùng HIS auth
        
        let tokenCode: string;
        let applicationCode: string;

        if (req.authType === 'HIS') {
            tokenCode = req.hisTokenCode;
            applicationCode = req.applicationCode;
        } else {
            // JWT auth - lấy từ header
            tokenCode = req.headers['TokenCode'];
            applicationCode = req.headers['ApplicationCode'];
        }

        return this.emrService.createAndSignHsm(dto, tokenCode, applicationCode);
    }
}
```

## Request Object Properties

Sau khi guard validate thành công, các properties sau được set vào `request`:

### JWT Authentication:
- `req.user`: User entity từ database
- `req.authType`: `'JWT'`

### HIS Authentication:
- `req.hisTokenCode`: HIS token code
- `req.applicationCode`: Application code
- `req.authType`: `'HIS'`

## Error Messages

- **JWT không hợp lệ và không có HIS token**: 
  ```
  Authentication required. Please provide either JWT Bearer token (Authorization header) or HIS TokenCode and ApplicationCode headers.
  ```

- **HIS token thiếu**:
  ```
  HIS TokenCode header is required
  ```

- **ApplicationCode thiếu**:
  ```
  HIS ApplicationCode header is required
  ```

