# V48 SaaS Foundation — Phase 1

**Version:** `v48-saas-foundation-p1`  
**Tag:** `v48-saas-foundation-p1`  
**Status:** Data Foundation

## Goal

Establish production SaaS data layer without modifying V38–V47 frozen modules.

## Scope

- Prisma models with `saas_*` table prefix
- RBAC / Plan catalog seed (idempotent)
- Static + DB verification
- Commercial adapter boundary types only (no V47 runtime import)

## Data Relations

```txt
SaasTenant -> SaasOrganization
SaasTenant -> SaasWorkspace
SaasTenant -> SaasMembership
SaasTenant -> SaasSubscription
SaasTenant -> SaasEntitlementGrant
SaasOrganization -> SaasWorkspace
SaasOrganization -> SaasMembership
SaasWorkspace -> SaasMembership
SaasMembership -> User
SaasRole -> SaasPermission (SaasRolePermission)
SaasPlan -> SaasSubscription
```

## Commands

```bash
npm run seed:saas-foundation
npm run verify:saas-foundation-p1
```

## Out of Scope (Phase 1)

- `app/api/saas/*`
- V47 runtime calls
- Business tenant demo data in seed

## Next Phase

- **P2:** Auth + TenantContext
- **P3:** Tenant Lifecycle API
- **P4:** Commercial Adapter (V47 hydrate)
