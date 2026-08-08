# V80 Pilot — API Reference Index (GA)

**Release:** `v80-pilot-ga-1.0.0`  
Auth: Pilot routes use `withPilotRoute` (organization required).

## Core intake

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/pilot/v80/intake/upload` | Upload tender document |
| POST | `/api/pilot/v80/intake/extract` | Extract requirements |
| GET / PATCH | `/api/pilot/v80/intake/[sessionId]` | Session read / patch |
| POST | `/api/pilot/v80/intake/validate` | Validate requirements |
| POST | `/api/pilot/v80/intake/approve` | Approve → project / quote / tender |
| POST | `/api/pilot/v80/intake/qa` | QA gate |

## Ops & recovery

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/pilot/v80/intake/ops` | Ops exception board |
| POST | `/api/pilot/v80/intake/[sessionId]/ops/resume` | Resume stuck ops |
| POST | `/api/pilot/v80/intake/[sessionId]/generation/retry` | Retry generation |
| POST | `/api/pilot/v80/intake/[sessionId]/recover` | Recover session |
| GET | `/api/pilot/v80/intake/[sessionId]/history` | Audit history |
| GET / POST | `/api/pilot/v80/intake/[sessionId]/freeze` | Freeze / delivery lock |
| GET / POST | `/api/pilot/v80/intake/[sessionId]/signoff` | Sign-off / release |

## Clarification, docs, compliance, packages

| Method | Path | Purpose |
|--------|------|---------|
| GET / POST | `/api/pilot/v80/intake/[sessionId]/clarify` | Clarification loop |
| GET / POST | `/api/pilot/v80/intake/[sessionId]/documents` | Multi-doc registry |
| GET / POST | `/api/pilot/v80/intake/[sessionId]/compliance` | Compliance validation |
| GET / POST | `/api/pilot/v80/intake/[sessionId]/handoff-package` | Handoff package |
| GET / POST | `/api/pilot/v80/intake/[sessionId]/bootstrap` | Bootstrap seed |

## Intelligence & portfolio

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/pilot/v80/intake/analytics` | Intake analytics (`?download=1`) |
| GET / POST | `/api/pilot/v80/intake/knowledge` | Org knowledge library |
| GET / POST | `/api/pilot/v80/intake/knowledge/governance` | Knowledge governance |
| GET / POST | `/api/pilot/v80/intake/[sessionId]/recommendations` | Recommendations |
| GET / POST | `/api/pilot/v80/intake/improvement` | Continuous improvement |
| GET | `/api/pilot/v80/intake/benchmark` | Org benchmark |
| GET | `/api/pilot/v80/intake/similarity` | Cross-project explorer |
| GET | `/api/pilot/v80/intake/[sessionId]/similarity` | Session similarity |
| GET | `/api/pilot/v80/intake/decision` | Enterprise decision report |
| GET | `/api/pilot/v80/intake/readiness` | Production hardening report |
| GET | `/api/pilot/v80/intake/ga` | GA release manifest (`?download=1`) |

Machine-readable index is embedded in `docs/pilot/ga/ga-manifest.json` → `apiIndex`.
