# V66 P1 — Deployment Baseline & Env Contract

Enterprise deployment/ops foundation for release readiness. **Read-only declarative layer** — no API, UI, Prisma, or runtime behavior changes.

## Scope (P1 only)

| Artifact | Purpose |
|----------|---------|
| Env contract | Catalog of env vars: required/forbidden per tier, categories, secrets |
| Deployment checklist | Ops gates for enterprise release (upstream + env + verify) |
| Runtime config surface | Declarative map of config namespaces (env / frozen-layer / scripts) |
| Verify entrypoint | `npm run verify:v66-p1-deployment-baseline` |

## Upstream (frozen)

V48–V65 remain frozen. V66 P1 only **references** upstream version locks:

- V64 commercial freeze
- V65 production freeze + sign-off

No mutations to `lib/production/v65/`, `lib/commercial/v64/`, or business runtime modules.

## Module layout

```
lib/deployment/v66/
  baseline.types.ts       # Report types
  baseline.lock.ts          # Upstream frozen version references
  baseline.surface.ts       # Artifact paths
  env.inventory.ts          # Env var catalog
  env.contract.ts           # Contract manifest builder
  deployment.checklist.ts   # Enterprise deployment checklist
  runtime.surface.ts        # Runtime config surface catalog
  baseline.builder.ts       # Report builder
  baseline.entry.ts         # Unified entry
  index.ts
```

## Unified entry

```ts
import { runDeploymentBaseline, formatDeploymentBaselineSummary } from "@/lib/deployment/v66";

const report = runDeploymentBaseline({
  deploymentId: "prod",
  targetEnvironment: "production",
});
console.log(formatDeploymentBaselineSummary(report));
```

## Production-required env (contract)

| Key | Category |
|-----|----------|
| `DATABASE_URL` | database |
| `DIRECT_URL` | database |
| `DOWNLOAD_TOKEN_SECRET` | auth-security |
| `JWT_SECRET` | auth-security |
| `SESSION_SECRET` | auth-security |
| `NEXT_PUBLIC_APP_URL` | deployment |
| `STRIPE_SECRET_KEY` | billing |
| `STRIPE_WEBHOOK_SECRET` | billing |
| `ENABLE_COMMERCIAL_REGISTER` | billing |

See `.env.example` for local/staging templates.

## Forbidden in production

| Key | Reason |
|-----|--------|
| `NEXT_PUBLIC_ENABLE_MOCK_AUTH` | Mock auth |
| `ENABLE_MOCK_AUTH` | Mock auth |
| `DEV_ZIP_ALLOW_ALL` | Paywall bypass |
| `DEV_ZIP_DEFAULT_ALLOW` | Paywall bypass |
| `ALLOW_DEBUG_API` | Debug routes |
| `ENTITLEMENT_DB_FALLBACK` | Dev entitlement fallback |

## Deployment checklist (summary)

1. V65 production program closed (P1–P8)
2. V66 env contract complete
3. Production secrets documented
4. Forbidden dev flags documented
5. Runtime config surface declared
6. Prisma preflight in build pipeline
7. Migrate deploy path documented
8. V66 verify entrypoint present

## Verify

```bash
npm run verify:v66-p1-deployment-baseline
npm run verify:v66-deployment          # P1 chain (extensible)
npm run verify:v65-production          # upstream frozen gate
```

## Rollback

Delete `lib/deployment/v66/`, `docs/deployment/V66-DEPLOYMENT-BASELINE.md`, `scripts/verify-v66-p1-deployment-baseline.ts`, and remove `verify:v66-*` scripts from `package.json`. No frozen layers affected.

## Boundaries

- Declarative catalog only — does not read or mutate live `process.env` at runtime
- Does not replace `v92:env-audit` (runtime env audit remains separate)
- P2+ may add freeze/sign-off; P1 is baseline foundation only
