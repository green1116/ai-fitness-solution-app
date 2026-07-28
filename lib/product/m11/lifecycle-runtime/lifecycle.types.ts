/**
 * Product M11 — Knowledge Lifecycle Runtime domain types
 */

import type {
  KNOWLEDGE_LIFECYCLE_BINDING_STATUSES,
  KNOWLEDGE_LIFECYCLE_PLAN_KINDS,
  KNOWLEDGE_LIFECYCLE_PLAN_STATUSES,
  KNOWLEDGE_LIFECYCLE_READINESS_VERDICTS,
  KNOWLEDGE_LIFECYCLE_STATES,
  KNOWLEDGE_LIFECYCLE_TRANSITION_STATUSES,
  KNOWLEDGE_LIFECYCLE_TRIGGERS,
  PRODUCT_KNOWLEDGE_LIFECYCLE_BASE,
  PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_LIFECYCLE_ID,
  PRODUCT_KNOWLEDGE_LIFECYCLE_VERSION,
} from "./lifecycle.constants";

export type KnowledgeLifecyclePlanKind =
  (typeof KNOWLEDGE_LIFECYCLE_PLAN_KINDS)[number];
export type KnowledgeLifecyclePlanStatus =
  (typeof KNOWLEDGE_LIFECYCLE_PLAN_STATUSES)[number];
export type KnowledgeLifecycleState =
  (typeof KNOWLEDGE_LIFECYCLE_STATES)[number];
export type KnowledgeLifecycleTransitionStatus =
  (typeof KNOWLEDGE_LIFECYCLE_TRANSITION_STATUSES)[number];
export type KnowledgeLifecycleTrigger =
  (typeof KNOWLEDGE_LIFECYCLE_TRIGGERS)[number];
export type KnowledgeLifecycleBindingStatus =
  (typeof KNOWLEDGE_LIFECYCLE_BINDING_STATUSES)[number];
export type KnowledgeLifecycleReadinessVerdict =
  (typeof KNOWLEDGE_LIFECYCLE_READINESS_VERDICTS)[number];
export type KnowledgeLifecycleMetadata = Record<string, unknown>;

export type KnowledgeLifecyclePlan = {
  id: string;
  planKey: string;
  kind: KnowledgeLifecyclePlanKind;
  status: KnowledgeLifecyclePlanStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: KnowledgeLifecycleMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterKnowledgeLifecyclePlanInput = {
  id?: string;
  planKey: string;
  kind: KnowledgeLifecyclePlanKind;
  title: string;
  summary: string;
  metadata?: KnowledgeLifecycleMetadata;
};

export type UpdateKnowledgeLifecyclePlanStatusInput = {
  planId: string;
  status: KnowledgeLifecyclePlanStatus;
};

/** Lifecycle transition — soft-ref to governance standardKey. */
export type KnowledgeLifecycleTransition = {
  id: string;
  planId: string;
  transitionKey: string;
  sequence: number;
  status: KnowledgeLifecycleTransitionStatus;
  fromState: KnowledgeLifecycleState;
  toState: KnowledgeLifecycleState;
  trigger: KnowledgeLifecycleTrigger;
  standardKeyRef: string;
  retentionDays: number;
  summary: string;
  detail: string;
  metadata: KnowledgeLifecycleMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterKnowledgeLifecycleTransitionInput = {
  id?: string;
  planId: string;
  transitionKey: string;
  sequence: number;
  fromState: KnowledgeLifecycleState;
  toState: KnowledgeLifecycleState;
  trigger: KnowledgeLifecycleTrigger;
  standardKeyRef: string;
  retentionDays: number;
  summary: string;
  metadata?: KnowledgeLifecycleMetadata;
};

export type UpdateKnowledgeLifecycleTransitionStatusInput = {
  transitionId: string;
  status: KnowledgeLifecycleTransitionStatus;
};

/** Soft binding of transition to governance review / support policy. */
export type KnowledgeLifecycleBinding = {
  id: string;
  planId: string;
  transitionId: string;
  bindingKey: string;
  reviewKeyRef: string;
  supportPolicyRef: string;
  status: KnowledgeLifecycleBindingStatus;
  detail: string;
  metadata: KnowledgeLifecycleMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindKnowledgeLifecycleTransitionInput = {
  id?: string;
  planId: string;
  transitionId: string;
  bindingKey: string;
  reviewKeyRef: string;
  supportPolicyRef: string;
  metadata?: KnowledgeLifecycleMetadata;
};

export type KnowledgeLifecycleReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type KnowledgeLifecycleReadinessResult = {
  verdict: KnowledgeLifecycleReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: KnowledgeLifecycleReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type KnowledgeLifecycleManifest = {
  lifecycleRuntimeId: typeof PRODUCT_KNOWLEDGE_LIFECYCLE_ID;
  version: typeof PRODUCT_KNOWLEDGE_LIFECYCLE_VERSION;
  freezeVersion: typeof PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION;
  base: typeof PRODUCT_KNOWLEDGE_LIFECYCLE_BASE;
  planCount: number;
  transitionCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
