# V72 P1 — Intelligence Catalog

Declarative operational intelligence catalog. **Read-only** — no runtime, API, database, or UI changes.

## Scope (P1 only)

| Field | Purpose |
|-------|---------|
| Insight | Insight track name |
| Signal | Observable signal identifier |
| Metric | Metric key or measurement |
| Event | Source event name |
| Anomaly | Anomaly detected flag |
| Trend | up / down / stable / volatile |
| Owner | Owning team |
| Status | draft / active / paused / archived |
| Source | Upstream version or system source |
| Severity | low / medium / high / critical |
| Confidence | low / medium / high |

## Module layout

```
lib/intelligence/v72/
  intelligence.types.ts
  intelligence.catalog.ts
  intelligence.builder.ts
  intelligence.entry.ts
```

## Entry

```ts
import { buildIntelligenceCatalog, runIntelligenceCatalog } from "@/lib/intelligence/v72/intelligence.entry";

const report = runIntelligenceCatalog({ deploymentId: "prod" });
```

## Exports

- `V72_INTELLIGENCE_VERSION` = `v72-intelligence-catalog-1`
- `buildIntelligenceCatalog()`
- `runIntelligenceCatalog()`

## Verify

```bash
npx tsx scripts/verify-v72-p1-intelligence-catalog.ts
```

## Freeze point (P1)

- `v72-intelligence-catalog-freeze-1`
- `lib/intelligence/v72/`

## Boundaries

- V48–V71 untouched
- Declarative catalog only — no intelligence execution
