# 产品概览 · AI Fitness Solution

---

## 文档元数据

| 项 | 内容 |
|----|------|
| **目标受众** | 企业行政、HR、项目负责人、招采前期经办人 |
| **使用场景** | 需求沟通会议、立项附件、投标前期说明、Demo 前预读 |
| **销售阶段** | SQL · Evaluation |
| **负责人** | 创始人 / 产品兼职 |

---

## 1. 产品定义

**AI Fitness Solution** 是企业级 **员工健身空间方案规划与投标交付** 平台。

客户输入 **企业规模、空间面积、预算区间** 等参数，系统生成：

| 交付物 | 说明 | 典型用途 |
|--------|------|----------|
| **Plan（方案）** | 结构化健身空间建设方案 | 内部讨论、设计 brief |
| **Budget（预算）** | 与方案联动的预算报告 | 立项、财务审批 |
| **Proposal PDF** | 正式排版方案/预算 PDF | 汇报、行政审批 |
| **Tender Package** | 投标技术文件包（Professional+） | 招采、比选 |

---

## 2. 核心能力

### 2.1 自动生成方案

- 按人数、面积、预算自动生成 **分区建议、设备类型、实施节奏**
- 减少对外部设计公司 **首轮方案** 的依赖与等待

### 2.2 预算与方案联动

- 预算项与方案模块对应，便于 **行政 ↔ 财务 ↔ 采购** 同一口径沟通
- 支持多轮修订（按合同约定轮次上限）

### 2.3 正式 PDF 输出

- 方案 PDF、预算 PDF、打包导出
- 适用于 **福利升级汇报、园区配套优化、招采前期文件**

### 2.4 企业级场景（Professional / Enterprise）

- **多工作区** 配置（联合办公、多网点）
- **Tender Package** 投标包生成
- 更高生成额度与优先支持

---

## 3. 适用场景

| 场景 | 角色 | 推荐 SKU |
|------|------|----------|
| 单点办公区健身区改造 | 行政 / 人事 | Starter |
| 总部福利升级、多部门评审 | 行政 + HR | Professional |
| 联合办公 3+ 店标准化 | 运营 / 产品 | Professional |
| HR 服务商批量服务客户 | 客户成功 / 商务 | Professional → Enterprise |
| 大型园区、强招标项目 | 招采 / 项目部 | Enterprise |

---

## 4. SKU 与权益（摘要）

| SKU | 适合 | 核心权益 |
|-----|------|----------|
| **Starter** | 30–150 人，单点项目 | Plan / Budget / PDF；次数上限 |
| **Professional** | 200–500 人、联合办公、HR 服务商 | 含 Tender；多工作区；优先支持 |
| **Enterprise** | 大规模、渠道、定制流程 | 无限额度；专属支持；个案定价 |

完整价格见 [pricing-sheet.md](pricing-sheet.md)。

---

## 5. 客户旅程（我们如何合作）

```
Lead → SQL → Evaluation（Demo / Trial）→ Commercial → Won → 交付 → 续约
```

| 阶段 | 客户获得 |
|------|----------|
| Evaluation | 15 分钟 Demo 或 14 天 Trial |
| Commercial | 定制报价单 + 项目包 SOW |
| Won | Kickoff → 方案/预算/PDF 交付 → 验收 |
| 续约 | 健康度回顾、权益升级（V8.9 扩展模型） |

---

## 6. 交付标准（签约后）

对齐 V8.5 交付里程碑：

| 里程碑 | 交付物 |
|--------|--------|
| **Initiated** | Kickoff 完成、需求确认 |
| **Proposal Delivered** | Plan + Budget + Proposal PDF（+ Tender 如适用） |
| **Completed** | 客户验收、CSAT、案例授权（如约定） |

**典型周期：** Kickstart 包 **21 天**（含约定 2 轮修订）。

---

## 7. 技术与管理说明（采购常问）

| 问题 | 回答摘要 |
|------|----------|
| 是否替代设计公司？ | **不替代终版施工图**；加速方案与投标前期，缩短决策周期 |
| 数据安全 | 企业项目数据按工作区隔离；具体条款见合同与 [faq.md](faq.md) |
| 部署 | SaaS 访问；无客户侧 Runtime 部署需求 |
| 集成 | MVP 阶段以导出 PDF 为主；深度集成 Enterprise 个案 |

---

## 8. 下一步

| 动作 | 资料 |
|------|------|
| 看 ROI | [roi-calculator.md](roi-calculator.md) |
| 预约演示 | [demo-script.md](demo-script.md) |
| 试点条款 | [pilot-program.md](pilot-program.md) |
| 比价 | [competitive-positioning.md](competitive-positioning.md) |

**立即体验：** [官网 `/`](https://) · [生成方案 `/plan`](https://)

---

## 9. 文档信息

| 项 | 值 |
|----|-----|
| 版本 | V9.0-A1 |
| 对齐 API | `GET /api/productization/catalog` |
