# Pilot Stage · 试点阶段

**漏斗阶段：** `Pilot`

| 属性 | 说明 |
|------|------|
| CRM 文件 | pilot-stage.md |
| 版本 | V9.0-A4 |
| 负责人 | 创始人 + 产品/交付 |
| 映射 V8.2 | `trial-started` · `evaluation` |
| 上游 | pilot-customer-plan.md · sales-kit/pilot-program.md |

---

## 1. 阶段定义

**Pilot** = 客户已进入 **14 天 Free Trial** 或 **付费 Discount / Joint Case Study 试点**，产品权益已开通，按试点协议执行 **使用、交付与转正式** 谈判。

**注意：** 漏斗标签为 `Pilot`；与「Pilot Program 三种模式」一一对应，在 CRM 用 `pilot_type` 区分。

---

## 2. 试点类型

| 类型 | `pilot_type` | 收费 | 周期 | 典型 |
|------|--------------|------|------|------|
| Free Trial | `free-trial` | 否 | 14 天 | 预算未批 |
| Discount Pilot | `discount` | 是 | 3 个月 | **第 1 家** |
| Joint Case Study | `case-study` | 是 | 6 个月 | **第 3 家 Pro** |

---

## 3. 进入标准

- [ ] 试点协议或 Trial 条款已签署（邮件确认最低标准）
- [ ] `pilot_start_date` / `pilot_end_date` 已填
- [ ] Trial：工作区已开通（对齐 V8.4 权益上限）
- [ ] Discount/Case：首付或定金已到账（建议）
- [ ] `stage` → **Pilot**

---

## 4. 退出标准

| 目标阶段 | 条件 |
|----------|------|
| **Closed Won** | 转正式订阅/项目包；**合同 + 首付**到账 |
| **Closed Lost** | 试点结束不转；满意度不达标；违约 |
| **Proposal** | 试点中止改直签谈判（重新报价） |

---

## 5. 关键活动（按时间线）

### Free Trial（14 天）

| 日 | 活动 |
|----|------|
| D0 | 开通 Trial + 发送指南 |
| D7 | Check-in：usage 回顾 |
| D7 | 发 Commercial 报价预览 |
| D14 | 到期；升正式或锁定只读 |

### Discount Pilot（3 个月）

| 里程碑 | 活动 |
|--------|------|
| Kickoff | V8.5 Initiated |
| W2–3 | Plan + Budget + PDF 交付 |
| 验收 | Completed + CSAT |
| 试点末 | 续约谈判（标准价） |

### Joint Case Study（6 个月）

| 里程碑 | 活动 |
|--------|------|
| 交付 | Tender（如适用） |
| D+45 | 案例访谈 |
| 发布 | 联合案例（官网/公众号） |

---

## 6. 试点成功标准（内部）

| 指标 | Free | Discount | Case Study |
|------|------|----------|------------|
| Plan 生成 | ≥3 | ≥5 | ≥8 |
| PDF 导出 | ≥2 | ≥5 | ≥8 |
| CSAT | ≥3.5 | ≥4.0 | ≥4.0 |
| 续费意向（末） | — | ≥7/10 | ≥8/10 |
| 转介绍 | 记录 | ≥1 | ≥2 |

---

## 7. 必录 CRM 字段

| 字段 | 说明 |
|------|------|
| `stage` | Pilot |
| `pilot_type` | free-trial / discount / case-study |
| `pilot_start_date` | |
| `pilot_end_date` | |
| `trial_workspace_id` | 若适用 |
| `usage_plan_count` | 每周更新 |
| `usage_pdf_count` | |
| `renewal_intent_score` | 1–10 |
| `case_study_rights` | 匿名/署名 |

---

## 8. SLA

| 规则 | 时限 |
|------|------|
| Trial 开通 | 申请通过后 **1 工作日** |
| Discount Kickoff | 首付后 **5 工作日** |
| 试点到期前商务触达 | **-14 天**、**-7 天** |
| 试点结束未转 | **+7 天** 内定 Won/Lost |

---

## 9. 阶段指标

| 指标 | 90 天目标 |
|------|-----------|
| 活跃 Pilot 数 | Trial≥6；Discount≥1 |
| Pilot→Closed Won | ≥50%（Discount） |
| 试点交付 Completed | #1 在 W9 |

---

## 10. 检查清单（→ Closed Won）

- [ ] 正式合同签署
- [ ] 首付/年费到账（发票 paid）
- [ ] 交付里程碑 Initiated（若新项目包）
- [ ] `stage` → **Closed Won** → [contract-stage.md](contract-stage.md)
- [ ] 设置 Renewal 提醒（合同结束 -90 天）

---

## 11. 关联文档

- sales-kit/pilot-program.md  
- crm/contract-stage.md  
- crm/renewal-stage.md
