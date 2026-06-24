# V61 Commercial Launch Documentation

## Launch Architecture

V61 closes production without expanding business modules:

- **P1** Technical debt closure (mock auth, org column probe, executive RBAC, MANAGER matrix)
- **P2** Portal RBAC: OWNER / ADMIN / MANAGER / MEMBER
- **P3–P5** Environment, journey, commercial validation
- **P6** Operations dashboard
- **P7–P10** Checklist, readiness scores, Go/No-Go engine
- **P12** Launch Center at `/launch`

## Verification

```bash
npm run verify:v61-launch
```

## Production Environment

| Variable | Production |
|----------|------------|
| `ENABLE_MOCK_AUTH` | Must NOT be set |
| `ENABLE_COMMERCIAL_REGISTER` | `1` to allow register |
| `SESSION_SECRET` | Strong non-default value |
| `DATABASE_URL` | Required |

## API Endpoints

- `GET /api/launch/go-no-go`
- `GET /api/launch/checklist`
- `GET /api/launch/readiness`
- `GET /api/launch/operations`
- `GET /api/launch/validation/environment`
- `GET /api/launch/validation/journey`
- `GET /api/launch/validation/commercial`
- `GET /api/launch/debt-closure`
- `GET /api/launch/rbac`

All launch APIs require **ADMIN+** role (`launch` surface).

## Go / No-Go Criteria

**GO** when:

- Launch checklist ready (≥8/10 pass, no fails)
- Overall launch score ≥ 85
- Targeted technical debt closed
- No blockers

Otherwise **NO-GO**.
