# V27 Supplier Portal Foundation — Phase 2 Report

**Version:** `v27-supplier-portal-2`  
**Tag:** `v27-supplier-portal`  
**Status:** Phase 2 Complete  
**Predecessor:** V27 Phase 1 (`v27-supplier-portal-1`)  
**Generated:** 2026-06-13

## Executive Summary

V27 Phase 2 在 Phase 1 供应商门户数据层之上，完成 **Supplier Self-Service Onboarding** 工作流层建设。提供入驻资料收集、状态机流转、审批门禁与统计报告。**未修改** V20–V26，**未新增** Runtime/Dashboard/登录系统。

---

## Created Files

| Path | Purpose |
|------|---------|
| `lib/supplier-portal/shared/types.ts` | Phase 2 类型扩展（Submission / Workflow / Approval / Report） |
| `lib/supplier-portal/onboarding/intake/builders.ts` | `buildSupplierOnboardingIntake()` |
| `lib/supplier-portal/onboarding/workflow/builders.ts` | `buildSupplierOnboardingWorkflow()` |
| `lib/supplier-portal/onboarding/approval/builders.ts` | `buildSupplierOnboardingApprovalGate()` |
| `lib/supplier-portal/onboarding/validation/validators.ts` | `validateSupplierOnboardingSubmission()` |
| `lib/supplier-portal/onboarding/report/builders.ts` | `buildSupplierOnboardingReport()` |
| `lib/supplier-portal/onboarding/submissions/data.ts` | 8 条样例入驻提交 |
| `lib/supplier-portal/onboarding/index.ts` | Onboarding barrel export |
| `lib/supplier-portal/index.ts` | 导出 onboarding 模块 |

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

### `SupplierOnboardingSubmission`

| Field | Type | Description |
|-------|------|-------------|
| `submissionId` | string | 唯一提交 ID |
| `supplierProfile` | SupplierProfile | 供应商资料 |
| `inventoryProfiles` | InventoryProfile[] | 库存列表 |
| `pricingProfiles` | PricingProfile[] | 定价列表 |
| `serviceProfiles` | ServiceProfile[] | 服务列表 |
| `coverageProfiles` | CoverageProfile[] | 覆盖列表 |
| `submittedAt` | string \| null | 提交时间 |
| `status` | SupplierOnboardingStatus | 当前状态 |
| `mode` | `"supplier-portal"` | 数据层标识 |

### `buildSupplierOnboardingIntake()`

从 Phase 1 catalog 只读收集供应商入驻资料：

```typescript
buildSupplierOnboardingIntake({ supplierId: "supplier-life-fitness-cn" })
  → SupplierOnboardingSubmission (status: draft)
```

**收集逻辑：**

| Profile | 来源 |
|---------|------|
| `supplierProfile` | `getSupplierProfileById(supplierId)` |
| `inventoryProfiles` | 按 supplier slug 匹配 inventoryId |
| `pricingProfiles` | 按 inventory SKU 关联 pricing |
| `serviceProfiles` | 按 supplier city 匹配 service |
| `coverageProfiles` | 按 supplier city 匹配 coverage |

### `buildSupplierOnboardingWorkflow()`

输出当前状态与步骤完成情况：

**Canonical (Life Fitness CN):**

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

### `buildSupplierOnboardingApprovalGate()`

| Field | Type | Description |
|-------|------|-------------|
| `submissionId` | string | 提交 ID |
| `decision` | `approved` \| `rejected` | 审批结果 |
| `reasons` | string[] | 审批理由 |
| `validatedAt` | string | 校验时间 |

**Canonical 审批结果 (Life Fitness CN):**

| Decision | **approved** |
|----------|--------------|
| Reasons | Supplier profile complete · 3 inventory · 2 pricing · 2 service · 1 coverage |

---

## Validation Results

### `validateSupplierOnboardingSubmission()`

**Canonical:** `onboarding-life-fitness-cn-001`

| Check | Result |
|-------|--------|
| `valid` | **true** |
| `supplierExists` | ✓ |
| `inventoryExists` | ✓ — 3 inventory records |
| `pricingExists` | ✓ — 2 pricing records |
| `serviceExists` | ✓ — 2 service records |
| `coverageExists` | ✓ — 1 coverage record |

