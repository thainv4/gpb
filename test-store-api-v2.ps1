# Test Script: Login and Store Service Request
$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:8000/api/v1"
$serviceReqCode = "000057337442"
$username = "admin"
$password = "Admin123!"

Write-Host "=== Test Store Service Request API ===" -ForegroundColor Green
Write-Host "Service Request Code: $serviceReqCode" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login
Write-Host "Step 1: Login..." -ForegroundColor Yellow
$loginBody = @{
    username = $username
    password = $password
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$global:token = $loginResponse.data.accessToken

Write-Host "✓ Login thành công!" -ForegroundColor Green
Write-Host "Token: $($global:token.Substring(0, 50))..." -ForegroundColor Gray
Write-Host ""

# Step 2: Get Service Request
Write-Host "Step 2: Get Service Request from HIS..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $global:token"
    "Content-Type" = "application/json"
}

$getResponse = Invoke-RestMethod -Uri "$baseUrl/service-requests/code/$serviceReqCode" -Method GET -Headers $headers

Write-Host "✓ Service Request found!" -ForegroundColor Green
Write-Host "  Patient: $($getResponse.data.patient.name)" -ForegroundColor Cyan
Write-Host "  Services: $($getResponse.data.services.Count)" -ForegroundColor Cyan

$executeRoomLisId = $getResponse.data.executeRoom.lisRoomId
$executeDeptLisId = $getResponse.data.executeDepartment.lisDepartmentId

Write-Host "  Execute Room LIS ID: $(if($executeRoomLisId){$executeRoomLisId}else{'NULL'})" -ForegroundColor Gray
Write-Host "  Execute Dept LIS ID: $(if($executeDeptLisId){$executeDeptLisId}else{'NULL'})" -ForegroundColor Gray

# Generate valid UUID v4 if LIS IDs are null
if (-not $executeRoomLisId) {
    Write-Host "  ⚠ Warning: No LIS Room ID, generating UUID v4" -ForegroundColor Yellow
    # Generate UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    $executeRoomLisId = [guid]::NewGuid().ToString()
    Write-Host "  Generated Room UUID: $executeRoomLisId" -ForegroundColor Gray
}
if (-not $executeDeptLisId) {
    Write-Host "  ⚠ Warning: No LIS Dept ID, generating UUID v4" -ForegroundColor Yellow
    # Generate UUID v4 format
    $executeDeptLisId = [guid]::NewGuid().ToString()
    Write-Host "  Generated Dept UUID: $executeDeptLisId" -ForegroundColor Gray
}

Write-Host ""

# Step 3: Store Service Request
Write-Host "Step 3: Store Service Request to LIS..." -ForegroundColor Yellow

$receptionCode = "REC-$(Get-Date -Format 'yyyyMMdd')-$(Get-Random -Minimum 1000 -Maximum 9999)"
$sampleCollectionTime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

$storeBody = @{
    serviceReqCode = $serviceReqCode
    currentRoomId = $executeRoomLisId
    currentDepartmentId = $executeDeptLisId
    receptionCode = $receptionCode
    sampleCollectionTime = $sampleCollectionTime
    saveRawJson = $false
} | ConvertTo-Json

Write-Host "Request:" -ForegroundColor Gray
Write-Host ($storeBody | ConvertFrom-Json | ConvertTo-Json -Depth 10) -ForegroundColor White
Write-Host ""

# Re-create headers to ensure token is fresh
$storeHeaders = @{
    "Authorization" = "Bearer $global:token"
    "Content-Type" = "application/json"
}

Write-Host "Token check: $(if($storeHeaders['Authorization']){'SET'}else{'MISSING'})" -ForegroundColor Gray

$storeResponse = Invoke-RestMethod -Uri "$baseUrl/service-requests/store" -Method POST -Headers $storeHeaders -Body $storeBody

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
Write-Host ""
Write-Host "=== Test Completed Successfully ===" -ForegroundColor Green

