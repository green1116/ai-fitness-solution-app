# V74 P7 — Decision Compliance Catalog

Declarative decision compliance domain catalog. **Read-only** — no runtime, API, database, audit engine, or AI inference. V48–V74 P1–P6 untouched.

## Scope (P7 only)

| Domain | ID | Purpose |
|--------|-----|---------|
| PolicyMatch | DEC-CMP-001 | Policy catalog alignment |
| ConstraintMatch | DEC-CMP-002 | Constraint catalog alignment |
| ContextIntegrity | DEC-CMP-003 | Context catalog integrity |
| EvaluationIntegrity | DEC-CMP-004 | Evaluation catalog integrity |
| SimulationIntegrity | DEC-CMP-005 | Simulation catalog integrity |
| AuditTrace | DEC-CMP-006 | Declarative audit evidence |
| VersionConsistency | DEC-CMP-007 | Phase version lock consistency |
| RollbackReadiness | DEC-CMP-008 | Rollback preview readiness |

Each entry defines: **Compliance ID**, **Purpose**, **Inputs**, **Outputs**, **Criteria**, **Evidence**, **Status**, **Validation**.

## Module layout

```
lib/decision/v74/
  decision.compliance.ts
  decision.compliance.catalog.ts
  decision.compliance.builder.ts
  decision.compliance.entry.ts
```

## Entry

```ts
import { buildDecisionComplianceCatalog, runDecisionComplianceCatalog } from "@/lib/decision/v74/decision.compliance.entry";

const report = runDecisionComplianceCatalog({ deploymentId: "prod" });
```

## Exports

- `V74_DECISION_COMPLIANCE_VERSION` = `v74-decision-compliance-catalog-1`
- `buildDecisionComplianceCatalog()`
- `runDecisionComplianceCatalog()`

## Upstream (read-only)

- **P6**: `buildDecisionSimulationCatalog()`
- **P1–P5**: via chain (`DEC-INP-*`, `DEC-OUT-*`, `DEC-PLC-*`, `DEC-CON-*`, `DEC-CTX-*`, `DEC-EVAL-*`, `DEC-SIM-*`)

## Verify

```bash
npx tsx scripts/verify-v74-p7-decision-compliance.ts
```

## Freeze point (P7)

- `v74-decision-compliance-catalog-freeze-1`

## Boundaries

- Declarative compliance metadata only — no audit enforcement at runtime
