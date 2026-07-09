/**
 * V75 P1 — Agent inventory types (read-only)
 */

export const V75_AGENT_VERSION = "v75-agent-inventory-1" as const;
export const V75_AGENT_FREEZE_VERSION = "v75-agent-inventory-freeze-1" as const;

export type AgentAssetStatus = "declared" | "registered" | "active" | "frozen";

export type AgentInputKind =
  | "signal"
  | "metric"
  | "decision"
  | "policy"
  | "constraint"
  | "context";

export type AgentInput = {
  id: string;
  name: string;
  kind: AgentInputKind;
  status: AgentAssetStatus;
  sourceRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type AgentOutputKind =
  | "action"
  | "recommendation"
  | "flag"
  | "escalation"
  | "audit"
  | "handoff";

export type AgentOutput = {
  id: string;
  name: string;
  kind: AgentOutputKind;
  status: AgentAssetStatus;
  inputRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type AgentContext = {
  id: string;
  name: string;
  status: AgentAssetStatus;
  deploymentId: string;
  decisionRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type AgentConstraint = {
  id: string;
  name: string;
  constraintKind: string;
  status: AgentAssetStatus;
  policyRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type AgentPolicy = {
  id: string;
  name: string;
  policyKind: string;
  status: AgentAssetStatus;
  sourceRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type AgentSource = {
  id: string;
  name: string;
  upstreamVersion: string;
  status: AgentAssetStatus;
  decisionRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type AgentInputManifest = {
  version: typeof V75_AGENT_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  inputs: AgentInput[];
  summary: string;
};

export type AgentOutputManifest = {
  version: typeof V75_AGENT_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  outputs: AgentOutput[];
  summary: string;
};

export type AgentContextManifest = {
  version: typeof V75_AGENT_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  contexts: AgentContext[];
  summary: string;
};

export type AgentConstraintManifest = {
  version: typeof V75_AGENT_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  constraints: AgentConstraint[];
  summary: string;
};

export type AgentPolicyManifest = {
  version: typeof V75_AGENT_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  policies: AgentPolicy[];
  summary: string;
};

export type AgentSourceManifest = {
  version: typeof V75_AGENT_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  sources: AgentSource[];
  summary: string;
};

export type AgentInventoryManifest = {
  version: typeof V75_AGENT_VERSION;
  inputs: AgentInputManifest;
  outputs: AgentOutputManifest;
  contexts: AgentContextManifest;
  constraints: AgentConstraintManifest;
  policies: AgentPolicyManifest;
  sources: AgentSourceManifest;
  inventoryComplete: boolean;
  summary: string;
};

export type AgentInventorySignals = {
  inventoryComplete?: boolean;
  upstreamAligned?: boolean;
  scopeCoverageComplete?: boolean;
  freezeVersionDeclared?: boolean;
};

export type AgentInventoryReport = {
  version: typeof V75_AGENT_VERSION;
  freezeVersion: typeof V75_AGENT_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  upstreamDecisionFreeze: string;
  upstreamDecisionSignoff: string;
  manifest: AgentInventoryManifest;
  inventoryReady: boolean;
  readinessScore: number;
  summary: string;
};
