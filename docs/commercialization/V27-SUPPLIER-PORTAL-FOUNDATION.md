# V27 Supplier Portal Foundation

**Version:** `v27-supplier-portal-4`  
**Status:** Frozen — supplier portal data & onboarding workflow layer  
**Tag:** `v27-supplier-portal-foundation`  
**Predecessor:** V26 Brand Portal Foundation (`v26-brand-portal-4`)  
**Successor:** V28+ Supplier Portal Runtime / Self-Service UI (read-only extension)

## Goal

将 AI Fitness Solution 从 Industry Tender Platform 扩展至 **Supplier Portal**，完成供应商门户数据层与自助入驻工作流全链路：

```
V21 Supplier Network (read-only compat)
V22 Procurement Intelligence (read-only compat)
  → SupplierProfile / InventoryProfile / PricingProfile / ServiceProfile / CoverageProfile
  → Supplier Onboarding Intake
  → Approval Workflow (draft → published)
  → Validation + Reporting + Freeze Evidence
```

## Principle

- **不新增** Runtime
- **不新增** Dashboard
- **不新增**登录系统
- **不修改** V20 Real Catalog Foundation
- **不修改** V21 Regional Supplier Network Foundation
- **不修改** V22 Dynamic Procurement Intelligence
- **不修改** V23 Bid Commercial Integration
- **不修改** V24 Proposal Intelligence
- **不修改** V25 Tender Knowledge Layer
- **不修改** V26 Brand Portal Foundation
- **仅建设** Data Layer · Onboarding Workflow · Validation · Report · Freeze Evidence

## Frozen Modules

| Domain | Path | Phase |
|--------|------|-------|
| Supplier Profile | `supplier-profile/` | 1 |
| Inventory Profile | `inventory-profile/` | 1 |
| Pricing Profile | `pricing-profile/` | 1 |
| Service Profile | `service-profile/` | 1 |
| Coverage Profile | `coverage-profile/` | 1 |
| Supplier Onboarding | `onboarding/intake/` | 2 |
| Approval Workflow | `onboarding/workflow/` + `approval/` | 2 |
| Validation | `validation/` + `freeze/validators.ts` | 1–Freeze |
| Reporting | `report/` + `freeze/report/` | 1–Freeze |
| Freeze Evidence | `freeze/evidence.ts` | Freeze |

## Module Layout

```
lib/supplier-portal/
  shared/types.ts
  supplier-profile/data.ts
  inventory-profile/data.ts
  pricing-profile/data.ts
  service-profile/data.ts
  coverage-profile/data.ts
  onboarding/
    intake/builders.ts           # buildSupplierOnboardingIntake
    workflow/builders.ts         # buildSupplierOnboardingWorkflow
    approval/builders.ts         # buildSupplierOnboardingApprovalGate
    validation/validators.ts     # validateSupplierOnboardingSubmission
    report/builders.ts           # buildSupplierOnboardingReport
    submissions/data.ts
  freeze/
    constants.ts
    coverage.ts                  # 7-dimension coverage stats
    validators.ts                # validateSupplierPortalFreeze
    evidence.ts                  # buildSupplierPortalFreezeEvidence
    report/builders.ts           # buildSupplierPortalFreezeReport
  validation/validators.ts
  report/builders.ts
  index.ts
```

## Onboarding State Machine (Frozen)

```
draft → submitted → review → approved → published
                              ↘ rejected
```

## Canonical Query (Frozen)

```typescript
{
  supplierId: "supplier-life-fitness-cn",
  submissionId: "onboarding-life-fitness-cn-001",
}
```

## Workflow Validation Suppliers (Frozen)

Life Fitness CN · Technogym CN · Matrix CN · Shuhua · Impulse CN — 全部完成 draft → published 完整流程

## Freeze API

```typescript
import {
  buildSupplierPortalFreezeReport,
  buildSupplierPortalFreezeEvidence,
  validateSupplierPortalFreeze,
  buildSupplierPortalCoverageStats,
} from "@/lib/supplier-portal";
```

## Coverage Dimensions

| Dimension | Phase |
|-----------|-------|
| Supplier Profile Coverage | 1 |
| Inventory Profile Coverage | 1 |
| Pricing Profile Coverage | 1 |
| Service Profile Coverage | 1 |
| Coverage Profile Coverage | 1 |
| Onboarding Coverage | 2 |
| Approval Workflow Coverage | 2 |

## Readiness Target

| Score | Target |
|-------|--------|
| Supplier Portal Readiness | **100%** |
| Supplier Portal Validation | **100%** |
| Supplier Portal Coverage | **100%** |
