# V22 Dynamic Procurement Intelligence

**Version:** `v22-procurement-intelligence-3`  
**Status:** Frozen — dynamic procurement pricing & commercial bundle layer  
**Tag:** `v22-dynamic-procurement-intelligence`  
**Predecessor:** V21 Regional Supplier Network Foundation (`v21-regional-supplier-foundation-3`)  
**Successor:** V23+ Bid Commercial Integration (read-only join)

## Goal

在 V20 真实目录与 V21 区域供应链网络之上，建立**动态采购智能数据层**，完成渠道定价、项目定价、折扣规则、交期情报四层目录，并通过 Procurement Bundle 与 Commercial Bundle 完成采购聚合与商业联合视图。

```
V20 catalog + V21 supplier-network + V22 procurement → Commercial Bundle
```

## Principle

- **不新增** Runtime
- **不新增** Dashboard
- **不修改** V20 Catalog Foundation
- **不修改** V21 Supplier Network Foundation
- **不修改** Tender Engine · PDF Engine
- **仅建设** 数据资产 · Bridge · Validation · Report

## Frozen Modules

| Module | Path | Phase |
|--------|------|-------|
| Channel Pricing | `channel-pricing/data.ts` | 1 |
| Project Pricing | `project-pricing/data.ts` | 1 |
| Discount Rules | `discount-rules/data.ts` | 1 |
| Lead Time Intelligence | `lead-time-intelligence/data.ts` | 1 |
| Procurement Bundle | `bridge/procurement-bridge.ts` | 2 |
| Commercial Bundle | `bridge/commercial-bridge.ts` | 3 |
| Validation | `validation/validators.ts` | 1–3 |
| Reporting | `report/builders.ts` | 1–3 |

## Module Layout

```
lib/procurement-intelligence/
  shared/types.ts
  channel-pricing/data.ts        # 5 entries, 4 SKUs, multi-channel pricing
  project-pricing/data.ts        # 5 entries, project-type pricing
  discount-rules/data.ts         # 5 rules, bulk/project/tiered
  lead-time-intelligence/data.ts # 6 entries, 4 SKUs, regional lead times
  bridge/
    procurement-bridge.ts        # buildProcurementSnapshot + buildProcurementBundle
    commercial-bridge.ts         # buildCommercialBundle (V20+V21+V22 join)
  validation/validators.ts
  report/builders.ts
  index.ts
```

## Catalog Inventory (Frozen)

| Catalog | Entries | Coverage |
|---------|---------|----------|
| Channel Pricing | 5 | LF-T5, TG-SKILLRUN, SH-T8000, MX-SDRIVE |
| Project Pricing | 5 | commercial-gym, hotel, enterprise, campus, community |
| Discount Rules | 5 | bulk / project / tiered / fixed |
| Lead Time Intelligence | 6 | East/North/South/Southwest China |

## Aggregation Layers

### Procurement Bundle (Phase 2)

```
sku + region + projectType + quantity → { channelPricing, projectPricing, discountRule, leadTime, finalPrice, savings }
```

### Commercial Bundle (Phase 3)

```
sku + city + quantity + projectType
  → V20 buildRealCatalogBundle(sku)
  → V21 buildSupplierNetworkBundle({ brand, city, sku })
  → V22 buildProcurementBundle({ sku, region, projectType, quantity })
  → { catalog, supplierNetwork, procurement, finalPrice, savings, leadTime, readinessScore }
```

**City → Region mapping:** Shanghai/Beijing/Guangzhou/Chengdu/Wuhan → East/North/South/Southwest/Central China

## Boundaries

- **不修改** `lib/real-catalog-foundation/` · `lib/regional-supplier-foundation/`
- **不修改** Tender Engine · Proposal PDF · Budget Engine
- **不新增** Runtime · Dashboard · API routes
- V22 通过只读 Bridge 调用 V20/V21，不侵入冻结边界

## Programmatic Access

```typescript
import {
  buildProcurementBundle,
  buildCommercialBundle,
  validateCommercialBundle,
  buildCommercialBundleReport,
} from "@/lib/procurement-intelligence";

const commercial = buildCommercialBundle({
  sku: "LF-T5-001",
  city: "Shanghai",
  quantity: 10,
  projectType: "commercial-gym",
});
```

## Verification

```bash
npx tsc --noEmit
npm run build
```

Expected: Procurement Readiness Score **100%** · Commercial Readiness Score **100%**

## Freeze Declaration

以下模块自本版本起**冻结**，不得在原边界内扩展 Runtime 或修改目录语义：

- Channel Pricing · Project Pricing · Discount Rules · Lead Time Intelligence
- Procurement Bundle · Commercial Bundle · Validation · Reporting

新能力须以 V23+ 新版本立项，不得增量修改 V22 冻结层。

## Next: Bid Commercial Integration

只读引用 `buildCommercialBundle()` 为投标编排提供「可采购 + 可交付 + 可定价」联合视图，不新增 Runtime。
