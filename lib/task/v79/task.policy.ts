/**
 * V79 P2 — Task policy catalog types (read-only)
 */

export const V79_TASK_POLICY_VERSION = "v79-task-policy-catalog-1" as const;
export const V79_TASK_POLICY_FREEZE_VERSION = "v79-task-policy-catalog-freeze-1" as const;

export type TaskPolicyCatalogKind =
  | "role"
  | "state"
  | "topology"
  | "scope"
  | "dependency"
  | "governance"
  | "boundary"
  | "version";

export type TaskPolicyEnforcement = "declarative" | "gate" | "audit-only" | "fallback";

export type TaskPolicyCatalogEntry = {
  id: string;
  kind: TaskPolicyCatalogKind;
  priority: number;
  roleRef: string;
  stateRef: string;
  topologyRef: string;
  governanceRef: string;
  dependencyRef: string;
  scopeRef: string;
  enforcement: TaskPolicyEnforcement;
  passCondition: string;
  blockCondition: string;
  required: boolean;
  description: string;
};

export type TaskPolicyCatalogManifest = {
  version: typeof V79_TASK_POLICY_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  policies: TaskPolicyCatalogEntry[];
  summary: string;
};

export type TaskPolicyGate = {
  id: string;
  policyRef: string;
  gateKind: string;
  verifyScript: string;
  required: boolean;
  description: string;
};

export type TaskPolicyGateManifest = {
  version: typeof V79_TASK_POLICY_VERSION;
  gateCount: number;
  catalogComplete: boolean;
  gates: TaskPolicyGate[];
  summary: string;
};

export type TaskPolicyCatalogSignals = {
  taskInventoryReady?: boolean;
  catalogComplete?: boolean;
  gatesComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type TaskPolicyCatalogReport = {
  version: typeof V79_TASK_POLICY_VERSION;
  freezeVersion: typeof V79_TASK_POLICY_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  taskInventoryVersion: string;
  taskInventoryReady: boolean;
  catalog: TaskPolicyCatalogManifest;
  gates: TaskPolicyGateManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
