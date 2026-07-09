# V72 P3 — Intelligence Policy

Declarative intelligence policy rules. **Read-only** — no runtime, API, database, or UI changes. V48–V72 P1/P2 untouched.

## Scope (P3 only)

| Concept | Purpose |
|---------|---------|
| PolicyRule | Scoped rule with constraint, allowed/blocked sets |
| PolicyScope | global / insight / signal / metric |
| PolicyConstraint | dependency-acyclic, catalog-complete, confidence-threshold, etc. |
| Allowed | Permitted values or states |
| Blocked | Denied values or states |
| RequiredCheck | Pass condition per rule (`INT-CHK-*`) |
| Exception | Waiver record per rule (`INT-EXC-*`) |
| Enforcement | declarative / gate / audit-only |
| AuditTrail | Audit event per rule (`INT-AUD-*`) |

## Module layout

```
lib/intelligence/v72/
  intelligence.policy.ts
  policy.rules.ts
  policy.builder.ts
  policy.entry.ts
```

## Entry

```ts
import { buildIntelligencePolicy, runIntelligencePolicy } from "@/lib/intelligence/v72/policy.entry";

const report = runIntelligencePolicy({ deploymentId: "prod" });
```

## Exports

- `V72_INTELLIGENCE_POLICY_VERSION` = `v72-intelligence-policy-1`
- `V72_INTELLIGENCE_POLICY_FREEZE_VERSION` = `v72-intelligence-policy-freeze-1`
- `buildIntelligencePolicy()`
- `runIntelligencePolicy()`

## Upstream (read-only)

- **P2**: `buildSignalDependency()`
- **P1**: via P2 chain

## Verify

```bash
npx tsx scripts/verify-v72-p3-intelligence-policy.ts
```

## Freeze point (P3)

- `v72-intelligence-policy-freeze-1`

## Boundaries

- Declarative policy only — not enforced at runtime
