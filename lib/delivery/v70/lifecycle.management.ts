/**
 * V70 P6 — Lifecycle management types (read-only)
 */

export const V70_LIFECYCLE_MANAGEMENT_VERSION = "v70-lifecycle-management-1" as const;
export const V70_LIFECYCLE_MANAGEMENT_FREEZE_VERSION =
  "v70-lifecycle-management-freeze-1" as const;

export type LifecycleStateKind = "active" | "deprecated" | "maintenance" | "archived";

export type LifecycleState = {
  id: string;
  releaseRef: string;
  state: LifecycleStateKind;
  active: boolean;
  deprecated: boolean;
  maintenance: boolean;
  archived: boolean;
  retention: string;
  endOfLife: string;
  supportPolicy: string;
  required: boolean;
  description: string;
};

export type LifecycleStateManifest = {
  version: typeof V70_LIFECYCLE_MANAGEMENT_VERSION;
  stateCount: number;
  kindCount: number;
  catalogComplete: boolean;
  states: LifecycleState[];
  summary: string;
};

export type LifecycleTransition = {
  id: string;
  releaseRef: string;
  fromState: LifecycleStateKind;
  toState: LifecycleStateKind;
  trigger: string;
  retention: string;
  required: boolean;
  description: string;
};

export type LifecycleTransitionManifest = {
  version: typeof V70_LIFECYCLE_MANAGEMENT_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  transitions: LifecycleTransition[];
  summary: string;
};

export type SupportPolicy = {
  id: string;
  releaseRef: string;
  policyKind: string;
  retention: string;
  endOfLife: string;
  active: boolean;
  required: boolean;
  description: string;
};

export type SupportPolicyManifest = {
  version: typeof V70_LIFECYCLE_MANAGEMENT_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  policies: SupportPolicy[];
  summary: string;
};

export type LifecycleManagementSignals = {
  upgradeGovernanceReady?: boolean;
  statesComplete?: boolean;
  transitionsComplete?: boolean;
  supportPoliciesComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type LifecycleManagementReport = {
  version: typeof V70_LIFECYCLE_MANAGEMENT_VERSION;
  freezeVersion: typeof V70_LIFECYCLE_MANAGEMENT_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  upgradeGovernanceVersion: string;
  upgradeGovernanceReady: boolean;
  states: LifecycleStateManifest;
  transitions: LifecycleTransitionManifest;
  supportPolicies: SupportPolicyManifest;
  managementReady: boolean;
  readinessScore: number;
  summary: string;
};
