# Phân chia 2 cơ sở (Bệnh viện Bạch Mai)

Tài liệu mô tả cách hệ thống GPB phân chia theo 2 cơ sở: **cơ sở 1** (cơ sở chính) và **cơ sở Ninh Bình** (cơ sở 2, viết tắt CSNB).

## 1. Kiến trúc & quyết định

- Cơ sở thật nằm ở bảng **`HIS_BRANCH`** (DB HIS). GPB **đọc trực tiếp** qua `hisConnection`, KHÔNG mirror sang bảng GPB.
- `BML_BRANCHES` giữ vai trò khác (khoa nội/ngoại) → **không đụng tới**.
- Cơ sở của một y lệnh được suy ra qua HIS: `executeRoom → HIS_DEPARTMENT (EXECUTE_DEPARTMENT_ID) → HIS_BRANCH`.
- GPB chỉ lưu tham chiếu `HIS_BRANCH_ID` (number) trên các bảng cần biết cơ sở.
- Phòng cơ sở 2 là **room mới** (roomCode mới, hậu tố `-NB`), KHÔNG nhân bản khoa, KHÔNG map sang phòng HIS.
- Barcode: cơ sở 1 giữ prefix gốc (T/C/F/S/G); cơ sở Ninh Bình thêm `2` sau prefix (vd `S` → `S2`).
- Cơ sở được truyền xuống BE qua HTTP header **`X-His-Branch-Id`**, gắn tập trung ở `fe-gpb` `client.ts` `request()`. BE đọc qua param decorator `@HisBranchId()`.
- **Ghi nhớ cơ sở lần trước**: FE lưu key bền vững `last-his-branch-id` (không xóa khi logout) để pre-select dropdown ở lần đăng nhập sau.

## 2. Tham số cần cấu hình trước khi chạy

Đặt trong `.env` của backend (`gpb`):

```env
PRIMARY_HIS_BRANCH_ID=1      # BỆNH VIỆN BẠCH MAI (cơ sở 1)
NINH_BINH_HIS_BRANCH_ID=81   # BỆNH VIỆN BẠCH MAI CƠ SỞ NINH BÌNH
```

Đặt trong `.env` của frontend (`fe-gpb`) để preview prefix barcode đúng (S2):

```env
NEXT_PUBLIC_NINH_BINH_HIS_BRANCH_ID=81
```

> Lưu ý: barcode cuối cùng luôn do BE sinh (dựa trên `NINH_BINH_HIS_BRANCH_ID`). Biến FE chỉ dùng cho phần hiển thị xem trước.

## 3. Data flow

```
localStorage last-his-branch-id  →  Login: dropdown tự chọn cơ sở lần trước
        →  branch-store (selectedHisBranchId) + cập nhật last-his-branch-id
        →  client.ts gắn header X-His-Branch-Id cho mọi request
                ├─ my-rooms: lọc theo BML_ROOMS.HIS_BRANCH_ID
                ├─ barcode by-prefix: +'2' nếu là Ninh Bình
                ├─ sidebar (workflow-history): lọc theo BML_STORED_SERVICE_REQUESTS.HIS_BRANCH_ID
                └─ store y lệnh: validate executeBranch == header, lưu HIS_BRANCH_ID
```

Validate y lệnh: `executeRoom → HIS_DEPARTMENT → HIS_BRANCH.ID`. Nếu khác cơ sở đang đăng nhập → cảnh báo + chặn lưu (cả FE và BE, BE trả 422).

## 4. Các cột DB mới

| Bảng | Cột | Ý nghĩa |
|------|-----|---------|
| `BML_ROOMS` | `HIS_BRANCH_ID NUMBER` | Cơ sở của phòng làm việc |
| `BML_ROOMS` | `ROOM_CODE` nới rộng → `VARCHAR2(30)` | Chứa hậu tố `-NB` cho cơ sở Ninh Bình |
| `BML_STORED_SERVICE_REQUESTS` | `HIS_BRANCH_ID NUMBER` | Cơ sở của y lệnh đã lưu (ghi lúc tiếp nhận) |

## 5. Migrations

- `1740000001500-AddHisBranchIdToRoomsAndStoredServiceRequests`: thêm cột `HIS_BRANCH_ID`.
- `1740000001600-DuplicateRoomsForNinhBinhBranch`:
  1. Nới rộng `ROOM_CODE` lên 30 ký tự.
  2. Backfill `HIS_BRANCH_ID = PRIMARY_HIS_BRANCH_ID` cho phòng hiện có (đang NULL).
  3. Nhân bản phòng cơ sở 1 → cơ sở Ninh Bình: `roomCode + '-NB'`, `roomName + ' - CSNB'`, giữ nguyên `departmentId`, `selectPrefix`, gán `HIS_BRANCH_ID = NINH_BINH_HIS_BRANCH_ID`.

> Migration `1600` yêu cầu `PRIMARY_HIS_BRANCH_ID` và `NINH_BINH_HIS_BRANCH_ID` đã set trong `.env`, nếu không sẽ dừng với lỗi rõ ràng.

- `1740000001700-BackfillHisBranchIdOnStoredServiceRequests`: gán `HIS_BRANCH_ID = PRIMARY_HIS_BRANCH_ID` cho mọi y lệnh đã lưu còn `NULL` (dữ liệu cũ thuộc cơ sở Hà Nội), để sidebar `by-room-and-state` lọc đúng.

## 6. Quy ước

- **roomCode cơ sở 2**: `<roomCode cơ sở 1>-NB` (vd `P168` → `P168-NB`).
- **roomName cơ sở 2**: `<tên cơ sở 1> - CSNB`.
- **barcode cơ sở 2**: `<prefix>2.<ngày>.<số thứ tự>` (vd `S2.20260614.0001`). LIS/HL7 chấp nhận case ID dạng `S2...`.

## 7. Điểm chạm code chính

Backend (`gpb`):
- `common/decorators/his-branch-id.decorator.ts` — đọc header `X-His-Branch-Id`.
- `common/constants/branch.constants.ts` — cấu hình cơ sở + helper `isNinhBinhBranch`.
- `modules/his-branch/*` — endpoint công khai `GET /his-branches` cho login.
- `modules/service-request/repositories/service-request.repository.ts` — JOIN lấy `executeBranch`.
- `modules/sample-reception/sample-reception.service.ts` — barcode +'2'.
- `modules/service-request/services/stored-service-request.service.ts` — validate + lưu `HIS_BRANCH_ID`.
- `modules/user-room/*` — my-rooms lọc theo cơ sở.
- `modules/workflow/workflow-history/*` — sidebar lọc theo cơ sở.

Frontend (`fe-gpb`):
- `lib/stores/branch.ts` — branch-store + `last-his-branch-id` + `isNinhBinhBranch`.
- `lib/api/client.ts` — gắn header `X-His-Branch-Id`, `getHisBranches()`.
- `components/auth-wizard/auth-form.tsx` — dropdown chọn cơ sở.
- `components/test-indications/test-indications-table.tsx` — cảnh báo + chặn lưu + preview prefix.
- `components/layout/dashboard-layout.tsx` — hiển thị cơ sở trên header.
- `components/service-requests-sidebar/service-requests-sidebar.tsx` — refetch theo cơ sở.
