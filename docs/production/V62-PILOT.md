# V62 Real User Pilot & Feedback Loop

Upgrades platform from **Commercial Launch Ready** to **Real User Validated Platform**.

## Scope

| Pillar | Capability |
|--------|------------|
| P1 | Pilot program (org/user/project registry) |
| P2 | Feedback loop (7 categories, 5 statuses) |
| P3 | Pilot telemetry (11 event types, in-memory) |
| P4 | Issue triage (blocker/high/medium/low) |
| P5 | Pilot health dashboard |
| P6 | Conversion funnel analytics |
| P7 | Support readiness (known issues, retry guidance) |
| P8 | Pilot success score |
| P9 | Operational improvement log |
| P10 | Monitoring extension (V60 health + telemetry + feedback) |
| P11 | Pilot documentation |
| P12 | `verify:v62-pilot` |
| P13 | Scale decision |

## UI

- `/pilot` — Overview + scale decision
- `/pilot/program` — Pilot roster management
- `/pilot/health` — Health dashboard
- `/pilot/feedback` — Feedback submission & list
- `/pilot/telemetry` — Event aggregation
- `/pilot/issues` — Issue triage
- `/pilot/funnel` — Conversion funnel
- `/pilot/support` — Support guide

## APIs

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/pilot/program` | Pilot program report |
| POST | `/api/pilot/program/register` | Enroll org / register project |
| GET | `/api/pilot/feedback` | Feedback loop report |
| POST | `/api/pilot/feedback/submit` | Submit feedback |
| GET | `/api/pilot/telemetry` | Telemetry report |
| POST | `/api/pilot/telemetry/record` | Record event |
| GET | `/api/pilot/issues` | Issue triage report |
| POST | `/api/pilot/issues/report` | Report issue |
| GET | `/api/pilot/health` | Health dashboard |
| GET | `/api/pilot/funnel` | Funnel analytics |
| GET | `/api/pilot/support` | Support readiness |
| GET | `/api/pilot/success-score` | Pilot success criteria |
| GET | `/api/pilot/improvements` | Operational log |
| GET | `/api/pilot/monitoring` | Unified monitoring |
| GET | `/api/pilot/docs` | Documentation |
| GET | `/api/pilot/scale-decision` | Scale decision |

## RBAC

Surface `pilot`: OWNER, ADMIN, MANAGER (not MEMBER).

## Verification

```bash
npm run verify:v62-pilot
npx tsc --noEmit
npm run build
```

## Freeze

V61 (`v61-commercial-launch-final`) remains frozen. V62 adds pilot layer only.
