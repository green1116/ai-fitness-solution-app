/**
 * Product M14 — Intelligence Lifecycle Runtime domain types
 */

import type {
  INTELLIGENCE_LIFECYCLE_BINDING_STATUSES,
  INTELLIGENCE_LIFECYCLE_PLAN_KINDS,
  INTELLIGENCE_LIFECYCLE_PLAN_STATUSES,
  INTELLIGENCE_LIFECYCLE_READINESS_VERDICTS,
  INTELLIGENCE_LIFECYCLE_STATES,
  INTELLIGENCE_LIFECYCLE_TRANSITION_STATUSES,
  INTELLIGENCE_LIFECYCLE_TRIGGERS,
  PRODUCT_INTELLIGENCE_LIFECYCLE_BASE,
  PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_LIFECYCLE_ID,
  PRODUCT_INTELLIGENCE_LIFECYCLE_VERSION,
} from "./lifecycle.constants";

export type IntelligenceLifecyclePlanKind =
  (typeof INTELLIGENCE_LIFECYCLE_PLAN_KINDS)[number];
export type IntelligenceLifecyclePlanStatus =
  (typeof INTELLIGENCE_LIFECYCLE_PLAN_STATUSES)[number];
export type IntelligenceLifecycleState =
  (typeof INTELLIGENCE_LIFECYCLE_STATES)[number];
export type IntelligenceLifecycleTransitionStatus =
  (typeof INTELLIGENCE_LIFECYCLE_TRANSITION_STATUSES)[number];
export type IntelligenceLifecycleTrigger =
  (typeof INTELLIGENCE_LIFECYCLE_TRIGGERS)[number];
export type IntelligenceLifecycleBindingStatus =
  (typeof INTELLIGENCE_LIFECYCLE_BINDING_STATUSES)[number];
export type IntelligenceLifecycleReadinessVerdict =
  (typeof INTELLIGENCE_LIFECYCLE_READINESS_VERDICTS)[number];
export type IntelligenceLifecycleMetadata = Record<string, unknown>;

export type IntelligenceLifecyclePlan = {
  id: string;
  planKey: string;
  kind: IntelligenceLifecyclePlanKind;
  status: IntelligenceLifecyclePlanStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: IntelligenceLifecycleMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterIntelligenceLifecyclePlanInput = {
  id?: string;
  planKey: string;
  kind: IntelligenceLifecyclePlanKind;
  title: string;
  summary: string;
  metadata?: IntelligenceLifecycleMetadata;
};

export type UpdateIntelligenceLifecyclePlanStatusInput = {
  planId: string;
  status: IntelligenceLifecyclePlanStatus;
};

/** Lifecycle transition — soft-ref to governance standardKey. */
export type IntelligenceLifecycleTransition = {
  id: string;
  planId: string;
  transitionKey: string;
  sequence: number;
  status: IntelligenceLifecycleTransitionStatus;
  fromState: IntelligenceLifecycleState;
  toState: IntelligenceLifecycleState;
  trigger: IntelligenceLifecycleTrigger;
  standardKeyRef: string;
  retentionDays: number;
  summary: string;
  detail: string;
  metadata: IntelligenceLifecycleMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterIntelligenceLifecycleTransitionInput = {
  id?: string;
  planId: string;
  transitionKey: string;
  sequence: number;
  fromState: IntelligenceLifecycleState;
  toState: IntelligenceLifecycleState;
  trigger: IntelligenceLifecycleTrigger;
  standardKeyRef: string;
  retentionDays: number;
  summary: string;
  metadata?: IntelligenceLifecycleMetadata;
};

export type UpdateIntelligenceLifecycleTransitionStatusInput = {
  transitionId: string;
  status: IntelligenceLifecycleTransitionStatus;
};

/** Soft binding of transition to governance review / support policy. */
export type IntelligenceLifecycleBinding = {
  id: string;
  planId: string;
  transitionId: string;
  bindingKey: string;
  reviewKeyRef: string;
  supportPolicyRef: string;
  status: IntelligenceLifecycleBindingStatus;
  detail: string;
  metadata: IntelligenceLifecycleMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindIntelligenceLifecycleTransitionInput = {
  id?: string;
  planId: string;
  transitionId: string;
  bindingKey: string;
  reviewKeyRef: string;
  supportPolicyRef: string;
  metadata?: IntelligenceLifecycleMetadata;
};

export type IntelligenceLifecycleReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type IntelligenceLifecycleReadinessResult = {
  verdict: IntelligenceLifecycleReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: IntelligenceLifecycleReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type IntelligenceLifecycleManifest = {
  lifecycleRuntimeId: typeof PRODUCT_INTELLIGENCE_LIFECYCLE_ID;
  version: typeof PRODUCT_INTELLIGENCE_LIFECYCLE_VERSION;
  freezeVersion: typeof PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION;
  base: typeof PRODUCT_INTELLIGENCE_LIFECYCLE_BASE;
  planCount: number;
  transitionCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
