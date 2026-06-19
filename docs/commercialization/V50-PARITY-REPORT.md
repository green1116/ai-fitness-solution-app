# V50 Parity Report

**Tag:** `v50-production-persistence-p6`  
**Status:** `FAIL`  
**Generated:** `2026-06-19T12:40:47.805Z`

## Scope

Compare `memory` backend vs `prisma` backend for semantic parity:

- workspace create
- workspace archive
- workflow create
- workflow approve
- history count
- event count

## Backend Status

| Backend | Status |
|---------|--------|
| memory | `ok` |
| prisma | `unavailable` |

**Prisma error:** `
Invalid `prisma.workspace.create()` invocation in
C:\Users\lenovo\ai-solution-app\lib\saas-product-persistence\repositories\workspace-repository.ts:27:40

  24 
  25 export const workspaceRepository: WorkspaceRepository = {
  26   async create(input: CreateWorkspaceInput): Promise<WorkspaceRecord> {
→ 27     const row = await prisma.workspace.create(
Error querying the database: FATAL: (ENOTFOUND) tenant/user postgres.ahfheyurjirvzorxwdbq not found`

## Memory Snapshot

```json
{
  "backend": "memory",
  "workspace": {
    "tenantId": "p6-parity-tenant",
    "name": "p6-workspace-verify",
    "statusAfterCreate": "ACTIVE",
    "statusAfterArchive": "ARCHIVED"
  },
  "workflow": {
    "workflowType": "QUOTE",
    "stateAfterCreate": "CREATED",
    "stateAfterApprove": "APPROVED",
    "createEventType": "WORKFLOW_CREATED",
    "approveEventType": "STATE_CHANGED",
    "approveHistoryFrom": "CREATED",
    "approveHistoryTo": "APPROVED",
    "historyCount": 2,
    "eventCount": 2
  }
}
```

## Prisma Snapshot

```json
null
```

## Mismatches

_No mismatches detected._


## Result

```txt
parity=FAIL
mismatchCount=0
```
