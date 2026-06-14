# Data Asset Sprint 1 Report

**Version:** `data-asset-sprint-1`  
**Status:** Complete  
**Predecessor:** Data Asset Foundation (`data-asset-foundation-1`)  
**Generated:** 2026-06-13

## Executive Summary

Data Asset Sprint 1 完成 `data/` 目录全面扩充：品牌 10 · SKU 50 · 供应商 10 · 历史项目 20 · 行业基准 5。新增 `lib/data-asset-loader/` 只读加载与 V20/V21/V25 兼容验证，**全部读取验证通过**。

---

## Asset Statistics

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| **Brand Count** | 5 | **10** | 10 ✓ |
| **SKU Count** | 0 (embedded) | **50** | 50 (10×5) ✓ |
| **Supplier Count** | 3 | **10** | 10 ✓ |
| **Project Count** | 3 | **20** | 20 ✓ |
| **Benchmark Count** | 3 | **5** | 5 ✓ |

---

## Brand Assets (10)

| File | Brand | Tier | Origin | SKUs |
|------|-------|------|--------|------|
| `life-fitness.json` | Life Fitness | premium | USA | 5 |
| `technogym.json` | Technogym | premium | Italy | 5 |
| `matrix.json` | Matrix | mid-market | USA | 5 |
| `relax.json` | Relax | commercial | China | 5 |
| `shuhua.json` | Shuhua | domestic | China | 5 |
| `precor.json` | **Precor** | premium | USA | 5 |
| `impulse.json` | **Impulse** | value | China | 5 |
| `dhz.json` | **DHZ** | domestic | China | 5 |
| `bodystrength.json` | **BodyStrong** | value | China | 5 |
| `sportsart.json` | **SportsArt** | commercial | Taiwan | 5 |

### SKU Coverage (per brand)

每品牌 5 个 SKU，覆盖 5 类设备：

| subCategory | V20 category | Example SKU |
|-------------|--------------|-------------|
| Treadmill | cardio | `{PREFIX}-TM-001` |
| Bike | group-training | `{PREFIX}-BK-001` |
| Elliptical | cardio | `{PREFIX}-EL-001` |
| Strength | strength | `{PREFIX}-ST-001` |
| Functional | functional | `{PREFIX}-FN-001` |

**Total SKU Count: 50**

---

## Supplier Assets (10)

| File | Brand | Primary Cities | Authorization |
|------|-------|----------------|---------------|
| `life-fitness.json` | Life Fitness | Shanghai, Beijing | national |
| `technogym.json` | Technogym | Shanghai, Beijing | national |
| `matrix.json` | Matrix | Guangzhou | regional |
| `relax.json` | Relax | Shenzhen | regional |
| `shuhua.json` | Shuhua | Chengdu | national |
| `precor.json` | Precor | Shanghai | national |
| `impulse.json` | Impulse | Chengdu | national |
| `dhz.json` | DHZ | Guangzhou | regional |
| `bodystrength.json` | BodyStrong | Shenzhen | regional |
| `sportsart.json` | SportsArt | Beijing | national |

### City Coverage

| City | Suppliers |
|------|-----------|
| Shanghai | Life Fitness, Technogym, Precor |
| Beijing | Life Fitness, Technogym, SportsArt |
| Guangzhou | Matrix, DHZ |
| Shenzhen | Relax, BodyStrong |
| Chengdu | Shuhua, Impulse |

**Dealer Count:** 12 · **Inventory Entries:** 14

---

## Project Assets (20)

| Industry | Projects | Count |
|----------|----------|-------|
| commercial-gym | 001, 006, 011, 016 | 4 |
| hotel | 002, 007, 012, 017 | 4 |
| campus | 003, 008, 013, 018 | 4 |
| community | 004, 009, 014, 019 | 4 |
| enterprise | 005, 010, 015, 020 | 4 |

**City rotation:** Shanghai · Beijing · Guangzhou · Shenzhen · Chengdu

