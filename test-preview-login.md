# 测试 Preview 模式 PDF 下载

## 端点
```
GET /api/pdf?planId=attaguy-plan&mode=preview
```

## 预期行为

### 1. 未登录（无 session cookie）
- **状态码**: `401 Unauthorized`
- **响应**: 
```json
{
  "ok": false,
  "code": "LOGIN_REQUIRED"
}
```

### 2. 已登录（有有效的 session cookie）
- **状态码**: `200 OK`
- **响应**（当前临时）:
```json
{
  "ok": true,
  "code": "PREVIEW_OK"
}
```

## 测试步骤

### 方法 1: 使用浏览器
1. 先登录获取 session cookie：
   - 访问 `http://localhost:3000/login`
   - 输入邮箱和验证码完成登录
   - 浏览器会自动保存 `session` cookie

2. 然后访问：
   ```
   http://localhost:3000/api/pdf?planId=attaguy-plan&mode=preview
   ```

### 方法 2: 使用 curl（带 cookie）
```bash
# 先登录获取 session cookie（需要先通过 OTP 验证）
# 然后使用 cookie 访问 preview 端点

curl -v "http://localhost:3000/api/pdf?planId=attaguy-plan&mode=preview" \
  -H "Cookie: session=YOUR_SESSION_TOKEN_HERE"
```

### 方法 3: 使用测试脚本
```bash
# 需要先获取有效的 session token
# 然后修改测试脚本添加 Cookie header
```

## 登录流程

1. 发送验证码：
   ```bash
   curl -X POST http://localhost:3000/api/auth/email/send \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

2. 验证 OTP（会返回 session cookie）：
   ```bash
   curl -X POST http://localhost:3000/api/auth/email/verify \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","code":"123456"}' \
     -c cookies.txt
   ```

3. 使用 cookie 访问 preview：
   ```bash
   curl "http://localhost:3000/api/pdf?planId=attaguy-plan&mode=preview" \
     -b cookies.txt
   ```

## 注意事项

- Preview 模式**必须**已登录（有有效的 session）
- Session 验证通过 `requireLogin` 函数检查：
  - 从 cookie 中提取 `session` token
  - 计算 hash: `sha256(token:${SESSION_SECRET})`
  - 查询 Session 表验证 tokenHash 和过期时间
- 当前返回临时 JSON，接入 PDF 渲染后才会返回实际 PDF

