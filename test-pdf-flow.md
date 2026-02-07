# PDF 下载接口测试指南

## 前置条件

1. **启动开发服务器**
   ```bash
   npm run dev
   ```
   服务器启动后应该运行在 `http://localhost:3000`

2. **确保数据库中有 planId 数据**
   - 方案数据存储在 `PlanJob` 表中，`id` 字段对应 `planId`
   - 或者通过 `/api/plan` 接口生成一个新方案

3. **确保环境变量已配置**
   - `DOWNLOAD_TOKEN_SECRET` - Token 签名密钥
   - `DATABASE_URL` - 数据库连接字符串

## 完整测试流程

### 步骤 1：生成方案（如果需要）

```bash
# 通过 API 生成方案
curl -X POST http://localhost:3000/api/plan \
  -H "Content-Type: application/json" \
  -d '{
    "companySize": "100",
    "area": "200",
    "scenario": "企业办公楼",
    "goal": "提升员工健康",
    "budget": "5-10万",
    "email": "test@example.com"
  }'
```

### 步骤 2：发送验证码

```bash
curl -X POST http://localhost:3000/api/auth/email/send \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**响应示例：**
```json
{
  "ok": true,
  "message": "sent"
}
```

**注意：** 验证码会发送到邮箱，同时保存到数据库 `EmailOtp` 表中。

### 步骤 3：验证验证码并获取 downloadToken

```bash
curl -X POST http://localhost:3000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456",
    "planId": "attaguy-plan"
  }' \
  -c cookies.txt \
  -v
```

**响应示例：**
```json
{
  "ok": true,
  "downloadToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expAt": 1234567890000,
  "maxUses": 1
}
```

**重要：** 
- 响应中会包含 `Set-Cookie` 头，设置 session cookie
- 保存 `downloadToken` 用于后续下载

### 步骤 4：下载 PDF（Full 模式）

```bash
# 使用获取到的 downloadToken
curl -X GET "http://localhost:3000/api/pdf?planId=attaguy-plan&downloadToken=<downloadToken>&mode=full" \
  -o output.pdf \
  -v
```

### 步骤 5：下载 PDF（Preview 模式 - 不需要 token）

```bash
curl -X GET "http://localhost:3000/api/pdf?planId=attaguy-plan&mode=preview" \
  -o preview.pdf \
  -v
```

## 使用测试脚本

### 测试 OTP 验证

```bash
node test-otp-verify.js test@example.com 123456 attaguy-plan
```

### 测试 PDF 下载

```bash
# Preview 模式（不需要 token）
node test-pdf-download.js attaguy-plan "" preview --save

# Full 模式（需要有效的 downloadToken）
node test-pdf-download.js attaguy-plan <downloadToken> full --save
```

## 使用 PowerShell 测试（Windows）

### 1. 发送验证码

```powershell
$body = @{
    email = "test@example.com"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/email/send" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

Write-Host "验证码已发送: $($response | ConvertTo-Json)"
```

### 2. 验证验证码

```powershell
$verifyBody = @{
    email = "test@example.com"
    code = "123456"
    planId = "attaguy-plan"
} | ConvertTo-Json

$verifyResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/otp/verify" `
    -Method POST `
    -ContentType "application/json" `
    -Body $verifyBody `
    -SessionVariable session

$downloadToken = $verifyResponse.downloadToken
Write-Host "DownloadToken: $downloadToken"
```

### 3. 下载 PDF

```powershell
$planId = "attaguy-plan"
$url = "http://localhost:3000/api/pdf?planId=$planId&downloadToken=$downloadToken&mode=full"

Invoke-WebRequest -Uri $url -OutFile "output.pdf" -WebSession $session
Write-Host "PDF 已保存到 output.pdf"
```

## 常见错误及解决方案

### 1. `MISSING_PLAN_ID`
- **原因：** 缺少 planId 参数
- **解决：** 确保 URL 中包含 `planId` 参数

### 2. `PLAN_NOT_FOUND`
- **原因：** 数据库中不存在该 planId
- **解决：** 
  - 检查 `PlanJob` 表中是否有对应的记录
  - 或通过 `/api/plan` 接口生成新方案

### 3. `MISSING_TOKEN` / `TOKEN_NOT_FOUND`
- **原因：** downloadToken 无效或不存在
- **解决：** 
  - 确保通过 `/api/auth/otp/verify` 获取有效的 token
  - 检查 token 是否已过期或被使用

### 4. `TOKEN_EXPIRED`
- **原因：** Token 已过期
- **解决：** 重新通过 OTP 验证获取新 token

### 5. `TOKEN_EXHAUSTED`
- **原因：** Token 使用次数已达上限
- **解决：** 重新获取新 token

## 检查数据库状态

### 检查 PlanJob 表

```sql
SELECT id, status, created_at FROM planjob WHERE id = 'attaguy-plan';
```

### 检查 EmailOtp 表

```sql
SELECT email, code, expires_at FROM "EmailOtp" WHERE email = 'test@example.com';
```

### 检查 PdfDownloadTokenState 表

```sql
SELECT plan_id, mode, exp_at, used_count, max_uses, revoked 
FROM "PdfDownloadTokenState" 
WHERE plan_id = 'attaguy-plan';
```

### 检查 PdfDownloadLog 表

```sql
SELECT plan_id, ok, reason, error, created_at 
FROM "PdfDownloadLog" 
WHERE plan_id = 'attaguy-plan' 
ORDER BY created_at DESC 
LIMIT 10;
```

## 调试技巧

1. **查看服务器日志**
   - 开发服务器控制台会显示详细的请求日志
   - 注意查看错误堆栈信息

2. **使用浏览器开发者工具**
   - Network 标签查看请求/响应详情
   - Console 查看前端错误信息

3. **检查环境变量**
   ```bash
   # 确保 .env.local 中包含必要的配置
   cat .env.local | grep -E "DOWNLOAD_TOKEN_SECRET|DATABASE_URL"
   ```

4. **使用 Prisma Studio 查看数据**
   ```bash
   npx prisma studio
   ```

