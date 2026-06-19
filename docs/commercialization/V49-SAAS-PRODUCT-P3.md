# V49 SaaS Product — Phase 3

**Tag:** `v49-saas-product-p3`

## Goal

Workspace Product Runtime — instance layer built on P2 `ProductContext`, with in-memory repository and V47 CustomerWorkspace mapping skeleton.

## Principles

- No V38–V48 modifications
- No P1/P2 interface changes
- No quote/workflow execution
- All instances derived from valid `ProductContext`

## Components

| Function | Description |
|----------|-------------|
| `createProductWorkspace()` | Create instance from ProductContext |
| `resolveWorkspaceProduct()` | Load by workspaceProductId |
| `listWorkspaceProducts()` | List by tenantId |
| `bindWorkspaceProduct()` | Refresh context snapshot + status |
| `mapSaasWorkspaceToV47CustomerWorkspace()` | Skeleton V47 workspace mapping |

## Lifecycle

`draft` → `active` → `suspended` → `archived`

## WorkspaceProductInstance

```ts
workspaceProductId, tenantId, workspaceId, productCode
productDefinition, productContextSnapshot
v47CustomerWorkspaceMapping, status, createdAt, updatedAt, metadata
```

## Commands

```bash
npm run verify:saas-product-p3
```

## Next Phase

- **P4:** Quote Workflow Runtime