Each project includes: `tender` · `proposal` · `outcome` · `knowledgeAssisted`

---

## Benchmark Assets (5)

| File | Industry | Primary City | Avg Win Prob |
|------|----------|--------------|--------------|
| `commercial-gym.json` | commercial-gym | Shanghai | 80% |
| `hotel.json` | hotel | Beijing | 68% |
| `campus.json` | campus | Guangzhou | 74% |
| `community.json` | community | Chengdu | 79% |
| `enterprise.json` | enterprise | Shanghai | 76% |

---

## Data Asset Loader

```
lib/data-asset-loader/
  shared/types.ts       # Asset file types + validation types
  reader.ts             # loadBrandAssets / loadSupplierAssets / loadProjectAssets / loadBenchmarkAssets
  validation.ts         # validateV20/V21/V25 + buildDataAssetSprintReport
  index.ts
```

### V20 Read API

```typescript
import { getV20BrandEntries, getV20EquipmentEntries } from "@/lib/data-asset-loader";

const brands = getV20BrandEntries();       // RealBrandEntry[] — 10
const equipment = getV20EquipmentEntries(); // RealEquipmentEntry[] — 50
```

### V21 Read API

```typescript
import {
  getV21SupplierEntries,
  getV21DealerEntries,
  getV21InventoryEntries,
} from "@/lib/data-asset-loader";

const suppliers = getV21SupplierEntries();   // SupplierEntry[] — 10
const dealers = getV21DealerEntries();       // DealerEntry[] — 12
const inventory = getV21InventoryEntries();  // InventoryEntry[] — 14
```

### V25 Read API

```typescript
import {
  getV25TenderEntries,
  getV25ProposalEntries,
  getV25OutcomeEntries,
  getV25BenchmarkEntries,
} from "@/lib/data-asset-loader";

const tenders = getV25TenderEntries();       // HistoricalTender[] — 20
const proposals = getV25ProposalEntries();   // HistoricalProposal[] — 20
const outcomes = getV25OutcomeEntries();     // HistoricalBidOutcome[] — 20
const benchmarks = getV25BenchmarkEntries(); // BenchmarkProfile[] — 5
```

---

## Validation Results

### `validateDataAssetRead()`

| Layer | Valid | Count | Details |
|-------|-------|-------|---------|
| **V20** | **true** | 10 brands · 50 SKUs | All 5 SKU types per brand · `mode: real-catalog` |
| **V21** | **true** | 10 suppliers · 12 dealers | 5 cities covered · active status |
| **V25** | **true** | 20 projects · 5 benchmarks | 5 industries covered · cross-ref valid |
| **All Valid** | **true** | — | 0 errors |

### Validation Command

```bash
npx tsx -e "import { buildDataAssetSprintReport } from './lib/data-asset-loader/validation'; console.log(JSON.stringify(buildDataAssetSprintReport(), null, 2));"
```

---

## Build Verification

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | **PASS** |
| `npm run build` | **PASS** |

---

## Directory Summary

```
data/
  brands/           10 files · 50 SKUs
  suppliers/        10 files · 12 dealers · 14 inventory
  projects/         20 files
  benchmarks/       5 files
  skus/             4 files (legacy)
```

**Total JSON assets:** 49 files

---

## Generation Scripts

| Script | Purpose |
|--------|---------|
| `scripts/generate-data-asset-sprint1.mjs` | Regenerate Sprint 1 JSON assets |
| `npx tsx lib/data-asset-loader/validation.ts` | Run validation programmatically |

---

## Constraints Honored

- ✓ 不修改 V20/V21/V22/V23/V24/V25 冻结层运行时模块
- ✓ 数据外置为 JSON 资产，通过 `data-asset-loader` 只读加载
- ✓ 类型字段与 V20 `RealBrandEntry` / `RealEquipmentEntry`、V21 `SupplierEntry`、V25 历史档案 1:1 兼容
