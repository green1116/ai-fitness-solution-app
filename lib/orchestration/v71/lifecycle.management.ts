/**
 * V71 P6 — Workflow lifecycle management types (read-only)
 */

export const V71_WORKFLOW_LIFECYCLE_VERSION = "v71-workflow-lifecycle-1" as const;
export const V71_WORKFLOW_LIFECYCLE_FREEZE_VERSION =
  "v71-workflow-lifecycle-freeze-1" as const;

export type LifecycleStateKind = "active" | "deprecated" | "maintenance" | "archived";

export type LifecycleState = {
  id: string;
  orchestrationRef: string;
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
  version: typeof V71_WORKFLOW_LIFECYCLE_VERSION;
  stateCount: number;
  kindCount: number;
  catalogComplete: boolean;
  states: LifecycleState[];
  summary: string;
};

export type LifecycleTransition = {
  id: string;
  orchestrationRef: string;
  fromState: LifecycleStateKind;
  toState: LifecycleStateKind;
  trigger: string;
  retention: string;
  required: boolean;
  description: string;
};

export type LifecycleTransitionManifest = {
  version: typeof V71_WORKFLOW_LIFECYCLE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  transitions: LifecycleTransition[];
  summary: string;
};

export type SupportPolicy = {
  id: string;
  orchestrationRef: string;
  policyKind: string;
  retention: string;
  endOfLife: string;
  active: boolean;
  required: boolean;
  description: string;
};

export type SupportPolicyManifest = {
  version: typeof V71_WORKFLOW_LIFECYCLE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  policies: SupportPolicy[];
  summary: string;
};

export type WorkflowLifecycleSignals = {
  workflowGovernanceReady?: boolean;
  statesComplete?: boolean;
  transitionsComplete?: boolean;
  supportPoliciesComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type WorkflowLifecycleReport = {
  version: typeof V71_WORKFLOW_LIFECYCLE_VERSION;
  freezeVersion: typeof V71_WORKFLOW_LIFECYCLE_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  workflowGovernanceVersion: string;
  workflowGovernanceReady: boolean;
  states: LifecycleStateManifest;
  transitions: LifecycleTransitionManifest;
  supportPolicies: SupportPolicyManifest;
  lifecycleReady: boolean;
  readinessScore: number;
  summary: string;
};
