import type { CommandPlatformStack } from "../api/stack";

export const GATED_BRIDGE_ORCHESTRATOR_VERSION = "v4-a5-a5-gated-bridge-orchestrator-1" as const;
export type GatedBridgeOrchestratorVersion = typeof GATED_BRIDGE_ORCHESTRATOR_VERSION;

export type OrchestrationMode = "dry-run" | "orchestration-only" | "live-ready" | "rollback-aware";

export type OrchestrationStepStatus = "planned" | "gated" | "ready" | "dispatched" | "blocked" | "skipped";

export type OrchestrationStep = {
  stepId: string;
  intentId: string;
  sequence: number;
  domain: string;
  status: OrchestrationStepStatus;
  mode: OrchestrationMode;
  detail: string;
};

export type OrchestrationDecisionOutcome = "proceed" | "block" | "defer";

export type OrchestrationDecision = {
  decisionId: string;
  intentId: string;
  outcome: OrchestrationDecisionOutcome;
  reason: string;
  gateState: string;
  timestamp: string;
};

export type OrchestrationReadinessProfile = {
  profileId: string;
  intentId: string;
  admitted: boolean;
  hitlCleared: boolean;
  bridgePlanReady: boolean;
  dispatchReady: boolean;
  rollbackCapable: boolean;
  liveReady: boolean;
  detail: string;
};

export type OrchestrationPlan = {
  planId: string;
  deploymentId: string;
  mode: OrchestrationMode;
  admittedIntentIds: string[];
  blockedIntentIds: string[];
  steps: OrchestrationStep[];
  rollbackAware: boolean;
};

export type OrchestrationResult = {
  resultId: string;
  deploymentId: string;
  mode: OrchestrationMode;
  admittedCount: number;
  blockedCount: number;
  dispatchedCount: number;
  readyCount: number;
  skippedCount: number;
  success: boolean;
  summary: string;
};

export type OrchestrationAuditRecord = {
  recordId: string;
  intentId: string;
  phase: "gate" | "readiness" | "orchestration" | "dispatch" | "audit";
  action: string;
  outcome: "pass" | "fail" | "skip";
  detail: string;
  timestamp: string;
};

export type GatedBridgeOrchestrator = {
  orchestratorId: string;
  deploymentId: string;
  platformVersion: "V4-A5-A5";
  mode: OrchestrationMode;
  plan: OrchestrationPlan;
  decisions: OrchestrationDecision[];
  readinessProfiles: OrchestrationReadinessProfile[];
  result: OrchestrationResult;
  audit: OrchestrationAuditRecord[];
  gate: {
    state: string;
    admittedIntentIds: string[];
    blockedIntentIds: string[];
  };
  bridge: {
    filteredPlans: number;
    filteredDispatches: number;
    filteredResults: number;
  };
};

export type GatedBridgeOrchestratorInput = {
  deploymentId: string;
  mode?: OrchestrationMode;
  stack?: CommandPlatformStack;
};

export type GatedBridgeOrchestratorResult = {
  version: GatedBridgeOrchestratorVersion;
  orchestrator: GatedBridgeOrchestrator;
  flags: {
    plan: boolean;
    readiness: boolean;
    orchestration: boolean;
    dispatch: boolean;
    audit: boolean;
    rollback: boolean;
  };
  summary: { summaryId: string; text: string; traceId: string };
  status: "idle" | "orchestrating" | "completed" | "partial" | "blocked";
};
