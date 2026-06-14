# V25 Tender Knowledge Layer — Phase 1 Report

**Version:** `v25-tender-knowledge-1`  
**Tag:** `v25-tender-knowledge`  
**Status:** Phase 1 Complete  
**Predecessor:** V24 Proposal Intelligence (`v24-proposal-intelligence-4`)  
**Generated:** 2026-06-13

## Executive Summary

V25 Phase 1 在冻结的 V20–V24 之上，完成 **Tender Knowledge 数据层** 建设。提供历史招标、方案、中标结果与行业基准档案的最小样例数据，并通过 Validation 与 Knowledge Report 输出统计摘要。**未修改** V20/V21/V22/V23/V24/PDF Engine，**未新增** Runtime/Dashboard。

---

## Created Files

| Path | Purpose |
|------|---------|
| `lib/tender-knowledge/shared/types.ts` | `HistoricalTender` / `HistoricalProposal` / `HistoricalBidOutcome` / `BenchmarkProfile` 及 Report 类型 |
| `lib/tender-knowledge/project-archive/data.ts` | 5 条历史招标项目样例 |
| `lib/tender-knowledge/project-archive/index.ts` | Project archive barrel export |
| `lib/tender-knowledge/proposal-archive/data.ts` | 5 条历史方案样例 |
| `lib/tender-knowledge/proposal-archive/index.ts` | Proposal archive barrel export |
| `lib/tender-knowledge/bid-outcome/data.ts` | 5 条中标/落标结果样例 |
| `lib/tender-knowledge/bid-outcome/index.ts` | Bid outcome barrel export |
| `lib/tender-knowledge/benchmark/data.ts` | 5 条行业/城市基准档案 |
| `lib/tender-knowledge/benchmark/index.ts` | Benchmark barrel export |
| `lib/tender-knowledge/validation/validators.ts` | `validateTenderKnowledge()` |
| `lib/tender-knowledge/validation/index.ts` | Validation barrel export |
| `lib/tender-knowledge/report/builders.ts` | `buildTenderKnowledgeReport()` |
| `lib/tender-knowledge/report/index.ts` | Report barrel export |
| `lib/tender-knowledge/index.ts` | 统一公共 API |

---

## Data Models

### `HistoricalTender`

| Field | Type | Description |
|-------|------|-------------|
| `tenderId` | string | 唯一招标 ID |
| `projectName` | string | 项目名称 |
| `city` | string | 城市 |
| `industry` | ProjectIndustry | 行业类型（与 V22 `ProjectType` 对齐） |
| `budgetMin` / `budgetMax` | number | 预算区间 |
| `tenderDate` | string | 招标日期 |
| `status` | `completed` · `active` · `archived` | 归档状态 |
| `mode` | `"tender-knowledge"` | 数据层标识 |

### `HistoricalProposal`

| Field | Type | Description |
|-------|------|-------------|
| `proposalId` | string | 唯一方案 ID |
| `tenderId` | string | 关联招标 ID |
| `sku` / `brand` | string | 设备 SKU 与品牌 |
| `quantity` | number | 数量 |
| `finalPrice` | number | 最终单价 |
| `proposalScore` | number | 历史方案评分 |
| `winProbability` | number | 历史胜率预测 |
| `strategyType` | string | 策略类型（如 high-confidence） |
| `submittedAt` | string | 提交日期 |

### `HistoricalBidOutcome`

| Field | Type | Description |
|-------|------|-------------|
| `outcomeId` | string | 唯一结果 ID |
| `tenderId` / `proposalId` | string | 关联招标与方案 |
| `outcome` | `won` · `lost` · `pending` · `withdrawn` | 中标结果 |
| `winPrice` | number \| null | 中标总价 |
| `competitorCount` | number | 竞争对手数量 |
| `marginPercent` | number \| null | 中标毛利率 |

### `BenchmarkProfile`

