# PowerShell 脚本：获取 downloadToken 并生成 curl 命令
# 使用方法：.\test-pdf-curl.ps1 <email> <planId> [code]

param(
    [string]$Email = "test@example.com",
    [string]$PlanId = "attaguy-plan",
    [string]$Code = ""
)

$BaseUrl = "http://localhost:3000"

Write-Host "`n🧪 PDF 下载测试流程" -ForegroundColor Cyan
Write-Host "📧 邮箱: $Email"
Write-Host "📋 PlanId: $PlanId`n"

# 1. 发送验证码
Write-Host "1️⃣ 发送验证码..." -ForegroundColor Yellow
try {
    $sendBody = @{
        email = $Email
    } | ConvertTo-Json

    $sendResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/email/send" `
        -Method POST `
        -ContentType "application/json" `
        -Body $sendBody

    if ($sendResponse.ok) {
        Write-Host "✅ 验证码已发送（请检查邮箱或数据库）" -ForegroundColor Green
    } else {
        Write-Host "❌ 发送失败: $($sendResponse.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ 发送失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. 如果没有提供验证码，提示用户输入
if ([string]::IsNullOrEmpty($Code)) {
    Write-Host "`n2️⃣ 请输入收到的验证码：" -ForegroundColor Yellow
    Write-Host "   （提示：可以从数据库 EmailOtp 表或邮箱中获取）" -ForegroundColor Gray
    Write-Host "`n使用方法：.\test-pdf-curl.ps1 $Email $PlanId <验证码>`n" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n2️⃣ 使用验证码: $Code" -ForegroundColor Yellow

# 3. 验证验证码并获取 downloadToken
Write-Host "`n3️⃣ 验证验证码并获取 downloadToken..." -ForegroundColor Yellow
try {
    $verifyBody = @{
        email = $Email
        code = $Code
        planId = $PlanId
    } | ConvertTo-Json

    $verifyResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/otp/verify" `
        -Method POST `
        -ContentType "application/json" `
        -Body $verifyBody

    if (-not $verifyResponse.ok) {
        Write-Host "❌ 验证失败: $($verifyResponse.message)" -ForegroundColor Red
        exit 1
    }

    $downloadToken = $verifyResponse.downloadToken
    Write-Host "✅ 验证成功！" -ForegroundColor Green
    Write-Host "   DownloadToken: $($downloadToken.Substring(0, [Math]::Min(30, $downloadToken.Length)))..." -ForegroundColor Gray
    Write-Host "   过期时间: $($verifyResponse.expAt)" -ForegroundColor Gray
    Write-Host "   最大使用次数: $($verifyResponse.maxUses)" -ForegroundColor Gray

    # 4. 生成 curl 命令
    $pdfUrl = "$BaseUrl/api/pdf?planId=$([System.Web.HttpUtility]::UrlEncode($PlanId))&downloadToken=$([System.Web.HttpUtility]::UrlEncode($downloadToken))&mode=full"
    $filename = "test-$PlanId.pdf"

    Write-Host "`n4️⃣ 生成的 curl 命令：" -ForegroundColor Yellow
    Write-Host "curl -o $filename `"$pdfUrl`"" -ForegroundColor Cyan
    
    Write-Host "`n📋 或者使用 PowerShell：" -ForegroundColor Yellow
    Write-Host "Invoke-WebRequest -Uri `"$pdfUrl`" -OutFile `"$filename`"" -ForegroundColor Cyan

    # 可选：直接执行下载
    Write-Host "`n5️⃣ 是否立即下载 PDF？(Y/N): " -ForegroundColor Yellow -NoNewline
    $confirm = Read-Host
    if ($confirm -eq "Y" -or $confirm -eq "y") {
        Write-Host "正在下载..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $pdfUrl -OutFile $filename
        Write-Host "✅ PDF 已保存到: $filename" -ForegroundColor Green
    }

} catch {
    Write-Host "❌ 请求失败: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "响应: $responseBody" -ForegroundColor Red
    }
    exit 1
}

