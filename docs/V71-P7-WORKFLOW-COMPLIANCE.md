# V71 P7 — Workflow Compliance

Declarative workflow compliance checklist. **Read-only** — no runtime, API, database, or UI changes. V48–V71 P1/P6 untouched.

## Scope (P7 only)

| Concept | Purpose |
|---------|---------|
| ComplianceItem | Per-orchestration compliance record (`ORC-CMP-*`) |
| Required | Mandatory compliance flag |
| Passed | Check passed flag |
| Failed | Check failed flag |
| Evidence | Declarative evidence reference |
| Review | pending / approved / rejected / waived |
| Exception | Waiver record (`ORC-CMP-EXC-*`) |
| AuditTrail | Audit event (`ORC-CMP-AUD-*`) |
| FreezeGate | Freeze verify gate (`ORC-CMP-GATE-*`) |
| Signoff | Role signoff (`ORC-CMP-SIGN-*`) |

## Module layout

```
lib/orchestration/v71/
  workflow.compliance.ts
  compliance.checklist.ts
  compliance.builder.ts
  compliance.entry.ts
```

## Entry

```ts
import { buildWorkflowCompliance, runWorkflowCompliance } from "@/lib/orchestration/v71/compliance.entry";

const report = runWorkflowCompliance({ deploymentId: "prod" });
```

## Exports

- `V71_WORKFLOW_COMPLIANCE_VERSION` = `v71-workflow-compliance-1`
- `V71_WORKFLOW_COMPLIANCE_FREEZE_VERSION` = `v71-workflow-compliance-freeze-1`
- `buildWorkflowCompliance()`
- `runWorkflowCompliance()`

## Upstream (read-only)

- **P6**: `buildWorkflowLifecycle()`
- **P1**: via P6 chain (`ORC-*`, `ORC-LCS-*`)

## Verify

```bash
npx tsx scripts/verify-v71-p7-workflow-compliance.ts
```

## Freeze point (P7)

- `v71-workflow-compliance-freeze-1`

## Boundaries

- Declarative compliance only — not enforced at runtime
