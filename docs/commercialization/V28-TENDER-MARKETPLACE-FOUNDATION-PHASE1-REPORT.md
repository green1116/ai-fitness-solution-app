# V28 Tender Marketplace Foundation — Phase 1 Report

**Version:** `v28-tender-marketplace-1`  
**Tag:** `v28-tender-marketplace`  
**Status:** Phase 1 Complete  
**Predecessor:** V27 Supplier Portal Foundation (`v27-supplier-portal-4`)  
**Route:** Industry Tender Platform — Tender Marketplace Track  
**Generated:** 2026-06-13

## Executive Summary

V28 Phase 1 在 V26 Brand Portal 与 V27 Supplier Portal 冻结层之上，正式建立 **Tender Marketplace 数据层**（`lib/tender-marketplace/`）。提供招标、需求、评标与商机档案，兼容 V20–V25 全链路。**未修改** V20–V27，**未新增** Runtime/Dashboard/登录系统。

---

## Created Files

| Path | Purpose |
|------|---------|
| `lib/tender-marketplace/shared/types.ts` | 四类 Profile 类型、Validation/Report 类型、版本常量 |
| `lib/tender-marketplace/tender-profile/data.ts` | 10 条招标档案（含 V25 知识层 5 条核心 tender） |
| `lib/tender-marketplace/tender-profile/index.ts` | Tender profile barrel export |
| `lib/tender-marketplace/requirement-profile/data.ts` | 20 条需求档案（每 tender 2 条） |
| `lib/tender-marketplace/requirement-profile/index.ts` | Requirement profile barrel export |
| `lib/tender-marketplace/evaluation-profile/data.ts` | 10 条评标权重档案 |
| `lib/tender-marketplace/evaluation-profile/index.ts` | Evaluation profile barrel export |
| `lib/tender-marketplace/opportunity-profile/data.ts` | 10 条商机档案 |
| `lib/tender-marketplace/opportunity-profile/index.ts` | Opportunity profile barrel export |
| `lib/tender-marketplace/validation/validators.ts` | `validateTenderMarketplace()` |
| `lib/tender-marketplace/validation/index.ts` | Validation barrel export |
| `lib/tender-marketplace/report/builders.ts` | `buildTenderMarketplaceReport()` |
| `lib/tender-marketplace/report/index.ts` | Report barrel export |
| `lib/tender-marketplace/index.ts` | 统一公共 API |

---

## Data Models

### `TenderProfile`

| Field | Type | Description |
|-------|------|-------------|
| `tenderId` | string | 唯一招标 ID（对齐 V25 HistoricalTender） |
| `title` | string | 招标标题 |
| `city` | string | 城市 |
| `industry` | ProjectType | 行业类型 |
| `budget` | number | 预算（CNY） |
| `publishDate` | string | 发布日期 |
| `deadline` | string | 截止日期 |
| `status` | `open` · `closed` · `awarded` · `archived` · `draft` | 招标状态 |
| `mode` | `"tender-marketplace"` | 数据层标识 |

### `RequirementProfile`

| Field | Type | Description |
|-------|------|-------------|
| `tenderId` | string | 关联招标 |
| `requirementType` | `equipment` · `service` · `installation` · `maintenance` | 需求类型 |
| `equipmentCategory` | string | 设备/服务类别 |
| `quantity` | number | 数量 |
| `technicalRequirement` | string | 技术要求（含 V22 SKU 引用） |
| `mandatory` | boolean | 是否 mandatory |

### `EvaluationProfile`

| Field | Type | Description |
|-------|------|-------------|
| `tenderId` | string | 关联招标 |
| `priceWeight` | number | 价格权重 |
| `technicalWeight` | number | 技术权重 |
| `serviceWeight` | number | 服务权重 |
| `deliveryWeight` | number | 交付权重 |
| `brandWeight` | number | 品牌权重（合计 100） |

### `OpportunityProfile`

| Field | Type | Description |
|-------|------|-------------|
| `tenderId` | string | 关联招标 |
| `estimatedValue` | number | 预估商机价值 |
| `competitionLevel` | `low` · `medium` · `high` | 竞争强度 |
| `targetBrands` | string[] | 目标品牌（对齐 V20） |
| `targetSuppliers` | string[] | 目标供应商（对齐 V21） |
| `status` | `active` · `closed` · `awarded` | 商机状态 |

---

## Compatibility

