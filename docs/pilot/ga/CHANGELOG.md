# Changelog — V80 Pilot GA

All notable Pilot freezes are documented here. Format: Keep a Changelog–inspired, project-local.

## [v80-pilot-ga-1.0.0] — 2026-08-04

### Added (GA freeze artifacts — P20)

- GA release manifest (`docs/pilot/ga/ga-manifest.json`)
- Architecture snapshot, API index, release notes, verification summary
- GA certification script `scripts/verify-pilot-p20-ga.ts`
- Read-only export API `GET /api/pilot/v80/intake/ga`

### Certified baseline (P1–P19)

- **P1–P3** Intake upload, review, approve handoff
- **P4–P8** Ops, confidence/evidence, clarification, multi-doc, compliance
- **P9–P10** Handoff package, bootstrap seed
- **P11–P15** Analytics, knowledge learn/govern/recommend/improve
- **P16–P18** Benchmark, cross-project similarity, enterprise decision support
- **P19** Integration & production hardening + regression suite runner

### Changed

- None to Project / Quote / Tender models
- None to V80 engine architecture

### Fixed

- N/A (documentation / release freeze)

### Security / boundaries

- Pilot APIs remain behind organization gate (`withPilotRoute`)
- No secrets added to GA artifacts
