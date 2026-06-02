import { buildOperationalGovernanceRuntime } from "../../governance";
import { buildOperationalAutonomousExecutionRuntime } from "../../execution";
import { buildAutonomousChangeManagementRuntime } from "../../change";
import { buildAutonomousIncidentManagementRuntime } from "../../incident";
import { buildAutonomousRecoveryOrchestrationRuntime } from "../../recovery";
import { buildAutonomousOperationsCenterRuntime } from "../../center";
import { buildAutonomousCommandRuntime } from "../index";
import { buildHumanInTheLoopCommandRuntime } from "../hitl";
import { buildAutonomousCommandExecutionRuntime } from "../bridge";
import { buildHITLBridgeCoordinationRuntime } from "../hitl-bridge";

export type CommandPlatformStack = {
  deploymentId: string;
  governance: ReturnType<typeof buildOperationalGovernanceRuntime>;
  execution: ReturnType<typeof buildOperationalAutonomousExecutionRuntime>;
  change: ReturnType<typeof buildAutonomousChangeManagementRuntime>;
  incident: ReturnType<typeof buildAutonomousIncidentManagementRuntime>;
  recovery: ReturnType<typeof buildAutonomousRecoveryOrchestrationRuntime>;
  operations: ReturnType<typeof buildAutonomousOperationsCenterRuntime>;
  command: ReturnType<typeof buildAutonomousCommandRuntime>;
  hitl: ReturnType<typeof buildHumanInTheLoopCommandRuntime>;
  bridge: ReturnType<typeof buildAutonomousCommandExecutionRuntime>;
  coordination: ReturnType<typeof buildHITLBridgeCoordinationRuntime>;
};

export function buildCommandPlatformStack(deploymentId: string): CommandPlatformStack {
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

  const hitl = buildHumanInTheLoopCommandRuntime({
    deploymentId,
    command,
    defaultReviewer: "command-api",
  });

  const bridge = buildAutonomousCommandExecutionRuntime({
    deploymentId,
    command,
    execution,
    change,
    incident,
    recovery,
  });

  const coordination = buildHITLBridgeCoordinationRuntime({
    deploymentId,
    command,
    hitl,
    bridge,
  });

  return {
    deploymentId,
    governance,
    execution,
    change,
    incident,
    recovery,
    operations,
    command,
    hitl,
    bridge,
    coordination,
  };
}
