/**
 * V73 P6 — Knowledge lifecycle management types (read-only)
 */

export const V73_KNOWLEDGE_LIFECYCLE_VERSION = "v73-knowledge-lifecycle-1" as const;
export const V73_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION =
  "v73-knowledge-lifecycle-freeze-1" as const;

export type LifecycleStateKind = "active" | "deprecated" | "maintenance" | "archived";

export type Active = boolean;
export type Deprecated = boolean;
export type Maintenance = boolean;
export type Archived = boolean;
export type Trigger = string;
export type Retention = string;
export type EndOfLife = string;

export type LifecycleState = {
  id: string;
  knowledgeRef: string;
  state: LifecycleStateKind;
  active: Active;
  deprecated: Deprecated;
  maintenance: Maintenance;
  archived: Archived;
  retention: Retention;
  endOfLife: EndOfLife;
  supportPolicy: string;
  required: boolean;
  description: string;
};

export type LifecycleStateManifest = {
  version: typeof V73_KNOWLEDGE_LIFECYCLE_VERSION;
  stateCount: number;
  kindCount: number;
  catalogComplete: boolean;
  states: LifecycleState[];
  summary: string;
};

export type Transition = {
  id: string;
  knowledgeRef: string;
  fromState: LifecycleStateKind;
  toState: LifecycleStateKind;
  trigger: Trigger;
  retention: Retention;
  required: boolean;
  description: string;
};

export type TransitionManifest = {
  version: typeof V73_KNOWLEDGE_LIFECYCLE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  transitions: Transition[];
  summary: string;
};

export type SupportPolicy = {
  id: string;
  knowledgeRef: string;
  policyKind: string;
  retention: Retention;
  endOfLife: EndOfLife;
  active: Active;
  required: boolean;
  description: string;
};

export type SupportPolicyManifest = {
  version: typeof V73_KNOWLEDGE_LIFECYCLE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  policies: SupportPolicy[];
  summary: string;
};

export type KnowledgeLifecycleSignals = {
  knowledgeGovernanceReady?: boolean;
  statesComplete?: boolean;
  transitionsComplete?: boolean;
  supportPoliciesComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type KnowledgeLifecycleReport = {
  version: typeof V73_KNOWLEDGE_LIFECYCLE_VERSION;
  freezeVersion: typeof V73_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  knowledgeGovernanceVersion: string;
  knowledgeGovernanceReady: boolean;
  states: LifecycleStateManifest;
  transitions: TransitionManifest;
  supportPolicies: SupportPolicyManifest;
  lifecycleReady: boolean;
  readinessScore: number;
  summary: string;
};
