/**
 * Product M11 — Knowledge Policy Runtime domain types
 */

import type {
  KNOWLEDGE_POLICY_BINDING_STATUSES,
  KNOWLEDGE_POLICY_CONSTRAINTS,
  KNOWLEDGE_POLICY_ENFORCEMENTS,
  KNOWLEDGE_POLICY_KINDS,
  KNOWLEDGE_POLICY_READINESS_VERDICTS,
  KNOWLEDGE_POLICY_RULE_STATUSES,
  KNOWLEDGE_POLICY_STATUSES,
  PRODUCT_KNOWLEDGE_POLICY_BASE,
  PRODUCT_KNOWLEDGE_POLICY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_POLICY_ID,
  PRODUCT_KNOWLEDGE_POLICY_VERSION,
} from "./policy.constants";

export type KnowledgePolicyKind = (typeof KNOWLEDGE_POLICY_KINDS)[number];
export type KnowledgePolicyStatus = (typeof KNOWLEDGE_POLICY_STATUSES)[number];
export type KnowledgePolicyRuleStatus =
  (typeof KNOWLEDGE_POLICY_RULE_STATUSES)[number];
export type KnowledgePolicyBindingStatus =
  (typeof KNOWLEDGE_POLICY_BINDING_STATUSES)[number];
export type KnowledgePolicyEnforcement =
  (typeof KNOWLEDGE_POLICY_ENFORCEMENTS)[number];
export type KnowledgePolicyConstraint =
  (typeof KNOWLEDGE_POLICY_CONSTRAINTS)[number];
export type KnowledgePolicyReadinessVerdict =
  (typeof KNOWLEDGE_POLICY_READINESS_VERDICTS)[number];
export type KnowledgePolicyMetadata = Record<string, unknown>;

export type KnowledgePolicy = {
  id: string;
  policyKey: string;
  kind: KnowledgePolicyKind;
  status: KnowledgePolicyStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: KnowledgePolicyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterKnowledgePolicyInput = {
  id?: string;
  policyKey: string;
  kind: KnowledgePolicyKind;
  title: string;
  summary: string;
  metadata?: KnowledgePolicyMetadata;
};

export type UpdateKnowledgePolicyStatusInput = {
  policyId: string;
  status: KnowledgePolicyStatus;
};

/** Policy rule — soft-ref to dependency graphKey. */
export type KnowledgePolicyRule = {
  id: string;
  policyId: string;
  ruleKey: string;
  sequence: number;
  status: KnowledgePolicyRuleStatus;
  constraint: KnowledgePolicyConstraint;
  enforcement: KnowledgePolicyEnforcement;
  graphKeyRef: string;
  summary: string;
  detail: string;
  metadata: KnowledgePolicyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterKnowledgePolicyRuleInput = {
  id?: string;
  policyId: string;
  ruleKey: string;
  sequence: number;
  constraint: KnowledgePolicyConstraint;
  enforcement: KnowledgePolicyEnforcement;
  graphKeyRef: string;
  summary: string;
  metadata?: KnowledgePolicyMetadata;
};

export type UpdateKnowledgePolicyRuleStatusInput = {
  ruleId: string;
  status: KnowledgePolicyRuleStatus;
};

/** Soft binding of policy rule to dependency edgeKey. */
export type KnowledgePolicyBinding = {
  id: string;
  policyId: string;
  ruleId: string;
  bindingKey: string;
  edgeKeyRef: string;
  status: KnowledgePolicyBindingStatus;
  detail: string;
  metadata: KnowledgePolicyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindKnowledgePolicyRuleInput = {
  id?: string;
  policyId: string;
  ruleId: string;
  bindingKey: string;
  edgeKeyRef: string;
  metadata?: KnowledgePolicyMetadata;
};

export type KnowledgePolicyReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type KnowledgePolicyReadinessResult = {
  verdict: KnowledgePolicyReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: KnowledgePolicyReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type KnowledgePolicyManifest = {
  policyRuntimeId: typeof PRODUCT_KNOWLEDGE_POLICY_ID;
  version: typeof PRODUCT_KNOWLEDGE_POLICY_VERSION;
  freezeVersion: typeof PRODUCT_KNOWLEDGE_POLICY_FREEZE_VERSION;
  base: typeof PRODUCT_KNOWLEDGE_POLICY_BASE;
  policyCount: number;
  ruleCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
