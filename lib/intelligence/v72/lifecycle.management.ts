/**
 * V72 P6 — Intelligence lifecycle management types (read-only)
 */

export const V72_INTELLIGENCE_LIFECYCLE_VERSION = "v72-intelligence-lifecycle-1" as const;
export const V72_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION =
  "v72-intelligence-lifecycle-freeze-1" as const;

export type LifecycleStateKind = "active" | "deprecated" | "maintenance" | "archived";

export type LifecycleState = {
  id: string;
  intelligenceRef: string;
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
  version: typeof V72_INTELLIGENCE_LIFECYCLE_VERSION;
  stateCount: number;
  kindCount: number;
  catalogComplete: boolean;
  states: LifecycleState[];
  summary: string;
};

export type Transition = {
  id: string;
  intelligenceRef: string;
  fromState: LifecycleStateKind;
  toState: LifecycleStateKind;
  trigger: string;
  retention: string;
  required: boolean;
  description: string;
};

export type TransitionManifest = {
  version: typeof V72_INTELLIGENCE_LIFECYCLE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  transitions: Transition[];
  summary: string;
};

export type SupportPolicy = {
  id: string;
  intelligenceRef: string;
  policyKind: string;
  retention: string;
  endOfLife: string;
  active: boolean;
  required: boolean;
  description: string;
};

export type SupportPolicyManifest = {
  version: typeof V72_INTELLIGENCE_LIFECYCLE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  policies: SupportPolicy[];
  summary: string;
};

export type IntelligenceLifecycleSignals = {
  intelligenceGovernanceReady?: boolean;
  statesComplete?: boolean;
  transitionsComplete?: boolean;
  supportPoliciesComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type IntelligenceLifecycleReport = {
  version: typeof V72_INTELLIGENCE_LIFECYCLE_VERSION;
  freezeVersion: typeof V72_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  intelligenceGovernanceVersion: string;
  intelligenceGovernanceReady: boolean;
  states: LifecycleStateManifest;
  transitions: TransitionManifest;
  supportPolicies: SupportPolicyManifest;
  lifecycleReady: boolean;
  readinessScore: number;
  summary: string;
};
