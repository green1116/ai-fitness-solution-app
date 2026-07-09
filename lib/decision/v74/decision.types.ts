/**
 * V74 P1 — Decision engine inventory types (read-only)
 */

export const V74_DECISION_VERSION = "v74-decision-inventory-1" as const;
export const V74_DECISION_FREEZE_VERSION = "v74-decision-inventory-freeze-1" as const;

export type DecisionInputKind =
  | "signal"
  | "metric"
  | "knowledge"
  | "policy"
  | "constraint"
  | "context";

export type DecisionInput = {
  id: string;
  name: string;
  kind: DecisionInputKind;
  sourceRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type DecisionOutputKind = "action" | "recommendation" | "flag" | "escalation" | "audit";

export type DecisionOutput = {
  id: string;
  name: string;
  kind: DecisionOutputKind;
  inputRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type DecisionContext = {
  id: string;
  name: string;
  deploymentId: string;
  knowledgeRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type DecisionConstraint = {
  id: string;
  name: string;
  constraintKind: string;
  policyRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type DecisionPolicy = {
  id: string;
  name: string;
  policyKind: string;
  sourceRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type DecisionSource = {
  id: string;
  name: string;
  upstreamVersion: string;
  knowledgeRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type DecisionInputManifest = {
  version: typeof V74_DECISION_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  inputs: DecisionInput[];
  summary: string;
};

export type DecisionOutputManifest = {
  version: typeof V74_DECISION_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  outputs: DecisionOutput[];
  summary: string;
};

export type DecisionContextManifest = {
  version: typeof V74_DECISION_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  contexts: DecisionContext[];
  summary: string;
};

export type DecisionConstraintManifest = {
  version: typeof V74_DECISION_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  constraints: DecisionConstraint[];
  summary: string;
};

export type DecisionPolicyManifest = {
  version: typeof V74_DECISION_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  policies: DecisionPolicy[];
  summary: string;
};

export type DecisionSourceManifest = {
  version: typeof V74_DECISION_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  sources: DecisionSource[];
  summary: string;
};

export type DecisionInventoryManifest = {
  version: typeof V74_DECISION_VERSION;
  inputs: DecisionInputManifest;
  outputs: DecisionOutputManifest;
  contexts: DecisionContextManifest;
  constraints: DecisionConstraintManifest;
  policies: DecisionPolicyManifest;
  sources: DecisionSourceManifest;
  inventoryComplete: boolean;
  summary: string;
};

export type DecisionInventorySignals = {
  inventoryComplete?: boolean;
  upstreamAligned?: boolean;
  scopeCoverageComplete?: boolean;
  freezeVersionDeclared?: boolean;
};

export type DecisionInventoryReport = {
  version: typeof V74_DECISION_VERSION;
  freezeVersion: typeof V74_DECISION_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  upstreamKnowledgeFreeze: string;
  upstreamKnowledgeSignoff: string;
  manifest: DecisionInventoryManifest;
  inventoryReady: boolean;
  readinessScore: number;
  summary: string;
};
