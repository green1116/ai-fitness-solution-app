# Rollback Snapshot — Final Release Pack

## Release identity

| Field | Value |
|-------|-------|
| **GA tag** | `release-wp-4-ga-1.0.0` |
| **Freeze tag** | `release-ga-freeze-1.0.0` |
| **Baseline** | `v80-pilot-ga-1.0.0` |
| **GA fingerprint** | `a88252f15e5dfdc77a60bc123c1950f8c461ca5183296ad43e38f83c26b4993e` |
| **Production fingerprint** | `c527e86e93451084c5e545c30b769e043fe6c653d8cc60cee9a01ab71a85b829` |

## Rollback gate

| Field | Value |
|-------|-------|
| **ready** | `true` |
| **strategy** | `ep-freeze-baseline` |
| **mocked** | `false` |

## Restore targets

Deterministic EP freeze baselines (restore in dependency order):

1. `ep-1-freeze-1.0.0` — Enterprise Organization Registry Freeze
2. `ep-2-freeze-1.0.0` — Enterprise Workspace Registry Freeze
3. `ep-3-freeze-1.0.0` — Enterprise Collaboration Freeze
4. `ep-4-freeze-1.0.0` — Enterprise Application Workflow Freeze

## Rollback procedure

1. Confirm current GA tag is `release-wp-4-ga-1.0.0` and freeze tag is `release-ga-freeze-1.0.0`.
2. Re-verify production pack: `npx tsx scripts/verify-release-wp3.ts` (expect PASS).
3. Re-verify GA freeze: `npx tsx scripts/verify-release-ga.ts` (expect GA / certified).
4. Restore enterprise freeze baselines to the restore targets above (EP-1 → EP-4).
5. Re-run Release readiness chain (WP-1 → WP-4) and confirm fingerprints match this snapshot.
6. Do **not** introduce mock handlers, mock routes, or alternate production APIs during rollback.

## Production surface lock

These production routes / APIs remain the rollback-compatible surfaces:

| Route | Handlers |
|-------|----------|
| `/pilot/intake` | `uploadTenderIntake`, `approveTenderIntake`, `buildIntakeHandoffPackage` |
| `/dashboard/command-center` | `postCommandDispatch` |

UI host component: `WorkflowEntryPanelActions`

## Determinism

Rollback snapshot content is derived from `buildGaRelease()`:

- status: `GA`
- certification: `certified`
- productionStatus: `PASS`
- rollback.strategy: `ep-freeze-baseline`
- rollback.restoreTargets: EP-1~EP-4 freeze versions listed above

Fingerprint must remain:

```
a88252f15e5dfdc77a60bc123c1950f8c461ca5183296ad43e38f83c26b4993e
```
