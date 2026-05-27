# V3.7 RC1 — Commercial Freeze

V3.7 RC1 is in **freeze state**. Commercial productization surfaces are sealed for description-only use. No new runtime layers or commercial capabilities are in scope for this phase.

## Frozen surfaces

| Layer | Version / ID | Entry |
|-------|----------------|-------|
| V3.5 commercialization freeze | `3.5-freeze` | Policy / manifest |
| V3.6 public surface closure | `3.6-closure-1` | `/commercial/v36/closure` |
| V3.7 productization (Steps 1–14) | `3.7-product-1` … `3.7-atlas-14` | `/commercial/v37` and step routes |
| V3.7 canonical hub | `3.7-hub-15` | `/commercial/v37/hub` |
| V3.7 hub freeze | `3.7-hub-freeze-16` | Hub seal + readonly guard |
| V3.7 final stabilization | `3.7-stabilization-17` | `/commercial/v37/stabilization` |

Steps 1–14 (catalog, pricing, orders, portal, closure, launch, operating, sunset, archive, legacy, atlas) remain frozen as documented in each step’s foundation version. Do not reopen seal boundaries or add payment, IdP, CRM, or ERP integration.

## Readonly surfaces

All V3.7 commercial routes are **read-only** description surfaces:

- No authoritative writes, deletes, edits, or migrations through commercial foundations
- Hub `assertHubReadonlySurface` enforces non-mutable portal routes and immutable entries
- Product, billing, subscription, and portal pages describe models only; no live payment or auth engines

Primary readonly entry: **`/commercial/v37/hub`** (canonical commercial surface).

Compatibility alias: `/commercial/v37/canonical` → hub.

## Canonical hub

- **Path:** `/commercial/v37/hub`
- **Foundation:** `runCommercialV37HubFoundation` (`3.7-hub-15`)
- **Role:** Unified canonical reference for Steps 1–14 pins, portal routes, immutable navigation, and terminal freeze summary
- **Prerequisite:** Master atlas ready (`3.7-atlas-14`)

Hooks (representative): `canonical-reference-ready`, `unified-portal-ready`, `immutable-entry-ready`, `hub-surface-ready`, `hub-freeze-ready`.

## Stabilization layer

- **Path:** `/commercial/v37/stabilization`
- **Foundation:** `runCommercialV37StabilizationFoundation` (`3.7-stabilization-17`)
- **Role:** Consolidation, freeze boundary, regression baseline, release readiness, maintainability
- **Prerequisite:** `hubFreeze.hubFrozen === true`

Hooks: `consolidation-ready`, `freeze-boundary-ready`, `regression-baseline-ready`, `stabilization-release-ready`, `stabilization-surface-ready`.

## Verification matrix (RC1)

Unified read-only check:

```bash
npm run verify:verification-matrix
```

Expected lines: `HUB OK`, `HUB FREEZE OK`, `STABILIZATION OK`, `PRODUCT SURFACE OK`, `READONLY SURFACE OK`, `RELEASE READINESS OK`, `VERIFICATION MATRIX OK`.

Related scripts: `verify:commercialization-v37-hub`, `verify:commercialization-v37-hub-freeze`, `verify:commercialization-v37-stabilization`.

## Out of scope (frozen)

Do **not** extend in this phase:

- Civilization runtime layers
- Swarm runtime
- Meta-cognition runtime
- Autonomous / recursive governance expansion
- New commercial feature branches (payments, subscriptions engine, CRM, ERP)

V3.5 freeze and V3.6 public-surface seal remain prerequisites; do not mutate their closure semantics.

## What happens next

Work after RC1 freeze is intentionally small:

1. **Maintenance** — docs, copy, and regression fixes within sealed boundaries
2. **Verify** — run matrix and step smokes before any commercial touch
3. **Release-ready** — use stabilization `releaseReadiness` and hub freeze as the publish gate

New productization steps or runtime chains require a new phase version, not incremental edits under RC1 freeze.
