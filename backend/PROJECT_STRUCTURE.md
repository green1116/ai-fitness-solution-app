# 项目结构说明

## 📁 标准目录结构

```
ai-judgment-mvp/
├── app.js                    # Express 主应用（核心后端服务）
├── package.json              # Node.js 依赖配置
├── .env.example              # 环境变量配置示例（复制为 .env 使用）
├── README.md                 # 项目说明文档
├── mysql_schema.sql         # MySQL 数据库结构（生产环境）
│
├── prompts/                 # GPT Prompt 模板目录
│   ├── openai_prompt.txt   # OpenAI Prompt 模板（SYSTEM + USER）
│   └── gpt-service.js       # GPT 服务工具函数（可选）
│
└── public/                  # 静态文件目录
    ├── result.html          # 结果展示页面（AI 判断报告）
    ├── deep-form.html       # 深度表单页面（10 个问题）
    ├── static/              # 静态资源
    │   ├── sample-qrcode.png  # 支付二维码图片（手动支付用）
    │   └── README.md         # 静态资源说明
    └── reports/             # PDF 报告目录（运行后自动生成）
        └── .gitkeep         # 保持目录被 Git 跟踪
```

## 📄 文件说明

### 核心文件

- **`app.js`** - Express 后端主应用
  - 订单管理 API (`/api/orders/create`, `/api/orders/confirm`)
  - 提交记录 API (`/api/submissions`)
  - 报告生成 API (`/api/submissions/:id/generate`)
  - 支付回调 (`/webhook/stripe`, `/webhook/alipay-notify`, `/webhook/wechatpay`)
  - 结果查询 API (`/api/result/:id`)

- **`package.json`** - 依赖配置
  - Express, OpenAI, Puppeteer, Stripe 等

- **`.env.example`** - 环境变量示例
  - 复制为 `.env` 并填写实际配置

- **`README.md`** - 项目文档
  - 安装、配置、运行说明

### 数据库文件

- **`mysql_schema.sql`** - MySQL 数据库结构
  - `users` 表（用户）
  - `orders` 表（订单）
  - `submissions` 表（提交记录）

### Prompt 模板

- **`prompts/openai_prompt.txt`** - GPT Prompt 模板
  - SYSTEM 提示词
  - USER 提示词模板（包含 `{answers}` 占位符）

### 前端页面

- **`public/result.html`** - AI 判断报告展示页
  - 从 `/api/result/:id` 获取数据
  - 显示摘要、维度、风险、建议
  - "获取深化判断方案" 按钮

- **`public/deep-form.html`** - 深度表单页面
  - 10 个问题的表单
  - 提交到 `/api/submissions`
  - 跳转到结果页面

### 静态资源

- **`public/static/sample-qrcode.png`** - 支付二维码
  - 用于手动支付场景
  - 用户需要自己放置一张二维码图片

- **`public/reports/`** - PDF 报告目录
  - 运行后自动生成
  - 存储生成的 PDF 文件

## 🚀 快速开始

1. **安装依赖**
   ```bash
   cd ai-judgment-mvp
   npm install
   ```

2. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 填写实际配置
   ```

3. **运行服务**
   ```bash
   node app.js
   # 或
   npm start
   ```

4. **访问页面**
   - 结果页：`http://localhost:3000/result.html?id=123`
   - 表单页：`http://localhost:3000/deep-form.html?order_no=ORD-123`

## 📝 注意事项

- **数据库**：默认使用 SQLite（自动创建 `mvp.db`），生产环境建议使用 MySQL
- **PDF 生成**：需要 Puppeteer，首次运行会自动下载 Chromium
- **支付二维码**：需要手动在 `public/static/` 目录放置 `sample-qrcode.png`
- **环境变量**：`.env` 文件不要提交到 Git（已在 `.gitignore` 中）

