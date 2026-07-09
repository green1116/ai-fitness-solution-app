# V74 P1 — Decision Engine Inventory

Declarative decision engine inventory. **Read-only** — no runtime, API, database, or UI changes. V48–V73 untouched.

## Scope (P1 only)

| Concept | Purpose |
|---------|---------|
| Decision Inputs | Signal/metric/knowledge inputs (`DEC-INP-*`) |
| Decision Outputs | Action/recommendation/flag outputs (`DEC-OUT-*`) |
| Decision Context | Deployment and knowledge context (`DEC-CTX-*`) |
| Decision Constraints | Boundary and governance constraints (`DEC-CST-*`) |
| Decision Policies | Declarative decision policies (`DEC-POL-*`) |
| Decision Sources | Upstream version sources (`DEC-SRC-*`) |

## Module layout

```
lib/decision/v74/
  decision.types.ts
  decision.inventory.ts
  decision.dependencies.ts
  decision.scope.ts
  decision.entry.ts
```

## Entry

```ts
import { buildDecisionInventory, runDecisionInventory } from "@/lib/decision/v74/decision.entry";

const report = runDecisionInventory({ deploymentId: "prod" });
```

## Exports

- `V74_DECISION_VERSION` = `v74-decision-inventory-1`
- `buildDecisionInventory()`
- `runDecisionInventory()`

## Upstream (read-only)

- **V73**: `v73-knowledge-freeze-1` / `v73-knowledge-signoff-1` via `decision.dependencies.ts`
- **KNW-*** knowledge refs as declarative sources

## Verify

```bash
npx tsx scripts/verify-v74-p1-decision-inventory.ts
```

## Freeze point (P1)

- `v74-decision-inventory-freeze-1`

## Boundaries

- Declarative inventory only — no decision execution at runtime
