# V73 P2 — Knowledge Dependency

Declarative knowledge dependency graph. **Read-only** — no runtime, API, database, or UI changes. V48–V73 P1 untouched.

## Scope (P2 only)

| Concept | Purpose |
|---------|---------|
| KnowledgeNode | Per-knowledge graph node (`KNW-NOD-*`) |
| Dependency | Directed edge (`KNW-DEP-*`) |
| Upstream | Source node identifier |
| Downstream | Target node identifier |
| Required | Mandatory dependency flag |
| Optional | Optional dependency flag |
| Order | Topological order hint |
| CycleCheck | Acyclic graph validation |
| Impact | low / medium / high / critical |

## Module layout

```
lib/knowledge/v73/
  knowledge.dependency.ts
  dependency.graph.ts
  dependency.builder.ts
  dependency.entry.ts
```

## Entry

```ts
import { buildKnowledgeDependency, runKnowledgeDependency } from "@/lib/knowledge/v73/dependency.entry";

const report = runKnowledgeDependency({ deploymentId: "prod" });
```

## Exports

- `V73_KNOWLEDGE_DEPENDENCY_VERSION` = `v73-knowledge-dependency-1`
- `V73_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION` = `v73-knowledge-dependency-freeze-1`
- `buildKnowledgeDependency()`
- `runKnowledgeDependency()`

## Upstream (read-only)

- **P1**: `buildKnowledgeCatalog()`
- **P1**: via chain (`KNW-*` refs)

## Verify

```bash
npx tsx scripts/verify-v73-p2-knowledge-dependency.ts
```

## Freeze point (P2)

- `v73-knowledge-dependency-freeze-1`

## Boundaries

- Declarative graph only — no dependency enforcement at runtime
