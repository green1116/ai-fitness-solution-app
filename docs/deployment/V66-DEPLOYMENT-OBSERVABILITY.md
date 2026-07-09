# V66 P3 — Deployment Observability Baseline

Minimal ops visibility foundation: structured deployment logs, ops event catalog, observability surface. **Declarative read-only layer** — no API, UI, Prisma, or business runtime changes.

## Scope (P3 only)

| Artifact | Purpose |
|----------|---------|
| Structured deployment logs | JSON schema + 10 canonical log event types |
| Ops event catalog | 12 ops visibility event definitions |
| Observability surface | 10-entry catalog (schema, modules, frozen layers, scripts) |
| Verify entrypoint | `npm run verify:v66-p3-deployment-observability` |

## Upstream

- **P1**: env contract & deployment baseline
- **P2**: health checks & readiness probes
- **Frozen**: V48–V65 and V60 platform events referenced only

## Module layout

```
lib/deployment/v66/
  observability.types.ts          # Types
  observability.artifacts.ts        # Artifact paths
  deployment.log.inventory.ts       # Log event catalog
  deployment.log.formatter.ts       # Structured log formatter
  ops.event.catalog.ts              # Ops event inventory
  observability.surface.ts          # Observability surface catalog
  observability.builder.ts            # Report builder
  observability.entry.ts              # Unified entry
  observability.ts
```

## Unified entry

```ts
import {
  runDeploymentObservability,
  formatDeploymentObservabilitySummary,
  formatStructuredDeploymentLog,
} from "@/lib/deployment/v66";

const report = runDeploymentObservability({ deploymentId: "prod" });
console.log(formatDeploymentObservabilitySummary(report));

const log = formatStructuredDeploymentLog({
  deploymentId: "prod",
  eventId: "DEP-LOG-001",
});
```

## Structured log schema

Fields: `schemaVersion`, `timestamp`, `deploymentId`, `phase`, `eventId`, `level`, `message`, `meta`

Phases: `baseline` | `execution` | `observability` | `deploy` | `health` | `verify`

## Ops event categories

`deploy` | `health` | `config` | `verify` | `upstream` | `observability`

## Observability surface (summary)

| ID | Kind | Target |
|----|------|--------|
| OBS-001 | schema | deployment log formatter |
| OBS-004 | frozen-layer | V60 platform events |
| OBS-005 | frozen-layer | `/api/production/health` |
| OBS-006–008 | script | V66 P1/P2/P3 verify scripts |

## Verify

```bash
npm run verify:v66-p3-deployment-observability
npm run verify:v66-deployment          # P1 + P2 + P3
```

## Rollback

Delete P3-only artifacts:

1. `observability*.ts`, `deployment.log.*`, `ops.event.catalog.ts`
2. `docs/deployment/V66-DEPLOYMENT-OBSERVABILITY.md`
3. `scripts/verify-v66-p3-deployment-observability.ts`
4. Revert `package.json` `verify:v66-deployment` to P1+P2
5. Revert `lib/deployment/v66/index.ts` to export baseline + execution only

P1, P2, and all frozen layers remain intact.

## Boundaries

- Formatter produces in-memory JSON only — no log shipping or DB writes
- Does not modify V60 `recordPlatformEvent` or any frozen observability runtime
- Sample logs use fixed timestamp for deterministic verify
