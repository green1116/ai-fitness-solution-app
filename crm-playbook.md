# V9.0-A4 CRM & Pipeline Playbook

**AI Fitness Solution — 销售漏斗与管道操作手册**

| 属性 | 说明 |
|------|------|
| 版本 | V9.0-A4（CRM & Pipeline Foundation） |
| 基线 Tag | `v8.10-commercial-readiness-freeze` |
| 上游 | `lead-generation-plan.md` · `sales-kit/` · `pilot-customer-plan.md` · V8.2 `journey/` |
| 范围 | **仅 CRM 流程资产**（无新 Runtime / Architecture） |
| 目录 | `crm/` |

---

## 0. 执行摘要

本手册定义 **MVP 销售漏斗** 与 **六段管道文件**，供飞书/Notion/Excel 手工 CRM 使用。不与平台新增代码耦合；阶段命名与 V8.2 Customer Journey **可映射、可并存**。

**北极星指标（90 天）：** SQL ≥20 · Proposal ≥6 · Pilot/签约 ≥3 · Closed Won ≥3

---

## 1. 销售漏斗总览

```
                    ┌─────────────┐
                    │    Lead     │  已知公司/联系人，未验证需求
                    └──────┬──────┘
                           │ 培育 / 打分
                    ┌──────▼──────┐
                    │     MQL     │  有需求信号，未达 Demo 门槛
                    └──────┬──────┘
                           │ SQL 分 ≥7
                    ┌──────▼──────┐
                    │     SQL     │  可约 Demo / 已 Demo
                    └──────┬──────┘
                           │ 报价发出
                    ┌──────▼──────┐
                    │  Proposal   │  正式报价 + 谈判
                    └──────┬──────┘
                           │ 试点/试用协议
                    ┌──────▼──────┐
                    │    Pilot    │  Trial / Discount / Case Study
                    └──────┬──────┘
                           │ 合同签署
              ┌────────────┴────────────┐
       ┌──────▼──────┐           ┌──────▼──────┐
       │ Closed Won  │           │ Closed Lost │
       └──────┬──────┘           └─────────────┘
              │
       ┌──────▼──────┐
       │  Renewal    │  续约 / 扩展（客户生命周期）
       └─────────────┘
```

---

## 2. 漏斗阶段定义（主表）

| 阶段 | 英文 | 定义 | 负责 | 典型停留 |
|------|------|------|------|----------|
| **线索** | Lead | 名单入库，尚未确认需求或 ICP 匹配 | 创始人/BD | 1–14 天 |
| **营销合格** | MQL | 有互动或需求信号，SQL 分 5–6 | 创始人/BD | 3–21 天 |
| **销售合格** | SQL | SQL 分 ≥7；已 Demo 或强意向约 Demo | 创始人 | 7–30 天 |
| **报价** | Proposal | 正式报价单已发出，商业谈判中 | 创始人 | 7–45 天 |
| **试点** | Pilot | 14 天 Trial 或 Discount/Case Study 试点执行中 | 创始人+交付 | 14–90 天 |
| **成交** | Closed Won | 合同签署 + 首付到账 | 创始人 | 终端（进 Renewal） |
| **丢单** | Closed Lost | 明确不采购或超期休眠 | 创始人 | 终端 |

---

## 3. CRM 文件与漏斗映射

| CRM 文件 | 覆盖漏斗阶段 | 文档 |
|----------|--------------|------|
| **Lead Stage** | Lead · MQL | [crm/lead-stage.md](crm/lead-stage.md) |
| **Opportunity Stage** | SQL | [crm/opportunity-stage.md](crm/opportunity-stage.md) |
| **Proposal Stage** | Proposal | [crm/proposal-stage.md](crm/proposal-stage.md) |
| **Pilot Stage** | Pilot | [crm/pilot-stage.md](crm/pilot-stage.md) |
| **Contract Stage** | Proposal → Closed Won/Lost | [crm/contract-stage.md](crm/contract-stage.md) |
| **Renewal Stage** | Closed Won 之后 | [crm/renewal-stage.md](crm/renewal-stage.md) |

---

## 4. 与 V8.2 Customer Journey 映射

| CRM 漏斗 | V8.2 Journey Kind |
|----------|-------------------|
| Lead | `lead` |
| MQL | `qualified-lead`（部分） |
| SQL | `demo-requested` · `evaluation` |
| Proposal | `proposal-generated` · `commercial-negotiation` |
| Pilot | `trial-started` · `evaluation` |
| Closed Won | `won` |
| Closed Lost | `lost` |
| Renewal | （交付后，对齐 V8.6/V8.9，非 Journey 终端前阶段） |

**API 参考（只读）：** `GET /api/productization/journey`

---

## 5. 全局 CRM 记录结构

### 5.1 Account（公司）

