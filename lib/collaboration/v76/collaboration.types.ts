/**
 * V76 P1 — Collaboration inventory types (read-only)
 */

export const V76_COLLABORATION_VERSION = "v76-collaboration-inventory-1" as const;
export const V76_COLLABORATION_FREEZE_VERSION = "v76-collaboration-inventory-freeze-1" as const;

export type CollaborationAssetStatus = "declared" | "registered" | "active" | "frozen";

export type CollaborationInputKind =
  | "signal"
  | "metric"
  | "agent"
  | "policy"
  | "constraint"
  | "context";

export type CollaborationInput = {
  id: string;
  name: string;
  kind: CollaborationInputKind;
  status: CollaborationAssetStatus;
  sourceRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type CollaborationOutputKind =
  | "action"
  | "recommendation"
  | "flag"
  | "escalation"
  | "audit"
  | "handoff";

export type CollaborationOutput = {
  id: string;
  name: string;
  kind: CollaborationOutputKind;
  status: CollaborationAssetStatus;
  inputRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type CollaborationContext = {
  id: string;
  name: string;
  status: CollaborationAssetStatus;
  deploymentId: string;
  agentRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type CollaborationConstraint = {
  id: string;
  name: string;
  constraintKind: string;
  status: CollaborationAssetStatus;
  policyRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type CollaborationPolicy = {
  id: string;
  name: string;
  policyKind: string;
  status: CollaborationAssetStatus;
  sourceRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type CollaborationSource = {
  id: string;
  name: string;
  upstreamVersion: string;
  status: CollaborationAssetStatus;
  agentRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type CollaborationInputManifest = {
  version: typeof V76_COLLABORATION_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  inputs: CollaborationInput[];
  summary: string;
};

export type CollaborationOutputManifest = {
  version: typeof V76_COLLABORATION_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  outputs: CollaborationOutput[];
  summary: string;
};

export type CollaborationContextManifest = {
  version: typeof V76_COLLABORATION_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  contexts: CollaborationContext[];
  summary: string;
};

export type CollaborationConstraintManifest = {
  version: typeof V76_COLLABORATION_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  constraints: CollaborationConstraint[];
  summary: string;
};

export type CollaborationPolicyManifest = {
  version: typeof V76_COLLABORATION_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  policies: CollaborationPolicy[];
  summary: string;
};

export type CollaborationSourceManifest = {
  version: typeof V76_COLLABORATION_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  sources: CollaborationSource[];
  summary: string;
};

export type CollaborationInventoryManifest = {
  version: typeof V76_COLLABORATION_VERSION;
  inputs: CollaborationInputManifest;
  outputs: CollaborationOutputManifest;
  contexts: CollaborationContextManifest;
  constraints: CollaborationConstraintManifest;
  policies: CollaborationPolicyManifest;
  sources: CollaborationSourceManifest;
  inventoryComplete: boolean;
  summary: string;
};

export type CollaborationInventorySignals = {
  inventoryComplete?: boolean;
  upstreamAligned?: boolean;
  scopeCoverageComplete?: boolean;
  freezeVersionDeclared?: boolean;
};

export type CollaborationInventoryReport = {
  version: typeof V76_COLLABORATION_VERSION;
  freezeVersion: typeof V76_COLLABORATION_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  upstreamAgentFreeze: string;
  upstreamAgentSignoff: string;
  manifest: CollaborationInventoryManifest;
  inventoryReady: boolean;
  readinessScore: number;
  summary: string;
};
