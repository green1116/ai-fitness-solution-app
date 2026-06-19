# V49 Architecture Diagram

## Platform Stack

```
┌─────────────────────────────────────────────────────────────┐
│              Industry Intelligence (V38~V46)                 │
├─────────────────────────────────────────────────────────────┤
│           Commercial Products Layer (V47, Frozen)            │
│              catalog / mapping — read-only                   │
├─────────────────────────────────────────────────────────────┤
│         Production SaaS Foundation (V48, Frozen)             │
│    tenant / rbac / subscription / portal / platform          │
├─────────────────────────────────────────────────────────────┤
│         SaaS Product Operating Layer (V49, Frozen)           │
│  P1 Registry → P2 Context → P3 Workspace → P4/P5 Workflow   │
│           → P6 Portal Shell → P7 Ops → P8 Freeze             │
└─────────────────────────────────────────────────────────────┘
```

## V49 Internal Flow

```
TenantContext
     ↓
resolveProductContext()          [P2]
     ↓
createProductWorkspace()         [P3]
     ↓
createQuoteWorkflow()            [P4]
     ↓
transitionBusinessWorkflow()     [P5: APPROVAL / DELIVERY / RELEASE]
     ↓
buildPortalView()                [P6: headless portal model]
     ↓
buildProductOpsRuntime()         [P7: health / metrics / lifecycle]
```

## Read vs Write Boundaries

| Layer | Read | Write |
|-------|------|-------|
| P1 | Product catalog | — |
| P2 | Context resolution | — |
| P3 | Workspace instances | create/bind workspace |
| P4/P5 | Workflow instances | workflow transitions |
| P6 | Aggregate P2~P5 | — |
| P7 | Aggregate P2~P6 | lifecycle status only |

P6 and P7 **never** execute V47 runtime or workflow transitions.
