# V28 Tender Marketplace Foundation

**Version:** `v28-tender-marketplace-4`  
**Status:** Frozen — tender marketplace data & publishing workflow layer  
**Tag:** `v28-tender-marketplace-foundation`  
**Predecessor:** V27 Supplier Portal Foundation (`v27-supplier-portal-4`)  
**Successor:** V29 Multi Tenant Foundation

## Goal

将 AI Fitness Solution 从 Brand/Supplier Portal 扩展至 **Tender Marketplace**，完成招标市场数据层与自助发布工作流全链路：

```
V20–V25 (read-only compat)
  → TenderProfile / RequirementProfile / EvaluationProfile / OpportunityProfile
  → Tender Publishing Intake
  → Approval Workflow (draft → published)
  → Validation + Reporting + Freeze Evidence
```

## Principle

- **不新增** Runtime
- **不新增** Dashboard
- **不新增**登录系统
- **不修改** V20–V27
- **仅建设** Data Layer · Publishing Workflow · Validation · Report · Freeze Evidence

## Frozen Modules

| Domain | Path | Phase |
|--------|------|-------|
| Tender Profile | `tender-profile/` | 1 |
| Requirement Profile | `requirement-profile/` | 1 |
| Evaluation Profile | `evaluation-profile/` | 1 |
| Opportunity Profile | `opportunity-profile/` | 1 |
| Tender Publishing | `onboarding/intake/` | 2 |
| Approval Workflow | `onboarding/workflow/` + `approval/` | 2 |
| Validation | `validation/` + `freeze/validators.ts` | 1–Freeze |
| Reporting | `report/` + `freeze/report/` | 1–Freeze |
| Freeze Evidence | `freeze/evidence.ts` | Freeze |

## Freeze API

```typescript
import {
  buildTenderMarketplaceFreezeReport,
  buildTenderMarketplaceFreezeEvidence,
  validateTenderMarketplaceFreeze,
} from "@/lib/tender-marketplace";
```

## Readiness Target

| Score | Target |
|-------|--------|
| Tender Marketplace Readiness | **100%** |
| Tender Marketplace Validation | **100%** |
| Tender Marketplace Coverage | **100%** |
