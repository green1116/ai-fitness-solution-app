/**
 * E01-P6 — Enterprise AI Agent Orchestration types
 * Agent Registry + orchestration lifecycle
 */

export const V101_AGENT_ORCHESTRATION_VERSION = "v101-agent-orchestration-1" as const;
export const V101_AGENT_ORCHESTRATION_FREEZE_VERSION =
  "v101-agent-orchestration-freeze-1" as const;

export type AgentRole =
  | "intake"
  | "understanding"
  | "intelligence"
  | "strategy"
  | "proposal"
  | "orchestrator";

export type AgentCapability =
  | "ingest"
  | "structure"
  | "analyze"
  | "decide"
  | "compose"
  | "coordinate";

export type AgentStatus = "registered" | "ready" | "running" | "succeeded" | "failed" | "skipped";

export type OrchestrationLifecycleStage =
  | "registry"
  | "plan"
  | "execute"
  | "assemble";

export type AgentDefinition = {
  id: string;
  role: AgentRole;
  name: string;
  capability: AgentCapability;
  kernelRef: string;
  dependsOn: string[];
  optional: boolean;
  readOnly: true;
};

export type AgentRunRecord = {
  id: string;
  agentId: string;
  role: AgentRole;
  status: AgentStatus;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  outputRef?: string;
  message: string;
  readOnly: true;
};

export type AgentRegistryManifest = {
  version: typeof V101_AGENT_ORCHESTRATION_VERSION;
  agentCount: number;
  roles: AgentRole[];
  agents: AgentDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};

export type OrchestrationPlanStep = {
  id: string;
  order: number;
  agentId: string;
  role: AgentRole;
  dependsOn: string[];
  readOnly: true;
};

export type OrchestrationPlan = {
  id: string;
  stepCount: number;
  steps: OrchestrationPlanStep[];
  readOnly: true;
};

export type OrchestrationArtifactRefs = {
  intakeReportId?: string;
  understandingReportId?: string;
  intelligenceReportId?: string;
  strategyReportId?: string;
  proposalReportId?: string;
  workspaceId?: string;
  requirementIndexId?: string;
  opportunityId?: string;
  strategyId?: string;
  blueprintId?: string;
};

export type OrchestrationLifecycleTransition = {
  from: OrchestrationLifecycleStage;
  to: OrchestrationLifecycleStage;
  at: string;
  note?: string;
  readOnly: true;
};

export type OrchestrationLifecycle = {
  current: OrchestrationLifecycleStage;
  stages: OrchestrationLifecycleStage[];
  transitions: OrchestrationLifecycleTransition[];
  complete: boolean;
  readOnly: true;
};

export type AgentOrchestrationInput = {
  deploymentId?: string;
  projectHint?: string;
  organizationHint?: string;
  rawText: string;
  estimatedValueHint?: number;
  preferredEmphasis?: Array<
    "compliance" | "equipment" | "commercial" | "delivery" | "differentiation"
  >;
  titleHint?: string;
};

export type AgentOrchestrationResult = {
  version: typeof V101_AGENT_ORCHESTRATION_VERSION;
  freezeVersion: typeof V101_AGENT_ORCHESTRATION_FREEZE_VERSION;
  reportId: string;
  deploymentId: string;
  generatedAt: string;
  registry: AgentRegistryManifest;
  plan: OrchestrationPlan;
  runs: AgentRunRecord[];
  artifacts: OrchestrationArtifactRefs;
  lifecycle: OrchestrationLifecycle;
  ready: boolean;
  readinessScore: number;
  summary: string;
};
