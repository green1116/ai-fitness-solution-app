# V28 Tender Marketplace Foundation — Phase 2 Report

**Version:** `v28-tender-marketplace-2`  
**Tag:** `v28-tender-marketplace`  
**Status:** Phase 2 Complete  
**Predecessor:** V28 Phase 1 (`v28-tender-marketplace-1`)  
**Generated:** 2026-06-13

## Executive Summary

V28 Phase 2 在 Phase 1 招标市场数据层之上，完成 **Tender Self-Service Publishing** 工作流层建设。提供招标发布资料收集、状态机流转、审批门禁与统计报告。**未修改** V20–V27，**未新增** Runtime/Dashboard/登录系统。

---

## Created Files

| Path | Purpose |
|------|---------|
| `lib/tender-marketplace/shared/types.ts` | Phase 2 类型扩展（TenderSubmission / Workflow / Approval / Report） |
| `lib/tender-marketplace/onboarding/intake/builders.ts` | `buildTenderPublishingIntake()` |
| `lib/tender-marketplace/onboarding/workflow/builders.ts` | `buildTenderPublishingWorkflow()` |
| `lib/tender-marketplace/onboarding/approval/builders.ts` | `buildTenderApprovalGate()` |
| `lib/tender-marketplace/onboarding/validation/validators.ts` | `validateTenderSubmission()` |
| `lib/tender-marketplace/onboarding/report/builders.ts` | `buildTenderPublishingReport()` |
| `lib/tender-marketplace/onboarding/submissions/data.ts` | 8 条样例发布提交 |
| `lib/tender-marketplace/onboarding/index.ts` | Onboarding barrel export |
| `lib/tender-marketplace/index.ts` | 导出 onboarding 模块 |

---

## Workflow Structure

### State Machine

```
draft
  ↓
submitted
  ↓
review
  ↓
approved
  ↓
published
```

**Branch:** `review` → `rejected`（审批未通过）

### `TenderSubmission`

| Field | Type | Description |
|-------|------|-------------|
| `submissionId` | string | 唯一提交 ID |
| `tenderProfile` | TenderProfile | 招标资料 |
| `requirements` | RequirementProfile[] | 需求列表 |
| `evaluation` | EvaluationProfile | 评标权重 |
| `opportunity` | OpportunityProfile | 商机档案 |
| `submittedAt` | string \| null | 提交时间 |
| `status` | TenderPublishingStatus | 当前状态 |
| `mode` | `"tender-marketplace"` | 数据层标识 |

### `buildTenderPublishingIntake()`

从 Phase 1 catalog 只读收集招标发布资料：

```typescript
buildTenderPublishingIntake({ tenderId: "tender-sh-commercial-gym-2025-001" })
  → TenderSubmission (status: draft)
```

**收集逻辑：**

| Profile | 来源 |
|---------|------|
| `tenderProfile` | `getTenderProfileById(tenderId)` |
| `requirements` | `getRequirementProfilesByTenderId(tenderId)` |
| `evaluation` | `getEvaluationProfileByTenderId(tenderId)` |
| `opportunity` | `getOpportunityProfileByTenderId(tenderId)` |

### `buildTenderPublishingWorkflow()`

输出当前状态与步骤完成情况：

**Canonical (Shanghai Commercial Gym):**

| Step | Status |
|------|--------|
| draft | ✓ completed |
| submitted | ✓ completed |
| review | ✓ completed |
| approved | ✓ completed |
| published | ✓ completed |
| nextStatus | null |

---

## Approval Structure

### `buildTenderApprovalGate()`

| Field | Type | Description |
|-------|------|-------------|
| `submissionId` | string | 提交 ID |
| `decision` | `approved` \| `rejected` | 审批结果 |
| `reasons` | string[] | 审批理由 |
| `validatedAt` | string | 校验时间 |

**Canonical 审批结果 (Shanghai Commercial Gym):**

| Decision | **approved** |
|----------|--------------|
| Reasons | Tender profile complete · 2 requirements · Evaluation weights · 3 brands + 3 suppliers |

---

## Validation Results

### `validateTenderSubmission()`

**Canonical:** `publishing-sh-commercial-gym-001`

| Check | Result |
|-------|--------|
| `valid` | **true** |
| `tenderExists` | ✓ |
| `requirementsExist` | ✓ — 2 requirements |
| `evaluationExists` | ✓ — weights sum 100 |
| `opportunityExists` | ✓ — 3 brands + 3 suppliers |

