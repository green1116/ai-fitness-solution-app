# V3.7 RC1 — Snapshot Tag Readiness Checklist

Use this checklist before tagging or publishing the **V3.7 RC1** commercial snapshot.

## RC1 documentation set

| Doc | Path | Purpose |
|-----|------|---------|
| Freeze | [FREEZE.md](./FREEZE.md) | Freeze state, frozen/readonly surfaces, out of scope |
| Release snapshot | [RELEASE-SNAPSHOT.md](./RELEASE-SNAPSHOT.md) | RC1 snapshot metadata and verify commands |
| Compatibility | [COMPATIBILITY.md](./COMPATIBILITY.md) | Compatibility boundaries and rename policy |
| Development workflow | [DEVELOPMENT-WORKFLOW.md](./DEVELOPMENT-WORKFLOW.md) | Recommended small-step process |
| Cleanup notes | [CLEANUP-NOTES.md](./CLEANUP-NOTES.md) | Late-phase cleanup principles |

- [ ] All five docs present and reviewed
- [ ] Docs agree on canonical hub path: `/commercial/v37/hub`
- [ ] Docs agree on stabilization path: `/commercial/v37/stabilization`

## Verification matrix

- [ ] `npm run verify:verification-matrix` passes
- [ ] Output includes: `HUB OK`
- [ ] Output includes: `HUB FREEZE OK`
- [ ] Output includes: `STABILIZATION OK`
- [ ] Output includes: `PRODUCT SURFACE OK`
- [ ] Output includes: `READONLY SURFACE OK`
- [ ] Output includes: `RELEASE READINESS OK`
- [ ] Output includes: `VERIFICATION MATRIX OK`

## Smoke (step-level)

- [ ] `npm run verify:commercialization-v37-hub` passes
- [ ] `npm run verify:commercialization-v37-hub-freeze` passes
- [ ] `npm run verify:commercialization-v37-stabilization` passes

## Build

- [ ] `npm run build` completes without errors (app compiles with commercial routes)

## Readonly surface

- [ ] Canonical hub loads: `/commercial/v37/hub`
- [ ] No write/delete/migrate paths exposed in commercial foundations
- [ ] `assertHubReadonlySurface` path green via verification matrix
- [ ] Public pages remain description-only (no payment / IdP / CRM wired)

## Freeze boundary

- [ ] Hub freeze: `hub-freeze-ready=3.7-hub-freeze-16`
- [ ] Stabilization freeze boundary locked (`freeze-boundary-ready`)
- [ ] No civilization / swarm / meta-cognition runtime expansion in RC1 scope
- [ ] V3.6 seal prerequisite unchanged (productization gate intact)

## Release-ready

- [ ] `stabilization-surface-ready=3.7-stabilization-17`
- [ ] Stabilization `releaseReadiness.publishable === true` (via matrix)
- [ ] `consolidation-ready` and `stabilization-release-ready` hooks consistent
- [ ] Release snapshot doc matches live foundation versions

## Snapshot tag sign-off

| Field | Value |
|-------|--------|
| Tag label (suggested) | `v3.7-rc1` |
| Hub foundation | `3.7-hub-15` |
| Hub freeze | `3.7-hub-freeze-16` |
| Stabilization | `3.7-stabilization-17` |
| Matrix version | `3.7-verification-matrix-1` |

- [ ] All sections above checked
- [ ] No open RC1-breaking renames or export churn planned
- [ ] Ready for snapshot tag / release notes reference

**RC1 rule:** stability-first, compatibility-first, release-ready over feature growth.
