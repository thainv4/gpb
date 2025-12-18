# Hướng Dẫn Test API Store Service Request

## Service Request Code: `000057337442`

## Cách 1: Test qua Swagger UI (Khuyến nghị)

1. Mở Swagger UI: http://localhost:8000/api/v1/docs

2. **Bước 1: Login để lấy JWT Token**
   - Tìm endpoint `POST /api/v1/auth/login`
   - Click "Try it out"
   - Nhập credentials (ví dụ):
     ```json
     {
       "username": "admin",
       "password": "admin123"
     }
     ```
   - Click "Execute"
   - Copy `accessToken` từ response

3. **Bước 2: Authorize với JWT Token**
   - Click nút "Authorize" (🔓) ở top right
   - Paste `accessToken` vào field "Value"
   - Click "Authorize" → "Close"

4. **Bước 3: Get Service Request từ HIS**
   - Tìm endpoint `GET /api/v1/service-requests/code/{serviceReqCode}`
   - Click "Try it out"
   - Nhập `serviceReqCode`: `000057337442`
   - Click "Execute"
   - Xem response để lấy thông tin:
     - `executeRoom.lisRoomId` → dùng cho `currentRoomId`
     - `executeDepartment.lisDepartmentId` → dùng cho `currentDepartmentId`

5. **Bước 4: Store Service Request**
   - Tìm endpoint `POST /api/v1/service-requests/store`
   - Click "Try it out"
   - Nhập request body:
     ```json
     {
       "serviceReqCode": "000057337442",
       "currentRoomId": "uuid-from-step3",
       "currentDepartmentId": "uuid-from-step3",
       "receptionCode": "REC-20251101-001",
       "sampleCollectionTime": "2025-11-01T10:30:00Z",
       "saveRawJson": false
     }
     ```
   - Click "Execute"
   - Xem response:
     - `servicesCount`: Số lượng services đã lưu
     - `workflowStarted`: true/false - Workflow đã tự động start chưa

## Cách 2: Test bằng PowerShell Script

Chạy script `test-store-service-request.ps1` nhưng cần:
1. Cập nhật username/password đúng trong script
2. Hoặc tạo user mới trước bằng endpoint register

## Cách 3: Test bằng cURL (nếu có JWT token)

```bash
# 1. Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2. Get Service Request (thay YOUR_TOKEN)
curl -X GET http://localhost:8000/api/v1/service-requests/code/000057337442 \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Store Service Request (thay YOUR_TOKEN và UUIDs)
curl -X POST http://localhost:8000/api/v1/service-requests/store \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceReqCode": "000057337442",
    "currentRoomId": "uuid-room-001",
    "currentDepartmentId": "uuid-dept-001",
    "receptionCode": "REC-20251101-001",
    "sampleCollectionTime": "2025-11-01T10:30:00Z"
  }'
```

## Kiểm Tra Kết Quả

Sau khi store thành công, kiểm tra database:

```sql
-- Kiểm tra Stored Service Request
SELECT * FROM BML_STORED_SERVICE_REQUESTS 
WHERE SERVICE_REQ_CODE = '000057337442';

-- Kiểm tra Services đã lưu
SELECT COUNT(*) as SERVICES_COUNT 
FROM BML_STORED_SR_SERVICES 
WHERE STORED_SERVICE_REQ_ID = (
    SELECT ID FROM BML_STORED_SERVICE_REQUESTS 
    WHERE SERVICE_REQ_CODE = '000057337442'
);

-- Kiểm tra Workflow đã start chưa
SELECT * FROM BML_WORKFLOW_HISTORY 
WHERE STORED_SERVICE_REQ_ID = (
    SELECT ID FROM BML_STORED_SERVICE_REQUESTS 
    WHERE SERVICE_REQ_CODE = '000057337442'
) 
AND IS_CURRENT = 1;
```

