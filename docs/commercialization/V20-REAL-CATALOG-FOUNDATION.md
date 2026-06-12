# V20 Real Catalog Foundation

**Version:** `v20-real-catalog-foundation-1`  
**Status:** Industry-real data asset layer  
**Predecessor:** V19.6 Tender Response Pack Composer (`v19.6-tender-response-pack`)  
**Successor:** V20+ Tender Strategy Space

## Goal

停止 Runtime 扩张，开始建设真实行业数据资产，让投标方案从「逻辑正确」升级为「行业真实可采购」。

```
readiness-stub 数据 → real-catalog 行业真实数据资产
```

## Principle

- **不新增** Runtime
- **不新增** Dashboard
- **优先建设** 真实品牌库 · 真实设备库 · 真实价格库 · 真实维护库 · 真实更换库

## Catalogs

| Catalog | Data File | Verify |
|---------|-----------|--------|
| Real Brand Catalog | `brand-catalog/data.ts` | `npm run verify:real-brand-catalog` |
| Real Equipment Catalog | `equipment-catalog/data.ts` | `npm run verify:real-equipment-catalog` |
| Real Pricing Catalog | `pricing-catalog/data.ts` | `npm run verify:real-pricing-catalog` |
| Real Maintenance Catalog | `maintenance-catalog/data.ts` | `npm run verify:real-maintenance-catalog` |
| Real Replacement Catalog | `replacement-catalog/data.ts` | `npm run verify:real-replacement-catalog` |

Master: `npm run verify:real-catalog-foundation`

## Module Layout

```
lib/real-catalog-foundation/
  shared/types.ts
  brand-catalog/data.ts          # 7 brands with distributor info
  equipment-catalog/data.ts      # 10 SKUs with specs + datasheets
  pricing-catalog/data.ts        # CNY list/dealer/project prices
  maintenance-catalog/data.ts    # Service intervals + costs
  replacement-catalog/data.ts    # Lifecycle + upgrade paths
  validation/validators.ts       # Cross-catalog integrity checks
  bridge/catalog-bridge.ts       # Bundle queries for downstream
  report/
  evidence.ts
  index.ts
```

## Brands (Real Catalog)

| Brand | Tier | Origin |
|-------|------|--------|
| Technogym | premium | Italy |
| Life Fitness | premium | USA |
| Matrix | mid-market | USA |
| Shuhua | domestic | China |
| Johnson | commercial | Taiwan |
| Impulse | value | China |
| IntelligentFit | commercial | China |

## Boundaries

- **不修改** Proposal Engine · Proposal PDF · Budget Engine · Commercial Delivery · Knowledge Base · AI Integration
- **不新增** Runtime · Dashboard · API routes
- 现有 Runtime 层继续运行；真实目录为独立数据资产，供后续版本接入

## Verification

```bash
npx tsc --noEmit
npm run build
npm run verify:real-brand-catalog
npm run verify:real-equipment-catalog
npm run verify:real-pricing-catalog
npm run verify:real-maintenance-catalog
npm run verify:real-replacement-catalog
npm run verify:real-catalog-foundation
```

Expected: `catalogIntegrityScore >= 90%` · `purchasabilityScore >= 85%`

## Next: Tender Strategy Space
