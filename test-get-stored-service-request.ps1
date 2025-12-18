# Test Script: Get Stored Service Request by ID
$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:8000/api/v1"
$storedId = "f32c11f9-cab8-4f72-9776-5b41a1bc89e8"
$username = "admin"
$password = "Admin123!"

Write-Host "=== Test Get Stored Service Request by ID ===" -ForegroundColor Green
Write-Host "Stored Service Request ID: $storedId" -ForegroundColor Cyan
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

# Step 2: Get Stored Service Request
Write-Host "Step 2: Get Stored Service Request by ID..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $global:token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/service-requests/stored/$storedId" -Method GET -Headers $headers
    
    Write-Host ""
    Write-Host "✓✓✓ GET SUCCESS! ✓✓✓" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== Response Summary ===" -ForegroundColor Cyan
    Write-Host "  ID: $($response.data.id)" -ForegroundColor White
    Write-Host "  Service Request Code: $($response.data.serviceReqCode)" -ForegroundColor White
    Write-Host "  Patient: $($response.data.patientName)" -ForegroundColor White
    Write-Host "  Services Count: $($response.data.services.Count)" -ForegroundColor White
    
    if ($response.data.workflowCurrentState) {
        Write-Host "  Workflow Current State: $($response.data.workflowCurrentState.stateName) ($($response.data.workflowCurrentState.stateCode))" -ForegroundColor Green
        Write-Host "  Workflow Started At: $($response.data.workflowCurrentState.startedAt)" -ForegroundColor Gray
    } else {
        Write-Host "  Workflow Current State: (không có)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "=== Services Detail ===" -ForegroundColor Cyan
    $parentCount = 0
    $childCount = 0
    
    foreach ($service in $response.data.services) {
        $parentCount++
        Write-Host "  [$parentCount] Parent Service: $($service.serviceName)" -ForegroundColor White
        Write-Host "      Code: $($service.serviceCode)" -ForegroundColor Gray
        Write-Host "      Reception Code: $($service.receptionCode)" -ForegroundColor Gray
        
        if ($service.serviceTests -and $service.serviceTests.Count -gt 0) {
            Write-Host "      Child Tests ($($service.serviceTests.Count)):" -ForegroundColor Yellow
            foreach ($test in $service.serviceTests) {
                $childCount++
                Write-Host "        - $($test.serviceName)" -ForegroundColor Gray
            }
        } else {
            Write-Host "      Child Tests: (không có)" -ForegroundColor Gray
        }
        Write-Host ""
    }
    
    Write-Host "  Summary:" -ForegroundColor Cyan
    Write-Host "    Total Parent Services: $parentCount" -ForegroundColor White
    Write-Host "    Total Child Tests: $childCount" -ForegroundColor White
    
    Write-Host ""
    Write-Host "=== Full Response (JSON) ===" -ForegroundColor Cyan
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
    
} catch {
    Write-Host ""
    Write-Host "✗ GET FAILED!" -ForegroundColor Red
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
Write-Host "=== Test Completed Successfully ===" -ForegroundColor Green

