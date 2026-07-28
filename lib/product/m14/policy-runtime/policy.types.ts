/**
 * Product M14 — Intelligence Policy Runtime domain types
 */

import type {
  INTELLIGENCE_POLICY_BINDING_STATUSES,
  INTELLIGENCE_POLICY_CONSTRAINTS,
  INTELLIGENCE_POLICY_ENFORCEMENTS,
  INTELLIGENCE_POLICY_KINDS,
  INTELLIGENCE_POLICY_READINESS_VERDICTS,
  INTELLIGENCE_POLICY_RULE_STATUSES,
  INTELLIGENCE_POLICY_STATUSES,
  PRODUCT_INTELLIGENCE_POLICY_BASE,
  PRODUCT_INTELLIGENCE_POLICY_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_POLICY_ID,
  PRODUCT_INTELLIGENCE_POLICY_VERSION,
} from "./policy.constants";

export type IntelligencePolicyKind = (typeof INTELLIGENCE_POLICY_KINDS)[number];
export type IntelligencePolicyStatus =
  (typeof INTELLIGENCE_POLICY_STATUSES)[number];
export type IntelligencePolicyRuleStatus =
  (typeof INTELLIGENCE_POLICY_RULE_STATUSES)[number];
export type IntelligencePolicyBindingStatus =
  (typeof INTELLIGENCE_POLICY_BINDING_STATUSES)[number];
export type IntelligencePolicyEnforcement =
  (typeof INTELLIGENCE_POLICY_ENFORCEMENTS)[number];
export type IntelligencePolicyConstraint =
  (typeof INTELLIGENCE_POLICY_CONSTRAINTS)[number];
export type IntelligencePolicyReadinessVerdict =
  (typeof INTELLIGENCE_POLICY_READINESS_VERDICTS)[number];
export type IntelligencePolicyMetadata = Record<string, unknown>;

export type IntelligencePolicy = {
  id: string;
  policyKey: string;
  kind: IntelligencePolicyKind;
  status: IntelligencePolicyStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: IntelligencePolicyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterIntelligencePolicyInput = {
  id?: string;
  policyKey: string;
  kind: IntelligencePolicyKind;
  title: string;
  summary: string;
  metadata?: IntelligencePolicyMetadata;
};

export type UpdateIntelligencePolicyStatusInput = {
  policyId: string;
  status: IntelligencePolicyStatus;
};

/** Policy rule — soft-ref to dependency graphKey. */
export type IntelligencePolicyRule = {
  id: string;
  policyId: string;
  ruleKey: string;
  sequence: number;
  status: IntelligencePolicyRuleStatus;
  constraint: IntelligencePolicyConstraint;
  enforcement: IntelligencePolicyEnforcement;
  graphKeyRef: string;
  summary: string;
  detail: string;
  metadata: IntelligencePolicyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterIntelligencePolicyRuleInput = {
  id?: string;
  policyId: string;
  ruleKey: string;
  sequence: number;
  constraint: IntelligencePolicyConstraint;
  enforcement: IntelligencePolicyEnforcement;
  graphKeyRef: string;
  summary: string;
  metadata?: IntelligencePolicyMetadata;
};

export type UpdateIntelligencePolicyRuleStatusInput = {
  ruleId: string;
  status: IntelligencePolicyRuleStatus;
};

/** Soft binding of policy rule to dependency edgeKey. */
export type IntelligencePolicyBinding = {
  id: string;
  policyId: string;
  ruleId: string;
  bindingKey: string;
  edgeKeyRef: string;
  status: IntelligencePolicyBindingStatus;
  detail: string;
  metadata: IntelligencePolicyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindIntelligencePolicyRuleInput = {
  id?: string;
  policyId: string;
  ruleId: string;
  bindingKey: string;
  edgeKeyRef: string;
  metadata?: IntelligencePolicyMetadata;
};

export type IntelligencePolicyReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type IntelligencePolicyReadinessResult = {
  verdict: IntelligencePolicyReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: IntelligencePolicyReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type IntelligencePolicyManifest = {
  policyRuntimeId: typeof PRODUCT_INTELLIGENCE_POLICY_ID;
  version: typeof PRODUCT_INTELLIGENCE_POLICY_VERSION;
  freezeVersion: typeof PRODUCT_INTELLIGENCE_POLICY_FREEZE_VERSION;
  base: typeof PRODUCT_INTELLIGENCE_POLICY_BASE;
  policyCount: number;
  ruleCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
