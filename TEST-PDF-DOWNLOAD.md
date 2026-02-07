# PDF 下载测试指南

## 完整流程

### 步骤 1: 发送验证码

```powershell
# PowerShell
$body = @{email="test@example.com"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/email/send" -Method POST -ContentType "application/json" -Body $body
```

或者使用 curl:
```bash
curl -X POST http://localhost:3000/api/auth/email/send \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\"}"
```

### 步骤 2: 获取验证码

验证码会发送到邮箱，或者可以从数据库查询：
```sql
SELECT email, code, expiresAt FROM "EmailOtp" WHERE email = 'test@example.com';
```

### 步骤 3: 验证验证码并获取 downloadToken

```powershell
# PowerShell
$body = @{
    email = "test@example.com"
    code = "123456"  # 替换为实际验证码
    planId = "attaguy-plan"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/otp/verify" -Method POST -ContentType "application/json" -Body $body
$token = $response.downloadToken
Write-Host "DownloadToken: $token"
```

或者使用 curl:
```bash
curl -X POST http://localhost:3000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456",
    "planId": "attaguy-plan"
  }'
```

响应示例:
```json
{
  "ok": true,
  "downloadToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expAt": "2026-01-29T03:00:00.000Z",
  "maxUses": 1
}
```

### 步骤 4: 使用 downloadToken 下载 PDF

**Windows PowerShell:**
```powershell
$token = "你的downloadToken"
$url = "http://localhost:3000/api/pdf?planId=attaguy-plan&downloadToken=$token&mode=full"
Invoke-WebRequest -Uri $url -OutFile "test.pdf"
```

**curl (Windows Git Bash 或 WSL):**
```bash
curl -o test.pdf \
  "http://localhost:3000/api/pdf?planId=attaguy-plan&downloadToken=你的token&mode=full"
```

**curl (Linux/Mac):**
```bash
curl -o test.pdf \
  "http://localhost:3000/api/pdf?planId=attaguy-plan&downloadToken=你的token&mode=full"
```

## 快速测试脚本

### 使用 Node.js 脚本（推荐）

```bash
# 1. 发送验证码并获取验证码（需要手动输入）
node test-otp-verify.js test@example.com 123456 attaguy-plan

# 2. 使用返回的 downloadToken 测试 PDF 下载
node test-pdf-download.js attaguy-plan <downloadToken> full
```

### 使用 PowerShell 脚本

```powershell
# 自动完成所有步骤（需要提供验证码）
.\test-pdf-curl.ps1 test@example.com attaguy-plan <验证码>
```

## 测试 Preview 模式（需要登录）

Preview 模式只需要登录（session cookie），不需要 downloadToken：

```bash
# 1. 先登录获取 session cookie
curl -X POST http://localhost:3000/api/auth/email/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}' \
  -c cookies.txt

# 2. 使用 session cookie 下载 preview
curl -b cookies.txt -o preview.pdf \
  "http://localhost:3000/api/pdf?planId=attaguy-plan&mode=preview"
```

## 常见错误

- **401 LOGIN_REQUIRED**: Preview 模式需要登录
- **403 MISSING_TOKEN**: Full 模式需要 downloadToken
- **403 TOKEN_EXPIRED**: downloadToken 已过期
- **429 TOKEN_EXHAUSTED**: downloadToken 使用次数已用完