---

## Report Results

### `buildSupplierOnboardingReport()`

| Metric | Value |
|--------|-------|
| **submissionCount** | **8** |
| **approvedCount** | **1** |
| **rejectedCount** | **1** |
| **publishedCount** | **5** |

### Sample Submissions by Status

| submissionId | Supplier | Status |
|--------------|----------|--------|
| `onboarding-life-fitness-cn-001` | Life Fitness CN | **published** |
| `onboarding-technogym-cn-001` | Technogym CN | **published** |
| `onboarding-matrix-cn-001` | Matrix CN | **published** |
| `onboarding-shuhua-001` | Shuhua | **published** |
| `onboarding-impulse-cn-001` | Impulse CN | **published** |
| `onboarding-dhz-cn-001` | DHZ CN | approved |
| `onboarding-relax-cn-001` | Relax CN | submitted |
| `onboarding-precor-cn-001` | Precor CN | rejected |

---

## Architecture Flow

```
buildSupplierOnboardingIntake(supplierId)
  ├── SupplierProfile (Phase 1)
  ├── InventoryProfile[] (Phase 1)
  ├── PricingProfile[] (Phase 1)
  ├── ServiceProfile[] (Phase 1)
  └── CoverageProfile[] (Phase 1)
        ↓
validateSupplierOnboardingSubmission()
        ↓
buildSupplierOnboardingApprovalGate() → approved / rejected
        ↓
buildSupplierOnboardingWorkflow() → current status + steps
        ↓
buildSupplierOnboardingReport()
```

---

## Build Verification

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | ✅ PASS |
| `npm run build` | ✅ PASS |

---

## Phase 3 Preview: Supplier Portal Freeze

Phase 3 将按 V26 Brand Portal Freeze 模式，冻结 Supplier Portal 全链路：

```
lib/supplier-portal/freeze/
  constants.ts          — CANONICAL queries + validation gates
  coverage.ts           — buildSupplierPortalCoverageStats()
  validators.ts         — validateSupplierPortalFreeze()
                        — validateSupplierOnboardingWorkflowPath()
  evidence.ts           — buildSupplierPortalFreezeEvidence()
  report/builders.ts    — buildSupplierPortalFreezeReport()
  index.ts              — 统一 freeze API
```

### Coverage 维度（6 维）

| Domain | Phase |
|--------|-------|
| supplierProfileCoverage | 1 |
| inventoryProfileCoverage | 1 |
| pricingProfileCoverage | 1 |
| serviceProfileCoverage | 1 |
| coverageProfileCoverage | 1 |
| onboardingCoverage | 2 |

### Validation Gates（预计 12 gate）

**Phase 1:**

- supplier exists
- inventory exists
- pricing exists
- service exists
- coverage exists
- V21 network compatible
- V22 procurement compatible

**Phase 2:**

- intake builder
- submission validation
- approval gate
- workflow builder
- onboarding report

### Workflow Path 验证

对 V21 核心供应商执行完整 workflow path 验证：

| Supplier | Expected Path |
|----------|---------------|
| `supplier-life-fitness-cn` | draft → published, approval **approved** |
| `supplier-technogym-cn` | draft → published, approval **approved** |
| `supplier-matrix-cn` | draft → published, approval **approved** |
| `supplier-shuhua` | draft → published, approval **approved** |

### Freeze 输出

| Item | Value |
|------|-------|
| Version | `v27-supplier-portal-4` |
| Tag | `v27-supplier-portal-foundation` |
| Readiness / Validation / Coverage | **100%** |
| Evidence | canonical Life Fitness CN onboarding **published** |

### Public API（Phase 3 新增）

```typescript
import {
  buildSupplierPortalFreezeReport,
  buildSupplierPortalFreezeEvidence,
  validateSupplierPortalFreeze,
} from "@/lib/supplier-portal/freeze";
```

---

## Constraints Honored

- ✓ 不修改 V20–V26
- ✓ 不新增 Runtime
- ✓ 不新增 Dashboard
- ✓ 不新增登录系统

---

**Next Step:** V27 Phase 3 — Supplier Portal Freeze
