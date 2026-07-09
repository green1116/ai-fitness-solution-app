# V74 P5 — Decision Evaluation Catalog

Declarative decision evaluation dimension catalog. **Read-only** — no runtime, API, database, scoring logic, or UI changes. V48–V74 P1–P4 untouched.

## Scope (P5 only)

| Dimension | ID | Purpose |
|-----------|-----|---------|
| Score | DEC-EVAL-001 | Readiness score dimension |
| Confidence | DEC-EVAL-002 | Compliance confidence dimension |
| Risk | DEC-EVAL-003 | Governance risk dimension |
| Quality | DEC-EVAL-004 | Compatibility quality dimension |
| Cost | DEC-EVAL-005 | Evaluation cost dimension |
| Benefit | DEC-EVAL-006 | Business benefit dimension |
| Impact | DEC-EVAL-007 | Lifecycle impact dimension |
| Explainability | DEC-EVAL-008 | Declarative audit dimension |

Each entry defines: **Evaluation ID**, **Purpose**, **Inputs**, **Outputs**, **Metrics**, **Threshold**, **Priority**, **Validation**.

## Module layout

```
lib/decision/v74/
  decision.evaluation.ts
  decision.evaluation.catalog.ts
  decision.evaluation.builder.ts
  decision.evaluation.entry.ts
```

## Entry

```ts
import { buildDecisionEvaluationCatalog, runDecisionEvaluationCatalog } from "@/lib/decision/v74/decision.evaluation.entry";

const report = runDecisionEvaluationCatalog({ deploymentId: "prod" });
```

## Exports

- `V74_DECISION_EVALUATION_VERSION` = `v74-decision-evaluation-catalog-1`
- `buildDecisionEvaluationCatalog()`
- `runDecisionEvaluationCatalog()`

## Upstream (read-only)

- **P4**: `buildDecisionConstraintCatalog()`
- **P1–P3**: via chain (`DEC-INP-*`, `DEC-OUT-*`, `DEC-CON-*`, `DEC-CTX-*`)

## Verify

```bash
npx tsx scripts/verify-v74-p5-decision-evaluation.ts
```

## Freeze point (P5)

- `v74-decision-evaluation-catalog-freeze-1`

## Boundaries

- Declarative evaluation metadata only — no scoring execution at runtime
