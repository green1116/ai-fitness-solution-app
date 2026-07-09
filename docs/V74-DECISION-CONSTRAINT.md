# V74 P4 — Decision Constraint Catalog

Declarative decision constraint foundation. **Read-only** — no runtime, API, database, or UI changes. V48–V74 P1–P3 untouched.

## Scope (P4 only)

| Type | ID | Purpose |
|------|-----|---------|
| HardRule | DEC-CON-001 | No runtime mutation boundary |
| SoftRule | DEC-CON-002 | Business alignment advisory |
| Priority | DEC-CON-003 | Governance risk ranking |
| Conflict | DEC-CON-004 | Output conflict resolution |
| Dependency | DEC-CON-005 | Acyclic graph requirement |
| Limit | DEC-CON-006 | Evaluation cost bound |
| Precondition | DEC-CON-007 | Compliance gate prerequisite |
| Postcondition | DEC-CON-008 | Inventory completeness verify |

Each entry defines: **Constraint ID**, **Purpose**, **Level**, **Trigger**, **Condition**, **Resolution**, **Priority**, **Validation**.

## Module layout

```
lib/decision/v74/
  decision.constraint.ts
  decision.constraint.catalog.ts
  decision.constraint.builder.ts
  decision.constraint.entry.ts
```

## Entry

```ts
import { buildDecisionConstraintCatalog, runDecisionConstraintCatalog } from "@/lib/decision/v74/decision.constraint.entry";

const report = runDecisionConstraintCatalog({ deploymentId: "prod" });
```

## Exports

- `V74_DECISION_CONSTRAINT_VERSION` = `v74-decision-constraint-catalog-1`
- `buildDecisionConstraintCatalog()`
- `runDecisionConstraintCatalog()`

## Upstream (read-only)

- **P3**: `buildDecisionContextCatalog()`
- **P1**: via chain (`DEC-CST-*`, `DEC-CTX-*`, `DEC-PLC-*`)

## Verify

```bash
npx tsx scripts/verify-v74-p4-decision-constraint.ts
```

## Freeze point (P4)

- `v74-decision-constraint-catalog-freeze-1`

## Boundaries

- Declarative constraint modeling only — no decision execution at runtime
