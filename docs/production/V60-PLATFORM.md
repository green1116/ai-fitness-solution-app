# V60 Production Platform Documentation

Generated as part of V60 Platform Hardening & Production Readiness.

## Architecture

- **V48–V57**: SaaS foundation, Workspace, Quote, Product Experience
- **V58**: Document & Delivery Platform
- **V59**: Enterprise Delivery Intelligence
- **V60**: Production hardening — security audit, boundary validation, observability, health center

## Security Model

- Portal APIs use `getPortalUserContext` or SaaS `api-gate`
- Tenant isolation via `lib/tenancy/tenant.guard.ts`
- Rate limiting and RBAC via `lib/security/*`

## Permission Model

| Role | Workspace | Documents | Intelligence | Executive | Production Ops |
|------|-----------|-----------|--------------|-----------|----------------|
| MEMBER | ✓ | ✓ | ✓ | — | — |
| MANAGER | ✓ | ✓ | ✓ | ✓ | — |
| ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ |
| OWNER | ✓ | ✓ | ✓ | ✓ | ✓ |

## Deployment

```bash
npm run verify:v60-production
npx tsc --noEmit
npm run build
```

- Disable `ENABLE_MOCK_AUTH` in production
- Run Prisma migrations before deploy
- Use secure httpOnly cookies

## API Endpoints (V60)

- `GET /api/production/health`
- `GET /api/production/readiness`
- `GET /api/production/security-audit`
- `GET /api/production/boundary`
- `GET /api/production/integrity`
- `GET /api/production/performance`
- `GET /api/production/errors`
- `GET /api/production/technical-debt`
- `GET /api/production/observability`
- `GET /api/production/documentation`
