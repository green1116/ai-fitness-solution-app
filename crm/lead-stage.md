# Lead Stage · 线索阶段

**漏斗阶段：** `Lead` · `MQL`

| 属性 | 说明 |
|------|------|
| CRM 文件 | lead-stage.md |
| 版本 | V9.0-A4 |
| 负责人 | 创始人 / BD |
| 上游 | [lead-generation-plan.md](../lead-generation-plan.md) |

---

## 1. 阶段定义

| 阶段 | 定义 | 与名单关系 |
|------|------|------------|
| **Lead** | 公司/联系人已入库，**尚未确认**健身区项目需求或 ICP 未验证 | `lead-generation-plan` 名单 L001+ |
| **MQL** | 有 **需求信号**（回复、下载、trigger 事件），但 SQL 分 **5–6**，未达 Demo 门槛 | 培育中线索 |

---

## 2. 进入标准

### Lead

- [ ] 公司名、ICP 分类、至少一种联系方式（邮箱优先）
- [ ] 来源渠道已记录
- [ ] 不在竞品「绝对不符」清单（如纯零售无 B 端场景）

### MQL（从 Lead 晋升）

- [ ] 至少 **1 次** 有效互动（回复邮件、通过微信、参会）
- [ ] 确认存在 **健身区/福利空间/新店/招标** 相关话题
- [ ] SQL 打分 **5–6**（见 [lead-generation-plan §4](../lead-generation-plan.md)）

---

## 3. 退出标准（转出）

| 目标阶段 | 条件 |
|----------|------|
| **SQL** | SQL 分 **≥7**；或已完成 Demo 预约 |
| **Closed Lost** | 明确无需求；ICP 不符；7 次触达无回复且已降级 |
| **Lead**（从 MQL 降级） | 90 天无互动；需求证伪 |

---

## 4. 关键活动

| 活动 | Lead | MQL | 频率 |
|------|------|-----|------|
| 冷邮件 A/B | ✅ | ✅ | 按 [lead-generation-plan](../lead-generation-plan.md) |
| 脉脉 DM | ✅ | ✅ | 同上 |
| 发产品页/案例 | 可选 | ✅ | MQL 必做 1 次 |
| 约 Demo | ❌ | ❌（除非升至 SQL） | — |
| 发报价 | ❌ | ❌ | — |
| SQL 打分更新 | ✅ | ✅ | 每次互动后 |

---

## 5. 必录 CRM 字段

| 字段 | Lead | MQL |
|------|------|-----|
| `stage` | Lead / MQL | |
| `sql_score` | 0–6 | 5–6 |
| `source` | 必填 | |
| `last_touch` | 必填 | |
| `next_action` | 必填 | |
| `trigger` | 建议 | 必填 |

---

## 6. SLA 与节奏

| 规则 | 说明 |
|------|------|
| 首次触达 | Lead 入库后 **3 个工作日** 内发邮件 A |
| 跟进 | 无回复 **3–5 天** 发邮件 B |
| 触达上限 | 同一公司 **7 天内 ≤2 次** |
| MQL 停留预警 | **21 天** 未升 SQL → 复盘或降级 |
| Lead 休眠 | **90 天** 无互动 → Closed Lost 或归档 |

---

## 7. 阶段指标

| 指标 | MVP 目标（W4） |
|------|----------------|
| Lead 池体积 | 100+ P0 |
| MQL 数 | 随触达自然增长 |
| Lead→MQL 转化率 | 10–20%（触达有回复） |
| MQL→SQL 转化率 | ≥40%（培育后） |

---

## 8. 检查清单（晋升 SQL 前）

- [ ] SQL 分 ≥7（或 Demo 已排期）
- [ ] 决策人职位已确认
- [ ] 时间表 ≤6 个月（或已标注例外）
- [ ] 已发 [product-overview](../sales-kit/product-overview.md) 或官网 `/product`
- [ ] 商机 `opp_id` 已创建，阶段改为 **SQL** → 见 [opportunity-stage.md](opportunity-stage.md)

---

## 9. 关联文档

- 模板：lead-generation-plan §7  
- 丢单原因（早期）：`无需求` · `ICP不符` · `无法联系` · `竞品免费方案`