| 字段 | 说明 |
|------|------|
| `account_id` | A001+ |
| `company` | 全称 |
| `tier` | P0 / P1 |
| `icp` | HR / 联合办公 / 科技行政 / 中小企业 / 物业 |
| `city` | 城市 |
| `employees` | 规模 |
| `website` | 官网 |

### 5.2 Opportunity（商机）

| 字段 | 说明 |
|------|------|
| `opp_id` | O001+ |
| `account_id` | 关联公司 |
| `stage` | Lead / MQL / SQL / Proposal / Pilot / Closed Won / Closed Lost |
| `amount` | 预估 ACV（CNY） |
| `sku` | Starter / Professional / Enterprise |
| `sql_score` | 0–10 |
| `close_date` | 预计签约日 |
| `loss_reason` | Lost 时必填 |

### 5.3 Activity（活动日志）

| 类型 | 示例 |
|------|------|
| Email | 冷邮件 A 发出 |
| Call | 发现 call 15min |
| Demo | Demo 完成 |
| Quote | 报价单 v1 发出 |
| Meeting | Kickoff |

---

## 6. 阶段转换规则（简表）

| 从 | 到 | 触发条件 |
|----|-----|----------|
| Lead | MQL | 回复邮件/通过好友；或有 trigger 事件 |
| Lead | Closed Lost | 明确无需求 / ICP 不符 |
| MQL | SQL | SQL 分 ≥7 或 Demo 完成 |
| MQL | Lead | 90 天无互动降级 |
| SQL | Proposal | 需求确认表归档 + 报价发出 |
| SQL | Closed Lost | 拒绝 Demo / 竞品中标 |
| Proposal | Pilot | 签 Trial 或 Discount Pilot 合同 |
| Proposal | Closed Won | 直签（无试点）+ 首付到账 |
| Proposal | Closed Lost | 丢单 / 选竞品 / 预算砍掉 |
| Pilot | Closed Won | 试点转正式 + 首付到账 |
| Pilot | Closed Lost | 试点失败 / 不续约 |
| Closed Won | Renewal | 进入 CS；到期前 90 天 |

---

## 7. 管道健康指标（每周五）

| 指标 | 公式 / 目标 |
|------|-------------|
| **漏斗体积** | 各阶段商机数 |
| **SQL→Proposal** | 报价数 / SQL 数（目标 ≥50%） |
| **Proposal→Won** | 赢单 / 报价（目标 ≥30% MVP） |
| **平均周期** | Won 的 (签约日 − 创建日) 天数 |
| **加权管道** | Σ(金额 × 阶段概率) |
| **阶段概率（默认）** | Lead 5% · MQL 10% · SQL 25% · Proposal 40% · Pilot 60% |

### 7.1 阶段赢率权重（MVP 默认）

| 阶段 | 默认赢率权重 |
|------|--------------|
| Lead | 5% |
| MQL | 10% |
| SQL | 25% |
| Proposal | 40% |
| Pilot | 60% |
| Closed Won | 100% |
| Closed Lost | 0% |

---

## 8. 角色与 RACI

| 活动 | 创始人 | BD | 产品/交付 | 财务 |
|------|--------|-----|-----------|------|
| Lead/MQL 外联 | A/R | R | — | — |
| SQL Demo | A/R | C | C | — |
| Proposal 审批价 | A | — | — | C |
| Pilot 交付 | A | — | R | — |
| 合同/发票 | A | — | — | R |
| Renewal QBR | A | — | C | — |

*A=负责 R=执行 C=协商 I=知会*

---

## 9. 与 90 天路线图对齐

| 阶段 | Day 1–30 | Day 31–60 | Day 61–90 |
|------|----------|-----------|-----------|
| Lead/MQL | 名单 100+ | 触达 150+ | 案例外联 |
| SQL | 排练 Demo | ≥20 | 持续 |
| Proposal | 资料齐套 | ≥6 报价 | 谈判 |
| Pilot | Trial 开通流程 | 签约 #1 | #2/#3 |
| Closed Won | — | L1/L2 | ≥3 家 |
| Renewal | — | — | #1 QBR |

---

## 10. 快速导航

| 场景 | 打开 |
|------|------|
| 新名单入库 | [lead-stage.md](crm/lead-stage.md) |
| 约 Demo / Demo 后 | [opportunity-stage.md](crm/opportunity-stage.md) |
| 发报价 | [proposal-stage.md](crm/proposal-stage.md) |
| 开 Trial / 折扣试点 | [pilot-stage.md](crm/pilot-stage.md) |
| 签合同、首付 | [contract-stage.md](crm/contract-stage.md) |
| 续约、扩展 | [renewal-stage.md](crm/renewal-stage.md) |

---

## 11. 文档信息

| 项 | 值 |
|----|-----|
| 版本 | V9.0-A4 |
| 关联 | `lead-generation-plan.md` · `first-revenue-plan.md` |
