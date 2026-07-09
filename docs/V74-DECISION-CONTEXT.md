# V74 P3 — Decision Context Catalog

Declarative decision context domain catalog. **Read-only** — no runtime, API, database, or UI changes. V48–V74 P1/P2 untouched.

## Scope (P3 only)

| Domain | ID | Purpose |
|--------|-----|---------|
| User | DEC-CTX-001 | Operator identity boundary |
| Workspace | DEC-CTX-002 | Workspace-scoped decisions |
| Organization | DEC-CTX-003 | Organization governance context |
| Knowledge | DEC-CTX-004 | Knowledge freeze context |
| Runtime | DEC-CTX-005 | No-runtime exclusion boundary |
| Workflow | DEC-CTX-006 | Declarative workflow reference |
| Environment | DEC-CTX-007 | Deployment environment context |
| History | DEC-CTX-008 | Audit history context |

Each entry defines: **Context ID**, **Purpose**, **Inputs**, **Outputs**, **Priority**, **Dependencies**, **Validation**.

## Module layout

```
lib/decision/v74/
  decision.context.ts
  decision.context.catalog.ts
  decision.context.builder.ts
  decision.context.entry.ts
```

## Entry

```ts
import { buildDecisionContextCatalog, runDecisionContextCatalog } from "@/lib/decision/v74/decision.context.entry";

const report = runDecisionContextCatalog({ deploymentId: "prod" });
```

## Exports

- `V74_DECISION_CONTEXT_VERSION` = `v74-decision-context-catalog-1`
- `buildDecisionContextCatalog()`
- `runDecisionContextCatalog()`

## Upstream (read-only)

- **P2**: `buildDecisionPolicyCatalog()`
- **P1**: via P2 chain (`DEC-INP-*`, `DEC-OUT-*`, `DEC-DEP-*`, inventory `DEC-CTX-*`)

## Verify

```bash
npx tsx scripts/verify-v74-p3-decision-context.ts
```

## Freeze point (P3)

- `v74-decision-context-catalog-freeze-1`

## Boundaries

- Declarative context modeling only — no decision execution at runtime
