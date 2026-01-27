# 检查 Resend 邮件发送日志

## 方法 1：通过 Resend Dashboard 查看

1. 登录 [Resend Dashboard](https://resend.com/emails)
2. 进入 "Emails" 页面
3. 查看最近的邮件发送记录
4. 检查：
   - 邮件状态（已发送/已送达/失败）
   - 错误信息（如果有）
   - 邮件内容预览

## 方法 2：通过 Resend API 查询

可以使用以下命令查询最近的邮件发送记录：

```bash
# 需要先安装 curl 或使用 Postman
curl -X GET "https://api.resend.com/emails" \
  -H "Authorization: Bearer YOUR_RESEND_API_KEY"
```

## 方法 3：检查服务器日志

查看服务器控制台输出，应该会看到：
- `[Resend] 准备发送验证码到: xxx@xxx.com`
- `[Resend] 邮件发送成功 - ID: xxx, Email: xxx, Code: xxx`
- 或 `[Resend] 邮件发送失败: xxx`

## 常见问题排查

### 1. 邮件未收到
- **检查垃圾邮件文件夹**
- **检查 Resend Dashboard 中的邮件状态**
- **确认发件人域名已验证**（`mail.attaguy.net` 需要在 Resend 中验证）

### 2. 域名未验证
- 登录 Resend Dashboard
- 进入 "Domains" 页面
- 添加并验证 `mail.attaguy.net` 域名
- 按照提示添加 DNS 记录

### 3. API Key 问题
- 确认 `.env.local` 中的 `RESEND_API_KEY` 正确
- 确认 API Key 有发送邮件的权限

### 4. 邮件被退回
- 检查 Resend Dashboard 中的退回原因
- 确认收件人邮箱地址有效
- 检查发件人地址格式是否正确

