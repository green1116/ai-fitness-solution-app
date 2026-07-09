# V72 P4 — Intelligence Compatibility

Declarative intelligence compatibility matrix. **Read-only** — no runtime, API, database, or UI changes. V48–V72 P1/P3 untouched.

## Scope (P4 only)

| Concept | Purpose |
|---------|---------|
| VersionPair | Source/target intelligence version pairing (`INT-VPX-*`) |
| Compatible | Pair marked compatible |
| Incompatible | Pair marked incompatible |
| Deprecated | Pair marked deprecated |
| Supported | Pair marked supported |
| Minimum | Lower bound version or range |
| Maximum | Upper bound version or range |
| Matrix | Aggregated compatibility matrix |
| Constraint | Range rule (`INT-CMP-CST-*`) |
| Fallback | Rollback/fallback target on mismatch |

## Module layout

```
lib/intelligence/v72/
  intelligence.compatibility.ts
  compatibility.matrix.ts
  compatibility.builder.ts
  compatibility.entry.ts
```

## Entry

```ts
import { buildIntelligenceCompatibility, runIntelligenceCompatibility } from "@/lib/intelligence/v72/compatibility.entry";

const report = runIntelligenceCompatibility({ deploymentId: "prod" });
```

## Exports

- `V72_INTELLIGENCE_COMPATIBILITY_VERSION` = `v72-intelligence-compatibility-1`
- `V72_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION` = `v72-intelligence-compatibility-freeze-1`
- `buildIntelligenceCompatibility()`
- `runIntelligenceCompatibility()`

## Upstream (read-only)

- **P3**: `buildIntelligencePolicy()`
- **P1**: via P3 chain (`INT-*` refs)

## Verify

```bash
npx tsx scripts/verify-v72-p4-intelligence-compatibility.ts
```

## Freeze point (P4)

- `v72-intelligence-compatibility-freeze-1`

## Boundaries

- Declarative matrix only — no intelligence version enforcement at runtime
