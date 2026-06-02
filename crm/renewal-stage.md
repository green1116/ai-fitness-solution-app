# Renewal Stage · 续约与扩展阶段

**漏斗阶段：** `Closed Won` 之后 · 客户生命周期

| 属性 | 说明 |
|------|------|
| CRM 文件 | renewal-stage.md |
| 版本 | V9.0-A4 |
| 负责人 | 创始人 + 客户成功 |
| 映射平台 | V8.6 Success · V8.9 Expansion |
| 上游 | sales-kit/ · first-revenue-plan.md |

---

## 1. 阶段定义

**Renewal** 不是售前漏斗的活跃阶段，而是 **Closed Won 客户** 的 **续约、扩展与转介绍** 管理阶段。

| 子流程 | 说明 |
|--------|------|
| **Onboarding / Adoption** | 首年采用与交付完成 |
| **QBR** | 季度业务回顾 |
| **Renewal** | 合同到期续约 |
| **Expansion** | 席位/工作区/SKU 升级 |
| **Referral** | 转介绍新商机 → 回到 `Lead` |

---

## 2. 进入标准

- [ ] 商机已为 **Closed Won**
- [ ] 至少完成 **Initiated** 交付里程碑
- [ ] `renewal_date`（合同结束日）已录入
- [ ] 客户健康度基线已建立

---

## 3. 续约时间线（默认）

| 距到期 | 动作 |
|--------|------|
| **-90 天** | 内部续约评估：健康度、用量、欠款 |
| **-60 天** | 客户 QBR 或续约意向沟通 |
| **-30 天** | 发出续费账单/合同 |
| **-7 天** | 升级提醒；逾期则权益只读（按合同） |
| **到期日** | 续约 Won 或 Churn |

---

## 4. 客户健康度（简版）

| 信号 | 绿 | 黄 | 红 |
|------|----|----|-----|
| 登录/生成（30 天） | 活跃 | 下降 | 无 |
| 支持工单 | 无阻塞 | 有未关 | 严重 |
| CSAT | ≥4 | 3–4 | <3 |
| 付款 | 准时 | 延迟<15天 | 拖欠 |
| 续约意向 | ≥8/10 | 5–7 | <5 |

**红 → 黄规则：** 创始人 48h 内介入；考虑 Executive call。

---

## 5. 关键活动

| # | 活动 | 频率 |
|---|------|------|
| 1 | 交付 Completed + CSAT | 首项目 |
| 2 | 采用率检查 | 月 |
| 3 | QBR | 季（Professional+） |
| 4 | 续约报价 | -30 天 |
| 5 | 扩展商机识别 | 持续 |
| 6 | 转介绍请求 | Completed 后 7 天 |
| 7 | 案例发布（若授权） | 按需 |

### 5.1 QBR 议程（30 分钟）

1. 用量回顾（Plan/Budget/PDF）  
2. 满意度与阻塞  
3. 下季度项目计划  
4. **续约/升级** 方案  
5. 转介绍请求  

---

## 6. 续约定价原则

| 情况 | 原则 |
|------|------|
| 试点价到期 | 恢复 **标准价** 或协商（见 pilot-program） |
| 健康绿 | 标准价；可选多年预付折扣 ≤10% |
| 健康黄 | 标准价 + 成功计划（培训/加赠次数） |
| 健康红 | 挽留折扣需审批；或和平 Churn |
| 扩展 | 工作区/席位/Tender 增量单独立项 |

---

## 7. 必录 CRM 字段

| 字段 | 说明 |
|------|------|
| `account_status` | Active / At-Risk / Churned |
| `renewal_date` | 合同结束 |
| `renewal_amount` | 下年 ACV |
| `renewal_stage` | OK / In-Negotiation / At-Risk / Churned |
| `health_score` | Green / Yellow / Red |
| `renewal_intent` | 1–10 |
| `expansion_opp` | 金额（可选） |
| `referral_leads` | 转介绍 opp_id 列表 |

---

## 8. 续约结果

| 结果 | CRM 处理 |
|------|----------|
| **Renewed Won** | 新合同+到账；`renewal_date` 顺延 |
| **Expanded** | 升级 SKU；新建 expansion 金额 |
| **Churned** | `account_status`=Churned；记录原因 |
| **Referral** | 新建 Lead，来源=Referral |

---

## 9. 阶段指标

| 指标 | MVP 目标 |
|------|----------|
| 首年续约率 | ≥70%（第 2 年起统计） |
| #1 续约意向（W13） | ≥8/10 |
| 转介绍线索/客户 | ≥1 |
| 扩展收入占比 | 跟踪即可 |

---

## 10. 与收入阶梯

| 事件 | 影响 |
|------|------|
| 续约到账 | MRR/ARR 续计 |
| 扩展 | ARR 上调 → 逼近 L3/L4 |
| Churn | ARR 扣减；复盘写入周报 |

---

## 11. 检查清单（续约 -30 天）

- [ ] 健康度已评
- [ ] 续费报价已发
- [ ] 采用率报告已备
- [ ] 阻塞项已清零或书面延期
- [ ] 会议已约

---

## 12. 关联文档

- crm/contract-stage.md  
- sales-kit/pilot-program.md（试点价仅首期）  
- pilot-customer-plan.md（转介绍）  
- 90-day-commercial-execution-roadmap W13 QBR
