import type { AutonomousCommandRuntimeResult } from "../types";
import type { OperationalAutonomousExecutionRuntimeResult } from "../../execution/types";
import type { AutonomousChangeManagementRuntimeResult } from "../../change/types";
import type { AutonomousIncidentManagementRuntimeResult } from "../../incident/types";
import type { AutonomousRecoveryOrchestrationRuntimeResult } from "../../recovery/types";

export const COMMAND_EXECUTION_BRIDGE_VERSION = "v4-a5-a1-command-execution-bridge-1" as const;
export type CommandExecutionBridgeVersion = typeof COMMAND_EXECUTION_BRIDGE_VERSION;

export type CommandExecutionMode =
  | "single-domain"
  | "multi-domain"
  | "coordinated"
  | "staged"
  | "rollback-capable";

export type CommandExecutionTargetDomain = "execution" | "change" | "incident" | "recovery";

export type CommandExecutionTarget = {
  targetId: string;
  intentId: string;
  domain: CommandExecutionTargetDomain;
  runtimeRef: string;
  entityRef: string;
  priority: "low" | "medium" | "high" | "critical";
  stage: number;
};

export type CommandExecutionPlan = {
  planId: string;
  intentId: string;
  mode: CommandExecutionMode;
  targets: CommandExecutionTarget[];
  coordinated: boolean;
  staged: boolean;
  rollbackCapable: boolean;
  status: "planned" | "dispatching" | "dispatched" | "skipped" | "failed";
};

export type ExecutionDispatch = {
  dispatchId: string;
  intentId: string;
  planId: string;
  runtimeId: string;
  candidateRef: string;
  planRef: string;
  status: "dispatched" | "skipped" | "failed";
  outcome: string;
};

export type ChangeDispatch = {
  dispatchId: string;
  intentId: string;
  planId: string;
  runtimeId: string;
  changeRequestRef: string;
  approvalRef: string;
  status: "dispatched" | "skipped" | "failed";
  outcome: string;
};

export type IncidentDispatch = {
  dispatchId: string;
  intentId: string;
  planId: string;
  runtimeId: string;
  incidentRef: string;
  responsePlanRef: string;
  status: "dispatched" | "skipped" | "failed";
  outcome: string;
};

export type RecoveryDispatch = {
  dispatchId: string;
  intentId: string;
  planId: string;
  runtimeId: string;
  recoveryRequestRef: string;
  orchestrationRef: string;
  status: "dispatched" | "skipped" | "failed";
  outcome: string;
};

export type CommandExecutionResult = {
  resultId: string;
  intentId: string;
  planId: string;
  domain: CommandExecutionTargetDomain;
  success: boolean;
  status: "completed" | "partial" | "failed" | "rolled-back-ready";
  detail: string;
};

export type RollbackReadiness = {
  readinessId: string;
  intentId: string;
  capable: boolean;
  rollbackPlanRef: string | null;
  reason: string;
};

export type CommandExecutionBridgeSummary = {
  summaryId: string;
  text: string;
  plans: number;
  targets: number;
  dispatched: number;
  skipped: number;
  failed: number;
  rollbackReady: number;
};

export type CommandExecutionBridge = {
  bridgeId: string;
  deploymentId: string;
  platformVersion: "V4-A5-A1";
  commandVersion: string;
  plans: CommandExecutionPlan[];
  targets: CommandExecutionTarget[];
  executionDispatches: ExecutionDispatch[];
  changeDispatches: ChangeDispatch[];
  incidentDispatches: IncidentDispatch[];
  recoveryDispatches: RecoveryDispatch[];
  results: CommandExecutionResult[];
  rollbackReadiness: RollbackReadiness[];
  summary: CommandExecutionBridgeSummary;
};

export type AutonomousCommandExecutionRuntimeInput = {
  deploymentId: string;
  command: AutonomousCommandRuntimeResult;
  execution: OperationalAutonomousExecutionRuntimeResult;
  change: AutonomousChangeManagementRuntimeResult;
  incident: AutonomousIncidentManagementRuntimeResult;
  recovery: AutonomousRecoveryOrchestrationRuntimeResult;
};

export type AutonomousCommandExecutionRuntimeResult = {
  version: CommandExecutionBridgeVersion;
  bridge: CommandExecutionBridge;
  plans: CommandExecutionPlan[];
  targets: CommandExecutionTarget[];
  executionDispatches: ExecutionDispatch[];
  changeDispatches: ChangeDispatch[];
  incidentDispatches: IncidentDispatch[];
  recoveryDispatches: RecoveryDispatch[];
  results: CommandExecutionResult[];
  rollbackReadiness: RollbackReadiness[];
  dispatchedCommands: string[];
  flags: {
    bridge: boolean;
    plans: boolean;
    executionDispatch: boolean;
    changeDispatch: boolean;
    incidentDispatch: boolean;
    recoveryDispatch: boolean;
    results: boolean;
    rollback: boolean;
  };
  summary: { summaryId: string; text: string; traceId: string };
  status: "idle" | "dispatching" | "completed" | "partial" | "failed";
};
