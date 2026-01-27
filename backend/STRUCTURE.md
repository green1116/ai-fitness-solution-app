# 📁 项目结构清单

## 标准目录结构

```
ai-judgment-mvp/
├── app.js                    # ✅ Express 主应用（核心后端服务）
├── package.json              # ✅ Node.js 依赖配置
├── .env.example              # ✅ 环境变量配置示例（复制为 .env 使用）
├── README.md                  # ✅ 项目说明文档
├── mysql_schema.sql          # ✅ MySQL 数据库结构（生产环境）
├── .gitignore                # ✅ Git 忽略文件配置
│
├── prompts/                  # ✅ GPT Prompt 模板目录
│   ├── openai_prompt.txt    # ✅ OpenAI Prompt 模板（SYSTEM + USER）
│   └── gpt-service.js        # ✅ GPT 服务工具函数（可选）
│
└── public/                   # ✅ 静态文件目录
    ├── result.html           # ✅ 结果展示页面（AI 判断报告）
    ├── deep-form.html        # ✅ 深度表单页面（10 个问题）
    ├── static/               # ✅ 静态资源目录
    │   ├── sample-qrcode.png # ⚠️  支付二维码图片（需要手动放置）
    │   └── README.md         # ✅ 静态资源说明
    └── reports/              # ✅ PDF 报告目录（运行后自动生成）
        └── .gitkeep          # ✅ 保持目录被 Git 跟踪
```

## 📄 文件检查清单

### ✅ 核心文件（必需）

- [x] `app.js` - Express 后端主应用
- [x] `package.json` - 依赖配置
- [x] `.env.example` - 环境变量示例
- [x] `README.md` - 项目文档
- [x] `mysql_schema.sql` - MySQL 数据库结构
- [x] `.gitignore` - Git 忽略配置

### ✅ Prompt 模板（必需）

- [x] `prompts/openai_prompt.txt` - GPT Prompt 模板

### ✅ 前端页面（必需）

- [x] `public/result.html` - 结果展示页面
- [x] `public/deep-form.html` - 深度表单页面

### ⚠️ 静态资源（需要手动添加）

- [ ] `public/static/sample-qrcode.png` - **需要手动放置支付二维码图片**

### ✅ 自动生成目录

- [x] `public/reports/` - PDF 报告目录（运行后自动生成）

## 🚀 快速验证

运行以下命令检查文件是否齐全：

```bash
cd ai-judgment-mvp

# 检查核心文件
ls app.js package.json .env.example README.md mysql_schema.sql

# 检查 Prompt 模板
ls prompts/openai_prompt.txt

# 检查前端页面
ls public/result.html public/deep-form.html

# 检查静态资源目录
ls public/static/

# 检查报告目录
ls public/reports/
```

## 📝 下一步操作

1. **复制环境变量文件**
   ```bash
   cp .env.example .env
   # 然后编辑 .env 填写实际配置
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **放置支付二维码**
   - 在 `public/static/` 目录放置 `sample-qrcode.png`
   - 可以是微信支付、支付宝或其他支付方式的二维码

4. **运行服务**
   ```bash
   node app.js
   ```

## ⚠️ 注意事项

- **`.env` 文件**：不要提交到 Git（已在 `.gitignore` 中）
- **`sample-qrcode.png`**：需要手动放置，用于手动支付场景
- **`public/reports/`**：运行后自动生成，PDF 文件存储在此目录
- **数据库文件**：SQLite 的 `mvp.db` 文件会自动创建，不要提交到 Git

## 📦 完整文件列表

```
ai-judgment-mvp/
├── app.js                          # 729 行，Express 主应用
├── package.json                    # 依赖配置
├── .env.example                    # 环境变量示例
├── README.md                       # 项目文档
├── mysql_schema.sql                # MySQL 数据库结构
├── .gitignore                      # Git 忽略配置
├── PROJECT_STRUCTURE.md            # 项目结构说明（本文件）
│
├── prompts/
│   ├── openai_prompt.txt           # GPT Prompt 模板
│   ├── gpt-service.js              # GPT 服务工具
│   ├── README.md                   # Prompt 使用说明
│   ├── report-generation.md       # 报告生成文档
│   └── usage_example.txt           # 使用示例
│
└── public/
    ├── result.html                 # 结果展示页面
    ├── deep-form.html              # 深度表单页面
    ├── static/
    │   ├── sample-qrcode.png       # ⚠️ 需要手动放置
    │   └── README.md                # 静态资源说明
    └── reports/
        └── .gitkeep                # 保持目录被 Git 跟踪
```

**所有必需文件已就位！** ✅

