# Test Script: Test 4 Result APIs
$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:8000/api/v1"
$username = "admin"
$password = "Admin123!"

# Sử dụng ID từ test trước
$storedReqId = "f32c11f9-cab8-4f72-9776-5b41a1bc89e8"

Write-Host "=== Test Result APIs ===" -ForegroundColor Green
Write-Host "Stored Service Request ID: $storedReqId" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login
Write-Host "Step 1: Login..." -ForegroundColor Yellow
$loginBody = @{
    username = $username
    password = $password
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$global:token = $loginResponse.data.accessToken

Write-Host "[OK] Login thanh cong!" -ForegroundColor Green
Write-Host ""

# Step 2: Get Stored Service Request để lấy Service ID
Write-Host "Step 2: Get Stored Service Request để lấy Service ID..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $global:token"
    "Content-Type" = "application/json"
}

$getResponse = Invoke-RestMethod -Uri "$baseUrl/service-requests/stored/$storedReqId" -Method GET -Headers $headers

if ($getResponse.data.services.Count -eq 0) {
    Write-Host "[FAIL] Khong tim thay services!" -ForegroundColor Red
    exit 1
}

# Lấy service ID đầu tiên (parent service)
$serviceId = $getResponse.data.services[0].id
Write-Host "[OK] Tim thay Service ID: $serviceId" -ForegroundColor Green
Write-Host "  Service Name: $($getResponse.data.services[0].serviceName)" -ForegroundColor Gray
Write-Host ""

# Step 3: Test Enter Result API
Write-Host "Step 3: Test Enter Result API..." -ForegroundColor Yellow

$resultMetadataObj = @{
    machine = "XYZ-123"
    method = "Automated"
    reagent = "ABC-456"
}

$enterResultBody = @{
    resultValue = 12.5
    resultValueText = "12.5"
    resultText = "Ket qua xet nghiem: Gia tri binh thuong trong khoang cho phep."
    resultStatus = "NORMAL"
    resultNotes = "Ket qua da duoc nhap tu dong tu may xet nghiem"
    resultMetadata = ($resultMetadataObj | ConvertTo-Json -Compress)
} | ConvertTo-Json -Depth 10

try {
    $enterResultResponse = Invoke-RestMethod -Uri "$baseUrl/service-requests/stored/$storedReqId/services/$serviceId/result" -Method PUT -Headers $headers -Body $enterResultBody
    
    Write-Host "[OK] Enter Result thanh cong!" -ForegroundColor Green
    Write-Host "  Result Entered At: $($enterResultResponse.data.resultEnteredAt)" -ForegroundColor White
    Write-Host "  Entered By User: $($enterResultResponse.data.resultEnteredByUserId)" -ForegroundColor White
} catch {
    Write-Host "[FAIL] Enter Result that bai: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Error: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""

# Step 4: Test QC Result API
Write-Host "Step 4: Test QC Result API..." -ForegroundColor Yellow

$qcResultBody = @{
    qcStatus = "PASSED"
    notes = "QC check passed"
} | ConvertTo-Json

try {
    $qcResultResponse = Invoke-RestMethod -Uri "$baseUrl/service-requests/stored/$storedReqId/services/$serviceId/result/qc" -Method POST -Headers $headers -Body $qcResultBody
    
    Write-Host "[OK] QC Result thanh cong!" -ForegroundColor Green
    Write-Host "  QC Status: $($qcResultResponse.data.qcStatus)" -ForegroundColor White
    Write-Host "  QC Checked At: $($qcResultResponse.data.qcCheckedAt)" -ForegroundColor White
} catch {
    Write-Host "[FAIL] QC Result that bai: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Error: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Step 5: Test Review Result API
Write-Host "Step 5: Test Review Result API..." -ForegroundColor Yellow

$reviewResultBody = @{
    approved = $true
    notes = "Ket qua da duoc review va chap nhan"
} | ConvertTo-Json

try {
    $reviewResultResponse = Invoke-RestMethod -Uri "$baseUrl/service-requests/stored/$storedReqId/services/$serviceId/result/review" -Method POST -Headers $headers -Body $reviewResultBody
    
    Write-Host "[OK] Review Result thanh cong!" -ForegroundColor Green
    Write-Host "  Result Reviewed At: $($reviewResultResponse.data.resultReviewedAt)" -ForegroundColor White
    Write-Host "  Reviewed By User: $($reviewResultResponse.data.resultReviewedByUserId)" -ForegroundColor White
} catch {
    Write-Host "[FAIL] Review Result that bai: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Error: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Step 6: Test Approve Result API
Write-Host "Step 6: Test Approve Result API..." -ForegroundColor Yellow

$approveResultBody = @{
    notes = "Ket qua da duoc phe duyet, co the gui ve HIS"
} | ConvertTo-Json

try {
    $approveResultResponse = Invoke-RestMethod -Uri "$baseUrl/service-requests/stored/$storedReqId/services/$serviceId/result/approve" -Method POST -Headers $headers -Body $approveResultBody
    
    Write-Host "[OK] Approve Result thanh cong!" -ForegroundColor Green
    Write-Host "  Result Approved At: $($approveResultResponse.data.resultApprovedAt)" -ForegroundColor White
    Write-Host "  Approved By User: $($approveResultResponse.data.resultApprovedByUserId)" -ForegroundColor White
} catch {
    Write-Host "[FAIL] Approve Result that bai: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Error: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Step 7: Verify bằng cách GET lại
Write-Host "Step 7: Verify - Get lại Stored Service Request..." -ForegroundColor Yellow

$verifyResponse = Invoke-RestMethod -Uri "$baseUrl/service-requests/stored/$storedReqId" -Method GET -Headers $headers

$firstService = $verifyResponse.data.services[0]
Write-Host "[OK] Verification:" -ForegroundColor Green
Write-Host "  Service: $($firstService.serviceName)" -ForegroundColor White
Write-Host "  Result Status: $($firstService.resultStatus)" -ForegroundColor White
Write-Host "  Result Value: $($firstService.resultValue)" -ForegroundColor White
Write-Host "  Is Normal: $($firstService.isNormal)" -ForegroundColor White
Write-Host "  Result Entered At: $($firstService.resultEnteredAt)" -ForegroundColor White
Write-Host "  Result Reviewed At: $($firstService.resultReviewedAt)" -ForegroundColor White
Write-Host "  Result Approved At: $($firstService.resultApprovedAt)" -ForegroundColor White
Write-Host "  QC Status: $($firstService.qcStatus)" -ForegroundColor White
Write-Host "  QC Checked At: $($firstService.qcCheckedAt)" -ForegroundColor White

Write-Host ""
Write-Host "=== Test Completed Successfully ===" -ForegroundColor Green

