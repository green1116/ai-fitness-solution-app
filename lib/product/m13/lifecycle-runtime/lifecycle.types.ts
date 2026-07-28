/**
 * Product M13 — OS Lifecycle Runtime domain types
 */

import type {
  OS_LIFECYCLE_BINDING_STATUSES,
  OS_LIFECYCLE_PLAN_KINDS,
  OS_LIFECYCLE_PLAN_STATUSES,
  OS_LIFECYCLE_READINESS_VERDICTS,
  OS_LIFECYCLE_STATES,
  OS_LIFECYCLE_TRANSITION_STATUSES,
  OS_LIFECYCLE_TRIGGERS,
  PRODUCT_OS_LIFECYCLE_BASE,
  PRODUCT_OS_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_OS_LIFECYCLE_ID,
  PRODUCT_OS_LIFECYCLE_VERSION,
} from "./lifecycle.constants";

export type OsLifecyclePlanKind = (typeof OS_LIFECYCLE_PLAN_KINDS)[number];
export type OsLifecyclePlanStatus = (typeof OS_LIFECYCLE_PLAN_STATUSES)[number];
export type OsLifecycleState = (typeof OS_LIFECYCLE_STATES)[number];
export type OsLifecycleTransitionStatus =
  (typeof OS_LIFECYCLE_TRANSITION_STATUSES)[number];
export type OsLifecycleTrigger = (typeof OS_LIFECYCLE_TRIGGERS)[number];
export type OsLifecycleBindingStatus =
  (typeof OS_LIFECYCLE_BINDING_STATUSES)[number];
export type OsLifecycleReadinessVerdict =
  (typeof OS_LIFECYCLE_READINESS_VERDICTS)[number];
export type OsLifecycleMetadata = Record<string, unknown>;

export type OsLifecyclePlan = {
  id: string;
  planKey: string;
  kind: OsLifecyclePlanKind;
  status: OsLifecyclePlanStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: OsLifecycleMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOsLifecyclePlanInput = {
  id?: string;
  planKey: string;
  kind: OsLifecyclePlanKind;
  title: string;
  summary: string;
  metadata?: OsLifecycleMetadata;
};

export type UpdateOsLifecyclePlanStatusInput = {
  planId: string;
  status: OsLifecyclePlanStatus;
};

/** Lifecycle transition — soft-ref to governance standardKey. */
export type OsLifecycleTransition = {
  id: string;
  planId: string;
  transitionKey: string;
  sequence: number;
  status: OsLifecycleTransitionStatus;
  fromState: OsLifecycleState;
  toState: OsLifecycleState;
  trigger: OsLifecycleTrigger;
  standardKeyRef: string;
  retentionDays: number;
  summary: string;
  detail: string;
  metadata: OsLifecycleMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOsLifecycleTransitionInput = {
  id?: string;
  planId: string;
  transitionKey: string;
  sequence: number;
  fromState: OsLifecycleState;
  toState: OsLifecycleState;
  trigger: OsLifecycleTrigger;
  standardKeyRef: string;
  retentionDays: number;
  summary: string;
  metadata?: OsLifecycleMetadata;
};

export type UpdateOsLifecycleTransitionStatusInput = {
  transitionId: string;
  status: OsLifecycleTransitionStatus;
};

/** Soft binding of transition to governance review / support policy. */
export type OsLifecycleBinding = {
  id: string;
  planId: string;
  transitionId: string;
  bindingKey: string;
  reviewKeyRef: string;
  supportPolicyRef: string;
  status: OsLifecycleBindingStatus;
  detail: string;
  metadata: OsLifecycleMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindOsLifecycleTransitionInput = {
  id?: string;
  planId: string;
  transitionId: string;
  bindingKey: string;
  reviewKeyRef: string;
  supportPolicyRef: string;
  metadata?: OsLifecycleMetadata;
};

export type OsLifecycleReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type OsLifecycleReadinessResult = {
  verdict: OsLifecycleReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: OsLifecycleReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type OsLifecycleManifest = {
  lifecycleRuntimeId: typeof PRODUCT_OS_LIFECYCLE_ID;
  version: typeof PRODUCT_OS_LIFECYCLE_VERSION;
  freezeVersion: typeof PRODUCT_OS_LIFECYCLE_FREEZE_VERSION;
  base: typeof PRODUCT_OS_LIFECYCLE_BASE;
  planCount: number;
  transitionCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
