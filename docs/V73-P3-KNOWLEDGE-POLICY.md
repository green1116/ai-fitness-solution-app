# V73 P3 — Knowledge Policy

Declarative knowledge policy rules. **Read-only** — no runtime, API, database, or UI changes. V48–V73 P1/P2 untouched.

## Scope (P3 only)

| Concept | Purpose |
|---------|---------|
| PolicyRule | Scoped policy rule (`KNW-POL-*`) |
| PolicyScope | global / document / topic / category |
| PolicyConstraint | dependency-acyclic, catalog-complete, confidence-threshold, etc. |
| Allowed | Permitted values or states |
| Blocked | Blocked values or states |
| RequiredCheck | Pre-policy check (`KNW-CHK-*`) |
| Exception | Waiver record (`KNW-EXC-*`) |
| Enforcement | declarative / gate / audit-only |
| AuditTrail | Audit event (`KNW-AUD-*`) |

## Module layout

```
lib/knowledge/v73/
  knowledge.policy.ts
  policy.rules.ts
  policy.builder.ts
  policy.entry.ts
```

## Entry

```ts
import { buildKnowledgePolicy, runKnowledgePolicy } from "@/lib/knowledge/v73/policy.entry";

const report = runKnowledgePolicy({ deploymentId: "prod" });
```

## Exports

- `V73_KNOWLEDGE_POLICY_VERSION` = `v73-knowledge-policy-1`
- `V73_KNOWLEDGE_POLICY_FREEZE_VERSION` = `v73-knowledge-policy-freeze-1`
- `buildKnowledgePolicy()`
- `runKnowledgePolicy()`

## Upstream (read-only)

- **P2**: `buildKnowledgeDependency()`
- **P1**: via P2 chain (`KNW-*` refs)

## Verify

```bash
npx tsx scripts/verify-v73-p3-knowledge-policy.ts
```

## Freeze point (P3)

- `v73-knowledge-policy-freeze-1`

## Boundaries

- Declarative policy only — not enforced at runtime
