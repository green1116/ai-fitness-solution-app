# V70 P1 — Release Catalog

Declarative enterprise delivery release catalog. **Read-only** — no runtime, API, database, or UI changes.

## Scope (P1 only)

| Field | Purpose |
|-------|---------|
| Release | Release track name |
| Version | Semantic or governance version token |
| Channel | stable / beta / canary / internal |
| Stage | planning / build / staging / production / archived |
| Artifact | Artifact root path |
| Owner | Owning team |
| Status | draft / active / deprecated / retired |
| Compatibility | backward-compatible / breaking / patch-only / none |
| SupportWindow | Support duration policy |
| RollbackTarget | Rollback destination reference |

## Module layout

```
lib/delivery/v70/
  release.types.ts
  release.catalog.ts
  release.builder.ts
  release.entry.ts
```

## Entry

```ts
import { buildReleaseCatalog, runReleaseCatalog } from "@/lib/delivery/v70/release.entry";

const report = runReleaseCatalog({ deploymentId: "prod" });
```

## Exports

- `V70_RELEASE_VERSION` = `v70-release-catalog-1`
- `V70_RELEASE_FREEZE_VERSION` = `v70-release-catalog-freeze-1`
- `buildReleaseCatalog()`
- `runReleaseCatalog()`

## Verify

```bash
tsx scripts/verify-v70-p1-release-catalog.ts
```

## Freeze point (P1)

- `v70-release-catalog-freeze-1`
- `lib/delivery/v70/`

## Boundaries

- V48–V69 untouched
- Declarative catalog only — no delivery execution
