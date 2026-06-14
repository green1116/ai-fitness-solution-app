# V26 Brand Portal Foundation

**Version:** `v26-brand-portal-4`  
**Status:** Frozen — brand portal data & onboarding workflow layer  
**Tag:** `v26-brand-portal-foundation`  
**Predecessor:** V25 Tender Knowledge Layer (`v25-tender-knowledge-4`)  
**Successor:** V27+ Brand Portal Runtime / Self-Service UI (read-only extension)

## Goal

将 AI Fitness Solution 从 Tender Intelligence System 升级为 **Industry Tender Platform**，完成品牌门户数据层与自助入驻工作流全链路：

```
V20 Catalog (read-only compat)
  → BrandProfile / ProductProfile / CertificationProfile / CaseStudyProfile
  → Brand Onboarding Intake
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
- **不修改** V25 Tender Knowledge
- **仅建设** Data Layer · Onboarding Workflow · Validation · Report · Freeze Evidence

## Frozen Modules

| Domain | Path | Phase |
|--------|------|-------|
| Brand Profile | `brand-profile/` | 1 |
| Product Profile | `product-profile/` | 1 |
| Certification Profile | `certification-profile/` | 1 |
| Case Study Profile | `case-study-profile/` | 1 |
| Brand Onboarding | `onboarding/intake/` | 2 |
| Approval Workflow | `onboarding/workflow/` + `approval/` | 2 |
| Validation | `validation/` + `freeze/validators.ts` | 1–Freeze |
| Reporting | `report/` + `freeze/report/` | 1–Freeze |
| Freeze Evidence | `freeze/evidence.ts` | Freeze |

## Module Layout

```
lib/brand-portal/
  shared/types.ts
  brand-profile/data.ts
  product-profile/data.ts
  certification-profile/data.ts
  case-study-profile/data.ts
  onboarding/
    intake/builders.ts           # buildBrandOnboardingIntake
    workflow/builders.ts         # buildBrandOnboardingWorkflow
    approval/builders.ts         # buildBrandOnboardingApprovalGate
    validation/validators.ts     # validateBrandOnboardingSubmission
    report/builders.ts           # buildBrandOnboardingReport
    submissions/data.ts
  freeze/
    constants.ts
    coverage.ts                  # 6-dimension coverage stats
    validators.ts                # validateBrandPortalFreeze
    evidence.ts                  # buildBrandPortalFreezeEvidence
    report/builders.ts           # buildBrandPortalFreezeReport
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
  brandId: "brand-life-fitness",
  submissionId: "onboarding-life-fitness-001",
}
```

## Workflow Validation Brands (Frozen)

Life Fitness · Technogym · Matrix · Shuhua — 全部完成 draft → published 完整流程

## Freeze API

```typescript
import {
  buildBrandPortalFreezeReport,
  buildBrandPortalFreezeEvidence,
  validateBrandPortalFreeze,
  buildBrandPortalCoverageStats,
} from "@/lib/brand-portal";
```

## Coverage Dimensions

| Dimension | Phase |
|-----------|-------|
| Brand Profile Coverage | 1 |
| Product Profile Coverage | 1 |
| Certification Coverage | 1 |
| Case Study Coverage | 1 |
| Onboarding Coverage | 2 |
| Approval Workflow Coverage | 2 |

## Readiness Target

| Score | Target |
|-------|--------|
| Brand Portal Readiness | **100%** |
| Brand Portal Validation | **100%** |
| Brand Portal Coverage | **100%** |
