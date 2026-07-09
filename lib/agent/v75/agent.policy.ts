/**
 * V75 P2 — Agent policy catalog types (read-only)
 */

export const V75_AGENT_POLICY_VERSION = "v75-agent-policy-catalog-1" as const;
export const V75_AGENT_POLICY_FREEZE_VERSION = "v75-agent-policy-catalog-freeze-1" as const;

export type AgentPolicyCatalogKind =
  | "safety"
  | "business"
  | "cost"
  | "quality"
  | "priority"
  | "confidence"
  | "fallback"
  | "compliance";

export type AgentPolicyEnforcement = "declarative" | "gate" | "audit-only" | "fallback";

export type AgentPolicyCatalogEntry = {
  id: string;
  kind: AgentPolicyCatalogKind;
  priority: number;
  inventoryPolicyRef: string;
  inputRef: string;
  scopeRef: string;
  constraintRef: string;
  enforcement: AgentPolicyEnforcement;
  passCondition: string;
  blockCondition: string;
  required: boolean;
  description: string;
};

export type AgentPolicyCatalogManifest = {
  version: typeof V75_AGENT_POLICY_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  policies: AgentPolicyCatalogEntry[];
  summary: string;
};

export type AgentPolicyGate = {
  id: string;
  policyRef: string;
  gateKind: string;
  verifyScript: string;
  required: boolean;
  description: string;
};

export type AgentPolicyGateManifest = {
  version: typeof V75_AGENT_POLICY_VERSION;
  gateCount: number;
  catalogComplete: boolean;
  gates: AgentPolicyGate[];
  summary: string;
};

export type AgentPolicyCatalogSignals = {
  agentInventoryReady?: boolean;
  catalogComplete?: boolean;
  gatesComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type AgentPolicyCatalogReport = {
  version: typeof V75_AGENT_POLICY_VERSION;
  freezeVersion: typeof V75_AGENT_POLICY_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  agentInventoryVersion: string;
  agentInventoryReady: boolean;
  catalog: AgentPolicyCatalogManifest;
  gates: AgentPolicyGateManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
