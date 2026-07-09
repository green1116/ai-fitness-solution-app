# V69 P3 — Code Governance

Declarative code governance layer mapping source boundaries to architecture objects. **Read-only layer** — no refactoring, no UI, no database changes. V48–V69 P1–P2 untouched.

## Scope (P3 only)

| Artifact | Purpose |
|----------|---------|
| Code objects | 8 objects (`CGOV-OBJ-*`) — `ARC-DEF-*` + `ARC-DEP-*` entry paths |
| Code policies | 8 standards (`CGOV-POL-*`) — naming, structure, boundary, verification |
| Directory boundaries | 8 boundaries (`CGOV-BND-*`) — path patterns + mutable/frozen flag |
| File ownership | 8 owners (`CGOV-FOWN-*`) — team/role per boundary |
| Import allowances | 8 rules (`CGOV-IMP-*`) — allowed cross-boundary references + `ADEP-EDGE-*` |
| Registry | Unified index of all catalog IDs |
| Freeze lock | `V69_CODE_GOVERNANCE_FREEZE_LOCK` |
| Rollback index | Per-layer rollback paths (`CGR-*`) |

## Upstream (read-only)

- **P1**: `ARCHITECTURE_DEFINITION_CATALOG`, `DEPENDENCY_ENTRY_CATALOG`
- **P2**: `ARCHITECTURE_DEPENDENCY_EDGE_CATALOG`, `buildArchitectureDependencyReport()`
- **Frozen**: V48–V69 P1–P2 not modified

## Module layout

```
lib/technical-governance/v69/code-governance/
  governance.types.ts
  governance.constants.ts
  governance.surface.ts
  code.object.catalog.ts
  code.policy.catalog.ts
  directory.boundary.catalog.ts
  file.ownership.catalog.ts
  import.allowance.catalog.ts
  alignment.catalog.ts
  governance.registry.ts
  freeze.lock.ts
  rollback.index.ts
  governance.builder.ts
  governance.entry.ts
  code-governance.ts
```

## Unified entry

```ts
import { runCodeGovernance, formatCodeGovernanceSummary } from "@/lib/technical-governance/v69";

const report = runCodeGovernance({ deploymentId: "prod" });
console.log(formatCodeGovernanceSummary(report));
```

## Verify

```bash
npm run verify:v69-p3-code-governance
```

## Freeze point (P3)

- `V69_CODE_GOVERNANCE_VERSION` = `v69-code-governance-1`
- `V69_CODE_GOVERNANCE_FREEZE_VERSION` = `v69-code-governance-freeze-1`
- `lib/technical-governance/v69/code-governance/`
- `npm run verify:v69-p3-code-governance`

## Rollback

See `rollback.index.ts` (`CGR-P3` … `CGR-UP-P1`). P1–P2 upstream must not be modified.

## Boundaries

- Import rules are declarative — not enforced by linter at runtime
- `isImportAllowed` is lookup helper only
- Does not modify source files or execute refactors
