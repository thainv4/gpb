<#
.SYNOPSIS
    Tạo retention policy trên Seq: xóa toàn bộ events sau 7 ngày (idempotent).

.DESCRIPTION
    Dùng cho Seq cài native trên Windows Server (không cần Docker).
    Yêu cầu: seqcli trong PATH (cài: dotnet tool install --global seqcli).

.PARAMETER ServerUrl
    URL Seq, mặc định $env:SEQ_SERVER_URL hoặc http://localhost:5341

.PARAMETER ApiKey
    API key Seq (admin/automation), mặc định $env:SEQ_ADMIN_API_KEY

.EXAMPLE
    .\scripts\apply-seq-retention-7d.ps1
    .\scripts\apply-seq-retention-7d.ps1 -ServerUrl http://seq.internal:5341 -ApiKey "xxx"
#>
[CmdletBinding()]
param(
    [string] $ServerUrl = $(if ($env:SEQ_SERVER_URL) { $env:SEQ_SERVER_URL } else { "http://localhost:5341" }),
    [string] $ApiKey = $env:SEQ_ADMIN_API_KEY
)

$ErrorActionPreference = "Stop"

function Test-SeqCli {
    $cmd = Get-Command seqcli -ErrorAction SilentlyContinue
    if (-not $cmd) {
        Write-Error @"
Không tìm thấy seqcli trong PATH.
Cài đặt: dotnet tool install --global seqcli
Sau đó mở shell mới hoặc thêm thư mục dotnet tools vào PATH.
"@
        exit 1
    }
}

function Wait-SeqReady {
    param([string] $BaseUrl)
    $uri = $BaseUrl.TrimEnd("/")
    for ($i = 0; $i -lt 60; $i++) {
        try {
            Invoke-WebRequest -Uri $uri -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop | Out-Null
            return
        } catch {
            Start-Sleep -Seconds 2
        }
    }
    Write-Error "Seq không phản hồi tại $uri sau ~2 phút."
    exit 1
}

Test-SeqCli
Wait-SeqReady -BaseUrl $ServerUrl

$listArgs = @("retention", "list", "-s", $ServerUrl, "--json", "--no-color")
if ($ApiKey) {
    $listArgs += @("-a", $ApiKey)
}

$jsonLines = @(& seqcli @listArgs 2>$null | Where-Object { $_ -match '^\s*\{' })
if ($jsonLines.Count -gt 0) {
    Write-Host "Đã có $($jsonLines.Count) retention policy trên Seq. Bỏ qua tạo mới."
    Write-Host "Xem danh sách: seqcli retention list -s `"$ServerUrl`""
    exit 0
}

$createArgs = @("retention", "create", "--after", "7d", "--delete-all-events", "-s", $ServerUrl)
if ($ApiKey) {
    $createArgs += @("-a", $ApiKey)
}

& seqcli @createArgs
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host "Đã tạo retention: xóa tất cả events sau 7 ngày."
