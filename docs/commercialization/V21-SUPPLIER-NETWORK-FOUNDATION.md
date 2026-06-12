# V21 Regional Supplier Network Foundation

**Version:** `v21-regional-supplier-foundation-3`  
**Status:** Frozen — industry regional supply chain data asset layer  
**Tag:** `v21-supplier-network-foundation`  
**Predecessor:** V20 Real Catalog Foundation (`v20-real-catalog-foundation-1`)  
**Successor:** V22+ Catalog–Supply Bridge (read-only join)

## Goal

在 V20 真实设备目录基础上，建立**区域供应链网络数据资产层**，完成品牌供应商、区域经销商、城市覆盖、库存与服务五层目录，并通过 Supplier Network Bundle 聚合查询。

```
V20 real-catalog（设备/价格/维保） → V21 supplier-network（区域供应链）
```

## Principle

- **不新增** Runtime
- **不新增** Dashboard
- **不修改** V20 Catalog Foundation
- **不修改** Tender Engine · PDF Engine
- **仅建设** 数据资产 · Bridge · Validation · Report · Evidence

## Frozen Modules

| Module | Path | Phase |
|--------|------|-------|
| Supplier Catalog | `supplier-catalog/data.ts` | 1 |
| Dealer Catalog | `dealer-catalog/data.ts` | 1 |
| Coverage Catalog | `coverage-catalog/data.ts` | 1 |
| Inventory Catalog | `inventory-catalog/data.ts` | 2 |
| Service Catalog | `service-catalog/data.ts` | 2 |
| Supplier Network Bundle | `bridge/supplier-bridge.ts` | 3 |
| Validation | `validation/validators.ts` | 1–3 |
| Reporting | `report/builders.ts` | 1–3 |
| Evidence | `evidence.ts` | 3 |

## Module Layout

```
lib/regional-supplier-foundation/
  shared/types.ts
  supplier-catalog/data.ts       # 4 brands → authorized suppliers
  dealer-catalog/data.ts         # 4 cities → regional dealers
  coverage-catalog/data.ts       # 5 cities → tier-1/2 coverage SLA
  inventory-catalog/data.ts      # 8 entries, 6 SKUs (V20-aligned)
  service-catalog/data.ts        # 6 providers, 5 cities
  bridge/supplier-bridge.ts      # buildRegionalSupplySnapshot + buildSupplierNetworkBundle
  validation/validators.ts       # Phase 1/2 + bundle validation
  report/builders.ts             # Phase 1/2 + network reports
  evidence.ts                    # Supplier Network Evidence
  index.ts
```

## Five-Layer Aggregation

```
brand  → supplier
city   → dealer + coverage + service
sku    → inventory
```

```typescript
buildSupplierNetworkBundle({ brand, city, sku })
// → { supplier, dealer, coverage, inventory, service, bundleReadiness }
```

## Catalog Inventory (Frozen)

| Catalog | Entries | Notes |
|---------|---------|-------|
| Supplier Catalog | 4 | Technogym, Life Fitness, Matrix, Shuhua |
| Dealer Catalog | 4 | Shanghai, Beijing, Guangzhou, Chengdu |
| Coverage Catalog | 5 | tier-1: SH/BJ/GZ · tier-2: CD/Wuhan |
| Inventory Catalog | 8 | 6 unique SKUs, multi-warehouse |
| Service Catalog | 6 | 5 cities, all active |

## Boundaries

- **不修改** `lib/real-catalog-foundation/`（V20 冻结边界）
- **不修改** Tender Engine · Proposal PDF · Budget Engine
- **不新增** Runtime · Dashboard · API routes
- V21 为独立只读数据资产，供后续版本以 Bridge 方式接入

## Programmatic Access

```typescript
import {
  buildSupplierNetworkBundle,
  validateSupplierNetworkBundle,
  buildSupplierNetworkReport,
  buildSupplierNetworkEvidence,
  buildSupplierFoundationPhase2Report,
} from "@/lib/regional-supplier-foundation";

const bundle = buildSupplierNetworkBundle({
  brand: "Life Fitness",
  city: "Shanghai",
  sku: "LF-T5-001",
});
```

## Verification

```bash
npx tsc --noEmit
npm run build
```

Expected: Supplier Network Readiness Score **100%** · Bundle Readiness Score **100%**

## Freeze Declaration

以下模块自本版本起**冻结**，不得在原边界内扩展 Runtime 或修改目录语义：

- Supplier Catalog · Dealer Catalog · Coverage Catalog
- Inventory Catalog · Service Catalog
- Supplier Network Bundle · Validation · Reporting · Evidence

新能力须以 V22+ 新版本立项，不得增量修改 V21 冻结层。

## Next: Catalog–Supply Bridge

只读 join V20 `buildRealCatalogBundle(sku)` 与 V21 `buildSupplierNetworkBundle({ brand, city, sku })`，为投标编排提供「可采购 + 可交付」联合视图。
