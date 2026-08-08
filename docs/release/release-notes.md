# Release Notes — Final Release Pack

## Tag

| Field | Value |
|-------|-------|
| **GA tag** | `release-wp-4-ga-1.0.0` |
| **Freeze tag** | `release-ga-freeze-1.0.0` |
| **Baseline** | `v80-pilot-ga-1.0.0` |
| **Status** | GA |
| **Certification** | certified |
| **Codename** | Enterprise Release GA Freeze |
| **Freeze date** | 2026-08-08 |

## Fingerprint

```
a88252f15e5dfdc77a60bc123c1950f8c461ca5183296ad43e38f83c26b4993e
```

Production validation fingerprint:

```
c527e86e93451084c5e545c30b769e043fe6c653d8cc60cee9a01ab71a85b829
```

## Summary

This Final Release Pack freezes the Release train after EP-1~EP-4 enterprise freezes and Release WP-1~WP-4.

| Work package | Capability | Outcome |
|--------------|------------|---------|
| Release/WP-1 | ReleaseReadiness | READY |
| Release/WP-2 | ReleaseCandidate | READY / certified |
| Release/WP-3 | ProductionValidation | PASS |
| Release/WP-4 | GaRelease | GA / certified |

## Production surfaces

| Route | Role |
|-------|------|
| `/pilot/intake` | Intake / review / handoff host |
| `/dashboard/command-center` | Execution host |

| Handler | Role |
|---------|------|
| `uploadTenderIntake` | Intake upload |
| `approveTenderIntake` | Intake approve |
| `buildIntakeHandoffPackage` | Handoff package |
| `postCommandDispatch` | Command dispatch |

UI host: `WorkflowEntryPanelActions`

## Scope

- Work packages frozen: Release WP-1~WP-3
- Closure: Release WP-4
- No new business capability
- Additive / read-only release gate only
- Production validated: PASS
- No mock surfaces

## Rollback

Strategy: `ep-freeze-baseline`  
Restore targets: `ep-1-freeze-1.0.0` · `ep-2-freeze-1.0.0` · `ep-3-freeze-1.0.0` · `ep-4-freeze-1.0.0`  

See [rollback-snapshot.md](./rollback-snapshot.md).

## Verification

```bash
npx tsx scripts/verify-release-ga.ts
npx tsx scripts/verify-release-final.ts
```

## Artifacts

| Path | Role |
|------|------|
| `lib/release/ga-release.ts` | GA release & freeze module |
| `docs/release/release-notes.md` | This document |
| `docs/release/rollback-snapshot.md` | Rollback snapshot |
| `scripts/verify-release-ga.ts` | GA verification |
| `scripts/verify-release-final.ts` | Final pack verification |
