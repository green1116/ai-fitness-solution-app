# V65 P6 — Release-Ready Gate

Final production release gate after [V65 P1](./V65-PRODUCTION-AUDIT.md) through [V65 P5](./V65-RUNTIME-RISK.md).

## Gates

| Gate | Phase |
|------|-------|
| V64 commercial freeze | P8 |
| Prisma preflight | P2 |
| TypeScript | P3 |
| Production build | P4 |
| Runtime risk | P5 |
| Release manifest | P6 |

## Unified entry

```ts
import { assertReleaseReadyPass } from "@/lib/production/v65";

assertReleaseReadyPass({
  deploymentId: "prod",
  signals: {
    verifyChainPass: true,
    typeScriptClean: true,
    buildPass: true,
    prismaPreflightPass: true,
  },
});
```

## Verify

```bash
npm run verify:v65-production    # P1 + P5 + P6 + P7 + P8
npm run verify:v65-p8-production-signoff
npm run verify:v65-p6-release-ready
npx tsc --noEmit
npm run prisma:preflight
npm run build
```

## Status

All P1 legacy blockers marked `resolved` (P2–P5). `ACTIVE_BUILD_BLOCKERS` is empty. Release-ready requires `openBlockerCount === 0`.
