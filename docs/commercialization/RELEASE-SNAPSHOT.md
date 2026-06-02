# V3.7 RC1 — Release Snapshot

## Version

**V3.7 RC1** — commercial productization release candidate (freeze).

## Current state

| Property | Status |
|----------|--------|
| Phase | Freeze |
| Surfaces | Read-only |
| Canonical entry | `/commercial/v37/hub` |
| Verification matrix | Established |
| Freeze documentation | `FREEZE.md` |

RC1 is a **description-only** commercial snapshot. No payment engine, IdP, CRM, or ERP wiring.

## Frozen scope

| Component | ID / path | Notes |
|-----------|-----------|--------|
| Canonical hub | `3.7-hub-15` · `/commercial/v37/hub` | Unified reference for Steps 1–14 |
| Hub freeze | `3.7-hub-freeze-16` | Seal + readonly guard |
| Freeze boundary | `3.7-freeze-boundary-1` | Blocks runtime expansion |
| Stabilization layer | `3.7-stabilization-17` · `/commercial/v37/stabilization` | Consolidation, regression baseline, release readiness |
| Readonly surfaces | All V3.7 commercial routes | No writes / deletes / migrations via foundations |

V3.5 freeze and V3.6 public-surface closure remain prerequisites and are not reopened under RC1.

## Verification in place

```bash
npm run verify:verification-matrix
```

Matrix checks (expected all OK):

- HUB
- HUB FREEZE
- STABILIZATION
- PRODUCT SURFACE
- READONLY SURFACE
- RELEASE READINESS

Supporting scripts:

- `verify:commercialization-v37-hub`
- `verify:commercialization-v37-hub-freeze`
- `verify:commercialization-v37-stabilization`

Reference: `docs/commercialization/FREEZE.md` (freeze boundaries and out-of-scope list).

## Principles after RC1

**In scope**

- Small-step maintenance within sealed surfaces
- Run verify / verification matrix before changes
- Use stabilization `releaseReadiness` as the publish gate

**Out of scope**

- Civilization runtime expansion
- Swarm runtime
- Meta-cognition runtime
- Autonomous / recursive governance layers
- New commercial capabilities or seal boundary changes

New work beyond RC1 requires a new phase version, not edits under this snapshot.

## Snapshot metadata

| Field | Value |
|-------|--------|
| Snapshot label | `v3.7-rc1` |
| Hub foundation | `3.7-hub-15` |
| Stabilization | `3.7-stabilization-17` |
| Matrix | `3.7-verification-matrix-1` |
| Primary hook | `stabilization-surface-ready=3.7-stabilization-17` |