| Field | Type | Description |
|-------|------|-------------|
| `benchmarkId` | string | 唯一基准 ID |
| `industry` / `city` | string | 行业与城市维度 |
| `avgWinProbability` | number | 平均胜率 |
| `avgProposalScore` | number | 平均方案评分 |
| `avgMarginPercent` | number | 平均毛利率 |
| `sampleSize` | number | 样本数量 |

---

## Sample Historical Projects

| tenderId | Project | City | Industry | Outcome |
|----------|---------|------|----------|---------|
| `tender-sh-commercial-gym-2025-001` | Shanghai Pudong Commercial Gym | Shanghai | commercial-gym | **won** |
| `tender-bj-hotel-2025-002` | Beijing CBD Hotel Fitness Upgrade | Beijing | hotel | lost |
| `tender-cd-community-2025-003` | Chengdu Community Sports Center | Chengdu | community | **won** |
| `tender-gz-campus-2025-004` | Guangzhou University Campus Gym | Guangzhou | campus | lost |
| `tender-sh-enterprise-2025-005` | Shanghai Enterprise Wellness Center | Shanghai | enterprise | **won** |

**Canonical query:** `tender-sh-commercial-gym-2025-001`（LF-T5-001 · Shanghai · commercial-gym · qty 10 · high-confidence · score 85 · win 82%）

---

## Validation Results

### `validateTenderKnowledge()`

| Check | Result |
|-------|--------|
| `valid` | **true** |
| `projectArchiveValid` | ✓ — 5 条项目，预算/城市/行业完整 |
| `proposalArchiveValid` | ✓ — 5 条方案，全部关联有效 tenderId |
| `bidOutcomeValid` | ✓ — 5 条结果，tenderId/proposalId 交叉引用一致 |
| `benchmarkValid` | ✓ — 5 条基准，sampleSize > 0 |

---

## Report Results

### `buildTenderKnowledgeReport()`

| Metric | Value |
|--------|-------|
| **projectCount** | **5** |
| **proposalCount** | **5** |
| **winCount** | **3** |

### Industry Distribution

| Industry | Count |
|----------|-------|
| commercial-gym | 1 |
| hotel | 1 |
| community | 1 |
| campus | 1 |
| enterprise | 1 |

### City Distribution

| City | Count |
|------|-------|
| Shanghai | 2 |
| Beijing | 1 |
| Chengdu | 1 |
| Guangzhou | 1 |

---

## Build Verification

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | **PASS** |
| `npm run build` | **PASS** |

---

## Phase 2 Preview: Knowledge Assisted Win Probability

Phase 2 将在 Phase 1 历史数据层之上，**只读辅助** V24 `buildWinProbabilityModel()`，不修改 V24 核心逻辑：

```
buildKnowledgeAssistedWinProbability(input)
  ├── buildWinProbabilityModel()          ← V24 read-only baseline
  ├── getBenchmarkProfilesByIndustry()    ← V25 benchmark lookup
  ├── getHistoricalProposalsByTenderId()  ← V25 similar project matching
  └── getWonBidOutcomes()                 ← V25 win-rate calibration
        → adjustedProbability (baseline ± historical delta)
```

**实现要点：**

1. **Similar Project Matching** — 按 `industry` + `city` + `sku` 检索 `HistoricalProposal`，计算历史平均 `winProbability` 与 `proposalScore`。
2. **Benchmark Calibration** — 从 `BenchmarkProfile` 读取 `avgWinProbability` / `avgMarginPercent`，对 V24 baseline 做 ± 加权修正。
3. **Outcome Signal** — 统计同维度 `won` / `lost` 比例，生成 `historicalWinRate` 置信区间。
4. **Report Extension** — 输出 `KnowledgeAssistedWinProbabilityReport`，包含 baseline、historical delta、calibrated probability 与 sample confidence。
5. **Freeze Gate** — Phase 3 增加 coverage / validation / evidence，与 V23/V24 freeze 模式一致。

**Canonical Phase 2 query:** LF-T5-001 · Shanghai · commercial-gym — 预期 calibrated win probability 在 V24 baseline **82%** 基础上，参考 Shanghai commercial-gym benchmark **80%** 与 canonical won outcome 进行微调。

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
