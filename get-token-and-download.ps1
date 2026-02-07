# PowerShell 脚本：自动获取 downloadToken 并下载 PDF
# 使用方法：.\get-token-and-download.ps1 <email> <planId> <验证码>

param(
    [string]$Email = "test@example.com",
    [string]$PlanId = "attaguy-plan",
    [string]$Code = ""
)

$BaseUrl = "http://localhost:3000"

Write-Host "`n🧪 PDF 下载完整流程" -ForegroundColor Cyan
Write-Host "📧 邮箱: $Email"
Write-Host "📋 PlanId: $PlanId`n"

# 如果没有提供验证码，先发送验证码
if ([string]::IsNullOrEmpty($Code)) {
    Write-Host "1️⃣ 发送验证码..." -ForegroundColor Yellow
    try {
        $sendBody = @{email = $Email} | ConvertTo-Json
        $sendResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/email/send" `
            -Method POST `
            -ContentType "application/json" `
            -Body $sendBody

        if ($sendResponse.ok) {
            Write-Host "✅ 验证码已发送（请检查邮箱或数据库）" -ForegroundColor Green
            Write-Host "`n📋 请提供验证码作为参数：" -ForegroundColor Yellow
            Write-Host "   .\get-token-and-download.ps1 $Email $PlanId <验证码>`n" -ForegroundColor White
            exit 0
        }
    } catch {
        Write-Host "❌ 发送失败: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host "2️⃣ 验证验证码并获取 downloadToken..." -ForegroundColor Yellow
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

    # 3. 下载 PDF
    Write-Host "`n3️⃣ 下载 PDF..." -ForegroundColor Yellow
    $pdfUrl = "$BaseUrl/api/pdf?planId=$([System.Web.HttpUtility]::UrlEncode($PlanId))&downloadToken=$([System.Web.HttpUtility]::UrlEncode($downloadToken))&mode=full"
    $filename = "out.pdf"

    Write-Host "   URL: $($pdfUrl.Substring(0, [Math]::Min(100, $pdfUrl.Length)))..." -ForegroundColor Gray

    try {
        Invoke-WebRequest -Uri $pdfUrl -OutFile $filename -MaximumRedirection 0 -ErrorAction SilentlyContinue
    } catch {
        # 如果重定向失败，尝试不带重定向
        try {
            Invoke-WebRequest -Uri $pdfUrl -OutFile $filename
        } catch {
            Write-Host "❌ 下载失败: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "`n📋 手动 curl 命令：" -ForegroundColor Yellow
            Write-Host "curl -L -o $filename `"$pdfUrl`"" -ForegroundColor Cyan
            exit 1
        }
    }

    # 检查文件是否存在且不为空
    if (Test-Path $filename -PathType Leaf) {
        $fileSize = (Get-Item $filename).Length
        if ($fileSize -gt 0) {
            Write-Host "✅ PDF 下载成功！" -ForegroundColor Green
            Write-Host "   文件: $filename" -ForegroundColor Gray
            Write-Host "   大小: $([math]::Round($fileSize / 1KB, 2)) KB" -ForegroundColor Gray
        } else {
            Write-Host "⚠️  文件已下载但为空，可能是 JSON 响应（PDF 渲染未接入）" -ForegroundColor Yellow
            Write-Host "   文件内容：" -ForegroundColor Gray
            Get-Content $filename | Select-Object -First 5
        }
    } else {
        Write-Host "❌ 文件下载失败" -ForegroundColor Red
    }

    Write-Host "`n📋 对应的 curl 命令：" -ForegroundColor Yellow
    Write-Host "curl -L -o $filename `"$pdfUrl`"" -ForegroundColor Cyan

} catch {
    Write-Host "❌ 请求失败: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "响应: $responseBody" -ForegroundColor Red
    }
    exit 1
}

