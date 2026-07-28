/**
 * Product M12 — Agent Policy Runtime domain types
 */

import type {
  AGENT_POLICY_BINDING_STATUSES,
  AGENT_POLICY_CONSTRAINTS,
  AGENT_POLICY_ENFORCEMENTS,
  AGENT_POLICY_KINDS,
  AGENT_POLICY_READINESS_VERDICTS,
  AGENT_POLICY_RULE_STATUSES,
  AGENT_POLICY_STATUSES,
  PRODUCT_AGENT_POLICY_BASE,
  PRODUCT_AGENT_POLICY_FREEZE_VERSION,
  PRODUCT_AGENT_POLICY_ID,
  PRODUCT_AGENT_POLICY_VERSION,
} from "./policy.constants";

export type AgentPolicyKind = (typeof AGENT_POLICY_KINDS)[number];
export type AgentPolicyStatus = (typeof AGENT_POLICY_STATUSES)[number];
export type AgentPolicyRuleStatus =
  (typeof AGENT_POLICY_RULE_STATUSES)[number];
export type AgentPolicyBindingStatus =
  (typeof AGENT_POLICY_BINDING_STATUSES)[number];
export type AgentPolicyEnforcement =
  (typeof AGENT_POLICY_ENFORCEMENTS)[number];
export type AgentPolicyConstraint =
  (typeof AGENT_POLICY_CONSTRAINTS)[number];
export type AgentPolicyReadinessVerdict =
  (typeof AGENT_POLICY_READINESS_VERDICTS)[number];
export type AgentPolicyMetadata = Record<string, unknown>;

export type AgentPolicy = {
  id: string;
  policyKey: string;
  kind: AgentPolicyKind;
  status: AgentPolicyStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: AgentPolicyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAgentPolicyInput = {
  id?: string;
  policyKey: string;
  kind: AgentPolicyKind;
  title: string;
  summary: string;
  metadata?: AgentPolicyMetadata;
};

export type UpdateAgentPolicyStatusInput = {
  policyId: string;
  status: AgentPolicyStatus;
};

/** Policy rule — soft-ref to dependency graphKey. */
export type AgentPolicyRule = {
  id: string;
  policyId: string;
  ruleKey: string;
  sequence: number;
  status: AgentPolicyRuleStatus;
  constraint: AgentPolicyConstraint;
  enforcement: AgentPolicyEnforcement;
  graphKeyRef: string;
  summary: string;
  detail: string;
  metadata: AgentPolicyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAgentPolicyRuleInput = {
  id?: string;
  policyId: string;
  ruleKey: string;
  sequence: number;
  constraint: AgentPolicyConstraint;
  enforcement: AgentPolicyEnforcement;
  graphKeyRef: string;
  summary: string;
  metadata?: AgentPolicyMetadata;
};

export type UpdateAgentPolicyRuleStatusInput = {
  ruleId: string;
  status: AgentPolicyRuleStatus;
};

/** Soft binding of policy rule to dependency edgeKey. */
export type AgentPolicyBinding = {
  id: string;
  policyId: string;
  ruleId: string;
  bindingKey: string;
  edgeKeyRef: string;
  status: AgentPolicyBindingStatus;
  detail: string;
  metadata: AgentPolicyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindAgentPolicyRuleInput = {
  id?: string;
  policyId: string;
  ruleId: string;
  bindingKey: string;
  edgeKeyRef: string;
  metadata?: AgentPolicyMetadata;
};

export type AgentPolicyReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AgentPolicyReadinessResult = {
  verdict: AgentPolicyReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AgentPolicyReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AgentPolicyManifest = {
  policyRuntimeId: typeof PRODUCT_AGENT_POLICY_ID;
  version: typeof PRODUCT_AGENT_POLICY_VERSION;
  freezeVersion: typeof PRODUCT_AGENT_POLICY_FREEZE_VERSION;
  base: typeof PRODUCT_AGENT_POLICY_BASE;
  policyCount: number;
  ruleCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
