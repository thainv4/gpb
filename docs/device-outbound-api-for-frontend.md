# Module Device Outbound – API Mô tả cho Frontend

## 1. Tổng quan

Module **Device Outbound** quản lý dữ liệu xuất ra thiết bị (máy nhuộm, máy quét…). Mỗi bản ghi gắn với một **receptionCode**, **dịch vụ**, **block/slide** và **method**. Backend tự sinh **blockId** và **slideId** theo quy tắc:

- **blockId** = `receptionCode + "A." + blockNumber` (vd: `S2601.0312A.2`)
- **slideId** = `receptionCode + "A." + blockNumber + "." + slideNumber` (vd: `S2601.0312A.2.3`)

| Mục | Giá trị |
|-----|---------|
| **Base path** | `/api/v1/device-outbound` |
| **Auth** | Tất cả API đều dùng **Bearer JWT** (header `Authorization: Bearer <token>`). POST và PUT bắt buộc JWT; nếu chỉ gửi HIS token (không có JWT) sẽ trả 400. |

---

## 2. Format response chung

Mọi response thành công đều có dạng:

```json
{
  "success": true,
  "status_code": 200,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "request_id": "...",
    "trace_id": "..."
  }
}
```

Lỗi (4xx/5xx):

```json
{
  "success": false,
  "status_code": 400,
  "error": {
    "code": "...",
    "message": "...",
    "timestamp": "...",
    "trace_id": "...",
    "details": { ... }
  },
  "meta": { ... }
}
```

Dữ liệu thực tế nằm trong **`data`**.

---

## 3. Danh sách API

### 3.1. Danh sách bản ghi (phân trang + lọc)

