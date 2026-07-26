/**
 * Product M09 — AI Governance shared types
 */

import type {
  AI_GOVERNANCE_COMPLIANCE_VERDICTS,
  AI_GOVERNANCE_POLICY_KINDS,
  AI_GOVERNANCE_POLICY_STATUSES,
  AI_GOVERNANCE_READINESS_VERDICTS,
  AI_GOVERNANCE_REVIEW_VERDICTS,
  AI_GOVERNANCE_STANDARD_LEVELS,
  PRODUCT_AI_GOVERNANCE_BASE,
  PRODUCT_AI_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AI_GOVERNANCE_ID,
  PRODUCT_AI_GOVERNANCE_VERSION,
} from "./governance.constants";

export type AiGovernancePolicyKind =
  (typeof AI_GOVERNANCE_POLICY_KINDS)[number];
export type AiGovernancePolicyStatus =
  (typeof AI_GOVERNANCE_POLICY_STATUSES)[number];
export type AiGovernanceStandardLevel =
  (typeof AI_GOVERNANCE_STANDARD_LEVELS)[number];
export type AiGovernanceReviewVerdict =
  (typeof AI_GOVERNANCE_REVIEW_VERDICTS)[number];
export type AiGovernanceComplianceVerdict =
  (typeof AI_GOVERNANCE_COMPLIANCE_VERDICTS)[number];
export type AiGovernanceReadinessVerdict =
  (typeof AI_GOVERNANCE_READINESS_VERDICTS)[number];
export type AiGovernanceMetadata = Record<string, unknown>;

export type AiGovernancePolicy = {
  id: string;
  policyKey: string;
  kind: AiGovernancePolicyKind;
  status: AiGovernancePolicyStatus;
  title: string;
  orchestrationKeyRef: string;
  detail: string;
  metadata: AiGovernanceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAiGovernancePolicyInput = {
  id?: string;
  policyKey: string;
  kind: AiGovernancePolicyKind;
  title: string;
  orchestrationKeyRef: string;
  metadata?: AiGovernanceMetadata;
};

export type UpdateAiGovernancePolicyStatusInput = {
  policyId: string;
  status: AiGovernancePolicyStatus;
};

export type AiGovernanceStandard = {
  id: string;
  policyId: string;
  standardKey: string;
  level: AiGovernanceStandardLevel;
  ruleRef: string;
  detail: string;
  metadata: AiGovernanceMetadata;
  createdAt: string;
};

export type RegisterAiGovernanceStandardInput = {
  id?: string;
  policyId: string;
  standardKey: string;
  level: AiGovernanceStandardLevel;
  ruleRef: string;
  metadata?: AiGovernanceMetadata;
};

export type AiGovernanceReview = {
  id: string;
  policyId: string;
  standardId: string;
  reviewKey: string;
  subjectRef: string;
  verdict: AiGovernanceReviewVerdict;
  detail: string;
  metadata: AiGovernanceMetadata;
  createdAt: string;
};

export type RecordAiGovernanceReviewInput = {
  id?: string;
  policyId: string;
  standardId: string;
  reviewKey: string;
  subjectRef: string;
  verdict: AiGovernanceReviewVerdict;
  metadata?: AiGovernanceMetadata;
};

export type AiGovernanceCompliance = {
  id: string;
  policyId: string;
  reviewId: string;
  complianceKey: string;
  verdict: AiGovernanceComplianceVerdict;
  detail: string;
  metadata: AiGovernanceMetadata;
  createdAt: string;
};

export type RecordAiGovernanceComplianceInput = {
  id?: string;
  policyId: string;
  reviewId: string;
  complianceKey: string;
  verdict: AiGovernanceComplianceVerdict;
  metadata?: AiGovernanceMetadata;
};

export type AiGovernanceReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AiGovernanceReadinessResult = {
  verdict: AiGovernanceReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AiGovernanceReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AiGovernanceManifest = {
  governanceId: typeof PRODUCT_AI_GOVERNANCE_ID;
  version: typeof PRODUCT_AI_GOVERNANCE_VERSION;
  freezeVersion: typeof PRODUCT_AI_GOVERNANCE_FREEZE_VERSION;
  base: typeof PRODUCT_AI_GOVERNANCE_BASE;
  policyCount: number;
  standardCount: number;
  reviewCount: number;
  complianceCount: number;
  checksum: string;
  createdAt: string;
};
