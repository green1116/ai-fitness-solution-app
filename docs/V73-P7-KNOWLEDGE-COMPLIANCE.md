# V73 P7 — Knowledge Compliance

Declarative knowledge compliance checklist. **Read-only** — no runtime, API, database, or UI changes. V48–V73 P1/P6 untouched.

## Scope (P7 only)

| Concept | Purpose |
|---------|---------|
| ComplianceItem | Per-knowledge compliance record (`KNW-CMP-*`) |
| Required | Whether compliance is mandatory |
| Passed | Pass flag |
| Failed | Fail flag |
| Evidence | Verification evidence string |
| Review | Review status (pending / approved / rejected / waived) |
| Exception | Waiver record (`KNW-CMP-EXC-*`) |
| AuditTrail | Audit event (`KNW-CMP-AUD-*`) |
| FreezeGate | Freeze version gate (`KNW-CMP-GATE-*`) |
| Signoff | Compliance signoff (`KNW-CMP-SIGN-*`) |

## Module layout

```
lib/knowledge/v73/
  knowledge.compliance.ts
  compliance.checklist.ts
  compliance.builder.ts
  compliance.entry.ts
```

## Entry

```ts
import { buildKnowledgeCompliance, runKnowledgeCompliance } from "@/lib/knowledge/v73/compliance.entry";

const report = runKnowledgeCompliance({ deploymentId: "prod" });
```

## Exports

- `V73_KNOWLEDGE_COMPLIANCE_VERSION` = `v73-knowledge-compliance-1`
- `V73_KNOWLEDGE_COMPLIANCE_FREEZE_VERSION` = `v73-knowledge-compliance-freeze-1`
- `buildKnowledgeCompliance()`
- `runKnowledgeCompliance()`

## Upstream (read-only)

- **P6**: `buildKnowledgeLifecycle()`
- **P1**: via P6 chain (`KNW-*`, `KNW-LCS-*`)

## Verify

```bash
npx tsx scripts/verify-v73-p7-knowledge-compliance.ts
```

## Freeze point (P7)

- `v73-knowledge-compliance-freeze-1`

## Boundaries

- Declarative compliance modeling only — not enforced at runtime