---

## Report Results

### `buildTenderPublishingReport()`

| Metric | Value |
|--------|-------|
| **submissionCount** | **8** |
| **approvedCount** | **1** |
| **rejectedCount** | **1** |
| **publishedCount** | **5** |

### Sample Submissions by Status

| submissionId | Tender | Status |
|--------------|--------|--------|
| `publishing-sh-commercial-gym-001` | Shanghai Commercial Gym | **published** |
| `publishing-bj-hotel-002` | Beijing Hotel | **published** |
| `publishing-gz-campus-004` | Guangzhou Campus | **published** |
| `publishing-sh-enterprise-005` | Shanghai Enterprise | **published** |
| `publishing-cd-community-003` | Chengdu Community | **published** |
| `publishing-sz-fitness-club-006` | Shenzhen Fitness Club | approved |
| `publishing-nj-government-007` | Nanjing Government | submitted |
| `publishing-wh-corporate-008` | Wuhan Corporate | rejected |

---

## Architecture Flow

```
buildTenderPublishingIntake(tenderId)
  ├── TenderProfile (Phase 1)
  ├── RequirementProfile[] (Phase 1)
  ├── EvaluationProfile (Phase 1)
  └── OpportunityProfile (Phase 1)
        ↓
validateTenderSubmission()
        ↓
buildTenderApprovalGate() → approved / rejected
        ↓
buildTenderPublishingWorkflow() → current status + steps
        ↓
buildTenderPublishingReport()
```

---

## Build Verification

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | ✅ PASS |
| `npm run build` | ✅ PASS |

---

## Phase 3 Preview: Tender Marketplace Freeze

Phase 3 将按 V27 Supplier Portal Freeze 模式，冻结 Tender Marketplace 全链路：

```
lib/tender-marketplace/freeze/
  constants.ts          — CANONICAL queries + validation gates
  coverage.ts           — buildTenderMarketplaceCoverageStats()
  validators.ts         — validateTenderMarketplaceFreeze()
                        — validateTenderPublishingWorkflowPath()
  evidence.ts           — buildTenderMarketplaceFreezeEvidence()
  report/builders.ts    — buildTenderMarketplaceFreezeReport()
  index.ts              — 统一 freeze API
```

### Coverage 维度（6 维）

| Domain | Phase |
|--------|-------|
| tenderProfileCoverage | 1 |
| requirementProfileCoverage | 1 |
| evaluationProfileCoverage | 1 |
| opportunityProfileCoverage | 1 |
| publishingCoverage | 2 |
| approvalWorkflowCoverage | 2 |

### Validation Gates（预计 12 gate）

**Phase 1:**

- tender exists
- requirements exist
- evaluation exists
- opportunity exists
- V20–V25 layer compatibility (6 checks folded into gates)

**Phase 2:**

- intake builder
- submission validation
- approval gate
- workflow builder
- publishing report

### Workflow Path 验证

对 V25 核心 tender 执行完整 workflow path 验证：

| Tender | Expected Path |
|--------|---------------|
| `tender-sh-commercial-gym-2025-001` | draft → published, approval **approved** |
| `tender-bj-hotel-2025-002` | draft → published, approval **approved** |
| `tender-gz-campus-2025-004` | draft → published, approval **approved** |
| `tender-cd-community-2025-003` | draft → published, approval **approved** |
| `tender-sh-enterprise-2025-005` | draft → published, approval **approved** |

### Freeze 输出

| Item | Value |
|------|-------|
| Version | `v28-tender-marketplace-4` |
| Tag | `v28-tender-marketplace-foundation` |
| Readiness / Validation / Coverage | **100%** |
| Evidence | canonical Shanghai Commercial Gym publishing **published** |

### Public API（Phase 3 新增）

```typescript
import {
  buildTenderMarketplaceFreezeReport,
  buildTenderMarketplaceFreezeEvidence,
  validateTenderMarketplaceFreeze,
} from "@/lib/tender-marketplace/freeze";
```

---

## Constraints Honored

- ✓ 不修改 V20–V27
- ✓ 不新增 Runtime
- ✓ 不新增 Dashboard
- ✓ 不新增登录系统

---

**Next Step:** V28 Phase 3 — Tender Marketplace Freeze
