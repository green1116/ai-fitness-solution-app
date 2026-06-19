# V49 SaaS Product — Phase 4

**Tag:** `v49-saas-product-p4`

## Goal

Quote Workflow Runtime — unified workflow instance layer with state machine, transitions, events, and commercial adapter context mapping.

## Architecture

```txt
WorkspaceProductInstance (P3)
        ↓
WorkflowInstance (QUOTE)
        ↓
State Machine: draft → estimating → review → approved → released
        ↓
CommercialAdapterWorkflowContext (mapper, no V47 execution)
```

## Components

| Module | Responsibility |
|--------|----------------|
| `workflow-repository` | In-memory WorkflowInstance store |
| `workflow-state-machine` | Legal transition validation |
| `workflow-transition-engine` | `transitionWorkflow()` + history |
| `workflow-events` | WORKFLOW_CREATED / STATE_CHANGED / WORKFLOW_RELEASED |
| `quote-workflow-runtime` | `createQuoteWorkflow()` entry |
| `workflow-mapper` | `mapWorkflowToCommercialAdapterContext()` |

## Quote State Machine

```txt
draft → estimating → review → approved → released
```

Illegal jumps are rejected with `WORKFLOW_TRANSITION_DENIED`.

## Commands

```bash
npm run verify:saas-product-p4
```

## Next Phase

- **P5:** Delivery & Approval Workflow
