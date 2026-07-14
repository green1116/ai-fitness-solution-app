# E03-P3 Tool Execution Runtime

## Base
- `enterprise-e03-p2-agent-runtime-kernel-v1`
- Platform isolation: additive under `lib/agent-platform/e03/tool/`
- Does **not** modify E03 P1 foundation or E03 P2 agent runtime

## Goal
Provide an enterprise-grade tool execution kernel for autonomous agents:
permission gate → execute → result → auditable trace.

## Runtime Identity
- Runtime ID: `enterprise-e03-p3-tool-execution-runtime-v1`
- Version: `e03-tool-runtime-1`
- Freeze: `e03-tool-runtime-freeze-1`

## Module Map
| File | Responsibility |
|---|---|
| `tool.types.ts` | Shared tool request/caller/output types |
| `tool.constants.ts` | IDs, phases, permission levels, statuses |
| `tool.contract.ts` | Tool contract + input validation |
| `tool.registry.ts` | Static tool catalog |
| `tool.permission.ts` | Role/permission authorization |
| `tool.executor.ts` | Phase machine + `executeTool` |
| `tool.result.ts` | `ToolExecutionResult` |
| `tool.trace.ts` | Audit/governance trace events |
| `tool.runtime.ts` | Clean facade: `runTool` / `runToolOrThrow` |

## Lifecycle
`PENDING → AUTHORIZED → RUNNING → COMPLETED → RESULT`

Denied or failed executions short-circuit with `status: denied | failed` and traced events.

## Built-in Tools
- `e03.tool.echo` — public echo probe
- `e03.tool.inspect` — input key inspection
- `e03.tool.transform` — text transform
- `e03.tool.hash` — deterministic djb2 digest
- `e03.tool.validate` — length validation
- `e03.tool.coordinator.ping` — coordinator-only ping

## Clean API
Primary entry: `lib/agent-platform/e03/tool/tool.runtime.ts`

```ts
import { runToolOrThrow } from "@/lib/agent-platform/e03/tool/tool.runtime";

const run = runToolOrThrow({
  toolId: "e03.tool.echo",
  caller: { agentId: "e03.agent.worker", role: "worker" },
  input: { message: "hello" },
});
```

## Verification
```bash
npx tsx scripts/verify-e03-p3-tool-runtime.ts
npx tsc --noEmit
```

## Isolation Guarantees
- No API / Prisma / DB / UI / LLM / Workflow / KG / PDF
- No npm external dependencies
- P1/P2 files remain frozen (hash-checked in verify script)
- Reuses P1 `AgentRole` only as a type import
