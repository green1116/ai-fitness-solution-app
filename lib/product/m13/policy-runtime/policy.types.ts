/**
 * Product M13 — OS Policy Runtime domain types
 */

import type {
  OS_POLICY_BINDING_STATUSES,
  OS_POLICY_CONSTRAINTS,
  OS_POLICY_ENFORCEMENTS,
  OS_POLICY_KINDS,
  OS_POLICY_READINESS_VERDICTS,
  OS_POLICY_RULE_STATUSES,
  OS_POLICY_STATUSES,
  PRODUCT_OS_POLICY_BASE,
  PRODUCT_OS_POLICY_FREEZE_VERSION,
  PRODUCT_OS_POLICY_ID,
  PRODUCT_OS_POLICY_VERSION,
} from "./policy.constants";

export type OsPolicyKind = (typeof OS_POLICY_KINDS)[number];
export type OsPolicyStatus = (typeof OS_POLICY_STATUSES)[number];
export type OsPolicyRuleStatus = (typeof OS_POLICY_RULE_STATUSES)[number];
export type OsPolicyBindingStatus = (typeof OS_POLICY_BINDING_STATUSES)[number];
export type OsPolicyEnforcement = (typeof OS_POLICY_ENFORCEMENTS)[number];
export type OsPolicyConstraint = (typeof OS_POLICY_CONSTRAINTS)[number];
export type OsPolicyReadinessVerdict =
  (typeof OS_POLICY_READINESS_VERDICTS)[number];
export type OsPolicyMetadata = Record<string, unknown>;

export type OsPolicy = {
  id: string;
  policyKey: string;
  kind: OsPolicyKind;
  status: OsPolicyStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: OsPolicyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOsPolicyInput = {
  id?: string;
  policyKey: string;
  kind: OsPolicyKind;
  title: string;
  summary: string;
  metadata?: OsPolicyMetadata;
};

export type UpdateOsPolicyStatusInput = {
  policyId: string;
  status: OsPolicyStatus;
};

/** Policy rule — soft-ref to dependency graphKey. */
export type OsPolicyRule = {
  id: string;
  policyId: string;
  ruleKey: string;
  sequence: number;
  status: OsPolicyRuleStatus;
  constraint: OsPolicyConstraint;
  enforcement: OsPolicyEnforcement;
  graphKeyRef: string;
  summary: string;
  detail: string;
  metadata: OsPolicyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOsPolicyRuleInput = {
  id?: string;
  policyId: string;
  ruleKey: string;
  sequence: number;
  constraint: OsPolicyConstraint;
  enforcement: OsPolicyEnforcement;
  graphKeyRef: string;
  summary: string;
  metadata?: OsPolicyMetadata;
};

export type UpdateOsPolicyRuleStatusInput = {
  ruleId: string;
  status: OsPolicyRuleStatus;
};

/** Soft binding of policy rule to dependency edgeKey. */
export type OsPolicyBinding = {
  id: string;
  policyId: string;
  ruleId: string;
  bindingKey: string;
  edgeKeyRef: string;
  status: OsPolicyBindingStatus;
  detail: string;
  metadata: OsPolicyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindOsPolicyRuleInput = {
  id?: string;
  policyId: string;
  ruleId: string;
  bindingKey: string;
  edgeKeyRef: string;
  metadata?: OsPolicyMetadata;
};

export type OsPolicyReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type OsPolicyReadinessResult = {
  verdict: OsPolicyReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: OsPolicyReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type OsPolicyManifest = {
  policyRuntimeId: typeof PRODUCT_OS_POLICY_ID;
  version: typeof PRODUCT_OS_POLICY_VERSION;
  freezeVersion: typeof PRODUCT_OS_POLICY_FREEZE_VERSION;
  base: typeof PRODUCT_OS_POLICY_BASE;
  policyCount: number;
  ruleCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
