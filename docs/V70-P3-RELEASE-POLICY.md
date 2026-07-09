# V70 P3 — Release Policy

Declarative release policy rules. **Read-only** — no runtime, API, database, or UI changes. V48–V70 P1/P2 untouched.

## Scope (P3 only)

| Concept | Purpose |
|---------|---------|
| PolicyRule | Scoped rule with constraint, allowed/blocked sets |
| PolicyScope | global / channel / stage / release |
| PolicyConstraint | dependency-acyclic, catalog-complete, verify-pass, etc. |
| Allowed | Permitted values or states |
| Blocked | Denied values or states |
| RequiredCheck | Pass condition per rule (`DLV-CHK-*`) |
| Exception | Waiver record per rule (`DLV-EXC-*`) |
| Enforcement | declarative / gate / audit-only |
| AuditTrail | Audit event per rule (`DLV-AUD-*`) |

## Module layout

```
lib/delivery/v70/
  release.policy.ts
  policy.rules.ts
  policy.builder.ts
  policy.entry.ts
```

## Entry

```ts
import { buildReleasePolicy, runReleasePolicy } from "@/lib/delivery/v70/policy.entry";

const report = runReleasePolicy({ deploymentId: "prod" });
```

## Exports

- `V70_RELEASE_POLICY_VERSION` = `v70-release-policy-1`
- `V70_RELEASE_POLICY_FREEZE_VERSION` = `v70-release-policy-freeze-1`
- `buildReleasePolicy()`
- `runReleasePolicy()`

## Upstream (read-only)

- **P2**: `buildReleaseDependency()`
- **P1**: via P2 chain

## Verify

```bash
npx tsx scripts/verify-v70-p3-release-policy.ts
```

## Freeze point (P3)

- `v70-release-policy-freeze-1`

## Boundaries

- Declarative policy only — not enforced at runtime
