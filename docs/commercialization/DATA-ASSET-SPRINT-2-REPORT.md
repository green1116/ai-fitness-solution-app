# Data Asset Sprint 2 Report

**Version:** `data-asset-sprint-2`  
**Status:** Complete  
**Predecessor:** Data Asset Sprint 1 (`data-asset-sprint-1`)  
**Generated:** 2026-06-13

## Executive Summary

Data Asset Sprint 2 将历史项目从 **20** 扩展至 **100**，新增 **80** 条项目记录；Benchmark 从 **5** 扩展至 **7**（新增 government · fitness-club）。品牌/ SKU/ 供应商数量保持不变。V25 Tender Knowledge **全部读取验证通过**。

---

## Asset Statistics

| Metric | Sprint 1 | Sprint 2 | Change |
|--------|----------|----------|--------|
| **Brand Count** | 10 | **10** | — |
| **SKU Count** | 50 | **50** | — |
| **Supplier Count** | 10 | **10** | — |
| **Project Count** | 20 | **100** | +80 |
| **Benchmark Count** | 5 | **7** | +2 |
| **Won Projects** | — | **58** | 58% |
| **Lost Projects** | — | **42** | 42% |

---

## Project Expansion (+80)

### Industry Distribution (均衡)

| Industry | Count |
|----------|-------|
| commercial-gym | **20** |
| hotel | **20** |
| campus | **20** |
| community | **20** |
| enterprise | **20** |

### City Distribution (均衡)

| City | Count |
|------|-------|
| Shanghai | **10** |
| Beijing | **10** |
| Guangzhou | **10** |
| Shenzhen | **10** |
| Chengdu | **10** |
| Hangzhou | **10** |
| Nanjing | **10** |
| Wuhan | **10** |
| Suzhou | **10** |
| Xi'an | **10** |

### Outcome Distribution

| Result | Count | Ratio |
|--------|-------|-------|
| **won** | **58** | 58% |
| **lost** | **42** | 42% |

---

## Project Schema (V25 Compatible)

每个 `project-XXX.json` 包含三层结构：

### HistoricalTender Summary

| Field | Type | Example |
|-------|------|---------|
| `projectId` | string | `project-042` |
| `city` | string | `Hangzhou` |
| `industry` | ProjectType | `hotel` |
| `area` | number | 650 (sqm) |
| `budget` | number | 980000 |
| `brand` | string | `Technogym` |
| `sku` | string | `TG-TM-001` |
| `result` | `won` · `lost` | `won` |

### HistoricalProposal Summary

| Field | Maps to |
|-------|---------|
| `score` | `proposal.proposalScore` |
| `winProbability` | `proposal.winProbability` |
| `strategy` | `proposal.strategyType` |

### HistoricalBidOutcome Summary

| Field | Maps to |
|-------|---------|
| `result` | `outcome.outcome` |
| `winningPrice` | `outcome.winPrice` |
| `grossMargin` | `outcome.marginPercent` |

嵌套 `tender` · `proposal` · `outcome` 保持 V25 `HistoricalTender` / `HistoricalProposal` / `HistoricalBidOutcome` 完整兼容。

---

## Benchmark Expansion (+2)

| File | Industry | Primary City | Avg Win Prob |
|------|----------|--------------|--------------|
| `government.json` | government | Beijing | 72% |
| `fitness-club.json` | fitness-club | Shanghai | 77% |

**Core V25 benchmarks (5):** commercial-gym · hotel · campus · community · enterprise  
**Extended benchmarks (7):** + government · fitness-club

---

## V25 Tender Knowledge Read Validation

### `validateV25TenderKnowledgeRead()`

| Check | Result |
|-------|--------|
| `valid` | **true** |
| Project count | **100** |
| Benchmark count | **7** |
| Core V25 benchmarks | **5** |
| Tender catalog | **100** |
| Proposal catalog | **100** |
| Outcome catalog | **100** |
| Industry balance | 20 × 5 ✓ |
| City balance | 10 × 10 ✓ |
| Won/Lost ratio | 58/42 ✓ |
| Summary ↔ nested consistency | ✓ |

### Read API

```typescript
import {
  getV25TenderKnowledgeCatalog,
  getV25TenderEntries,
  getV25ProposalEntries,
  getV25OutcomeEntries,
  getV25BenchmarkEntries,
  validateV25TenderKnowledgeRead,
} from "@/lib/data-asset-loader";

const catalog = getV25TenderKnowledgeCatalog();
// catalog.tenders.length === 100
// catalog.proposals.length === 100
// catalog.outcomes.length === 100
// catalog.coreBenchmarks.length === 5
// catalog.extendedBenchmarks.length === 7

validateV25TenderKnowledgeRead().valid === true
```

---

## Unchanged Assets

| Category | Count | Status |
|----------|-------|--------|
| Brands | 10 | Unchanged |
| SKUs | 50 | Unchanged |
| Suppliers | 10 | Unchanged |

---

## Build Verification

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | **PASS** |
| `validateV25TenderKnowledgeRead()` | **PASS** |
| `validateDataAssetRead()` | **allValid: true** |

---

## Generation Script

```bash
node scripts/generate-data-asset-sprint2.mjs
```

---

## Directory Summary

```
data/
  brands/           10 files · 50 SKUs
  suppliers/        10 files
  projects/         100 files  ← Sprint 2
  benchmarks/       7 files    ← Sprint 2 (+2)
```

**Total project JSON assets:** 100  
**Total benchmark JSON assets:** 7
