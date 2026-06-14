# V25 Tender Knowledge Layer — Freeze Report

**Version:** `v25-tender-knowledge-4`  
**Tag:** `v25-tender-knowledge-layer`  
**Status:** Frozen  
**Predecessor:** V24 Proposal Intelligence (Readiness: 100%)  
**Generated:** 2026-06-13

## Executive Summary

V25 在冻结的 V24 Proposal Intelligence 之上，完成投标历史知识全链路建设：Historical Archives → Historical Matching → Benchmark Adjustment → Knowledge Assisted Win Probability。全部 12-gate Validation 通过，**Knowledge Readiness 100%**，**Knowledge Validation Score 100%**，**Knowledge Coverage Score 100%**。

---

## Module Statistics

| Module | Count | Coverage |
|--------|-------|----------|
| Frozen Domains | **7** | tender / proposal / outcome / benchmark / matching / adjustment / win-probability |
| Archive Catalogs | **4** | project / proposal / bid-outcome / benchmark |
| Matching Dimensions | **5** | industry / city / sku / projectType / quantityRange |
| Validation Gates | **12** | Phase 1(5) + Phase 2(4) + Freeze(3) |
| Report Builders | **3** | knowledge / knowledge-assisted / freeze |

---

## Coverage Results

### Five-Dimension Tender Knowledge Coverage

| Dimension | Score |
|-----------|-------|
| Project Archive Coverage | **100%** |
| Proposal Archive Coverage | **100%** |
| Bid Outcome Coverage | **100%** |
| Benchmark Coverage | **100%** |
| Knowledge Coverage | **100%** |
| **Knowledge Coverage Score** | **100%** |

---

## Validation Results

### `validateTenderKnowledgeFreeze()` — 12 Gates

| Layer | Check | Result |
|-------|-------|--------|
| Phase 1 | `phase1Valid` | **true** |
| Phase 1 | project / proposal / bid-outcome / benchmark archive | ✓ × 4 |
| Phase 2 | `phase2Valid` | **true** |
| Phase 2 | historical match / benchmark / calibrated / valid | ✓ × 4 |
| Freeze | baseline > 0 | ✓ |
| Freeze | calibrated = **78%** | ✓ |
| Freeze | confidence exists | ✓ |
| **Knowledge Validation Score** | **100%** | 12/12 |

---

## Readiness Results

| Score | Value |
|-------|-------|
| **Knowledge Readiness Score** | **100%** |
| **Knowledge Validation Score** | **100%** |
| **Knowledge Coverage Score** | **100%** |

### Canonical Knowledge Output

**Input:** LF-T5-001 · Shanghai · qty 10 · commercial-gym

| Metric | Value |
|--------|-------|
| V24 Baseline Probability | **82%** |
| Historical Win Rate (weighted) | **~68%** |
| Industry Benchmark Rate | **80%** |
| **Knowledge Assisted Calibrated Probability** | **78%** |
| Confidence | **high** |

---

## Complete Knowledge Report

### Phase 1 — Historical Archives

| Archive | Count |
|---------|-------|
| Historical Tenders | 5 |
| Historical Proposals | 5 |
| Bid Outcomes | 5 |
| Benchmark Profiles | 5 |
| Won Projects | 3 |

### Phase 2 — Knowledge Assisted Analysis

| Output | Value |
|--------|-------|
| Similar Projects | 2 |
| Best Match Score | 5/5 |
| Industry Adjustment | -2 |
| City Adjustment | -4 |
| Benchmark Net Adjustment | -3 |
| Calibrated Probability | **78%** |

**Similar Project Matches:**

| Proposal | Match | Outcome |
|----------|-------|---------|
| `proposal-sh-gym-lf-001` | 5/5 | won |
| `proposal-sh-enterprise-lf-001` | 3/5 | won |

---

## Canonical Knowledge Query

```typescript
import {
  buildKnowledgeAssistedWinProbabilityReport,
  buildTenderKnowledgeFreezeReport,
  buildTenderKnowledgeFreezeEvidence,
} from "@/lib/tender-knowledge";

const query = {
  sku: "LF-T5-001",
  city: "Shanghai",
  quantity: 10,
  projectType: "commercial-gym",
};

const knowledgeReport = buildKnowledgeAssistedWinProbabilityReport(query);
// knowledgeReport.winProbability.calibratedProbability === 78
// knowledgeReport.validation.valid === true

const freezeReport = buildTenderKnowledgeFreezeReport();
// freezeReport.readiness.readinessScore === 100
// freezeReport.status === "frozen"

const evidence = buildTenderKnowledgeFreezeEvidence();
// evidence.freezeManifest.calibratedProbability === 78
// evidence.tag === "v25-tender-knowledge-layer"
```

---

## Knowledge Evidence

```typescript
{
  tag: "v25-tender-knowledge-layer",
  version: "v25-tender-knowledge-4",
  freezeManifest: {
    frozenDomains: [
      "historical-tender",
      "historical-proposal",
      "historical-bid-outcome",
      "benchmark-profile",
      "historical-matching",
      "benchmark-adjustment",
      "knowledge-assisted-win-probability",
    ],
    canonicalQuery: { sku: "LF-T5-001", city: "Shanghai", quantity: 10, projectType: "commercial-gym" },
    baselineProbability: 82,
    calibratedProbability: 78,
    confidence: "high",
  },
  validationPassed: true,
  readiness: { readinessScore: 100, validationScore: 100, coverageScore: 100 },
}
```

---

## Build Verification

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | **PASS** |
| `npm run build` | **PASS** |

---

## Tag

```
v25-tender-knowledge-layer
```

---

## Constraints Honored

- ✓ 不修改 V20 Catalog
- ✓ 不修改 V21 Supplier
- ✓ 不修改 V22 Procurement
- ✓ 不修改 V23 Commercial Proposal
- ✓ 不修改 V24 Proposal Intelligence
- ✓ 不修改 PDF Engine
- ✓ 不新增 Runtime
- ✓ 不新增 Dashboard