| Mục | Mô tả |
|-----|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/device-outbound` |
| **Query (optional)** | Xem bảng dưới |

| Tham số | Kiểu | Mặc định | Mô tả |
|---------|------|----------|--------|
| `limit` | number | 10 | Số bản ghi mỗi trang (1–100) |
| `offset` | number | 0 | Vị trí bắt đầu |
| `receptionCode` | string | - | Lọc theo mã tiếp nhận |
| `serviceCode` | string | - | Lọc theo mã dịch vụ |

**Response 200 – `data`:**

```json
{
  "items": [
    {
      "id": "uuid",
      "receptionCode": "S2601.0312",
      "serviceCode": "BM125",
      "blockId": "S2601.0312A.2",
      "slideId": "S2601.0312A.2.3",
      "method": "HE",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "has_next": true,
    "has_prev": false
  }
}
```

---

### 3.2. Chi tiết một bản ghi

| Mục | Mô tả |
|-----|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/device-outbound/:id` |

**Response 200 – `data`:** Một object cùng cấu trúc với phần tử trong `items` (id, receptionCode, serviceCode, blockId, slideId, method, createdAt, updatedAt).

**Response 404:** Không tìm thấy bản ghi.

---

### 3.3. Danh sách dịch vụ theo mã tiếp nhận (dropdown)

Dùng để hiển thị dropdown chọn dịch vụ khi tạo/sửa device outbound (dữ liệu lấy từ bảng stored service request services theo `receptionCode`).

| Mục | Mô tả |
|-----|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/device-outbound/services` |
| **Query (bắt buộc)** | `receptionCode` (string) – mã tiếp nhận mẫu |

**Response 200 – `data`:**

```json
[
  {
    "id": "uuid",
    "serviceCode": "BM125",
    "serviceName": "Nhuộm HE",
    "isChildService": 0,
    "parentServiceId": null
  },
  {
    "id": "uuid",
    "serviceCode": "BM126",
    "serviceName": "Nhuộm đặc biệt",
    "isChildService": 1,
    "parentServiceId": "uuid-parent"
  }
]
```

| Field | Kiểu | Mô tả |
|-------|------|--------|
| `id` | string | ID bản ghi dịch vụ (StoredServiceRequestService) |
| `serviceCode` | string \| null | Mã dịch vụ |
| `serviceName` | string \| null | Tên dịch vụ |
| `isChildService` | number | 0 = parent, 1 = child |
| `parentServiceId` | string \| null | ID dịch vụ cha (nếu là child) |

**Response 400:** Thiếu hoặc rỗng `receptionCode`.

**Gợi ý FE:** Gọi API này khi user chọn/nhập receptionCode để load options cho dropdown dịch vụ (tạo/sửa).

---

### 3.4. Tạo bản ghi

| Mục | Mô tả |
|-----|--------|
| **Method** | `POST` |
| **URL** | `/api/v1/device-outbound` |
| **Body** | JSON, xem bảng dưới |

| Field | Kiểu | Bắt buộc | Ràng buộc | Mô tả |
|-------|------|----------|-----------|--------|
| `receptionCode` | string | Có | max 50 | Mã tiếp nhận mẫu |
| `serviceCode` | string | Có | max 50 | Mã dịch vụ |
| `blockNumber` | number | Có | ≥ 1 | Số block |
| `slideNumber` | number | Có | ≥ 1 | Số slide |
| `method` | string | Có | max 50 | Phương pháp (vd: HE) |

**Ví dụ body:**

```json
{
  "receptionCode": "S2601.0312",
  "serviceCode": "BM125",
  "blockNumber": 2,
  "slideNumber": 3,
  "method": "HE"
}
```

**Response 201 – `data`:** Object bản ghi vừa tạo (id, receptionCode, serviceCode, blockId, slideId, method, createdAt, updatedAt). Backend tự tính `blockId` và `slideId`.

**Response 400:** Validation lỗi hoặc không có JWT (chỉ HIS token).

---

### 3.5. Cập nhật bản ghi

| Mục | Mô tả |
|-----|--------|
| **Method** | `PUT` |
| **URL** | `/api/v1/device-outbound/:id` |
| **Body** | JSON, **tất cả field optional** (partial update) |

| Field | Kiểu | Ràng buộc | Mô tả |
|-------|------|-----------|--------|
| `receptionCode` | string | max 50 | Mã tiếp nhận |
| `serviceCode` | string | max 50 | Mã dịch vụ |
| `blockNumber` | number | ≥ 1 | Số block |
| `slideNumber` | number | ≥ 1 | Số slide |
| `method` | string | max 50 | Phương pháp |

**Response 200 – `data`:** Object bản ghi sau khi cập nhật.

**Response 400:** Validation hoặc không có JWT.  
**Response 404:** Không tìm thấy bản ghi.

**Logic backend:** Nếu gửi `receptionCode` và/hoặc `blockNumber` và/hoặc `slideNumber`, backend sẽ tính lại `blockId` và `slideId` theo quy tắc trên.

---

### 3.6. Xóa bản ghi (soft delete)

| Mục | Mô tả |
|-----|--------|
| **Method** | `DELETE` |
| **URL** | `/api/v1/device-outbound/:id` |
| **Body** | Không dùng |

**Response 200 – `data`:**

```json
{
  "message": "Device outbound deleted successfully"
}
```

**Response 404:** Không tìm thấy. Sau khi xóa thành công, bản ghi không còn xuất hiện trong danh sách và GET theo id.

---

## 4. TypeScript types (gợi ý cho FE)

```typescript
// Item một bản ghi (dùng cho list, get-by-id, create response, update response)
interface DeviceOutboundItem {
  id: string;
  receptionCode: string;
  serviceCode: string;
  blockId: string;
  slideId: string;
  method: string;
  createdAt: string;
  updatedAt: string;
}

// Danh sách + phân trang
interface DeviceOutboundListData {
  items: DeviceOutboundItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Dropdown dịch vụ theo receptionCode
interface DeviceOutboundServiceOption {
  id: string;
  serviceCode?: string | null;
  serviceName?: string | null;
  isChildService: number;
  parentServiceId?: string | null;
}

// Body tạo mới
interface CreateDeviceOutboundBody {
  receptionCode: string;
  serviceCode: string;
  blockNumber: number;
  slideNumber: number;
  method: string;
}

// Body cập nhật (partial)
interface UpdateDeviceOutboundBody {
  receptionCode?: string;
  serviceCode?: string;
  blockNumber?: number;
  slideNumber?: number;
  method?: string;
}

// Envelope response
interface ApiResponse<T> {
  success: boolean;
  status_code: number;
  data?: T;
  meta?: {
    timestamp: string;
    request_id?: string;
    trace_id?: string;
  };
  error?: {
    code: string;
    message: string;
    timestamp: string;
    trace_id: string;
    details?: unknown;
  };
}
```

---

## 5. Luồng gợi ý trên Frontend

1. **Màn danh sách:** Gọi `GET /api/v1/device-outbound?limit=10&offset=0` (có thể thêm `receptionCode`, `serviceCode`). Hiển thị bảng + phân trang từ `data.items` và `data.pagination`.

2. **Màn tạo mới:**
   - User nhập **receptionCode** → gọi `GET /api/v1/device-outbound/services?receptionCode=...` → dùng `data` để render dropdown **dịch vụ** (label: serviceName/serviceCode, value: serviceCode hoặc id tùy logic backend khi tạo).
   - User nhập **blockNumber**, **slideNumber**, **method** → gửi `POST /api/v1/device-outbound` với body đủ field.
   - Backend trả về bản ghi đã tạo (có `blockId`, `slideId`) nếu cần hiển thị lại.

3. **Màn sửa:** Load chi tiết `GET /api/v1/device-outbound/:id`. Có thể load lại dropdown dịch vụ theo `receptionCode` hiện tại. Gửi cập nhật `PUT /api/v1/device-outbound/:id` với body chỉ chứa field cần đổi (partial).

4. **Xóa:** Gọi `DELETE /api/v1/device-outbound/:id` → sau thành công refresh danh sách hoặc xóa dòng tương ứng khỏi state.
