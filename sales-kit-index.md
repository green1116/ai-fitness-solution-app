# V9.0-A1 Sales Kit Index

**AI Fitness Solution — 销售资料体系索引**

| 属性 | 说明 |
|------|------|
| 版本 | V9.0-A1（Sales Kit Foundation） |
| 基线 Tag | `v8.10-commercial-readiness-freeze` |
| 上游 | `first-revenue-plan.md` · `pilot-customer-plan.md` · `90-day-commercial-execution-roadmap.md` |
| 范围 | **仅销售资产**（无新 Runtime / Framework / Governance / Architecture） |
| 目录 | `sales-kit/` |

---

## 0. 使用说明

1. **对外发送**：优先 `product-overview` + `pricing-sheet`；高意向客户加 `roi-calculator` + `demo-script` 预约。
2. **内部对齐**：销售、创始人、交付兼职共用本索引；版本以 Git 为准，重大调价同步更新 `pricing-sheet` 与 `first-revenue-plan.md`。
3. **平台对齐**：数字与 SKU 与 V8.1 Catalog、V8.3 Sales API（`/api/productization/sales`）一致；**收款为对公 + 发票，不接在线支付**。

---

## 1. 资料清单

| 文档 | 路径 | 一句话 |
|------|------|--------|
| 公司概览 | [sales-kit/company-overview.md](sales-kit/company-overview.md) | 我们是谁、服务谁、为何可信 |
| 产品概览 | [sales-kit/product-overview.md](sales-kit/product-overview.md) | 能力、场景、交付物 |
| 报价单 | [sales-kit/pricing-sheet.md](sales-kit/pricing-sheet.md) | 三档 SKU + 项目包 + 微订单 |
| ROI 计算器 | [sales-kit/roi-calculator.md](sales-kit/roi-calculator.md) | 客户参数 → 价值叙事 |
| Demo 脚本 | [sales-kit/demo-script.md](sales-kit/demo-script.md) | 15 分钟标准演示 |
| 试点计划 | [sales-kit/pilot-program.md](sales-kit/pilot-program.md) | Free / Discount / Joint Case Study |
| 常见问题 | [sales-kit/faq.md](sales-kit/faq.md) | 采购、安全、交付、价格 |
| 竞争定位 | [sales-kit/competitive-positioning.md](sales-kit/competitive-positioning.md) | vs 设计公司 / 设备商 / 通用 AI |

---

## 2. 元数据矩阵（受众 · 场景 · 阶段 · 负责人）

| 文档 | 目标受众 | 使用场景 | 销售阶段 | 负责人 |
|------|----------|----------|----------|--------|
| **company-overview** | 决策者、采购、合伙人 | 首次触达、官网 About、伙伴介绍 | Lead · Awareness | 创始人 |
| **product-overview** | 行政、HR、项目负责人 | 需求沟通、立项附件、投标前期 | SQL · Evaluation | 创始人 / 产品兼职 |
| **pricing-sheet** | 采购、财务、行政负责人 | 报价谈判、合同附件、招投标预算参考 | Commercial · Negotiation | 创始人 |
| **roi-calculator** | 行政负责人、HRD、园区运营 | Demo 后跟进、内部立项汇报 | Evaluation · Commercial | 创始人 |
| **demo-script** | 销售、创始人、产品演示 | 现场/线上 Demo、客户培训预演 | Evaluation | 创始人 / 产品兼职 |
| **pilot-program** | 有预算顾虑的 SQL、第 1–3 家目标客户 | 试点条款谈判、合同附录 | Trial · Commercial | 创始人 |
| **faq** | 全角色（含 IT/采购） | 邮件回复、投标答疑、合同审阅 | 全阶段 | 创始人（法务复核） |
| **competitive-positioning** | 销售、BD、渠道伙伴 | 竞品比选、RFP 差异化陈述 | Evaluation · Commercial | 创始人 / BD |

---

## 3. 销售阶段与资料组合

| 阶段 | 定义 | 推荐资料包 |
|------|------|------------|
| **Lead** | 已知品牌，未验证需求 | company-overview + product-overview（1 页摘要） |
| **SQL** | BANT 初筛通过 | product-overview + demo-script（预约） |
| **Evaluation** | Demo / Trial 进行中 | demo-script + roi-calculator + faq |
| **Commercial** | 报价与合同谈判 | pricing-sheet + pilot-program + competitive-positioning |
| **Won** | 签约交付 | pricing-sheet（最终版）+ product-overview（交付范围引用） |

---

## 4. 与 90 天路线图对齐

| 路线图周次 | 主要资料 |
|------------|----------|
| W1 | company-overview · product-overview |
| W2 | pricing-sheet · faq（价格条款） |
| W3 | demo-script · roi-calculator |
| W4 | 全包齐套 → `sales-kit-v1` 对外别名即本目录 |
| W5–W8 | pilot-program · pricing-sheet · competitive-positioning |
| W9+ | product-overview（案例页更新后引用） |

---

## 5. 版本与维护

| 项 | 值 |
|----|-----|
| 创建 | V9.0-A1 |
| 冻结 Tag | `v8.10-commercial-readiness-freeze` |
| 下次复审 | 首单签约后或调价时 |
| 变更原则 | 只改 Markdown；不新增 API / Runtime |

---

## 6. 快速链接

- 官网：`/`  
- 现场 Demo：`/plan`  
- 示例报告：`/result`  
- 销售 API：`GET /api/productization/catalog` · `GET /api/productization/sales`
