# V72 P5 — Intelligence Governance

Declarative intelligence governance rules. **Read-only** — no runtime, API, database, or UI changes. V48–V72 P1/P4 untouched.

## Scope (P5 only)

| Concept | Purpose |
|---------|---------|
| GovernanceRule | Scoped governance rule (`INT-GOV-*`) |
| GovernanceScope | global / insight / signal / metric |
| Approval | required / approved / waived / rejected |
| Review | Pre-governance review (`INT-GOV-REV-*`) |
| Exception | Waiver record (`INT-GOV-EXC-*`) |
| Escalation | Failure escalation (`INT-GOV-ESC-*`) |
| AuditTrail | Audit event (`INT-GOV-AUD-*`) |
| FreezeGate | Freeze version gate (`INT-GOV-FRZ-*`) |
| Signoff | Governance signoff (`INT-GOV-SIG-*`) |
| RiskLevel | low / medium / high / critical |

## Module layout

```
lib/intelligence/v72/
  intelligence.governance.ts
  governance.rules.ts
  governance.builder.ts
  governance.entry.ts
```

## Entry

```ts
import { buildIntelligenceGovernance, runIntelligenceGovernance } from "@/lib/intelligence/v72/governance.entry";

const report = runIntelligenceGovernance({ deploymentId: "prod" });
```

## Exports

- `V72_INTELLIGENCE_GOVERNANCE_VERSION` = `v72-intelligence-governance-1`
- `V72_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION` = `v72-intelligence-governance-freeze-1`
- `buildIntelligenceGovernance()`
- `runIntelligenceGovernance()`

## Upstream (read-only)

- **P4**: `buildIntelligenceCompatibility()`
- **P1**: via P4 chain (`INT-*`, `INT-VPX-*`)

## Verify

```bash
npx tsx scripts/verify-v72-p5-intelligence-governance.ts
```

## Freeze point (P5)

- `v72-intelligence-governance-freeze-1`

## Boundaries

- Declarative governance only — not enforced at runtime
