# V73 P4 — Knowledge Compatibility

Declarative knowledge compatibility matrix. **Read-only** — no runtime, API, database, or UI changes. V48–V73 P1/P3 untouched.

## Scope (P4 only)

| Concept | Purpose |
|---------|---------|
| VersionPair | Source/target knowledge version pairing (`KNW-VPX-*`) |
| Compatible | Pair marked compatible |
| Incompatible | Pair marked incompatible |
| Deprecated | Pair marked deprecated |
| Supported | Pair marked supported |
| Minimum | Lower bound version or range |
| Maximum | Upper bound version or range |
| Matrix | Aggregated compatibility matrix |
| Constraint | Range rule (`KNW-CMP-CST-*`) |
| Fallback | Rollback/fallback target on mismatch |

## Module layout

```
lib/knowledge/v73/
  knowledge.compatibility.ts
  compatibility.matrix.ts
  compatibility.builder.ts
  compatibility.entry.ts
```

## Entry

```ts
import { buildKnowledgeCompatibility, runKnowledgeCompatibility } from "@/lib/knowledge/v73/compatibility.entry";

const report = runKnowledgeCompatibility({ deploymentId: "prod" });
```

## Exports

- `V73_KNOWLEDGE_COMPATIBILITY_VERSION` = `v73-knowledge-compatibility-1`
- `V73_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION` = `v73-knowledge-compatibility-freeze-1`
- `buildKnowledgeCompatibility()`
- `runKnowledgeCompatibility()`

## Upstream (read-only)

- **P3**: `buildKnowledgePolicy()`
- **P1**: via P3 chain (`KNW-*` refs)

## Verify

```bash
npx tsx scripts/verify-v73-p4-knowledge-compatibility.ts
```

## Freeze point (P4)

- `v73-knowledge-compatibility-freeze-1`

## Boundaries

- Declarative matrix only — no knowledge version enforcement at runtime
