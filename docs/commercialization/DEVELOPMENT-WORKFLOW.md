# V3.7 RC1 — Development Workflow

## Current phase

| Item | Status |
|------|--------|
| Release line | **V3.7 RC1** |
| Phase state | **Freeze** (see `FREEZE.md`) |
| Stabilization | Complete (`3.7-stabilization-17`) |
| Verification matrix | Established (`verify:verification-matrix`) |
| Surfaces | Read-only · canonical hub fixed |

Work in RC1 is **maintenance and verification**, not new productization steps or runtime layers.

## Recommended workflow

Use **small, isolated changes** end to end:

| Step | Practice |
|------|----------|
| Scope | One Composer session → **one goal** |
| Prompt | **Small prompt** — single file or tight module |
| Code | **Small diff** — no drive-by refactors |
| Check | **Small verify** — one smoke or matrix run |
| Git | **Small commit** — one logical change per commit |

Do not batch unrelated goals (hub + stabilization + docs + engine) in one pass unless explicitly planned.

## Recommended order

```txt
modify → smoke → verify → review → commit
```

1. **Modify** — touch only what the goal requires; stay inside freeze boundaries  
2. **Smoke** — run the relevant step smoke (e.g. hub-freeze, stabilization)  
3. **Verify** — run `npm run verify:verification-matrix` before merge when commercial code changed  
4. **Review** — confirm no breaking paths, hooks, or exports  
5. **Commit** — message states *why* (fix / docs / verify), not a dump of file names  

For docs-only changes, matrix verify is optional; for `lib/commercialization/**`, matrix is recommended.

## Avoid

- **Long Agent prompts** — split into sequenced micro-tasks  
- **Global restructuring** — no repo-wide renames or barrel moves under RC1  
- **Unbounded runtime expansion** — no civilization / swarm / meta-cognition chains  
- **Breaking rename / export** — paths and hooks are compatibility-frozen (`COMPATIBILITY.md`)  
- **Skipping verify** after commercial foundation edits  

## Engineering goals (RC1)

| Goal | Meaning |
|------|---------|
| **Release-ready** | Stabilization `releaseReadiness` and hub freeze must stay green |
| **Maintainability** | Docs and smokes stay aligned with sealed surfaces |
| **Stability-first** | Prefer fixes that preserve behavior over new features |
| **Compatibility-first** | Preserve `/commercial/v37/hub` and hook contracts |

Feature growth waits for a **new phase version**, not RC1 patches.

## Related docs

| Document | Purpose |
|----------|---------|
| [FREEZE.md](./FREEZE.md) | Freeze state, frozen/readonly surfaces, out of scope |
| [RELEASE-SNAPSHOT.md](./RELEASE-SNAPSHOT.md) | RC1 snapshot metadata and verify commands |
| [COMPATIBILITY.md](./COMPATIBILITY.md) | Compatibility boundaries and rename policy |
| [MAINTAINABILITY.md](./MAINTAINABILITY.md) | Long-term maintainability notes for sealed commercial layer |

## Quick verify commands

```bash
npm run verify:verification-matrix
npm run verify:commercialization-v37-hub-freeze
npm run verify:commercialization-v37-stabilization
```

All expected matrix lines should report **OK** before treating RC1 commercial work as done.
