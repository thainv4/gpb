# Test Script: Login and Store Service Request
param(
    [string]$ServiceReqCode = "000057337442"
)

$baseUrl = "http://localhost:8000/api/v1"
$username = "admin"
$password = "Admin123!"

Write-Host "=== Test Store Service Request API ===" -ForegroundColor Green
Write-Host "Service Request Code: $ServiceReqCode" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login
Write-Host "Step 1: Login..." -ForegroundColor Yellow
$loginBody = @{
    username = $username
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.accessToken
    Write-Host "✓ Login thành công!" -ForegroundColor Green
    Write-Host "Token preview: $($token.Substring(0, [Math]::Min(50, $token.Length)))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Login thất bại: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Chi tiết: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""

# Step 2: Get Service Request
Write-Host "Step 2: Get Service Request from HIS..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Debug: Verify token is set
Write-Host "Token set: $(if($token){'YES'}else{'NO'})" -ForegroundColor Gray
Write-Host "Token length: $($token.Length)" -ForegroundColor Gray

try {
    $getResponse = Invoke-RestMethod -Uri "$baseUrl/service-requests/code/$ServiceReqCode" -Method GET -Headers $headers
    Write-Host "✓ Service Request found!" -ForegroundColor Green
    Write-Host "  Patient: $($getResponse.data.patient.name)" -ForegroundColor Cyan
    Write-Host "  Services: $($getResponse.data.services.Count)" -ForegroundColor Cyan
    
    $executeRoomLisId = $getResponse.data.executeRoom.lisRoomId
    $executeDeptLisId = $getResponse.data.executeDepartment.lisDepartmentId
    
    Write-Host "  Execute Room LIS ID: $(if($executeRoomLisId){$executeRoomLisId}else{'NULL'})" -ForegroundColor Gray
    Write-Host "  Execute Dept LIS ID: $(if($executeDeptLisId){$executeDeptLisId}else{'NULL'})" -ForegroundColor Gray
    
    if (-not $executeRoomLisId) {
        Write-Host "  ⚠ Warning: No LIS Room ID, using placeholder" -ForegroundColor Yellow
        $executeRoomLisId = "00000000-0000-0000-0000-000000000001"
    }
    if (-not $executeDeptLisId) {
        Write-Host "  ⚠ Warning: No LIS Dept ID, using placeholder" -ForegroundColor Yellow
        $executeDeptLisId = "00000000-0000-0000-0000-000000000001"
    }
    
} catch {
    Write-Host "✗ Get Service Request failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Chi tiết: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""

# Step 3: Store Service Request
Write-Host "Step 3: Store Service Request to LIS..." -ForegroundColor Yellow

$receptionCode = "REC-$(Get-Date -Format 'yyyyMMdd')-$(Get-Random -Minimum 1000 -Maximum 9999)"
$sampleCollectionTime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

$storeBody = @{
    serviceReqCode = $ServiceReqCode
    currentRoomId = $executeRoomLisId
    currentDepartmentId = $executeDeptLisId
    receptionCode = $receptionCode
    sampleCollectionTime = $sampleCollectionTime
    saveRawJson = $false
} | ConvertTo-Json

Write-Host "Request Body:" -ForegroundColor Gray
Write-Host ($storeBody | ConvertFrom-Json | ConvertTo-Json -Depth 10) -ForegroundColor White

# Debug: Verify headers before POST
Write-Host "Headers before POST:" -ForegroundColor Gray
Write-Host "  Authorization: Bearer $($token.Substring(0, [Math]::Min(50, $token.Length)))..." -ForegroundColor Gray

try {
    $storeResponse = Invoke-RestMethod -Uri "$baseUrl/service-requests/store" -Method POST -Headers $headers -Body $storeBody
    
    Write-Host ""
    Write-Host "✓✓✓ STORE SUCCESS! ✓✓✓" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host "  ID: $($storeResponse.data.id)" -ForegroundColor White
    Write-Host "  Service Request Code: $($storeResponse.data.serviceReqCode)" -ForegroundColor White
    Write-Host "  Services Count: $($storeResponse.data.servicesCount)" -ForegroundColor White
    Write-Host "  Workflow Started: $($storeResponse.data.workflowStarted)" -ForegroundColor $(if($storeResponse.data.workflowStarted){'Green'}else{'Yellow'})
    Write-Host "  Stored At: $($storeResponse.data.storedAt)" -ForegroundColor White
    
    Write-Host ""
    Write-Host "Full Response:" -ForegroundColor Cyan
    Write-Host ($storeResponse | ConvertTo-Json -Depth 10) -ForegroundColor White
    
} catch {
    Write-Host ""
    Write-Host "✗ Store FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        $errorJson = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorJson) {
            Write-Host "Error Details:" -ForegroundColor Red
            Write-Host ($errorJson | ConvertTo-Json -Depth 10) -ForegroundColor Red
        } else {
            Write-Host "Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
    exit 1
}

Write-Host ""
Write-Host "=== Test Completed ===" -ForegroundColor Green

