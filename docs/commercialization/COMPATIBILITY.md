# V3.7 RC1 — Compatibility

## Current compatibility state

| Item | Status |
|------|--------|
| Canonical hub | Fixed at `/commercial/v37/hub` (`3.7-hub-15`) |
| Readonly surfaces | Fixed — description-only, no write paths |
| Verification matrix | Established (`verify:verification-matrix`) |
| Hub freeze | `3.7-hub-freeze-16` |
| Stabilization | `3.7-stabilization-17` |

RC1 treats the above as the **stable public contract** for commercial foundations. Consumers (smokes, pages, ecology hooks) should assume these paths and hook prefixes remain valid for the RC1 line.

Alias: `/commercial/v37/canonical` redirects to the canonical hub (compatibility only; do not add new aliases).

## Compatibility strategy

1. **Keep public surfaces stable** — V3.6 closure and V3.7 step routes stay addressable; behavior remains read-only.
2. **Avoid breaking renames** — foundation versions, hook names (`hub-surface-ready`, `stabilization-surface-ready`, etc.), and primary paths are frozen for RC1.
3. **Avoid large export churn** — no broad re-exports or barrel reshuffles under `lib/commercialization` without a new phase version.
4. **Keep verify reproducible** — matrix and step smokes must pass unchanged on a clean checkout; V3.6 seal fixture hooks remain the productization gate.

Breaking changes require a **new phase version** (e.g. RC2 or V3.8), not silent edits under RC1.

## Not continuing (RC1)

- Civilization runtime expansion
- Swarm runtime expansion
- Meta-cognition runtime expansion
- Autonomous / recursive governance layers
- New commercial feature branches (payments, IdP, CRM, ERP)

See also: `FREEZE.md`, `RELEASE-SNAPSHOT.md`.

## Principles going forward

| Priority | Action |
|----------|--------|
| 1 | Small-step maintenance inside sealed boundaries |
| 2 | Run `verify:verification-matrix` (and related smokes) before merge |
| 3 | **Release-ready** over feature growth — use stabilization `releaseReadiness` |
| 4 | **Stability** over new surfaces — extend only with explicit version bump |

Compatibility is **stability-first**: RC1 is maintained, verified, and publish-gated—not expanded.
