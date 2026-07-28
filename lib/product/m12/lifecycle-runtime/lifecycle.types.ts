/**
 * Product M12 — Agent Lifecycle Runtime domain types
 */

import type {
  AGENT_LIFECYCLE_BINDING_STATUSES,
  AGENT_LIFECYCLE_PLAN_KINDS,
  AGENT_LIFECYCLE_PLAN_STATUSES,
  AGENT_LIFECYCLE_READINESS_VERDICTS,
  AGENT_LIFECYCLE_STATES,
  AGENT_LIFECYCLE_TRANSITION_STATUSES,
  AGENT_LIFECYCLE_TRIGGERS,
  PRODUCT_AGENT_LIFECYCLE_BASE,
  PRODUCT_AGENT_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_AGENT_LIFECYCLE_ID,
  PRODUCT_AGENT_LIFECYCLE_VERSION,
} from "./lifecycle.constants";

export type AgentLifecyclePlanKind =
  (typeof AGENT_LIFECYCLE_PLAN_KINDS)[number];
export type AgentLifecyclePlanStatus =
  (typeof AGENT_LIFECYCLE_PLAN_STATUSES)[number];
export type AgentLifecycleState = (typeof AGENT_LIFECYCLE_STATES)[number];
export type AgentLifecycleTransitionStatus =
  (typeof AGENT_LIFECYCLE_TRANSITION_STATUSES)[number];
export type AgentLifecycleTrigger =
  (typeof AGENT_LIFECYCLE_TRIGGERS)[number];
export type AgentLifecycleBindingStatus =
  (typeof AGENT_LIFECYCLE_BINDING_STATUSES)[number];
export type AgentLifecycleReadinessVerdict =
  (typeof AGENT_LIFECYCLE_READINESS_VERDICTS)[number];
export type AgentLifecycleMetadata = Record<string, unknown>;

export type AgentLifecyclePlan = {
  id: string;
  planKey: string;
  kind: AgentLifecyclePlanKind;
  status: AgentLifecyclePlanStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: AgentLifecycleMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAgentLifecyclePlanInput = {
  id?: string;
  planKey: string;
  kind: AgentLifecyclePlanKind;
  title: string;
  summary: string;
  metadata?: AgentLifecycleMetadata;
};

export type UpdateAgentLifecyclePlanStatusInput = {
  planId: string;
  status: AgentLifecyclePlanStatus;
};

/** Lifecycle transition — soft-ref to governance standardKey. */
export type AgentLifecycleTransition = {
  id: string;
  planId: string;
  transitionKey: string;
  sequence: number;
  status: AgentLifecycleTransitionStatus;
  fromState: AgentLifecycleState;
  toState: AgentLifecycleState;
  trigger: AgentLifecycleTrigger;
  standardKeyRef: string;
  retentionDays: number;
  summary: string;
  detail: string;
  metadata: AgentLifecycleMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAgentLifecycleTransitionInput = {
  id?: string;
  planId: string;
  transitionKey: string;
  sequence: number;
  fromState: AgentLifecycleState;
  toState: AgentLifecycleState;
  trigger: AgentLifecycleTrigger;
  standardKeyRef: string;
  retentionDays: number;
  summary: string;
  metadata?: AgentLifecycleMetadata;
};

export type UpdateAgentLifecycleTransitionStatusInput = {
  transitionId: string;
  status: AgentLifecycleTransitionStatus;
};

/** Soft binding of transition to governance review / support policy. */
export type AgentLifecycleBinding = {
  id: string;
  planId: string;
  transitionId: string;
  bindingKey: string;
  reviewKeyRef: string;
  supportPolicyRef: string;
  status: AgentLifecycleBindingStatus;
  detail: string;
  metadata: AgentLifecycleMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindAgentLifecycleTransitionInput = {
  id?: string;
  planId: string;
  transitionId: string;
  bindingKey: string;
  reviewKeyRef: string;
  supportPolicyRef: string;
  metadata?: AgentLifecycleMetadata;
};

export type AgentLifecycleReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AgentLifecycleReadinessResult = {
  verdict: AgentLifecycleReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AgentLifecycleReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AgentLifecycleManifest = {
  lifecycleRuntimeId: typeof PRODUCT_AGENT_LIFECYCLE_ID;
  version: typeof PRODUCT_AGENT_LIFECYCLE_VERSION;
  freezeVersion: typeof PRODUCT_AGENT_LIFECYCLE_FREEZE_VERSION;
  base: typeof PRODUCT_AGENT_LIFECYCLE_BASE;
  planCount: number;
  transitionCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
