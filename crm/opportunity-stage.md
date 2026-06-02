# Opportunity Stage · 商机阶段（SQL）

**漏斗阶段：** `SQL`

| 属性 | 说明 |
|------|------|
| CRM 文件 | opportunity-stage.md |
| 版本 | V9.0-A4 |
| 负责人 | 创始人 |
| 映射 V8.2 | `demo-requested` · `evaluation` |

---

## 1. 阶段定义

**SQL（Sales Qualified Lead）** = 销售合格商机：已通过 **SQL 打分 ≥7** 或 **完成 15 分钟 Demo**，具备进入 **报价/试点** 的明确意向与决策路径。

本文件覆盖从 **Demo 预约 → Demo 完成 → 需求确认** 的全过程，直至发出正式报价（转入 [proposal-stage.md](proposal-stage.md)）。

---

## 2. 进入标准

- [ ] SQL 分 **≥7**（见 lead-generation-plan）
- [ ] 或：Demo 已 **排期/完成**
- [ ] 商机 `opp_id` 已创建
- [ ] 预估 `sku` 与 `amount`（ACV 粗算）已填

---

## 3. 退出标准

| 目标阶段 | 条件 |
|----------|------|
| **Proposal** | 《需求确认表》归档 + **正式报价单**已发出 |
| **Pilot** | 跳过正式报价、直接签 **Trial/Discount Pilot**（少见，需审批备注） |
| **Closed Lost** | Demo 后明确不买；竞品中标；预算取消 |
| **MQL** | 误判 SQL；Demo 爽约 2 次且无法重约 |

---

## 4. 子状态（建议在 CRM 用标签）

| 子状态 | 说明 |
|--------|------|
| `SQL-Demo-Scheduled` | Demo 已约未开 |
| `SQL-Demo-Done` | Demo 已完成 |
| `SQL-Needs-Confirmed` | 需求确认中 |
| `SQL-Ready-for-Quote` | 可发报价 |

---

## 5. 关键活动

| # | 活动 | 交付物 | 参考 |
|---|------|--------|------|
| 1 | 发送 Demo 邀约 | 日历邀请 | lead-generation-plan §7.4 |
| 2 | 执行 15 分钟 Demo | 现场 PDF / 录屏 | sales-kit/demo-script.md |
| 3 | Demo 后 24h 跟进 | 邮件 + PDF 摘要 | lead-generation-plan |
| 4 | 填写需求确认表 | BANT 简表 | 见下表 |
| 5 | ROI 初算（可选） | ROI 表 | sales-kit/roi-calculator.md |
| 6 | 判断 Trial vs 直报价 | 路径决策 | pilot-stage / proposal-stage |

### 5.1 需求确认表（最小字段）

| 字段 | 内容 |
|------|------|
| 人数 | |
| 面积（㎡） | |
| 预算区间（CNY） | |
| 时间表 | |
| 决策人 | |
| 招采是否介入 | 是/否 |
| 竞品 | 设计公司/设备商/无 |

---

## 6. 必录 CRM 字段

| 字段 | 必填 |
|------|------|
| `stage` | SQL |
| `sql_score` | ≥7 |
| `demo_date` | 完成则填 |
| `sku` | Starter/Pro/Ent |
| `amount` | 预估 ACV |
| `close_date` | 预计签约 |
| `next_action` | |
| `pilot_path` | Trial / Discount / Direct / 待定 |

---

## 7. SLA

| 规则 | 时限 |
|------|------|
| Demo 后首次跟进 | **24h** |
| Demo → 需求确认 | **7 天** |
| 需求确认 → 报价发出 | **5 个工作日** |
| SQL 停留预警 | **30 天** 未进 Proposal → 复盘 |

---

## 8. 阶段指标

| 指标 | 90 天目标 |
|------|-----------|
| 累计 SQL | ≥20 |
| Demo 完成数 | ≥12 |
| SQL→Proposal | ≥50% |
| 平均 Demo→报价天数 | ≤14 天 |

---

## 9. 路径决策树

```
Demo 完成
    ├─ 预算已批、愿付定金 → Proposal（或 Pilot Discount 并行）
    ├─ 预算未批、SQL高 → Pilot（14 天 Trial）
    └─ 仅调研、无时间表 → 降 MQL 或 Lost
```

---

## 10. 检查清单（进入 Proposal）

- [ ] 需求确认表已归档
- [ ] 报价 SKU/项目包已选定
- [ ] 报价单 PDF 已生成（sales-kit/pricing-sheet）
- [ ] `stage` → **Proposal**

---

## 11. 关联文档

- [proposal-stage.md](proposal-stage.md)  
- [pilot-stage.md](pilot-stage.md)  
- website/contact-page.md（Demo 表单来源）
