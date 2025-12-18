# Simple Test Script for Store Service Request API
# Usage: .\test-store-api-simple.ps1 -Token "your-jwt-token-here"

param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    
    [string]$ServiceReqCode = "000057337442"
)

$baseUrl = "http://localhost:8000/api/v1"
$headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

Write-Host "=== Test Store Service Request API ===" -ForegroundColor Green
Write-Host "Service Request Code: $ServiceReqCode" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get Service Request from HIS
Write-Host "Step 1: Get Service Request from HIS..." -ForegroundColor Yellow
try {
    $getResponse = Invoke-RestMethod -Uri "$baseUrl/service-requests/code/$ServiceReqCode" -Method GET -Headers $headers
    Write-Host "✓ Service Request found!" -ForegroundColor Green
    Write-Host "  Patient: $($getResponse.data.patient.name)" -ForegroundColor Cyan
    Write-Host "  Services: $($getResponse.data.services.Count)" -ForegroundColor Cyan
    
    # Extract data
    $executeRoomLisId = $getResponse.data.executeRoom.lisRoomId
    $executeDeptLisId = $getResponse.data.executeDepartment.lisDepartmentId
    
    Write-Host "  Execute Room LIS ID: $(if($executeRoomLisId){$executeRoomLisId}else{'NULL'})" -ForegroundColor Gray
    Write-Host "  Execute Dept LIS ID: $(if($executeDeptLisId){$executeDeptLisId}else{'NULL'})" -ForegroundColor Gray
    
    # Fallback values if LIS IDs are null
    if (-not $executeRoomLisId) {
        Write-Host "  ⚠ Warning: No LIS Room ID, using placeholder UUID" -ForegroundColor Yellow
        $executeRoomLisId = "00000000-0000-0000-0000-000000000001"
    }
    if (-not $executeDeptLisId) {
        Write-Host "  ⚠ Warning: No LIS Dept ID, using placeholder UUID" -ForegroundColor Yellow
        $executeDeptLisId = "00000000-0000-0000-0000-000000000001"
    }
    
} catch {
    Write-Host "✗ Get Service Request failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""

# Step 2: Store Service Request
Write-Host "Step 2: Store Service Request to LIS..." -ForegroundColor Yellow

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

try {
    $storeResponse = Invoke-RestMethod -Uri "$baseUrl/service-requests/store" -Method POST -Headers $headers -Body $storeBody
    
    Write-Host ""
    Write-Host "✓ Store Service Request SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response Data:" -ForegroundColor Cyan
    Write-Host "  ID: $($storeResponse.data.id)" -ForegroundColor White
    Write-Host "  Service Request Code: $($storeResponse.data.serviceReqCode)" -ForegroundColor White
    Write-Host "  Services Count: $($storeResponse.data.servicesCount)" -ForegroundColor White
    Write-Host "  Workflow Started: $($storeResponse.data.workflowStarted)" -ForegroundColor $(if($storeResponse.data.workflowStarted){'Green'}else{'Yellow'})
    Write-Host "  Stored At: $($storeResponse.data.storedAt)" -ForegroundColor White
    
    if (-not $storeResponse.data.workflowStarted) {
        Write-Host ""
        Write-Host "  ⚠ Warning: Workflow was not auto-started" -ForegroundColor Yellow
        Write-Host "    This might be normal if workflow states are not configured yet" -ForegroundColor Gray
    }
    
} catch {
    Write-Host ""
    Write-Host "✗ Store Service Request FAILED!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        $errorJson = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorJson) {
            Write-Host "  Error Details:" -ForegroundColor Red
            Write-Host ($errorJson | ConvertTo-Json -Depth 10) -ForegroundColor Red
        } else {
            Write-Host "  Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
    
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        Write-Host "  HTTP Status: $statusCode" -ForegroundColor Red
    }
    
    exit 1
}

Write-Host ""
Write-Host "=== Test Completed Successfully ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Check database: SELECT * FROM BML_STORED_SERVICE_REQUESTS WHERE SERVICE_REQ_CODE = '$ServiceReqCode'" -ForegroundColor Gray
Write-Host "  2. Check services: SELECT * FROM BML_STORED_SR_SERVICES WHERE STORED_SERVICE_REQ_ID = '$($storeResponse.data.id)'" -ForegroundColor Gray
Write-Host "  3. Check workflow: SELECT * FROM BML_WORKFLOW_HISTORY WHERE STORED_SERVICE_REQ_ID = '$($storeResponse.data.id)' AND IS_CURRENT = 1" -ForegroundColor Gray

