# test-pdf-debug.ps1
# Usage: .\test-pdf-debug.ps1 your-email@example.com attaguy-plan
param(
  [string]$email = "test@example.com",
  [string]$planId = "attaguy-plan"
)

$base = "http://localhost:3000"

Write-Host "1) Sending verification code to $email ..." -ForegroundColor Yellow
try {
    $sendResp = Invoke-RestMethod -Method Post -Uri "$base/api/auth/email/send" -Body (@{ email = $email } | ConvertTo-Json) -ContentType "application/json"
    Write-Host "  -> Verification code sent. Please check your email or database." -ForegroundColor Green
} catch {
    Write-Host "  -> Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$code = Read-Host "2) Enter the verification code you received (6-digit number) and press Enter"

Write-Host "3) Verifying code and getting downloadToken ..." -ForegroundColor Yellow
try {
    $verifyBody = @{ email = $email; code = $code; planId = $planId } | ConvertTo-Json
    $verifyResp = Invoke-RestMethod -Method Post -Uri "$base/api/auth/otp/verify" -Body $verifyBody -ContentType "application/json"
    Write-Host "  -> Verify response:" -ForegroundColor Cyan
    $verifyResp | ConvertTo-Json
} catch {
    Write-Host "  -> Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "  -> Response: $responseBody" -ForegroundColor Red
    }
    exit 1
}

if (-not $verifyResp.downloadToken) {
    Write-Host "ERROR: No downloadToken received, stopping." -ForegroundColor Red
    exit 1
}

$token = $verifyResp.downloadToken
Write-Host "4) Downloading PDF and showing full HTTP Response (headers + body) ..." -ForegroundColor Yellow
# Use curl to show full headers and body (body is binary, will print to console - also save to out.pdf)
$downloadUrl = "$base/api/pdf?planId=$planId&mode=full&downloadToken=$token"
Write-Host "  Download URL: $downloadUrl" -ForegroundColor Cyan
# Use curl to save file and show response headers
curl -i -L $downloadUrl -o out.pdf

Write-Host "`nCheck: Generated file out.pdf (in current directory), please try to open it." -ForegroundColor Green
Write-Host "If status is 403 or JSON response, please copy the full curl output above and paste it here." -ForegroundColor Yellow
