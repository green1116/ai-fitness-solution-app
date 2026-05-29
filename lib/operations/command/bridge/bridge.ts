import type { AutonomousCommandRuntimeResult } from "../types";
import type { OperationalAutonomousExecutionRuntimeResult } from "../../execution/types";
import type { AutonomousChangeManagementRuntimeResult } from "../../change/types";
import type { AutonomousIncidentManagementRuntimeResult } from "../../incident/types";
import type { AutonomousRecoveryOrchestrationRuntimeResult } from "../../recovery/types";
import type { CommandExecutionBridge, CommandExecutionBridgeSummary } from "./types";
import { buildCommandExecutionPlans } from "./plan";
import { dispatchCommands } from "./dispatch";

export function buildCommandExecutionBridge(input: {
  deploymentId: string;
  command: AutonomousCommandRuntimeResult;
  execution: OperationalAutonomousExecutionRuntimeResult;
  change: AutonomousChangeManagementRuntimeResult;
  incident: AutonomousIncidentManagementRuntimeResult;
  recovery: AutonomousRecoveryOrchestrationRuntimeResult;
}): CommandExecutionBridge {
  const plans = buildCommandExecutionPlans({
    deploymentId: input.deploymentId,
    command: input.command,
    executionRuntimeId: input.execution.registry.executionRuntimeId,
    changeRuntimeId: input.change.registry.changeManagementId,
    incidentRuntimeId: input.incident.registry.incidentManagementId,
    recoveryRuntimeId: input.recovery.registry.recoveryOrchestrationId,
  });

  const targets = plans.flatMap((p) => p.targets);
  const dispatch = dispatchCommands({
    deploymentId: input.deploymentId,
    plans,
    execution: input.execution,
    change: input.change,
    incident: input.incident,
    recovery: input.recovery,
  });

  const allDispatches = [
    ...dispatch.executionDispatches,
    ...dispatch.changeDispatches,
    ...dispatch.incidentDispatches,
    ...dispatch.recoveryDispatches,
  ];
  const dispatched = allDispatches.filter((d) => d.status === "dispatched").length;
  const skipped = allDispatches.filter((d) => d.status === "skipped").length;
  const failed = allDispatches.filter((d) => d.status === "failed").length;
  const rollbackReady = dispatch.rollbackReadiness.filter((r) => r.capable).length;

  const summary: CommandExecutionBridgeSummary = {
    summaryId: `command-execution-bridge-summary-${input.deploymentId}`,
    text: `plans=${plans.length} targets=${targets.length} dispatched=${dispatched} skipped=${skipped} failed=${failed} rollbackReady=${rollbackReady}`,
    plans: plans.length,
    targets: targets.length,
    dispatched,
    skipped,
    failed,
    rollbackReady,
  };

  const dispatchedPlans = plans.map((p) => ({
    ...p,
    status:
      dispatch.dispatchedCommands.includes(p.intentId) ?
        ("dispatched" as const)
      : ("skipped" as const),
  }));

  return {
    bridgeId: `command-execution-bridge-${input.deploymentId}`,
    deploymentId: input.deploymentId,
    platformVersion: "V4-A5-A1",
    commandVersion: input.command.version,
    plans: dispatchedPlans,
    targets,
    executionDispatches: dispatch.executionDispatches,
    changeDispatches: dispatch.changeDispatches,
    incidentDispatches: dispatch.incidentDispatches,
    recoveryDispatches: dispatch.recoveryDispatches,
    results: dispatch.results,
    rollbackReadiness: dispatch.rollbackReadiness,
    summary,
  };
}
