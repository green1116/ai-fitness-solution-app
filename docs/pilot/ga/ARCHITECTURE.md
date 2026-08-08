# V80 Pilot — Architecture Snapshot (GA)

**Release:** `v80-pilot-ga-1.0.0` · **Codename:** Intake Intelligence GA · **Date:** 2026-08-04

This snapshot freezes the Pilot architecture as shipped through **P19**. P20 adds release metadata only — no new business capability, engine, or schema redesign.

## Principles

- Reuse **V80** + Pilot services only
- In-memory Intake session store for pilot workflows; production Project / Quote / Tender created on approve
- Additive session/JSON fields only — **no Project / Quote / Tender model changes**
- Deterministic scoring and aggregation (no new ML engine)

## Layer map

### Intake Core (P1–P3)

Upload → parse/extract → review/edit → validate → approve handoff to production entities and V80 bridge.

### Quality & Ops (P4–P8)

Ops exception board, evidence/confidence, clarification loop, multi-document consolidation, compliance/knowledge rules.

### Handoff & Execution (P9–P10)

Internal/customer handoff package, project bootstrap seed, freeze/sign-off gates.

### Intelligence (P11–P15)

Analytics KPIs, org knowledge learning, governance (promote/deprecate), recommendations + feedback, continuous improvement loop.

### Portfolio & Decision (P16–P18)

Org benchmark scorecard, cross-project similarity/reuse, enterprise decision support report.

### Hardening & GA (P19–P20)

Production hardening checks, regression suite (P1–P18), GA manifest / docs / certification fingerprint.

## Runtime boundaries

| Concern | Location |
|--------|----------|
| Session state | `lib/pilot/v80/intake/intake.store.ts` (in-memory) |
| Barrel exports | `lib/pilot/v80/index.ts` |
| Pilot APIs | `app/api/pilot/v80/intake/**` |
| Pilot UI | `app/(pilot)/pilot/**` + `components/pilot/**` |
| Auth gate | `withPilotRoute` → SaaS org gate |

## Out of scope for GA freeze

- New engines or model training
- Prisma model migrations for Project / Quote / Tender
- Redesign of V80 workflow runtime
