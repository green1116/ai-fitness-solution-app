/**
 * V74 P2 — Decision policy catalog types (read-only)
 */

export const V74_DECISION_POLICY_VERSION = "v74-decision-policy-catalog-1" as const;
export const V74_DECISION_POLICY_FREEZE_VERSION = "v74-decision-policy-catalog-freeze-1" as const;

export type PolicyCatalogKind =
  | "safety"
  | "business"
  | "cost"
  | "quality"
  | "priority"
  | "confidence"
  | "fallback"
  | "compliance";

export type PolicyEnforcement = "declarative" | "gate" | "audit-only" | "fallback";

export type PolicyCatalogEntry = {
  id: string;
  kind: PolicyCatalogKind;
  inventoryPolicyRef: string;
  inputRef: string;
  scopeRef: string;
  enforcement: PolicyEnforcement;
  passCondition: string;
  blockCondition: string;
  required: boolean;
  description: string;
};

export type PolicyCatalogManifest = {
  version: typeof V74_DECISION_POLICY_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  policies: PolicyCatalogEntry[];
  summary: string;
};

export type PolicyGate = {
  id: string;
  policyRef: string;
  gateKind: string;
  verifyScript: string;
  required: boolean;
  description: string;
};

export type PolicyGateManifest = {
  version: typeof V74_DECISION_POLICY_VERSION;
  gateCount: number;
  catalogComplete: boolean;
  gates: PolicyGate[];
  summary: string;
};

export type DecisionPolicyCatalogSignals = {
  decisionInventoryReady?: boolean;
  catalogComplete?: boolean;
  gatesComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type DecisionPolicyCatalogReport = {
  version: typeof V74_DECISION_POLICY_VERSION;
  freezeVersion: typeof V74_DECISION_POLICY_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  decisionInventoryVersion: string;
  decisionInventoryReady: boolean;
  catalog: PolicyCatalogManifest;
  gates: PolicyGateManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
