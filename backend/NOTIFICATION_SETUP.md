# 通知功能配置指南

## 1. 安装依赖

```bash
npm install nodemailer
```

## 2. 配置环境变量

在 `.env` 文件中添加以下配置：

### SMTP 邮件配置

```env
# ===== SMTP 邮件 =====
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@example.com
SMTP_PASS=your_smtp_password_or_app_password
MAIL_FROM="AI Judgment <your_email@example.com>"

# 发给用户（若你要用户留邮箱，可先留空；也可以只发给运营邮箱）
MAIL_TO_OPS=ops@example.com
```

**注意事项：**
- Gmail/Outlook 常需要"应用专用密码"或开启 SMTP
- `SMTP_SECURE=true` 通常配 465；587 通常 `SMTP_SECURE=false`
- `MAIL_FROM` 建议使用已验证的域名邮箱

### 企业微信 Webhook（群机器人）

```env
# ===== 企业微信 webhook（群机器人）=====
WECOM_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxx
```

**获取方式（最短路径）：**
1. 进入企业微信群聊
2. 点击右上角（群设置）
3. 选择「群机器人」
4. 点击「添加机器人」
5. 复制 Webhook URL
6. 填到 `.env` 的 `WECOM_WEBHOOK_URL`

### 飞书 Webhook（群机器人）

```env
# ===== 飞书 webhook（群机器人）=====
FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxxxx
```

**获取方式（最短路径）：**
1. 进入飞书群聊
2. 点击「添加机器人」→「自定义机器人」
3. 复制 Webhook URL
4. 填到 `.env` 的 `FEISHU_WEBHOOK_URL`

**注意：** 这两种 webhook 都是纯 HTTP POST，无需 SDK。

## 3. 通知触发时机

系统会在以下事件自动发送通知：

1. **新订单创建** (`POST /api/orders/create`)
   - 通知内容：订单号、金额、货币

2. **订单支付确认** (`POST /api/orders/confirm`)
   - 通知内容：订单号、支付时间

3. **新提交创建** (`POST /api/submissions`)
   - 通知内容：提交编号、订单号

4. **报告生成完成** (`POST /api/submissions/:id/generate`)
   - 通知内容：提交编号、报告链接、下载地址

## 4. 测试通知

### 测试邮件

```bash
# 创建测试订单触发通知
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -d "{}"
```

### 测试 Webhook

```bash
# 创建测试订单触发通知
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -d "{}"
```

检查企业微信/飞书群是否收到通知消息。

## 5. 常见问题

### Q: 邮件发送失败

**检查项：**
1. SMTP 配置是否正确
2. 是否使用了应用专用密码（Gmail/Outlook）
3. SMTP 端口和 secure 设置是否匹配
4. 查看服务器日志中的错误信息

### Q: Webhook 未收到消息

**检查项：**
1. Webhook URL 是否正确
2. 网络是否可达（服务器能否访问外网）
3. 查看服务器日志中的错误信息

### Q: 不想使用某种通知方式

**处理：**
- 在 `.env` 中留空对应的配置项即可
- 系统会自动跳过未配置的通知方式

## 6. 通知格式

### 邮件通知

- **主题**：`[AI Judgment] {事件名称}`
- **内容**：JSON 格式的事件数据

### Webhook 通知

- **企业微信**：文本消息格式
- **飞书**：文本消息格式
- **内容**：事件标题 + JSON 数据

---

**提示：** 所有通知都是异步发送，不会阻塞主流程。即使通知失败，也不会影响订单和报告的正常处理。