| Layer | Check | Result |
|-------|-------|--------|
| V20 Catalog | 全部 `targetBrands` 在 V20 brand catalog 中存在 | ✅ |
| V21 Supplier | V21 冻结 network + `data/suppliers` 供应商均可映射 | ✅ |
| V22 Procurement | V22 channel pricing 全部 SKU 在 requirements 中引用 | ✅ |
| V23 Proposal | Canonical tender 可构建有效 Bid Commercial Bundle | ✅ |
| V24 Intelligence | Canonical query Proposal Intelligence 验证通过 | ✅ |
| V25 Knowledge | V25 HistoricalTender 5 条 ID 均为 marketplace 子集 | ✅ |

**Canonical Query:** `tender-sh-commercial-gym-2025-001`

---

## Validation Results

`validateTenderMarketplace()` 执行结果：

| Check | Result |
|-------|--------|
| `tenderExists` | ✅ true（10 条） |
| `requirementsExist` | ✅ true（20 条） |
| `evaluationExists` | ✅ true（10 条，权重合计 100） |
| `opportunityExists` | ✅ true（10 条） |
| `v20CatalogCompatible` | ✅ true |
| `v21SupplierCompatible` | ✅ true |
| `v22ProcurementCompatible` | ✅ true |
| `v23ProposalCompatible` | ✅ true |
| `v24IntelligenceCompatible` | ✅ true |
| `v25KnowledgeCompatible` | ✅ true |
| **`valid`** | **✅ true** |

---

## Report Results

`buildTenderMarketplaceReport()` 输出：

| Metric | Value |
|--------|-------|
| `tenderCount` | 10 |
| `requirementCount` | 20 |
| `evaluationCount` | 10 |
| `opportunityCount` | 10 |
| `validation.valid` | true |
| `version` | `v28-tender-marketplace-1` |

**Summary:**  
`tender-marketplace-report tenders=10 requirements=20 evaluations=10 opportunities=10 valid=true v20Compatible=true v21Compatible=true v22Compatible=true v23Compatible=true v24Compatible=true v25Compatible=true canonical=tender-sh-commercial-gym-2025-001`

---

## Build Verification

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | ✅ PASS |
| `npm run build` | ✅ PASS |

---

## Phase 2 Preview — Tender Self-Service Publishing

Phase 2 将在 Phase 1 数据层之上，参照 V26 Brand Portal / V27 Supplier Portal `onboarding/` 模式，实现 **Tender Self-Service Publishing**，使招标方自行发布与维护招标信息。

### 目标能力

招标方可提交并维护：

- **Tender** — 标题、城市、行业、预算、发布/截止日期
- **Requirements** — 设备/服务/安装/维护需求清单
- **Evaluation** — 价格/技术/服务/交付/品牌权重
- **Opportunity** — 预估价值、竞争强度、目标品牌/供应商

### 建议目录结构

```
lib/tender-marketplace/onboarding/
  intake/          # buildTenderPublishingIntake(tenderId)
  workflow/        # draft → submitted → review → approved → published
  approval/        # buildTenderPublishingApprovalGate()
  validation/      # validateTenderPublishingSubmission()
  report/          # buildTenderPublishingReport()
  submissions/     # 样例发布与完整 workflow 验证
```

### 状态机（对齐 V26/V27）

```
draft → submitted → review → approved → published
                  ↘ rejected → draft
```

### 与现有层集成

| 层 | Phase 2 集成点 |
|----|----------------|
| V20 | 已发布 requirements 引用 V20 SKU/品牌 |
| V21/V27 | 已发布 opportunity 目标供应商同步 supplier portal |
| V22 | 已发布 tender 定价需求对齐 procurement channel |
| V23/V24 | 已发布 tender 可触发 bid/proposal intelligence 分析 |
| V25 | 已发布 tender 归档为 knowledge 候选 |
| Phase 1 profiles | `published` 状态覆盖静态 `data.ts` 默认值 |

### 验证场景（Phase 2 完成标准）

- `tender-sh-commercial-gym-2025-001` 完整 workflow：提交 tender/requirements/evaluation/opportunity → 审核通过 → published
- 至少 1 条 rejected → draft 重提路径
- Phase 1 validation + Phase 2 publishing validation 联合 `valid: true`
- `npx tsc --noEmit` + `npm run build` PASS

### 约束（延续 Phase 1）

- 不修改 V20–V27 冻结层
- 不新增 Runtime / Dashboard / 登录系统
- 仅扩展 `lib/tender-marketplace/` 数据与 publishing 层

---

## Public API

```typescript
import {
  validateTenderMarketplace,
  buildTenderMarketplaceReport,
  getAllTenderProfiles,
  getAllRequirementProfiles,
  getAllEvaluationProfiles,
  getAllOpportunityProfiles,
  CANONICAL_TENDER_MARKETPLACE_QUERY,
  TENDER_MARKETPLACE_VERSION,
} from "@/lib/tender-marketplace";
```

---

**Next Step:** V28 Phase 2 — Tender Self-Service Publishing
