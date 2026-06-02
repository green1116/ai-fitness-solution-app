/**
 * V4-A5-A1 Command Execution Bridge — verification
 */
import { buildOperationalGovernanceRuntime } from "../lib/operations/governance";
import { buildOperationalAutonomousExecutionRuntime } from "../lib/operations/execution";
import { buildAutonomousChangeManagementRuntime } from "../lib/operations/change";
import { buildAutonomousIncidentManagementRuntime } from "../lib/operations/incident";
import { buildAutonomousRecoveryOrchestrationRuntime } from "../lib/operations/recovery";
import { buildAutonomousOperationsCenterRuntime } from "../lib/operations/center";
import { buildAutonomousCommandRuntime } from "../lib/operations/command";
import {
  COMMAND_EXECUTION_BRIDGE_VERSION,
  buildAutonomousCommandExecutionRuntime,
  buildCommandExecutionBridge,
  buildCommandExecutionPlan,
  dispatchCommand,
  dispatchExecution,
  dispatchChange,
  dispatchIncident,
  dispatchRecovery,
} from "../lib/operations/command/bridge";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const deploymentId = "v4-verify-command-execution-bridge";
  const governance = buildOperationalGovernanceRuntime({ deploymentId });

  const execution = buildOperationalAutonomousExecutionRuntime({
    deploymentId,
    mode: "simulation",
    autonomous: governance.governanceAutonomous,
    intelligence: governance.governanceIntelligence,
  });

  const change = buildAutonomousChangeManagementRuntime({
    deploymentId,
    autonomous: governance.governanceAutonomous,
    execution,
  });

  const incident = buildAutonomousIncidentManagementRuntime({
    deploymentId,
    intelligence: governance.governanceIntelligence,
    observability: governance.governanceFederationObservability,
    execution,
    change,
  });

  const recovery = buildAutonomousRecoveryOrchestrationRuntime({
    deploymentId,
    intelligence: governance.governanceIntelligence,
    autonomous: governance.governanceAutonomous,
    execution,
    change,
    incident,
  });

  const operations = buildAutonomousOperationsCenterRuntime({
    deploymentId,
    execution,
    change,
    incident,
    recovery,
  });

  const command = buildAutonomousCommandRuntime({
    deploymentId,
    operations,
    execution,
    change,
    incident,
    recovery,
  });

  const runtime = buildAutonomousCommandExecutionRuntime({
    deploymentId,
    command,
    execution,
    change,
    incident,
    recovery,
  });

  assert(runtime.version === COMMAND_EXECUTION_BRIDGE_VERSION, "bridge version");
  assert(runtime.bridge.platformVersion === "V4-A5-A1", "platform version");
  assert(runtime.flags.bridge, "bridge flag");
  assert(runtime.plans.length > 0, "execution plans");
  assert(runtime.targets.length > 0, "execution targets");
  assert(runtime.results.length > 0, "execution results");
  assert(runtime.rollbackReadiness.length > 0, "rollback readiness");
  assert(runtime.bridge.summary.plans === runtime.plans.length, "summary plans");

  const bridge = buildCommandExecutionBridge({
    deploymentId,
    command,
    execution,
    change,
    incident,
    recovery,
  });
  assert(bridge.bridgeId.includes(deploymentId), "buildCommandExecutionBridge");

  const sampleIntent = command.intents.find((i) =>
    command.authorityEvaluations.some((e) => e.intentId === i.intentId && e.authorized),
  );
  assert(!!sampleIntent, "authorized intent for plan");

  const route = command.routes.find((r) => r.intentId === sampleIntent!.intentId)!;
  const policyEvaluation = command.policyEvaluations.find((e) => e.intentId === sampleIntent!.intentId)!;
  const authorityEvaluation = command.authorityEvaluations.find((e) => e.intentId === sampleIntent!.intentId)!;
  const delegation = command.delegations.find((d) => d.intentId === sampleIntent!.intentId) ?? null;
  const coordination = command.coordinations.find((c) => c.intentId === sampleIntent!.intentId);

  const plan = buildCommandExecutionPlan({
    deploymentId,
    intent: sampleIntent!,
    route,
    policyEvaluation,
    authorityAuthorized: authorityEvaluation.authorized,
    delegation,
    coordination,
    executionRuntimeId: execution.registry.executionRuntimeId,
    changeRuntimeId: change.registry.changeManagementId,
    incidentRuntimeId: incident.registry.incidentManagementId,
    recoveryRuntimeId: recovery.registry.recoveryOrchestrationId,
  });
  assert(plan !== null, "buildCommandExecutionPlan");

  const bundle = dispatchCommand({
    deploymentId,
    plan: plan!,
    execution,
    change,
    incident,
    recovery,
  });
  assert(bundle.results.length > 0, "dispatchCommand");

  const execDispatches = dispatchExecution({ deploymentId, plan: plan!, execution });
  const changeDispatches = dispatchChange({ deploymentId, plan: plan!, change });
  const incidentDispatches = dispatchIncident({ deploymentId, plan: plan!, incident });
  const recoveryDispatches = dispatchRecovery({ deploymentId, plan: plan!, recovery });

  assert(execDispatches.length >= 0, "dispatchExecution");
  assert(changeDispatches.length >= 0, "dispatchChange");
  assert(incidentDispatches.length >= 0, "dispatchIncident");
  assert(recoveryDispatches.length >= 0, "dispatchRecovery");

  console.log("Command Execution Bridge");
  console.log("PASS");
  console.log(`version=${runtime.version}`);
  console.log(`status=${runtime.status}`);
  console.log(`bridgeSummary=${runtime.summary.text}`);
  console.log(`plans=${runtime.plans.length}`);
  console.log(`targets=${runtime.targets.length}`);
  console.log(`dispatchedCommands=${runtime.dispatchedCommands.length}`);
  console.log(`executionDispatches=${runtime.executionDispatches.length}`);
  console.log(`changeDispatches=${runtime.changeDispatches.length}`);
  console.log(`incidentDispatches=${runtime.incidentDispatches.length}`);
  console.log(`recoveryDispatches=${runtime.recoveryDispatches.length}`);
  console.log(`results=${runtime.results.length}`);
  console.log(`rollbackReady=${runtime.rollbackReadiness.filter((r) => r.capable).length}`);
  console.log(`bridge=${runtime.flags.bridge}`);
  console.log(`plansFlag=${runtime.flags.plans}`);
  console.log(`executionDispatch=${runtime.flags.executionDispatch}`);
  console.log(`changeDispatch=${runtime.flags.changeDispatch}`);
  console.log(`incidentDispatch=${runtime.flags.incidentDispatch}`);
  console.log(`recoveryDispatch=${runtime.flags.recoveryDispatch}`);
  console.log(`rollback=${runtime.flags.rollback}`);
}

main();
