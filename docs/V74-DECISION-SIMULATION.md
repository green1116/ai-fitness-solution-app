# V74 P6 — Decision Simulation Catalog

Declarative decision simulation type catalog. **Read-only** — no runtime, API, database, prediction engine, or AI inference. V48–V74 P1–P5 untouched.

## Scope (P6 only)

| Type | ID | Purpose |
|------|-----|---------|
| DryRun | DEC-SIM-001 | Inventory readiness dry-run |
| Scenario | DEC-SIM-002 | Governance risk scenario |
| Alternative | DEC-SIM-003 | Compatibility skip alternative |
| Comparison | DEC-SIM-004 | Dependency graph comparison |
| Ranking | DEC-SIM-005 | Policy candidate ranking |
| Forecast | DEC-SIM-006 | Lifecycle transition forecast |
| Sensitivity | DEC-SIM-007 | Confidence threshold sensitivity |
| RollbackPreview | DEC-SIM-008 | Rollback path preview |

Each entry defines: **Simulation ID**, **Purpose**, **Inputs**, **Outputs**, **Assumptions**, **Expected Result**, **Priority**, **Validation**.

## Module layout

```
lib/decision/v74/
  decision.simulation.ts
  decision.simulation.catalog.ts
  decision.simulation.builder.ts
  decision.simulation.entry.ts
```

## Entry

```ts
import { buildDecisionSimulationCatalog, runDecisionSimulationCatalog } from "@/lib/decision/v74/decision.simulation.entry";

const report = runDecisionSimulationCatalog({ deploymentId: "prod" });
```

## Exports

- `V74_DECISION_SIMULATION_VERSION` = `v74-decision-simulation-catalog-1`
- `buildDecisionSimulationCatalog()`
- `runDecisionSimulationCatalog()`

## Upstream (read-only)

- **P5**: `buildDecisionEvaluationCatalog()`
- **P1–P4**: via chain (`DEC-INP-*`, `DEC-OUT-*`, `DEC-EVAL-*`, `DEC-CTX-*`)

## Verify

```bash
npx tsx scripts/verify-v74-p6-decision-simulation.ts
```

## Freeze point (P6)

- `v74-decision-simulation-catalog-freeze-1`

## Boundaries

- Declarative simulation metadata only — no simulation execution at runtime
