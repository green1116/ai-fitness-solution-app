# V25 Tender Knowledge Layer

**Version:** `v25-tender-knowledge-4`  
**Status:** Frozen — historical tender knowledge & knowledge-assisted win probability  
**Tag:** `v25-tender-knowledge-layer`  
**Predecessor:** V24 Proposal Intelligence (`v24-proposal-intelligence-4`)  
**Successor:** V26+ Regional Knowledge Expansion / Multi-SKU Historical Matching (read-only extension)

## Goal

在冻结的 V24 Proposal Intelligence 之上，建立**投标历史知识层**，完成历史档案、基准校准与知识辅助胜率全链路：

```
V24 Win Probability (read-only baseline)
  → Historical Archives (Tender / Proposal / Outcome / Benchmark)
  → Historical Matching
  → Benchmark Adjustment
  → Knowledge Assisted Win Probability
  → Validation + Reporting + Freeze Evidence
```

## Principle

- **不新增** Runtime
- **不新增** Dashboard
- **不修改** V20 Real Catalog Foundation
- **不修改** V21 Regional Supplier Network Foundation
- **不修改** V22 Dynamic Procurement Intelligence
- **不修改** V23 Bid Commercial Integration
- **不修改** V24 Proposal Intelligence
- **不修改** PDF Engine · Tender Engine
- **仅建设** Data Layer · Knowledge Assisted Analysis · Validation · Report · Freeze Evidence

## Frozen Modules

| Domain | Path | Phase |
|--------|------|-------|
| Historical Tender | `project-archive/` | 1 |
| Historical Proposal | `proposal-archive/` | 1 |
| Historical Bid Outcome | `bid-outcome/` | 1 |
| Benchmark Profile | `benchmark/` | 1 |
| Historical Matching | `knowledge-assisted/matching/` | 2 |
| Benchmark Adjustment | `knowledge-assisted/benchmark-adjustment/` | 2 |
| Knowledge Assisted Win Probability | `knowledge-assisted/win-probability/` | 2 |
| Validation | `validation/` + `freeze/validators.ts` | 1–Freeze |
| Reporting | `report/` + `freeze/report/` | 1–Freeze |
| Freeze Evidence | `freeze/evidence.ts` | Freeze |

## Module Layout

```
lib/tender-knowledge/
  shared/types.ts
  project-archive/data.ts           # HistoricalTender
  proposal-archive/data.ts          # HistoricalProposal
  bid-outcome/data.ts               # HistoricalBidOutcome
  benchmark/data.ts                 # BenchmarkProfile
  knowledge-assisted/
    matching/builders.ts            # findSimilarHistoricalProjects
    benchmark-adjustment/builders.ts # buildBenchmarkAdjustment
    win-probability/builders.ts     # buildKnowledgeAssistedWinProbability
  freeze/
    constants.ts
    coverage.ts                     # 5-dimension coverage stats
    validators.ts                   # validateTenderKnowledgeFreeze
    evidence.ts                     # buildTenderKnowledgeFreezeEvidence
    report/builders.ts              # buildTenderKnowledgeFreezeReport
  validation/validators.ts
  report/builders.ts
  index.ts
```

## Canonical Knowledge Query (Frozen)

```typescript
{
  sku: "LF-T5-001",
  city: "Shanghai",
  quantity: 10,
  projectType: "commercial-gym",
}
```

**Frozen Output:**

| Metric | Value |
|--------|-------|
| V24 Baseline Probability | **82%** |
| Knowledge Assisted Calibrated Probability | **78%** |
| Confidence | **high** |

## Matching Dimensions (Frozen)

| Dimension | Rule |
|-----------|------|
| `industry` | `tender.industry === projectType` |
| `city` | `tender.city === city` |
| `sku` | `proposal.sku === sku` |
| `projectType` | `tender.industry === projectType` |
| `quantityRange` | `proposal.quantity` within ±30% |

## Calibration Formula (Frozen)

```
calibrated = round(
  baseline × 0.50 +
  historicalWinRate × 0.25 +
  industryBenchmarkRate × 0.25
)
```

## Freeze API

```typescript
import {
  buildTenderKnowledgeFreezeReport,
  buildTenderKnowledgeFreezeEvidence,
  validateTenderKnowledgeFreeze,
  buildTenderKnowledgeCoverageStats,
} from "@/lib/tender-knowledge";
```

## Coverage Dimensions

| Dimension | Phase |
|-----------|-------|
| Project Archive Coverage | 1 |
| Proposal Archive Coverage | 1 |
| Bid Outcome Coverage | 1 |
| Benchmark Coverage | 1 |
| Knowledge Coverage | 2 |

## Validation Gates

**12 gates** — Phase 1 (5) + Phase 2 (4) + Freeze canonical (3)

## Readiness Target

| Score | Target |
|-------|--------|
| Knowledge Readiness Score | **100%** |
| Knowledge Validation Score | **100%** |
| Knowledge Coverage Score | **100%** |
