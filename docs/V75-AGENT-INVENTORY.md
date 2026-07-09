# V75 P1 — Agent Inventory

Declarative agent inventory. **Read-only** — no runtime, API, database, or UI changes. V48–V74 untouched.

## Scope (P1 only)

| Concept | Purpose |
|---------|---------|
| Agent Inputs | Signal/metric/decision inputs (`AGT-INP-*`) |
| Agent Outputs | Action/recommendation/handoff outputs (`AGT-OUT-*`) |
| Agent Context | Deployment and decision context (`AGT-CTX-*`) |
| Agent Constraints | Boundary and governance constraints (`AGT-CST-*`) |
| Agent Policies | Declarative agent policies (`AGT-POL-*`) |
| Agent Sources | Upstream version sources (`AGT-SRC-*`) |

Each asset carries `status`: `declared` | `registered` | `active` | `frozen`.

## Module layout

```
lib/agent/v75/
  agent.types.ts
  agent.inventory.ts
  agent.dependencies.ts
  agent.scope.ts
  agent.entry.ts
```

## Entry

```ts
import { buildAgentInventory, runAgentInventory } from "@/lib/agent/v75/agent.entry";

const report = runAgentInventory({ deploymentId: "prod" });
```

## Exports

- `V75_AGENT_VERSION` = `v75-agent-inventory-1`
- `V75_AGENT_FREEZE_VERSION` = `v75-agent-inventory-freeze-1`
- `buildAgentInventory()`
- `runAgentInventory()`

## Upstream (read-only)

- **V74**: `v74-decision-freeze-1` / `v74-decision-signoff-1` via `agent.dependencies.ts`

## Verify

```bash
npx tsx scripts/verify-v75-p1-agent-inventory.ts
```

## Freeze point (P1)

- `v75-agent-inventory-freeze-1`

## Boundaries

- Declarative inventory only — no agent orchestration at runtime
