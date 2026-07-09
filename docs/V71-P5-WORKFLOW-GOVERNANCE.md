# V71 P5 — Workflow Governance

Declarative workflow governance rules. **Read-only** — no runtime, API, database, or UI changes. V48–V71 P1/P4 untouched.

## Scope (P5 only)

| Concept | Purpose |
|---------|---------|
| GovernanceRule | Scoped governance rule (`ORC-GOV-*`) |
| GovernanceScope | global / workflow / orchestration / action |
| Approval | required / approved / waived / rejected |
| Review | Pre-governance review (`ORC-GOV-REV-*`) |
| Exception | Waiver record (`ORC-GOV-EXC-*`) |
| Escalation | Failure escalation (`ORC-GOV-ESC-*`) |
| AuditTrail | Audit event (`ORC-GOV-AUD-*`) |
| FreezeGate | Freeze version gate (`ORC-GOV-FRZ-*`) |
| Signoff | Governance signoff (`ORC-GOV-SIG-*`) |
| RiskLevel | low / medium / high / critical |

## Module layout

```
lib/orchestration/v71/
  workflow.governance.ts
  governance.rules.ts
  governance.builder.ts
  governance.entry.ts
```

## Entry

```ts
import { buildWorkflowGovernance, runWorkflowGovernance } from "@/lib/orchestration/v71/governance.entry";

const report = runWorkflowGovernance({ deploymentId: "prod" });
```

## Exports

- `V71_WORKFLOW_GOVERNANCE_VERSION` = `v71-workflow-governance-1`
- `V71_WORKFLOW_GOVERNANCE_FREEZE_VERSION` = `v71-workflow-governance-freeze-1`
- `buildWorkflowGovernance()`
- `runWorkflowGovernance()`

## Upstream (read-only)

- **P4**: `buildWorkflowCompatibility()`
- **P1**: via P4 chain (`ORC-*`, `ORC-WPX-*`)

## Verify

```bash
npx tsx scripts/verify-v71-p5-workflow-governance.ts
```

## Freeze point (P5)

- `v71-workflow-governance-freeze-1`

## Boundaries

- Declarative governance only — not enforced at runtime
