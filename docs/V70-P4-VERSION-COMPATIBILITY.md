# V70 P4 — Version Compatibility

Declarative version compatibility matrix. **Read-only** — no runtime, API, database, or UI changes. V48–V70 P1/P3 untouched.

## Scope (P4 only)

| Concept | Purpose |
|---------|---------|
| VersionPair | Source/target release version pairing (`DLV-VPX-*`) |
| Compatible | Pair marked compatible |
| Incompatible | Pair marked incompatible |
| Deprecated | Pair marked deprecated |
| Supported | Pair marked supported |
| Minimum | Lower bound version or range |
| Maximum | Upper bound version or range |
| Matrix | Aggregated compatibility matrix |
| Constraint | Range rule (`DLV-CMP-CST-*`) |
| Fallback | Rollback/fallback target on mismatch |

## Module layout

```
lib/delivery/v70/
  version.compatibility.ts
  compatibility.matrix.ts
  compatibility.builder.ts
  compatibility.entry.ts
```

## Entry

```ts
import { buildVersionCompatibility, runVersionCompatibility } from "@/lib/delivery/v70/compatibility.entry";

const report = runVersionCompatibility({ deploymentId: "prod" });
```

## Exports

- `V70_VERSION_COMPATIBILITY_VERSION` = `v70-version-compatibility-1`
- `V70_VERSION_COMPATIBILITY_FREEZE_VERSION` = `v70-version-compatibility-freeze-1`
- `buildVersionCompatibility()`
- `runVersionCompatibility()`

## Upstream (read-only)

- **P3**: `buildReleasePolicy()`
- **P1**: via P3 chain (`DLV-REL-*` refs)

## Verify

```bash
npx tsx scripts/verify-v70-p4-version-compatibility.ts
```

## Freeze point (P4)

- `v70-version-compatibility-freeze-1`

## Boundaries

- Declarative matrix only — no version enforcement at runtime
