# AI Judgment MVP

## 1. 安装
```bash
npm ci
```

## 2. 配置

### 步骤 1：创建环境变量文件

复制 `env.example` 为 `.env`：
```bash
cp env.example .env
```

### 步骤 2：填写配置

编辑 `.env` 文件，填写以下配置：

#### 必需配置
- `OPENAI_API_KEY` - OpenAI API Key
- `ADMIN_TOKEN` - 管理员令牌（务必改强密码）
- `BASE_URL` - 部署域名

#### SMTP 邮件配置
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@example.com
SMTP_PASS=your_smtp_password
MAIL_FROM="AI Judgment <your_email@example.com>"
MAIL_TO_OPS=ops@example.com
```

**注意事项：**
- Gmail/Outlook 常需要"应用专用密码"或开启 SMTP
- `SMTP_SECURE=true` 通常配 465；587 通常 `SMTP_SECURE=false`
- `MAIL_FROM` 建议使用已验证的域名邮箱

#### 可选配置（通知功能）

**企业微信 Webhook（最短路径）：**
1. 进入群聊 → 右上角 → 群机器人 → 添加机器人 → 复制 Webhook URL
2. 填到 `.env` 的 `WECOM_WEBHOOK_URL`

**飞书 Webhook（最短路径）：**
1. 群聊 → 添加机器人（自定义机器人）→ 复制 Webhook URL
2. 填到 `.env` 的 `FEISHU_WEBHOOK_URL`

**注意：** 这两种 webhook 都是纯 HTTP POST，无需 SDK。

详细配置说明请参考：[NOTIFICATION_SETUP.md](./NOTIFICATION_SETUP.md)

## 3. 运行
```bash
npm start
```

## 4. MVP 流程

1. **用户在 result.html 点击"获取深化判断方案"**
   - 后端创建订单：`POST /api/orders/create`

2. **用户扫码付款（线下），客服人工核验后**：
   ```bash
   POST /api/orders/confirm
   Header: x-admin-token: your_admin_token
   Body: {"order_no": "ORD-xxx"}
   ```

3. **用户填写 deep-form 并提交**：
   - `POST /api/submissions`

4. **管理员生成报告**：
   ```bash
   POST /api/submissions/SUB-xxx/generate
   Header: x-admin-token: your_admin_token
   ```

5. **用户下载 PDF**：
   - `/reports/SUB-xxx.pdf`

## 5. 生产建议

- **前 30 单**：强制人工校对报告，避免幻觉。
- **Puppeteer 在 Linux**：需安装依赖库，或用容器镜像。
- **后续升级**：换 MySQL/Postgres + 队列（Bull/Redis）做异步生成。

## 6. 文件说明
- `app.js` - Express 后端服务
- `public/result.html` - 结果展示页面
- `public/deep-form.html` - 深度表单页面
- `prompts/openai_prompt.txt` - GPT Prompt 模板
- `mysql_schema.sql` - MySQL 数据库结构（可选）

## 7. 数据库
默认使用 SQLite（自动创建 `mvp.db`），生产环境可切换到 MySQL。
