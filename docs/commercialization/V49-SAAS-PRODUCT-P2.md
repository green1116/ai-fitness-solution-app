# V49 SaaS Product — Phase 2

**Tag:** `v49-saas-product-p2`

## Goal

Establish Product Context Runtime — unified context resolution for tenant, workspace, and product binding without business execution.

## Principles

- No V38–V48 modifications
- No P1 interface changes
- Context orchestration only — no workflow execution
- P6 subscription entitlements read for feature flags (informational)
- P5 RBAC permissions attached to context

## Components

| Module | Function |
|--------|----------|
| `bindTenantContext()` | Extract and validate tenant slice from `TenantContext` |
| `bindWorkspaceContext()` | Build `WorkspaceProductBinding` with portal catalog check |
| `bindProductContext()` | Resolve product, workflows, V47 mapping, feature flags |
| `resolveProductContext()` | Single entry — compose full `ProductContext` |

## ProductContext Fields

```ts
tenantId, workspaceId, userId, portalType
productCode, productDefinition, workflowStages
workspaceBinding, v47ModuleMapping
permissions, featureFlags, source
```

## Guard Rules

- Tenant requires `userId`, `tenantId`, `portalType`
- Workspace requires `workspaceId` and portal catalog membership
- Product must be compatible with `portalType`

## Commands

```bash
npm run verify:saas-product-p2
```

## Next Phase

- **P3:** Workspace Product Runtime — persistent workspace product instances
