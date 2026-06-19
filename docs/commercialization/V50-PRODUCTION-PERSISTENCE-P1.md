# V50 Production Persistence — P1 Schema Foundation

**Tag:** `v50-production-persistence-p1`

## Goal

Establish the minimal Prisma persistence skeleton for V50:

- Workspace
- Quote
- WorkflowInstance (QUOTE only)
- WorkflowHistory
- WorkflowEvent (Audit)

No V49 runtime wiring in P1. No Approval / Delivery / Release.

## Prisma Tables

| Model | Table |
|-------|-------|
| `Workspace` | `saas_product_workspace` |
| `Quote` | `saas_product_quote` |
| `WorkflowInstance` | `saas_product_workflow_instance` |
| `WorkflowHistory` | `saas_product_workflow_history` |
| `WorkflowEvent` | `saas_product_workflow_event` |

## Module

```
lib/saas-product-persistence/
  shared/persistence-types.ts
  shared/persistence-errors.ts
  shared/persistence-constants.ts
  validation/validate-persistence-p1.ts
  index.ts
```

## Commands

```bash
npx prisma migrate deploy
npx prisma generate
npm run verify:v50-p1
npx tsc --noEmit
```

## P1 Gate

- Migration `20260618120000_v50_p1_schema` applied
- `verify:v50-p1` PASS
- V49 `verify:saas-product-p8` PASS

## Next

**P2 — Repository Foundation**
