/**
 * V77 P2 — Planning policy catalog types (read-only)
 */

export const V77_PLANNING_POLICY_VERSION = "v77-planning-policy-catalog-1" as const;
export const V77_PLANNING_POLICY_FREEZE_VERSION =
  "v77-planning-policy-catalog-freeze-1" as const;

export type PlanningPolicyCatalogKind =
  | "role"
  | "topology"
  | "scope"
  | "dependency"
  | "governance"
  | "boundary"
  | "compliance"
  | "version";

export type PlanningPolicyEnforcement = "declarative" | "gate" | "audit-only" | "fallback";

export type PlanningPolicyCatalogEntry = {
  id: string;
  kind: PlanningPolicyCatalogKind;
  priority: number;
  roleRef: string;
  topologyRef: string;
  governanceRef: string;
  dependencyRef: string;
  scopeRef: string;
  enforcement: PlanningPolicyEnforcement;
  passCondition: string;
  blockCondition: string;
  required: boolean;
  description: string;
};

export type PlanningPolicyCatalogManifest = {
  version: typeof V77_PLANNING_POLICY_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  policies: PlanningPolicyCatalogEntry[];
  summary: string;
};

export type PlanningPolicyGate = {
  id: string;
  policyRef: string;
  gateKind: string;
  verifyScript: string;
  required: boolean;
  description: string;
};

export type PlanningPolicyGateManifest = {
  version: typeof V77_PLANNING_POLICY_VERSION;
  gateCount: number;
  catalogComplete: boolean;
  gates: PlanningPolicyGate[];
  summary: string;
};

export type PlanningPolicyCatalogSignals = {
  planningInventoryReady?: boolean;
  catalogComplete?: boolean;
  gatesComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type PlanningPolicyCatalogReport = {
  version: typeof V77_PLANNING_POLICY_VERSION;
  freezeVersion: typeof V77_PLANNING_POLICY_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  planningInventoryVersion: string;
  planningInventoryReady: boolean;
  catalog: PlanningPolicyCatalogManifest;
  gates: PlanningPolicyGateManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
