# V3.7 RC1 — Cleanup Notes

## Current phase

| Item | Status |
|------|--------|
| Phase | **RC1 freeze** |
| Stabilization | Complete |
| Verification matrix | Established |
| Primary goal | **Release-ready** (not feature growth) |

Commercial work is in **late-phase cleanup**: remove dead weight without reopening seals or public contracts.

## Recommended cleanup (small steps)

Apply cleanup in **narrow PRs** — one category per change, with verify after each.

| Direction | Examples |
|-----------|----------|
| Unused runtime | Remove dead imports / unreachable foundation calls not wired to engine or smokes |
| Abandoned hooks | Drop unused `format*Hook` exports with no consumers; keep RC1 hook strings stable |
| Duplicate export | Collapse redundant barrel re-exports in `lib/commercialization` (no new public names) |
| Experimental surfaces | Retire draft routes or docs marked experimental; keep canonical hub as sole entry |
| Unreferenced files | Delete orphans after confirming no smoke, page, or engine reference |

**Before delete:** run `verify:verification-matrix` and the smoke for the touched area.

## Avoid

- **Large refactors** — no repo-wide moves or renames under RC1  
- **New runtime layers** — no civilization / swarm / meta-cognition / autonomous expansion  
- **Re-opening freeze** — do not change seal semantics, payment boundaries, or Step 1–14 foundations  
- **Breaking public surface** — paths, hook prefixes, and `/commercial/v37/hub` must stay compatible  

Cleanup is **subtractive and local**, not a redesign.

## Priorities (order)

1. **Stability-first** — matrix and hub-freeze smokes stay green  
2. **Maintainability-first** — fewer duplicates, clearer exports, aligned docs  
3. **Compatibility-first** — no breaking renames (`COMPATIBILITY.md`)  
4. **Release consistency** — behavior matches `RELEASE-SNAPSHOT.md` and freeze docs  

If cleanup conflicts with stability, **do not merge** until the conflict is resolved or deferred to the next phase version.

## Workflow

Follow `DEVELOPMENT-WORKFLOW.md`: modify → smoke → verify → review → commit.

Docs-only cleanup does not require matrix; any `lib/commercialization/**` deletion does.

## Related docs

| Document | Purpose |
|----------|---------|
| [FREEZE.md](./FREEZE.md) | What must remain frozen |
| [RELEASE-SNAPSHOT.md](./RELEASE-SNAPSHOT.md) | RC1 snapshot and verify commands |
| [COMPATIBILITY.md](./COMPATIBILITY.md) | Rename and export policy |
| [DEVELOPMENT-WORKFLOW.md](./DEVELOPMENT-WORKFLOW.md) | Small-step process |

## Out of scope for cleanup PRs

- New commercial features or pages  
- Engine hook chains beyond existing stabilization line  
- V3.7 step additions (Steps 16+ as new capability layers)  

Defer those to a **new phase** after RC1 ships.
