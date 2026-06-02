# Contract Stage · 合同与成交阶段

**漏斗阶段：** `Proposal` / `Pilot` → **`Closed Won`** · **`Closed Lost`**

| 属性 | 说明 |
|------|------|
| CRM 文件 | contract-stage.md |
| 版本 | V9.0-A4 |
| 负责人 | 创始人 + 财务 |
| 映射 V8.2 | `commercial-negotiation` → `won` / `lost` |
| 上游 | sales-kit/pricing-sheet · V8.8 Billing |

---

## 1. 阶段定义

本文件覆盖 **合同签署、对公收款、发票、首付确认** 直至商机标记为 **Closed Won** 或 **Closed Lost**。  

在 CRM 中：

- 谈判后期仍可能显示 `Proposal` 或 `Pilot`
- **首付到账当日** 将商机置为 **`Closed Won`**
- 丢单当日置为 **`Closed Lost`**

---

## 2. Closed Won 进入标准

- [ ] 正式合同双方签署（电子签/盖章扫描）
- [ ] 合同含：SKU、金额、付款计划、交付范围、修订轮次、保密
- [ ] **首付到账**（或全款到账，视条款）
- [ ] 发票状态：`issued` → `paid`（V8.8 口径）
- [ ] `closed_won_date` · `contract_id` · `actual_amount` 已填

---

## 3. Closed Lost 进入标准

- [ ] 客户书面/邮件明确拒绝，或 **报价过期 + 30 天** 无回复
- [ ] `loss_reason` **必填**（见 §8）
- [ ] `closed_lost_date` 已填
- [ ] 无未结清试点纠纷（若有，先结案）

---

## 4. 合同包清单

| 文档 | 用途 |
|------|------|
| 主订阅合同 | 年费 + 权益 |
| 项目包 SOW | Kickstart / Tender Ready / Multi-Site |
| 定金协议 | 可抵扣（若曾收 L1） |
| 试点附录 | 折扣仅首期、案例授权 |
| 发票信息表 | 税号、开户行 |

---

## 5. 付款里程碑（默认）

| 节点 | 比例 | 触发 |
|------|------|------|
| 首付 | 50% | 合同签署后 **5 工作日** |
| 尾款 | 50% | Proposal Delivered + 客户验收 |
| 年费续费 | 100% | 到期前 **30 天** 账单 |

**收入阶梯：**

| 到账累计 | 阶梯 |
|----------|------|
| ≥¥1,000 | L1 |
| ≥¥10,000 | L2 |
| ≥¥100,000 | L3 |

---

## 6. 关键活动（Closed Won 路径）

| # | 活动 | 负责 |
|---|------|------|
| 1 | 发送合同草案 | 创始人 |
| 2 | 法务/客户审阅 | 双方 |
| 3 | 签署 | 双方 |
| 4 | 开付款通知 + 发票 | 财务 |
| 5 | 确认首付到账 | 财务 → CRM |
| 6 | Kickoff 会议 | 创始人+交付 |
| 7 | CRM → **Closed Won** | 创始人 |
| 8 | 创建 Renewal 任务 | 见 renewal-stage |

### 6.1 交付对齐（V8.5）

| 里程碑 | 说明 |
|--------|------|
| Initiated | Kickoff 完成 |
| Proposal Delivered | Plan + Budget + PDF (+ Tender) |
| Completed | 验收 + 尾款 |

---

## 7. 必录 CRM 字段

### Closed Won

| 字段 | 说明 |
|------|------|
| `stage` | Closed Won |
| `closed_won_date` | |
| `contract_id` | |
| `actual_amount` | 首年 ACV 或项目包金额 |
| `sku` | |
| `payment_received` | 首付金额 |
| `invoice_status` | paid |
| `delivery_stage` | Initiated |
| `renewal_date` | 合同结束日 |

### Closed Lost

| 字段 | 说明 |
|------|------|
| `stage` | Closed Lost |
| `closed_lost_date` | |
| `loss_reason` | 枚举 |
| `competitor` | 若已知 |
| `re_engage_date` | 可选（6–12 月后再触达） |

---

## 8. 丢单原因枚举

| 代码 | 说明 |
|------|------|
| `price` | 价格/预算 |
| `competitor-design` | 设计公司 |
| `competitor-vendor` | 设备商打包 |
| `competitor-other` | 其他竞品 |
| `no-budget` | 预算冻结/取消 |
| `no-timeline` | 无时间表 |
| `no-authority` | 无法触达决策人 |
| `diy-excel` | 内部 Excel 凑合 |
| `ghosting` | 失联 |
| `pilot-failed` | 试点未达标 |
| `other` | 备注说明 |

---

## 9. 阶段指标

| 指标 | 90 天目标 |
|------|-----------|
| Closed Won 数 | ≥3 |
| 平均 Proposal→Won 天数 | 30–45（Starter） |
| 首付准时率 | ≥80% |
| L2 达成 | W8 至少 1 单 |

---

## 10. 检查清单

**Closed Won 当日**

- [ ] 合同归档
- [ ] 首付核对银行流水
- [ ] 发票已开
- [ ] Kickoff 已约（5 工作日内）
- [ ] `stage` = Closed Won
- [ ] Renewal 日历：结束日 -90 / -60 / -30

**Closed Lost 当日**

- [ ] loss_reason 已填
- [ ] 停止主动推销（除非 re_engage_date）
- [ ] 教训记入周报（1 行）

---

## 11. 关联文档

- [renewal-stage.md](renewal-stage.md)  
- first-revenue-plan.md  
- pilot-customer-plan.md（#1/#3/#10）
