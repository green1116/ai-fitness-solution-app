# V23 Bid Commercial Integration

**Version:** `v23-bid-commercial-integration-4`  
**Status:** Frozen — commercial → proposal integration layer  
**Tag:** `v23-bid-commercial-integration`  
**Predecessor:** V22 Dynamic Procurement Intelligence (`v22-procurement-intelligence-3`)  
**Successor:** V24+ Multi-SKU / Regional Expansion (read-only extension)

## Goal

在 V20 真实目录、V21 区域供应链与 V22 动态采购之上，建立**投标商业集成层**，完成从商业数据到投标方案章节的端到端只读聚合：

```
V20 catalog + V21 supplier + V22 procurement
  → BidCommercialBundle
  → Commercial Proposal Sections
  → Commercial Proposal Pack
  → Validation + Reporting + Freeze Evidence
```

## Principle

- **不新增** Runtime
- **不新增** Dashboard
- **不修改** V20 Real Catalog Foundation
- **不修改** V21 Regional Supplier Network Foundation
- **不修改** V22 Dynamic Procurement Intelligence
- **不修改** PDF Engine · Tender Engine
- **仅建设** Bridge · Proposal Sections · Composer Integration · Validation · Report · Freeze Evidence

## Frozen Modules

| Domain | Path | Phase |
|--------|------|-------|
| Bid Commercial Bundle | `bridge/commercial-bid-bridge.ts` | 1 |
| Proposal Sections | `proposal-sections/` | 2 |
| Commercial Proposal Pack | `proposal-composer-integration/` | 3 |
| Validation | `validation/` + `proposal-composer-integration/validation/` + `freeze/validators.ts` | 1–Freeze |
| Reporting | `report/` + `proposal-composer-integration/report/` + `freeze/report/` | 1–Freeze |
| Freeze Evidence | `freeze/evidence.ts` | Freeze |

## Module Layout

```
lib/bid-commercial-integration/
  shared/types.ts
  bridge/commercial-bid-bridge.ts           # buildBidCommercialBundle
  proposal-sections/
    equipment-section/builders.ts           # V20 catalog → 设备章节
    supply-chain-section/builders.ts        # V21 supplier → 供应链章节
    procurement-section/builders.ts         # V22 procurement → 采购章节
    delivery-section/builders.ts            # V21+V22 → 交付章节
    builders.ts                             # buildCommercialProposalSections
  proposal-composer-integration/
    bridge/proposal-composer-bridge.ts      # buildCommercialProposalPack
    validation/validators.ts
    report/builders.ts
  freeze/
    constants.ts                            # canonical query + frozen domains
    coverage.ts                             # 5-dimension coverage stats
    validators.ts                           # validateCommercialProposalFreeze
    evidence.ts                             # buildCommercialProposalFreezeEvidence
    report/builders.ts                      # buildCommercialProposalFreezeReport
  validation/validators.ts
  report/builders.ts
  index.ts
```

## Three-Layer Aggregation

### Phase 1 — BidCommercialBundle

```
sku + city + quantity + projectType
  → V20 buildRealCatalogBundle(sku)
  → V21 buildSupplierNetworkBundle({ brand, city, sku })
  → V22 buildCommercialBundle({ sku, city, quantity, projectType })
  → { catalog, supplierNetwork, procurement, finalPrice, savings, leadTime, readinessScore }
```

### Phase 2 — Commercial Proposal Sections

```
BidCommercialBundle
  → buildEquipmentSection(catalog)
  → buildSupplyChainSection(supplierNetwork)
  → buildProcurementSection(procurement, savings)
  → buildDeliverySection(leadTime, service, inventory)
  → ProposalSection[4]
```

### Phase 3 — Commercial Proposal Pack

```
BidCommercialBundle + ProposalSection[]
  → composeProposalPackFromSections()
  → { equipmentSection, supplyChainSection, procurementSection, deliverySection, integrationReadiness }
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
| Catalog Coverage | V20 canonical bundle | brand + equipment + pricing + maintenance + replacement |
| Supplier Coverage | V21 supplier network bundle | supplier + dealer + inventory + service + coverage |
| Procurement Coverage | V22 procurement bundle | channel + project + discount + lead time |
| Proposal Section Coverage | Phase 2 sections | 4/4 sections with readiness > 0 |
| Proposal Pack Coverage | Phase 3 pack | 4 mapped sections + integrationReadiness |

## Scoring (Frozen)

| Score | Definition |
|-------|------------|
| Readiness Score | `CommercialProposalPack.integrationReadiness` |
| Validation Score | 22-gate freeze validation pass rate |
| Commercial Coverage Score | Average of 5 coverage dimensions |

## Programmatic Access

```typescript
import {
  buildCommercialProposalPack,
  validateCommercialProposalFreeze,
  buildCommercialProposalFreezeReport,
  buildCommercialProposalFreezeEvidence,
} from "@/lib/bid-commercial-integration";

const pack = buildCommercialProposalPack({
  sku: "LF-T5-001",
  city: "Shanghai",
  quantity: 10,
  projectType: "commercial-gym",
});

const validation = validateCommercialProposalFreeze();
const report = buildCommercialProposalFreezeReport();
const evidence = buildCommercialProposalFreezeEvidence();
```

## Verification Gate

```bash
npx tsc --noEmit   # PASS
npm run build      # PASS
```

## Freeze Boundary

| In scope (frozen) | Out of scope |
|-------------------|--------------|
| BidCommercialBundle + 4 Proposal Sections + CommercialProposalPack | V20 / V21 / V22 catalog modifications |
| 22-gate validation + 5-dimension coverage + evidence | New Runtime / Dashboard |
| Tender Response Pack compatibility check (read-only) | PDF Engine / Tender Engine changes |

**Tag:** `v23-bid-commercial-integration`
