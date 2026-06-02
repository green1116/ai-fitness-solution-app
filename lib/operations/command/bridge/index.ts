export * from "./types";
export * from "./plan";
export * from "./dispatch-execution";
export * from "./dispatch-change";
export * from "./dispatch-incident";
export * from "./dispatch-recovery";
export * from "./dispatch";
export * from "./bridge";

import {
  COMMAND_EXECUTION_BRIDGE_VERSION,
  type AutonomousCommandExecutionRuntimeInput,
  type AutonomousCommandExecutionRuntimeResult,
} from "./types";
import { buildCommandExecutionBridge } from "./bridge";

export type AutonomousCommandExecutionRuntime = AutonomousCommandExecutionRuntimeResult;

export function buildAutonomousCommandExecutionRuntime(
  input: AutonomousCommandExecutionRuntimeInput,
): AutonomousCommandExecutionRuntimeResult {
  const bridge = buildCommandExecutionBridge({
    deploymentId: input.deploymentId,
    command: input.command,
    execution: input.execution,
    change: input.change,
    incident: input.incident,
    recovery: input.recovery,
  });

  const hasDispatched = bridge.summary.dispatched > 0;
  const hasFailed = bridge.summary.failed > 0;
  let status: AutonomousCommandExecutionRuntimeResult["status"] = "completed";
  if (!hasDispatched && bridge.plans.length === 0) status = "idle";
  else if (hasFailed) status = "failed";
  else if (hasDispatched && bridge.summary.skipped > 0) status = "partial";
  else if (bridge.plans.some((p) => p.status === "dispatching")) status = "dispatching";

  return {
    version: COMMAND_EXECUTION_BRIDGE_VERSION,
    bridge,
    plans: bridge.plans,
    targets: bridge.targets,
    executionDispatches: bridge.executionDispatches,
    changeDispatches: bridge.changeDispatches,
    incidentDispatches: bridge.incidentDispatches,
    recoveryDispatches: bridge.recoveryDispatches,
    results: bridge.results,
    rollbackReadiness: bridge.rollbackReadiness,
    dispatchedCommands: [
      ...new Set(
        [
          ...bridge.executionDispatches,
          ...bridge.changeDispatches,
          ...bridge.incidentDispatches,
          ...bridge.recoveryDispatches,
        ]
          .filter((d) => d.status === "dispatched")
          .map((d) => d.intentId),
      ),
    ],
    flags: {
      bridge: true,
      plans: bridge.plans.length > 0,
      executionDispatch: bridge.executionDispatches.length >= 0,
      changeDispatch: bridge.changeDispatches.length >= 0,
      incidentDispatch: bridge.incidentDispatches.length >= 0,
      recoveryDispatch: bridge.recoveryDispatches.length >= 0,
      results: bridge.results.length > 0,
      rollback: bridge.rollbackReadiness.length > 0,
    },
    summary: {
      summaryId: bridge.summary.summaryId,
      text: bridge.summary.text,
      traceId: `command-execution-bridge-trace-${input.deploymentId}`,
    },
    status,
  };
}
