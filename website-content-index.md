# V9.0-A2 Website Content Index

**AI Fitness Solution — 官网内容结构索引**

| 属性 | 说明 |
|------|------|
| 版本 | V9.0-A2（Website & Landing Page Foundation） |
| 上游 | `sales-kit/` · `sales-kit-index.md` |
| 基线 Tag | `v8.10-commercial-readiness-freeze` |
| 范围 | **仅内容资产**（Markdown；无新 Runtime / Framework / Architecture） |
| 目录 | `website/` |

---

## 0. 使用说明

1. **内容源：** 本目录为官网 **文案与区块结构** 的单一事实来源；实现落地时映射到 `app/` 页面组件，不重复发明文案。
2. **与产品对齐：** 可点击 CTA 指向现有路由 `/plan`、`/result`；定价/试用/联系为 **内容页**，MVP 可同页锚点或后续独立路由。
3. **禁止：** 官网不接在线支付；CTA 为「生成方案 / 预约 Demo / 申请试用 / 联系销售」。

---

## 1. 页面清单

| 页面 | 文件 | 建议路由 | 对应现有实现 |
|------|------|----------|--------------|
| 首页 | [website/home-page.md](website/home-page.md) | `/` | `app/page.tsx` |
| 产品 | [website/product-page.md](website/product-page.md) | `/product` | 待实现 |
| 定价 | [website/pricing-page.md](website/pricing-page.md) | `/pricing` | 待实现 |
| 试用 | [website/trial-page.md](website/trial-page.md) | `/trial` | 对齐 V8.4 Trial |
| 联系 | [website/contact-page.md](website/contact-page.md) | `/contact` | 待实现 |

---

## 2. 统一内容区块（每页均定义）

| 区块 | 英文 | 用途 |
|------|------|------|
| **Hero** | Hero | 首屏标题、副标题、主/次 CTA |
| **Value Proposition** | Value Proposition | 一句话价值 + 支撑句 |
| **Features** | Features | 产品能力卡片（3–6 项） |
| **Customer Benefits** | Customer Benefits | 按角色/场景的收益 |
| **FAQ** | FAQ | 该页最常见 4–8 问 |
| **CTA** | CTA | 页底转化行动 |

---

## 3. 全站导航（建议）

| 导航项 | 链接 | 优先级 |
|--------|------|--------|
| 产品 | `/product` | 必含 |
| 定价 | `/pricing` | 必含 |
| 试用 | `/trial` | 必含 |
| 联系 | `/contact` | 必含 |
| 立即体验 | `/plan` | 主 CTA（全局） |

**页脚：** 公司名 · 联系邮箱 · 隐私说明占位 · © 年份

---

## 4. 页面与 sales-kit 映射

| 官网页面 | 主要 sales-kit 来源 |
|----------|---------------------|
| home-page | company-overview · product-overview（摘要） |
| product-page | product-overview · competitive-positioning（摘要） |
| pricing-page | pricing-sheet |
| trial-page | pilot-program · faq（试用相关） |
| contact-page | company-overview · demo-script（预约） |

---

## 5. CTA 矩阵（全站）

| CTA 文案 | 目标 | 使用页面 |
|----------|------|----------|
| 立即生成方案 | `/plan` | 首页、产品、定价、试用 |
| 查看示例报告 | `/result?planId=attaguy-plan` | 首页、产品 |
| 预约 15 分钟 Demo | `/contact`（表单：类型=Demo） | 首页、产品、定价 |
| 申请 14 天试用 | `/trial` 或 `/contact`（类型=Trial） | 试用、产品 |
| 获取报价 | `/contact`（类型=Quote） | 定价 |
| 联系销售 | `/contact` | 全站页脚 |

---

## 6. SEO 元数据（建议）

| 页面 | Title | Description（≤160 字） |
|------|-------|-------------------------|
| 首页 | AI Fitness Solution — 企业健身空间方案自动生成 | 3 天产出方案、预算与正式 PDF，面向企业行政、HR 与招采。 |
| 产品 | 产品能力 — AI Fitness Solution | Plan、Budget、Proposal PDF、Tender 投标包，企业级健身空间规划。 |
| 定价 | 定价 — AI Fitness Solution | Starter / Professional / Enterprise 与项目交付包，对公签约。 |
| 试用 | 免费试用 — AI Fitness Solution | 14 天试用工作区，体验方案与 PDF 生成。 |
| 联系 | 联系我们 — AI Fitness Solution | 预约 Demo、获取报价、商务合作。 |

---

## 7. 与 90 天路线图对齐

| 周次 | 官网动作 |
|------|----------|
| W1 | 首页 Hero/VP 与 `home-page.md` 对齐 |
| W2 | 上线或锚点 **定价** 内容 |
| W3 | 产品页 + 示例报告 CTA |
| W4 | 试用页 + 联系表单字段定稿 |

---

## 8. 文档信息

| 项 | 值 |
|----|-----|
| 版本 | V9.0-A2 |
| 关联 | `sales-kit-index.md` |
