/**
 * Product M10 — AI Runtime Governance shared types
 */

import type {
  AI_RUNTIME_GOVERNANCE_COMPLIANCE_VERDICTS,
  AI_RUNTIME_GOVERNANCE_POLICY_KINDS,
  AI_RUNTIME_GOVERNANCE_POLICY_STATUSES,
  AI_RUNTIME_GOVERNANCE_READINESS_VERDICTS,
  AI_RUNTIME_GOVERNANCE_REVIEW_VERDICTS,
  AI_RUNTIME_GOVERNANCE_STANDARD_LEVELS,
  PRODUCT_AI_RUNTIME_GOVERNANCE_BASE,
  PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_GOVERNANCE_ID,
  PRODUCT_AI_RUNTIME_GOVERNANCE_VERSION,
} from "./governance.constants";

export type AiRuntimeGovernancePolicyKind =
  (typeof AI_RUNTIME_GOVERNANCE_POLICY_KINDS)[number];
export type AiRuntimeGovernancePolicyStatus =
  (typeof AI_RUNTIME_GOVERNANCE_POLICY_STATUSES)[number];
export type AiRuntimeGovernanceStandardLevel =
  (typeof AI_RUNTIME_GOVERNANCE_STANDARD_LEVELS)[number];
export type AiRuntimeGovernanceReviewVerdict =
  (typeof AI_RUNTIME_GOVERNANCE_REVIEW_VERDICTS)[number];
export type AiRuntimeGovernanceComplianceVerdict =
  (typeof AI_RUNTIME_GOVERNANCE_COMPLIANCE_VERDICTS)[number];
export type AiRuntimeGovernanceReadinessVerdict =
  (typeof AI_RUNTIME_GOVERNANCE_READINESS_VERDICTS)[number];
export type AiRuntimeGovernanceMetadata = Record<string, unknown>;

export type AiRuntimeGovernancePolicy = {
  id: string;
  policyKey: string;
  kind: AiRuntimeGovernancePolicyKind;
  status: AiRuntimeGovernancePolicyStatus;
  title: string;
  resourceKeyRef: string;
  detail: string;
  metadata: AiRuntimeGovernanceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAiRuntimeGovernancePolicyInput = {
  id?: string;
  policyKey: string;
  kind: AiRuntimeGovernancePolicyKind;
  title: string;
  resourceKeyRef: string;
  metadata?: AiRuntimeGovernanceMetadata;
};

export type UpdateAiRuntimeGovernancePolicyStatusInput = {
  policyId: string;
  status: AiRuntimeGovernancePolicyStatus;
};

export type AiRuntimeGovernanceStandard = {
  id: string;
  policyId: string;
  standardKey: string;
  level: AiRuntimeGovernanceStandardLevel;
  ruleRef: string;
  detail: string;
  metadata: AiRuntimeGovernanceMetadata;
  createdAt: string;
};

export type RegisterAiRuntimeGovernanceStandardInput = {
  id?: string;
  policyId: string;
  standardKey: string;
  level: AiRuntimeGovernanceStandardLevel;
  ruleRef: string;
  metadata?: AiRuntimeGovernanceMetadata;
};

export type AiRuntimeGovernanceReview = {
  id: string;
  policyId: string;
  standardId: string;
  reviewKey: string;
  subjectRef: string;
  verdict: AiRuntimeGovernanceReviewVerdict;
  detail: string;
  metadata: AiRuntimeGovernanceMetadata;
  createdAt: string;
};

export type RecordAiRuntimeGovernanceReviewInput = {
  id?: string;
  policyId: string;
  standardId: string;
  reviewKey: string;
  subjectRef: string;
  verdict: AiRuntimeGovernanceReviewVerdict;
  metadata?: AiRuntimeGovernanceMetadata;
};

export type AiRuntimeGovernanceCompliance = {
  id: string;
  policyId: string;
  reviewId: string;
  complianceKey: string;
  verdict: AiRuntimeGovernanceComplianceVerdict;
  detail: string;
  metadata: AiRuntimeGovernanceMetadata;
  createdAt: string;
};

export type RecordAiRuntimeGovernanceComplianceInput = {
  id?: string;
  policyId: string;
  reviewId: string;
  complianceKey: string;
  verdict: AiRuntimeGovernanceComplianceVerdict;
  metadata?: AiRuntimeGovernanceMetadata;
};

export type AiRuntimeGovernanceReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AiRuntimeGovernanceReadinessResult = {
  verdict: AiRuntimeGovernanceReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AiRuntimeGovernanceReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AiRuntimeGovernanceManifest = {
  governanceId: typeof PRODUCT_AI_RUNTIME_GOVERNANCE_ID;
  version: typeof PRODUCT_AI_RUNTIME_GOVERNANCE_VERSION;
  freezeVersion: typeof PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_VERSION;
  base: typeof PRODUCT_AI_RUNTIME_GOVERNANCE_BASE;
  policyCount: number;
  standardCount: number;
  reviewCount: number;
  complianceCount: number;
  checksum: string;
  createdAt: string;
};
