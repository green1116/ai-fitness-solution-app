# PowerShell 测试 OTP 验证接口并获取 downloadToken

# 配置
$baseUrl = "http://localhost:3000"
$email = "insport@163.com"
$code = "105405"  # 替换为实际的验证码
$planId = "your-plan-id-here"  # 替换为实际的 planId

# 1. 验证 OTP 并获取 downloadToken
Write-Host "正在验证 OTP..." -ForegroundColor Yellow

$body = @{
    email = $email
    code = $code
    planId = $planId
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/auth/otp/verify" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "验证成功！" -ForegroundColor Green
    Write-Host "响应内容：" -ForegroundColor Cyan
    $res | ConvertTo-Json
    
    if ($res.downloadToken) {
        Write-Host "`n下载 Token：" -ForegroundColor Green
        Write-Host $res.downloadToken -ForegroundColor White
        
        # 使用 downloadToken 下载 PDF
        Write-Host "`n正在下载 PDF..." -ForegroundColor Yellow
        $pdfUrl = "$baseUrl/api/pdf?plan_id=$planId&downloadToken=$($res.downloadToken)"
        Write-Host "PDF URL: $pdfUrl" -ForegroundColor Cyan
        Start-Process $pdfUrl
    } else {
        Write-Host "`n警告：未返回 downloadToken（可能因为未提供 planId）" -ForegroundColor Yellow
    }
} catch {
    Write-Host "错误：" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "详细信息：" -ForegroundColor Red
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

