/**
 * V76 P2 — Collaboration policy catalog types (read-only)
 */

export const V76_COLLABORATION_POLICY_VERSION = "v76-collaboration-policy-catalog-1" as const;
export const V76_COLLABORATION_POLICY_FREEZE_VERSION =
  "v76-collaboration-policy-catalog-freeze-1" as const;

export type CollaborationPolicyCatalogKind =
  | "role"
  | "communication"
  | "delegation"
  | "coordination"
  | "conflict"
  | "governance"
  | "boundary"
  | "compliance";

export type CollaborationPolicyEnforcement =
  | "declarative"
  | "gate"
  | "audit-only"
  | "fallback";

export type CollaborationPolicyCatalogEntry = {
  id: string;
  kind: CollaborationPolicyCatalogKind;
  priority: number;
  inventoryPolicyRef: string;
  inputRef: string;
  scopeRef: string;
  constraintRef: string;
  enforcement: CollaborationPolicyEnforcement;
  passCondition: string;
  blockCondition: string;
  required: boolean;
  description: string;
};

export type CollaborationPolicyCatalogManifest = {
  version: typeof V76_COLLABORATION_POLICY_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  policies: CollaborationPolicyCatalogEntry[];
  summary: string;
};

export type CollaborationPolicyGate = {
  id: string;
  policyRef: string;
  gateKind: string;
  verifyScript: string;
  required: boolean;
  description: string;
};

export type CollaborationPolicyGateManifest = {
  version: typeof V76_COLLABORATION_POLICY_VERSION;
  gateCount: number;
  catalogComplete: boolean;
  gates: CollaborationPolicyGate[];
  summary: string;
};

export type CollaborationPolicyCatalogSignals = {
  collaborationInventoryReady?: boolean;
  catalogComplete?: boolean;
  gatesComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type CollaborationPolicyCatalogReport = {
  version: typeof V76_COLLABORATION_POLICY_VERSION;
  freezeVersion: typeof V76_COLLABORATION_POLICY_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  collaborationInventoryVersion: string;
  collaborationInventoryReady: boolean;
  catalog: CollaborationPolicyCatalogManifest;
  gates: CollaborationPolicyGateManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
