# Proposal Stage · 报价阶段

**漏斗阶段：** `Proposal`

| 属性 | 说明 |
|------|------|
| CRM 文件 | proposal-stage.md |
| 版本 | V9.0-A4 |
| 负责人 | 创始人（财务 C） |
| 映射 V8.2 | `proposal-generated` · `commercial-negotiation` |

---

## 1. 阶段定义

**Proposal** = 已向客户发出 **正式报价单**（含 SKU/项目包/有效期），处于 **商业谈判、折扣审批、合同审阅** 阶段，尚未签署试点或主合同。

---

## 2. 进入标准

- [ ] 需求确认表已归档（来自 SQL）
- [ ] 《报价单 v1》已发送（邮件可追踪）
- [ ] 报价有效期 **14 天** 已注明
- [ ] `amount` 更新为报价金额
- [ ] `proposal_sent_date` 已记录

---

## 3. 退出标准

| 目标阶段 | 条件 |
|----------|------|
| **Pilot** | 签署 Trial / Discount Pilot / Case Study 协议 |
| **Closed Won** | 主合同签署 + **首付到账**（无试点） |
| **Closed Lost** | 丢单、选竞品、超期未批、预算冻结 |
| **SQL** | 报价重大变更需重新 Demo/需求确认（少见） |

---

## 4. 报价包组成（Must Send）

| 文档 | 来源 |
|------|------|
| 报价单 | sales-kit/pricing-sheet.md |
| SOW（项目包时） | Kickstart / Tender Ready 范围 |
| 定金说明（可选） | ¥1,000–5,000 可抵扣 |
| 试点条款（若适用） | sales-kit/pilot-program.md |

---

## 5. 关键活动

| # | 活动 | 说明 |
|---|------|------|
| 1 | 发出报价 | 邮件 + PDF；CRM 记 `proposal_sent_date` |
| 2 | 报价跟进 | D+3 / D+7 / 到期前 D-2 |
| 3 | 折扣审批 | Starter ≤5 折 · Pro ≤7 折；超上限创始人批 |
| 4 | 法务/合同草案 | contract-stage 预备 |
| 5 | 定金收取 | 冲刺 L1（¥1,000+） |
| 6 | 竞争应对 | competitive-positioning.md |

### 5.1 跟进节奏

| 日 | 动作 |
|----|------|
| D+0 | 发报价 + 确认收到 |
| D+3 | 答疑 call / 微信 |
| D+7 | 案例或 ROI 补充 |
| D+12 | 到期提醒 + CTA 定金或 Pilot |
| 过期 | 延期 7 天或 Closed Lost |

---

## 6. 必录 CRM 字段

| 字段 | 说明 |
|------|------|
| `stage` | Proposal |
| `proposal_version` | v1, v2… |
| `proposal_sent_date` | |
| `proposal_expiry_date` | +14 天 |
| `quoted_amount` | 含税/未税注明 |
| `discount_pct` | 试点折扣 % |
| `sku` + `package` | 如 Starter + Kickstart |
| `competitor` | 若在比选 |
| `next_action` | |

---

## 7. 谈判底线（MVP）

| 项 | 底线 |
|----|------|
| Starter 试点折扣 | ≤50% |
| Professional 试点折扣 | ≤30% |
| Kickstart 最低价 | ≥¥18,000 标价下浮需备注原因 |
| 修订轮次 | Kickstart 默认 2 轮 |
| 付款 | 首付 50% 启动 |

---

## 8. 阶段指标

| 指标 | 90 天目标 |
|------|-----------|
| 发出报价数 | ≥6 |
| Proposal→Pilot/Won | ≥30% |
| 平均报价周期 | ≤45 天 |
| 定金转化（L1） | ≥2 笔 |

---

## 9. 检查清单

**→ Pilot**

- [ ] 试点模式选定（Free/Discount/Case Study）
- [ ] 试点合同 + 案例授权条款
- [ ] `stage` → **Pilot**

**→ Closed Won（直签）**

- [ ] 主合同签署
- [ ] 首付到账
- [ ] 转 [contract-stage.md](contract-stage.md)

**→ Closed Lost**

- [ ] `loss_reason` 必填
- [ ] `stage` → **Closed Lost**

---

## 10. 常见丢单原因

`价格` · `选设计公司` · `设备商打包` · `预算冻结` · `无决策人` · `内部工具` · `超期无回复`

---

## 11. 关联文档

- [contract-stage.md](contract-stage.md)  
- [pilot-stage.md](pilot-stage.md)  
- first-revenue-plan.md（L1/L2）
