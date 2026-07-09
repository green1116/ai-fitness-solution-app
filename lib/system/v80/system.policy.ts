/**
 * V80 P2 — System meta policy types (declarative, read-only)
 */

export const V80_SYSTEM_POLICY_VERSION = "v80-system-meta-policy-1" as const;
export const V80_SYSTEM_POLICY_FREEZE_VERSION = "v80-system-meta-policy-freeze-1" as const;

export type SystemPolicyKind =
  | "boundary"
  | "stack-freeze"
  | "cross-layer"
  | "dependency"
  | "governance"
  | "scope"
  | "topology"
  | "version";

export type SystemPolicyEnforcement = "declarative" | "gate" | "audit-only" | "invariant";

export type SystemPolicyEntry = {
  id: string;
  kind: SystemPolicyKind;
  priority: number;
  layerRefs: string[];
  roleRef: string;
  topologyRef: string;
  governanceRef: string;
  dependencyRef: string;
  scopeRef: string;
  invariantRef: string;
  constraintRef: string;
  enforcement: SystemPolicyEnforcement;
  passCondition: string;
  blockCondition: string;
  required: boolean;
  description: string;
};

export type SystemInvariantKind =
  | "freeze"
  | "map"
  | "dependency"
  | "scope"
  | "alignment"
  | "declarative";

export type SystemInvariant = {
  id: string;
  kind: SystemInvariantKind;
  layerRefs: string[];
  policyRef: string;
  scopeRef: string;
  expression: string;
  required: boolean;
  description: string;
};

export type SystemMetaConstraintKind =
  | "runtime"
  | "mutation"
  | "boundary"
  | "consumer";

export type SystemMetaConstraint = {
  id: string;
  kind: SystemMetaConstraintKind;
  boundarySide: "v80" | "stack" | "exclusion";
  policyRef: string;
  scopeRef: string;
  rule: string;
  required: boolean;
  description: string;
};

export type SystemPolicyScopeZone = "v80-policy" | "v76-v79-target" | "exclusion";

export type SystemPolicyScopeBoundary = {
  id: string;
  zone: SystemPolicyScopeZone;
  scopeRef: string;
  appliesTo: string[];
  excludes: string[];
  rule: string;
  required: boolean;
  description: string;
};

export type SystemPolicyCatalogManifest = {
  version: typeof V80_SYSTEM_POLICY_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  policies: SystemPolicyEntry[];
  summary: string;
};

export type SystemInvariantManifest = {
  version: typeof V80_SYSTEM_POLICY_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  invariants: SystemInvariant[];
  summary: string;
};

export type SystemMetaConstraintManifest = {
  version: typeof V80_SYSTEM_POLICY_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  constraints: SystemMetaConstraint[];
  summary: string;
};

export type SystemPolicyBoundaryManifest = {
  version: typeof V80_SYSTEM_POLICY_VERSION;
  zoneCount: number;
  boundaryComplete: boolean;
  boundaries: SystemPolicyScopeBoundary[];
  summary: string;
};

export type SystemPolicyCatalogSignals = {
  systemInventoryReady?: boolean;
  catalogComplete?: boolean;
  invariantsComplete?: boolean;
  constraintsComplete?: boolean;
  boundaryComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type SystemPolicyCatalogReport = {
  version: typeof V80_SYSTEM_POLICY_VERSION;
  freezeVersion: typeof V80_SYSTEM_POLICY_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  systemInventoryVersion: string;
  systemInventoryReady: boolean;
  catalog: SystemPolicyCatalogManifest;
  invariants: SystemInvariantManifest;
  constraints: SystemMetaConstraintManifest;
  boundary: SystemPolicyBoundaryManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
