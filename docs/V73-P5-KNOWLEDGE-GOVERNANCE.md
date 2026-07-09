# V73 P5 — Knowledge Governance

Declarative knowledge governance rules. **Read-only** — no runtime, API, database, or UI changes. V48–V73 P1/P4 untouched.

## Scope (P5 only)

| Concept | Purpose |
|---------|---------|
| GovernanceRule | Scoped governance rule (`KNW-GOV-*`) |
| GovernanceScope | global / document / topic / category |
| Approval | required / approved / waived / rejected |
| Review | Pre-governance review (`KNW-GOV-REV-*`) |
| Exception | Waiver record (`KNW-GOV-EXC-*`) |
| Escalation | Failure escalation (`KNW-GOV-ESC-*`) |
| AuditTrail | Audit event (`KNW-GOV-AUD-*`) |
| FreezeGate | Freeze version gate (`KNW-GOV-FRZ-*`) |
| Signoff | Governance signoff (`KNW-GOV-SIG-*`) |
| RiskLevel | low / medium / high / critical |

## Module layout

```
lib/knowledge/v73/
  knowledge.governance.ts
  governance.rules.ts
  governance.builder.ts
  governance.entry.ts
```

## Entry

```ts
import { buildKnowledgeGovernance, runKnowledgeGovernance } from "@/lib/knowledge/v73/governance.entry";

const report = runKnowledgeGovernance({ deploymentId: "prod" });
```

## Exports

- `V73_KNOWLEDGE_GOVERNANCE_VERSION` = `v73-knowledge-governance-1`
- `V73_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION` = `v73-knowledge-governance-freeze-1`
- `buildKnowledgeGovernance()`
- `runKnowledgeGovernance()`

## Upstream (read-only)

- **P4**: `buildKnowledgeCompatibility()`
- **P1**: via P4 chain (`KNW-*`, `KNW-VPX-*`)

## Verify

```bash
npx tsx scripts/verify-v73-p5-knowledge-governance.ts
```

## Freeze point (P5)

- `v73-knowledge-governance-freeze-1`

## Boundaries

- Declarative governance only — not enforced at runtime
