# 快速测试 PDF 下载

## 完整步骤

### 步骤 1: 发送验证码

```bash
curl -X POST http://localhost:3000/api/auth/email/send \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\"}"
```

### 步骤 2: 获取验证码

验证码会发送到邮箱，或者从数据库查询：
```sql
SELECT email, code, expiresAt FROM "EmailOtp" WHERE email = 'test@example.com';
```

### 步骤 3: 验证验证码并获取 downloadToken

```bash
curl -X POST http://localhost:3000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"code\":\"123456\",\"planId\":\"attaguy-plan\"}"
```

响应示例：
```json
{
  "ok": true,
  "downloadToken": "abc123xyz...",
  "expAt": "2026-01-29T03:00:00.000Z",
  "maxUses": 1
}
```

### 步骤 4: 使用 downloadToken 下载 PDF

**注意**: 将 `你的token` 替换为步骤 3 返回的实际 `downloadToken` 值。

```bash
curl -L -o out.pdf "http://localhost:3000/api/pdf?planId=attaguy-plan&downloadToken=你的token&mode=full"
```

**完整示例**（假设 token 是 `abc123xyz...`）：
```bash
curl -L -o out.pdf "http://localhost:3000/api/pdf?planId=attaguy-plan&downloadToken=abc123xyz...&mode=full"
```

## 使用 PowerShell 脚本（推荐）

```powershell
# 1. 发送验证码
.\get-token-and-download.ps1 test@example.com attaguy-plan

# 2. 提供验证码后自动下载
.\get-token-and-download.ps1 test@example.com attaguy-plan 123456
```

## 使用 Node.js 脚本

```bash
# 完整流程（需要提供验证码）
node test-pdf-with-token-flow.js test@example.com attaguy-plan 123456
```

## 注意事项

1. **验证码有效期**: 10 分钟
2. **downloadToken 有效期**: 默认 30 分钟（可通过环境变量配置）
3. **使用次数**: 默认 1 次（可通过环境变量配置）
4. **当前状态**: PDF 渲染函数未接入，会返回 JSON 响应而不是实际的 PDF 文件

## 当前 API 响应

由于 PDF 渲染函数还未接入，当前会返回 JSON：
```json
{
  "ok": true,
  "code": "FULL_OK",
  "mode": "basic"
}
```

接入 PDF 渲染函数后，将返回实际的 PDF 文件。

