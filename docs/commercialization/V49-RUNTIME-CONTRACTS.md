# V49 Runtime Contracts (Frozen)

Contracts frozen at P8. **No signature or structural changes after `v49-saas-product-final`.**  
Extensions allowed in V50+ via new modules or metadata fields.

## Frozen Entry Points

| Contract | Layer | Purpose |
|----------|-------|---------|
| `resolveProduct()` | P1 | Resolve product definition by SKU |
| `resolveProductContext()` | P2 | Bind tenant + workspace + product context |
| `createProductWorkspace()` | P3 | Materialize workspace product instance |
| `createQuoteWorkflow()` | P4 | Start quote workflow |
| `transitionBusinessWorkflow()` | P5 | Transition APPROVAL/DELIVERY/RELEASE |
| `buildPortalView()` | P6 | Headless portal view model |
| `buildProductOpsRuntime()` | P7 | Ops dashboard + health runtime |

## Frozen Type Contracts

| Type | Layer | Extension Rule |
|------|-------|----------------|
| `ProductContext` | P2 | metadata only after P8 |
| `WorkspaceProductInstance` | P3 | metadata only after P8 |
| `WorkflowInstance` | P4/P5 | metadata only after P8 |
| `PortalViewModel` | P6 | metadata only after P8 |
| `ProductOpsDashboard` | P7 | metadata only after P8 |

## API Map

### Registry (P1)
`resolveProduct`, `listProducts`, `resolveWorkflowStage`

### Context (P2)
`resolveProductContext`, `bindTenantContext`, `bindWorkspaceContext`, `bindProductContext`

### Workspace (P3)
`createProductWorkspace`, `resolveWorkspaceProduct`, `listWorkspaceProducts`

### Workflow (P4)
`createQuoteWorkflow`, `transitionWorkflow`, `listWorkflowInstances`

### Business Process (P5)
`createApprovalWorkflow`, `createDeliveryWorkflow`, `createReleaseWorkflow`, `transitionBusinessWorkflow`

### Portal (P6)
`resolvePortalContext`, `buildPortalView`, `getPortalCapabilities`, `resolvePortalRoute`

### Ops (P7)
`buildProductOpsRuntime`, `buildProductOpsDashboard`, `calculateProductHealth`, `runHealthChecks`, lifecycle controls

## Verification

```bash
npm run verify:saas-product-p8
```

Checks: `runtimeContractsFrozen`, `typeSystemLocked`.
