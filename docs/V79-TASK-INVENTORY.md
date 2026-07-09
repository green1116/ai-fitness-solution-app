# V79 P1 — Task Inventory

Declarative task lifecycle inventory. **Read-only** — no runtime, API, database, or UI changes. V48–V78 untouched.

## Scope (P1 only)

| Concept | Purpose |
|---------|---------|
| Task Roles | Declarative task roles (`TSK-ROL-*`) |
| Task States | Lifecycle state catalog (`TSK-STA-*`) |
| Task Topology | Acyclic task graph nodes (`TSK-TOP-*`) |
| Task Scopes | Global/domain/session boundaries (`TSK-SCP-*`) |
| Task Dependencies | Upstream V78 execution locks (`TSK-DEP-*`) |
| Task Governance | Freeze/audit/compliance rules (`TSK-GOV-*`) |

## Module layout

```
lib/task/v79/
  task.types.ts
  task.inventory.ts
  task.state.ts
  task.dependencies.ts
  task.scope.ts
  task.entry.ts
```

## Entry

```ts
import { buildTaskInventory, runTaskInventory } from "@/lib/task/v79/task.entry";

const report = runTaskInventory({ deploymentId: "prod" });
```

## Exports

- `V79_TASK_VERSION` = `v79-task-inventory-1`
- `V79_TASK_FREEZE_VERSION` = `v79-task-inventory-freeze-1`
- `buildTaskInventory()`
- `runTaskInventory()`

## Upstream (read-only)

- **V78**: `v78-execution-freeze-1` / `v78-execution-signoff-1` via `task.dependencies.ts`

## Verify

```bash
npx tsx scripts/verify-v79-p1-task-inventory.ts
```

## Freeze point (P1)

- `v79-task-inventory-freeze-1`

## Boundaries

- Declarative inventory only — no runtime task engine
