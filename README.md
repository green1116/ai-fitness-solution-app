This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `env.local.example` 为 `.env.local`：

```bash
cp env.local.example .env.local
```

编辑 `.env.local` 文件，填写以下配置：

#### SMTP 邮件配置（如果使用 SMTP）
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@example.com
SMTP_PASS=your_smtp_password_or_app_password
MAIL_FROM="AttaGuy <your_email@example.com>"
```

#### Resend 邮件配置（如果使用 Resend，推荐）
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM="Attaguy <noreply@mail.attaguy.net>"
```

**注意**：`EMAIL_FROM` 格式为 `"显示名称 <邮箱地址>"`，例如：
- ✅ 正确：`EMAIL_FROM="Attaguy <noreply@mail.attaguy.net>"`
- ❌ 错误：`EMAIL_FROM="noreply@mail.attaguy.net"`（没有显示名称）

#### 安全配置（必需）
```env
EMAIL_TOKEN_SECRET=change_me_to_a_long_random_string
DOWNLOAD_TOKEN_SECRET=change_me_to_a_long_random_string_at_least_32_chars
```

#### Token 有效期配置（可选）
```env
# 下载 token 有效期（秒）：建议 900（15 分钟）或 600（10 分钟）
# 更短的 TTL 可以降低 token 被截获后的风险窗口
# 默认值：1800（30 分钟）
DOWNLOAD_TOKEN_EXPIRES_IN_SECONDS=900
```

#### PDF 销售授权白名单（可选）
```env
# PDF_SALES_ALLOW_EMAILS: 允许下载 full 的邮箱列表（逗号分隔）
# PDF_SALES_ALLOW_PLAN_IDS: 允许下载 full 的 planId 列表（逗号分隔，可为空表示不限制 planId，不推荐）
PDF_SALES_ALLOW_EMAILS="sales@attaguy.net, your@email.com"
PDF_SALES_ALLOW_PLAN_IDS="attaguy-plan"
```

**说明**：
- 销售授权是 PDF 下载的第四种访问方式（优先级：token → 授权码 → 支付 → 销售授权）
- 如果 `PDF_SALES_ALLOW_PLAN_IDS` 为空，则允许所有 planId（不推荐，存在安全风险）
- 只有登录用户且邮箱在白名单中才能使用销售授权下载

#### 数据库配置（可选）
如果需要订单校验功能，配置数据库连接：
```env
DB_URL=postgres://user:pass@host:5432/dbname
```

### 3. 运行开发服务器

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
