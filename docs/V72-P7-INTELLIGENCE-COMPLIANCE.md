# V72 P7 — Intelligence Compliance

Declarative intelligence compliance checklist. **Read-only** — no runtime, API, database, or UI changes. V48–V72 P1/P6 untouched.

## Scope (P7 only)

| Concept | Purpose |
|---------|---------|
| ComplianceItem | Per-insight compliance record (`INT-CMP-*`) |
| Required | Mandatory compliance flag |
| Passed | Check passed flag |
| Failed | Check failed flag |
| Evidence | Declarative evidence reference |
| Review | pending / approved / rejected / waived |
| Exception | Waiver record (`INT-CMP-EXC-*`) |
| AuditTrail | Audit event (`INT-CMP-AUD-*`) |
| FreezeGate | Freeze verify gate (`INT-CMP-GATE-*`) |
| Signoff | Role signoff (`INT-CMP-SIGN-*`) |

## Module layout

```
lib/intelligence/v72/
  intelligence.compliance.ts
  compliance.checklist.ts
  compliance.builder.ts
  compliance.entry.ts
```

## Entry

```ts
import { buildIntelligenceCompliance, runIntelligenceCompliance } from "@/lib/intelligence/v72/compliance.entry";

const report = runIntelligenceCompliance({ deploymentId: "prod" });
```

## Exports

- `V72_INTELLIGENCE_COMPLIANCE_VERSION` = `v72-intelligence-compliance-1`
- `V72_INTELLIGENCE_COMPLIANCE_FREEZE_VERSION` = `v72-intelligence-compliance-freeze-1`
- `buildIntelligenceCompliance()`
- `runIntelligenceCompliance()`

## Upstream (read-only)

- **P6**: `buildIntelligenceLifecycle()`
- **P1**: via P6 chain (`INT-*`, `INT-LCS-*`)

## Verify

```bash
npx tsx scripts/verify-v72-p7-intelligence-compliance.ts
```

## Freeze point (P7)

- `v72-intelligence-compliance-freeze-1`

## Boundaries

- Declarative compliance only — not enforced at runtime
