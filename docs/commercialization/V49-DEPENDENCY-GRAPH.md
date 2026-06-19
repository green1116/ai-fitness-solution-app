# V49 Dependency Graph

## Required Direction

```
P1 → P2 → P3 → P4 → P5 → P6 → P7
```

## Edge Map

| From | To | Via |
|------|-----|-----|
| P1 | P2 | `resolveProduct`, workflow stage catalog |
| P2 | P3 | `ProductContext` → `WorkspaceProductInstance` |
| P3 | P4 | `workspaceProductId` → quote workflow |
| P4 | P5 | shared workflow repository + business state machine |
| P2~P5 | P6 | portal read adapters |
| P2~P6 | P7 | ops read adapters + portal summary |

## Forbidden Patterns (Audited in P8)

| Pattern | Reason |
|---------|--------|
| P6/P7 → V47 runtime | No commercial execution in exposure/ops layers |
| P6/P7 → `transitionWorkflow` | No workflow mutation in portal/ops |
| P7 → bypass P3 workspace scope | Ops must respect tenant/workspace binding |
| P6/P7 → P1 registry direct skip | Must aggregate through runtime layers |
| Any V49 layer → Prisma/DB | Headless runtime only |

## Allowed Exceptions (Documented)

| Pattern | Reason |
|---------|--------|
| P1 → V47 `product-catalog` | Catalog read-only alignment |
| P4 `workflow-mapper` → P1 mapping | Adapter context mapping only |
| P7 → `updateWorkspaceProductStatus` | Lifecycle control (status field only) |

## Verification

```bash
npm run verify:saas-product-p8
```

Audit checks: `crossLayerClean`, `v47BoundaryClean`, `mutationLeakFree`.
