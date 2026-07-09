/**
 * V78 P2 — Execution policy catalog types (read-only)
 */

export const V78_EXECUTION_POLICY_VERSION = "v78-execution-policy-catalog-1" as const;
export const V78_EXECUTION_POLICY_FREEZE_VERSION =
  "v78-execution-policy-catalog-freeze-1" as const;

export type ExecutionPolicyCatalogKind =
  | "role"
  | "topology"
  | "scope"
  | "dependency"
  | "governance"
  | "boundary"
  | "compliance"
  | "version";

export type ExecutionPolicyEnforcement = "declarative" | "gate" | "audit-only" | "fallback";

export type ExecutionPolicyCatalogEntry = {
  id: string;
  kind: ExecutionPolicyCatalogKind;
  priority: number;
  roleRef: string;
  topologyRef: string;
  governanceRef: string;
  dependencyRef: string;
  scopeRef: string;
  enforcement: ExecutionPolicyEnforcement;
  passCondition: string;
  blockCondition: string;
  required: boolean;
  description: string;
};

export type ExecutionPolicyCatalogManifest = {
  version: typeof V78_EXECUTION_POLICY_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  policies: ExecutionPolicyCatalogEntry[];
  summary: string;
};

export type ExecutionPolicyGate = {
  id: string;
  policyRef: string;
  gateKind: string;
  verifyScript: string;
  required: boolean;
  description: string;
};

export type ExecutionPolicyGateManifest = {
  version: typeof V78_EXECUTION_POLICY_VERSION;
  gateCount: number;
  catalogComplete: boolean;
  gates: ExecutionPolicyGate[];
  summary: string;
};

export type ExecutionPolicyCatalogSignals = {
  executionInventoryReady?: boolean;
  catalogComplete?: boolean;
  gatesComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type ExecutionPolicyCatalogReport = {
  version: typeof V78_EXECUTION_POLICY_VERSION;
  freezeVersion: typeof V78_EXECUTION_POLICY_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  executionInventoryVersion: string;
  executionInventoryReady: boolean;
  catalog: ExecutionPolicyCatalogManifest;
  gates: ExecutionPolicyGateManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
