/**
 * Product M11 — Knowledge Governance domain types
 */

import type {
  KNOWLEDGE_GOVERNANCE_APPROVALS,
  KNOWLEDGE_GOVERNANCE_BINDING_STATUSES,
  KNOWLEDGE_GOVERNANCE_READINESS_VERDICTS,
  KNOWLEDGE_GOVERNANCE_REVIEW_STATUSES,
  KNOWLEDGE_GOVERNANCE_RISK_LEVELS,
  KNOWLEDGE_GOVERNANCE_STANDARD_KINDS,
  KNOWLEDGE_GOVERNANCE_STANDARD_STATUSES,
  PRODUCT_KNOWLEDGE_GOVERNANCE_BASE,
  PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_GOVERNANCE_ID,
  PRODUCT_KNOWLEDGE_GOVERNANCE_VERSION,
} from "./governance.constants";

export type KnowledgeGovernanceStandardKind =
  (typeof KNOWLEDGE_GOVERNANCE_STANDARD_KINDS)[number];
export type KnowledgeGovernanceStandardStatus =
  (typeof KNOWLEDGE_GOVERNANCE_STANDARD_STATUSES)[number];
export type KnowledgeGovernanceReviewStatus =
  (typeof KNOWLEDGE_GOVERNANCE_REVIEW_STATUSES)[number];
export type KnowledgeGovernanceApproval =
  (typeof KNOWLEDGE_GOVERNANCE_APPROVALS)[number];
export type KnowledgeGovernanceRiskLevel =
  (typeof KNOWLEDGE_GOVERNANCE_RISK_LEVELS)[number];
export type KnowledgeGovernanceBindingStatus =
  (typeof KNOWLEDGE_GOVERNANCE_BINDING_STATUSES)[number];
export type KnowledgeGovernanceReadinessVerdict =
  (typeof KNOWLEDGE_GOVERNANCE_READINESS_VERDICTS)[number];
export type KnowledgeGovernanceMetadata = Record<string, unknown>;

export type KnowledgeGovernanceStandard = {
  id: string;
  standardKey: string;
  kind: KnowledgeGovernanceStandardKind;
  status: KnowledgeGovernanceStandardStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: KnowledgeGovernanceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterKnowledgeGovernanceStandardInput = {
  id?: string;
  standardKey: string;
  kind: KnowledgeGovernanceStandardKind;
  title: string;
  summary: string;
  metadata?: KnowledgeGovernanceMetadata;
};

export type UpdateKnowledgeGovernanceStandardStatusInput = {
  standardId: string;
  status: KnowledgeGovernanceStandardStatus;
};

/** Governance review — soft-ref to compatibility matrixKey. */
export type KnowledgeGovernanceReview = {
  id: string;
  standardId: string;
  reviewKey: string;
  sequence: number;
  status: KnowledgeGovernanceReviewStatus;
  approval: KnowledgeGovernanceApproval;
  riskLevel: KnowledgeGovernanceRiskLevel;
  matrixKeyRef: string;
  summary: string;
  detail: string;
  metadata: KnowledgeGovernanceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterKnowledgeGovernanceReviewInput = {
  id?: string;
  standardId: string;
  reviewKey: string;
  sequence: number;
  approval: KnowledgeGovernanceApproval;
  riskLevel: KnowledgeGovernanceRiskLevel;
  matrixKeyRef: string;
  summary: string;
  metadata?: KnowledgeGovernanceMetadata;
};

export type UpdateKnowledgeGovernanceReviewStatusInput = {
  reviewId: string;
  status: KnowledgeGovernanceReviewStatus;
};

/** Soft binding of review to freeze-gate / pair key. */
export type KnowledgeGovernanceBinding = {
  id: string;
  standardId: string;
  reviewId: string;
  bindingKey: string;
  freezeGateRef: string;
  pairKeyRef: string;
  status: KnowledgeGovernanceBindingStatus;
  detail: string;
  metadata: KnowledgeGovernanceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindKnowledgeGovernanceReviewInput = {
  id?: string;
  standardId: string;
  reviewId: string;
  bindingKey: string;
  freezeGateRef: string;
  pairKeyRef: string;
  metadata?: KnowledgeGovernanceMetadata;
};

export type KnowledgeGovernanceReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type KnowledgeGovernanceReadinessResult = {
  verdict: KnowledgeGovernanceReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: KnowledgeGovernanceReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type KnowledgeGovernanceManifest = {
  governanceRuntimeId: typeof PRODUCT_KNOWLEDGE_GOVERNANCE_ID;
  version: typeof PRODUCT_KNOWLEDGE_GOVERNANCE_VERSION;
  freezeVersion: typeof PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION;
  base: typeof PRODUCT_KNOWLEDGE_GOVERNANCE_BASE;
  standardCount: number;
  reviewCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
