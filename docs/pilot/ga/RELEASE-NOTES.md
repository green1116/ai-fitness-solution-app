# V80 Pilot — Release Notes (GA)

**Version:** `v80-pilot-ga-1.0.0`  
**Codename:** Intake Intelligence GA  
**Date:** 2026-08-04

## Summary

This release freezes the Pilot Intake Intelligence platform (P1–P19) as a production-ready GA baseline on V80. P20 publishes release artifacts and certification only — **no new business features**.

## What is included

- End-to-end tender intake: upload → extract → review → clarify → compliance → QA → approve
- Ops recovery: retry, recover, exception board, freeze/sign-off
- Organization knowledge: learn, govern, recommend, improve
- Portfolio analytics: benchmark, cross-project similarity, executive decision support
- Production hardening: route/nav coverage, determinism, regression catalog (P1–P18), readiness report

## Explicit non-goals (this freeze)

- No new recommendation/ML engine
- No architecture redesign
- No Project / Quote / Tender Prisma model changes
- No new domain workflows beyond P1–P19

## How to verify

```bash
npx tsx scripts/verify-pilot-p19-harden.ts
npx tsx scripts/verify-pilot-p20-ga.ts
# optional full suite
npx tsx scripts/verify-pilot-regression.ts
```

## Artifacts

| Artifact | Path |
|----------|------|
| Manifest | `docs/pilot/ga/ga-manifest.json` |
| Architecture | `docs/pilot/ga/ARCHITECTURE.md` |
| API index | `docs/pilot/ga/API-INDEX.md` |
| Changelog | `docs/pilot/ga/CHANGELOG.md` |
| Verification summary | `docs/pilot/ga/VERIFICATION-SUMMARY.md` |

## Upgrade / ops notes

- Pilot session state remains in-memory for the pilot surface; treat process restarts as session loss unless externally persisted later.
- Production entities continue to be created only on approve (existing P3 path).
- Export endpoints support `?download=1` where documented (analytics, knowledge, benchmark, decision, readiness, GA).
