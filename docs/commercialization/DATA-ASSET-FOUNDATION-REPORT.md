# Data Asset Foundation Report

**Version:** `data-asset-foundation-1`  
**Status:** Initial Sample Data  
**Compatible Layers:** V20 · V21 · V22 · V23 · V24 · V25  
**Generated:** 2026-06-13

## Executive Summary

建立项目级 **Data Asset Foundation** 目录，将 V20–V25 冻结层数据模型以 JSON 文件形式外置为可版本化数据资产。所有文件采用 `schemaVersion: "1.0"` 包装，内嵌与各层 TypeScript 类型兼容的实体字段，可直接映射至运行时 catalog / archive 模块。

---

## Directory Structure

```
data/
  brands/
    life-fitness.json
    technogym.json
    matrix.json
    relax.json
    shuhua.json
  suppliers/
    life-fitness.json
    technogym.json
    matrix.json
  projects/
    project-001.json
    project-002.json
    project-003.json
  benchmarks/
    commercial-gym.json
    hotel.json
    campus.json
  skus/                          # (existing)
    treadmill.json
    bike.json
    strength.json
    recovery.json
```

---

## Schema Compatibility

| Directory | Compatible Layer | TypeScript Model | Mode Field |
|-----------|------------------|------------------|------------|
| `brands/` | V20 Real Catalog | `RealBrandEntry` | `real-catalog` |
| `suppliers/` | V21 Regional Supplier | `SupplierEntry` + `DealerEntry` + `InventoryEntry` | `supplier-network` |
| `projects/` | V25 Tender Knowledge | `HistoricalTender` + `HistoricalProposal` + `HistoricalBidOutcome` | `tender-knowledge` |
| `benchmarks/` | V25 Tender Knowledge | `BenchmarkProfile` | `tender-knowledge` |

**Wrapper Format:**

```json
{
  "schemaVersion": "1.0",
  "compatibleLayers": ["v20-real-catalog"],
  "brand": { ... }
}
```

---

## Brand Assets (5)

| File | brandId | Tier | Origin |
|------|---------|------|--------|
| `life-fitness.json` | `brand-life-fitness` | premium | USA |
| `technogym.json` | `brand-technogym` | premium | Italy |
| `matrix.json` | `brand-matrix` | mid-market | USA |
| `relax.json` | `brand-relax` | commercial | China |
| `shuhua.json` | `brand-shuhua` | domestic | China |

**V20 Mapping:** `brand` 字段 1:1 对应 `RealBrandEntry`，可直接导入 `lib/real-catalog-foundation/brand-catalog/`。

---

## Supplier Assets (3)

| File | Supplier ID | Brand | Authorization | Inventory SKUs |
|------|-------------|-------|---------------|----------------|
| `life-fitness.json` | `supplier-life-fitness-cn` | Life Fitness | national | LF-T5-001 × 2 warehouses |
| `technogym.json` | `supplier-technogym-cn` | Technogym | national | TG-SKILLRUN-001 |
| `matrix.json` | `supplier-matrix-cn` | Matrix | regional | MX-SDRIVE-001 |

**V21 Mapping:** `supplier` → `SupplierEntry`，`dealers` → `DealerEntry[]`，`inventory` → `InventoryEntry[]`。

---

## Project Assets (3)

| File | Project | City | Industry | SKU | Outcome |
|------|---------|------|----------|-----|---------|
| `project-001.json` | Shanghai Pudong Commercial Gym | Shanghai | commercial-gym | LF-T5-001 × 10 | **won** |
| `project-002.json` | Beijing CBD Hotel Fitness | Beijing | hotel | TG-SKILLRUN-001 × 6 | lost |
| `project-003.json` | Chengdu Community Sports Center | Chengdu | community | SH-T8000-001 × 15 | **won** |

**V25 Mapping:**

- `tender` → `HistoricalTender`
- `proposal` → `HistoricalProposal`
- `outcome` → `HistoricalBidOutcome`
- `knowledgeAssisted` → V25 Phase 2 calibrated output（canonical: project-001 baseline 82% → calibrated 78%）

---

## Benchmark Assets (3)

| File | Industry | Primary City | Avg Win Prob | Avg Score | Avg Margin |
|------|----------|--------------|--------------|-----------|------------|
| `commercial-gym.json` | commercial-gym | Shanghai | 80% | 84 | 16% |
| `hotel.json` | hotel | Beijing | 68% | 78 | 12% |
| `campus.json` | campus | Guangzhou | 74% | 80 | 13% |

**V25 Mapping:** `profiles[]` → `BenchmarkProfile[]`，与 `lib/tender-knowledge/benchmark/data.ts` 一致。

---

## Cross-Layer Reference Map

```
project-001
  ├── brand: life-fitness.json
  ├── supplier: life-fitness.json
  ├── benchmark: commercial-gym.json
  └── canonical: LF-T5-001 · Shanghai · qty 10 · commercial-gym

project-002
  ├── brand: technogym.json
  ├── supplier: technogym.json
  └── benchmark: hotel.json

project-003
  ├── brand: shuhua.json
  └── industry: community (no dedicated benchmark file)
```

---

## Asset Statistics

| Category | Files | Records |
|----------|-------|---------|
| Brands | 5 | 5 brand entries |
| Suppliers | 3 | 3 suppliers · 4 dealers · 4 inventory entries |
| Projects | 3 | 3 tenders · 3 proposals · 3 outcomes |
| Benchmarks | 3 | 3 industry profiles |
| SKUs (existing) | 4 | legacy SKU catalog |
| **Total JSON Assets** | **18** | — |

---

## Canonical Query Alignment

**Frozen canonical query** (V23–V25):

```json
{
  "sku": "LF-T5-001",
  "city": "Shanghai",
  "quantity": 10,
  "projectType": "commercial-gym"
}
```

**Data asset path:** `data/projects/project-001.json`

| Layer | Output |
|-------|--------|
| V24 baseline win probability | 82% |
| V25 calibrated probability | 78% |
| Outcome | won · ¥980,000 · margin 17% |

---

## Usage Notes

1. **Read-only seed data** — 当前 JSON 为示例资产，不自动加载至 V20–V25 运行时模块。
2. **Schema evolution** — 字段变更需同步更新 `schemaVersion` 与对应 TypeScript 类型。
3. **Import path** — 后续可通过 data loader 将 JSON 映射至各 foundation catalog，无需修改冻结层 API。
4. **Relax brand** — 新增 mid-tier 中国品牌，扩展 V20 品牌覆盖（hotel / community 场景）。

---

## Next Steps (Optional)

- 添加 `data/procurement/` 映射 V22 channel-pricing / discount-rules
- 添加 `data/equipment/` 映射 V20 `RealEquipmentEntry`
- 实现 `lib/data-asset-loader/` 只读加载 JSON → foundation catalog
