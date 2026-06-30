# V65 P5 — Runtime Risk Layer

Local compatibility guards for legacy production risks identified in [V65 P1 audit](./V65-PRODUCTION-AUDIT.md). No API/UI/Prisma contract changes.

## Mitigations

| ID | Area | Guard |
|----|------|-------|
| RT-001 | Organization slug | `resolveOrganizationSlug` — legacy rows without slug |
| RT-002 | Feature gating | `normalizeSaasPlan` — string/alias plan values |
| RT-003 | Portal workspace | `resolveOrganizationDisplayName` + slug resolver |
| RT-004 | SaaS billing | `organizationId` on invoice create |
| RT-005 | Quote delivery | `latest` null guard in download handler |

## Unified entry

```ts
import { assertRuntimeRiskPass, runRuntimeRiskGate } from "@/lib/production/v65";

assertRuntimeRiskPass({ deploymentId: "prod" });
```

## Verify

```bash
npm run verify:v65-p5-runtime-risk
npx tsc --noEmit
npm run build
```
