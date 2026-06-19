# V49 SaaS Product — Phase 1

**Tag:** `v49-saas-product-p1`

## Goal

Establish the Product Registry Foundation for the SaaS Product Layer: product catalog, workflow stage catalog, workspace product bindings, and V47 module mapping.

## Principles

- No V38–V48 modifications
- No V47 runtime imports (catalog read-only only)
- No P1 schema or migration changes
- P1 is registry/catalog only — no UI, no workflow execution

## Components

| Layer | Module |
|-------|--------|
| Product Registry | `resolveProduct()`, `listProducts()`, `listProductsForPortal()` |
| Workflow Catalog | `resolveWorkflowStage()`, `listWorkflowStages()` |
| Workspace Catalog | `listWorkspaceProductsForPortal()` |
| V47 Mapping | `mapProductToV47Module()`, `mapWorkflowToV47Module()` |

## Products (aligned with V47 SKU)

| Product Code | Portal | Workflows |
|--------------|--------|-----------|
| kickstart-package | enterprise, contractor | quote, package |
| tender-ready-package | enterprise, contractor | quote, package, approval |
| delivery-intelligence-package | enterprise, contractor | quote, package, delivery, approval, audit, release |

## Workflow Stages

| Key | Stages | V47 Module |
|-----|--------|------------|
| commercial.quote | intake → quote → executed | access-layer/quote |
| commercial.package | build → validate → ready | package/ |
| commercial.delivery | orchestrate → execute → complete | orchestration/ |
| commercial.approval | submit → review → approved | approval/ |
| commercial.audit | record → query → export | audit/ |
| commercial.release | prepare → publish → ledger | release/ |

## Commands

```bash
npm run verify:saas-product-p1
```

## Next Phase

- **P2:** Product Context Runtime — `resolveProductContext()`
