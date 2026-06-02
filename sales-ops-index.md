# V9.0-A5 Sales Operations Index

**AI Fitness Solution — 销售执行资产索引**

| 属性 | 说明 |
|------|------|
| 版本 | V9.0-A5（Sales Operations Assets） |
| 基线 Tag | `v8.10-commercial-readiness-freeze` |
| 上游 | V9.0-A1 `sales-kit/` · A2 `website/` · A3 `lead-generation-plan.md` · A4 `crm/` |
| 范围 | **可执行模板与表格**（无新 Runtime / Framework / Architecture / Governance） |
| 目录 | `sales-ops/` |

---

## 0. 使用说明

1. **导入 CRM：** 用 Excel/飞书打开 `crm-template.csv`，另存为主表；每周复制一行做快照或直接用 `weekly-sales-dashboard.md` 填数。
2. **名单建设：** `lead-list-template.csv` 对齐 A3 的 100 P0 + 30 P1。
3. **外联：** `outreach-email-template.md` + `wechat-outreach-template.md`（与 A3 一致，此处为执行副本）。
4. **阶段检查：** Demo / Proposal / Pilot / Quotation / Follow-up / Renewal 各 checklist 或 template。
5. **周五复盘：** 填写 `weekly-sales-dashboard.md`。

---

## 1. 资产清单

| 文件 | 类型 | 用途 |
|------|------|------|
| [crm-template.csv](sales-ops/crm-template.csv) | CSV | 商机主表（Account 级） |
| [lead-list-template.csv](sales-ops/lead-list-template.csv) | CSV | 线索名单录入 |
| [outreach-email-template.md](sales-ops/outreach-email-template.md) | 模板 | 冷邮件 A/B/C + Demo |
| [wechat-outreach-template.md](sales-ops/wechat-outreach-template.md) | 模板 | 微信 1–4 + 跟进 |
| [demo-checklist.md](sales-ops/demo-checklist.md) | 清单 | Demo 前/中/后 |
| [proposal-checklist.md](sales-ops/proposal-checklist.md) | 清单 | 发报价前/后 |
| [pilot-agreement-template.md](sales-ops/pilot-agreement-template.md) | 合同附录 | Trial / Discount / Case Study |
| [quotation-template.md](sales-ops/quotation-template.md) | 报价单 | 对外正式报价 |
| [followup-template.md](sales-ops/followup-template.md) | 模板 | 阶段跟进邮件/微信 |
| [renewal-template.md](sales-ops/renewal-template.md) | 模板 | 续约/QBR/转介绍 |
| [weekly-sales-dashboard.md](sales-ops/weekly-sales-dashboard.md) | 仪表盘 | 每周五指标 |

---

## 2. 与漏斗阶段映射

| 漏斗阶段 | 主要资产 |
|----------|----------|
| Lead / MQL | lead-list-template · outreach-email · wechat |
| SQL | demo-checklist · followup（Demo） |
| Proposal | proposal-checklist · quotation-template |
| Pilot | pilot-agreement-template |
| Closed Won | crm-template（Stage 更新）· followup（Kickoff） |
| Renewal | renewal-template |
| 全阶段 | weekly-sales-dashboard |

---

## 3. 字段关系

```
lead-list-template.csv  ──导入/晋升──►  crm-template.csv
                                              │
quotation-template.md ◄── Proposal 阶段 ──────┤
pilot-agreement-template.md ◄── Pilot ────────┤
weekly-sales-dashboard.md ◄── 每周汇总 ──────┘
```

---

## 4. 角色

| 角色 | 常用资产 |
|------|----------|
| 创始人 | 全包 + dashboard |
| BD | lead-list + outreach + wechat |
| 财务 | quotation 付款条款、crm ARR |
| 交付 | demo-checklist 交付部分、pilot 验收 |

---

## 5. 版本与维护

| 项 | 值 |
|----|-----|
| 创建 | V9.0-A5 |
| 调价时更新 | quotation-template.md |
| 漏斗变更时更新 | crm-template.csv 表头说明（crm-playbook） |

---

## 6. 快速开始（第 1 周）

- [ ] 复制 `crm-template.csv` → `crm-2026.csv`
- [ ] 用 `lead-list-template.csv` 录入首批 25 条
- [ ] 从 `outreach-email-template.md` 发邮件 A
- [ ] 周五填写 `weekly-sales-dashboard.md` Week 1
