# V24 Proposal Intelligence Layer

**Version:** `v24-proposal-intelligence-4`  
**Status:** Frozen — proposal analysis & bid strategy intelligence layer  
**Tag:** `v24-proposal-intelligence`  
**Predecessor:** V23 Bid Commercial Integration (`v23-bid-commercial-integration-4`)  
**Successor:** V25+ Multi-SKU Intelligence / Regional Expansion (read-only extension)

## Goal

在冻结的 V23 `CommercialProposalPack` 之上，建立**投标方案智能分析层**，完成评分、风险分析、建议、中标概率与投标策略全链路：

```
V23 CommercialProposalPack (read-only)
  → Proposal Score
  → Risk Analysis + Recommendations
  → Win Probability + Competitive Position
  → Bid Strategy
  → Validation + Reporting + Freeze Evidence
```

## Principle

- **不新增** Runtime
- **不新增** Dashboard
- **不修改** V20 Real Catalog Foundation
- **不修改** V21 Regional Supplier Network Foundation
- **不修改** V22 Dynamic Procurement Intelligence
- **不修改** V23 Bid Commercial Integration
- **不修改** PDF Engine · Tender Engine
- **仅建设** Analysis · Strategy · Validation · Report · Freeze Evidence

## Frozen Modules

| Domain | Path | Phase |
|--------|------|-------|
| Proposal Score | `scoring/builders.ts` | 1 |
| Risk Analysis | `risk-analysis/builders.ts` | 1 |
| Recommendations | `recommendation/builders.ts` | 1 |
| Win Probability | `win-probability/` + `competitive-position/` + `tender-context/` | 2 |
| Bid Strategy | `strategy/` | 3 |
| Validation | `validation/` + `freeze/validators.ts` | 1–Freeze |
| Reporting | `report/` + `freeze/report/` | 1–Freeze |
| Freeze Evidence | `freeze/evidence.ts` | Freeze |

## Module Layout

```
lib/proposal-intelligence/
  shared/types.ts
  scoring/builders.ts              # buildProposalScore (5 dimensions)
  risk-analysis/builders.ts        # buildRiskAnalysis (5 categories)
  recommendation/builders.ts       # buildProposalRecommendations
  tender-context/builders.ts       # buildTenderContextProfile
  competitive-position/builders.ts # buildCompetitivePositionAnalysis
  win-probability/builders.ts      # buildWinProbabilityModel
  strategy/
    high-confidence/builders.ts
    balanced/builders.ts
    aggressive/builders.ts
    cost-optimized/builders.ts
    builders.ts                    # buildBidStrategy
  freeze/
    constants.ts
    coverage.ts                    # 5-dimension coverage stats
    validators.ts                  # validateProposalIntelligenceFreeze
    evidence.ts                    # buildProposalIntelligenceFreezeEvidence
    report/builders.ts             # buildProposalIntelligenceFreezeReport
  validation/validators.ts
  report/builders.ts
  index.ts
```

## Canonical Query (Frozen)

```typescript
{
  sku: "LF-T5-001",
  city: "Shanghai",
  quantity: 10,
  projectType: "commercial-gym",
}
```

## Coverage Dimensions (Frozen)

| Dimension | Source | Metric |
|-----------|--------|--------|
| Score Coverage | 5 scoring dimensions + overall | catalog/supplier/procurement/delivery/coverage |
| Risk Coverage | 5 risk categories | inventory/supplier/lead-time/service/pricing |
| Recommendation Coverage | strengths + weaknesses + recommendations | 3 output groups |
| Win Probability Coverage | win model + competitive position | probability + reasons + rank |
| Bid Strategy Coverage | strategy type + adjustments + recommendations | 4 strategy types |

## Scoring (Frozen)

| Score | Definition |
|-------|------------|
| Readiness Score | `(coverageScore + validationScore) / 2` |
| Validation Score | 15-gate Phase 1–3 pass rate |
| Coverage Score | Average of 5 coverage dimensions |

## Programmatic Access

```typescript
import {
  buildProposalIntelligenceFreezeReport,
  buildProposalIntelligenceFreezeEvidence,
  validateProposalIntelligenceFreeze,
} from "@/lib/proposal-intelligence";

const report = buildProposalIntelligenceFreezeReport();
const evidence = buildProposalIntelligenceFreezeEvidence();
const validation = validateProposalIntelligenceFreeze();
```

## Verification Gate

```bash
npx tsc --noEmit   # PASS
npm run build      # PASS
```

## Freeze Boundary

| In scope (frozen) | Out of scope |
|-------------------|--------------|
| Score / Risk / Recommendations / Win Probability / Bid Strategy | V20–V23 modifications |
| 15-gate validation + 5-dimension coverage + evidence | New Runtime / Dashboard |
| Read-only V23 pack consumption | PDF Engine changes |

**Tag:** `v24-proposal-intelligence`
