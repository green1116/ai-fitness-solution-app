/**
 * Product M14 — Intelligence Governance domain types
 */

import type {
  INTELLIGENCE_GOVERNANCE_APPROVALS,
  INTELLIGENCE_GOVERNANCE_BINDING_STATUSES,
  INTELLIGENCE_GOVERNANCE_READINESS_VERDICTS,
  INTELLIGENCE_GOVERNANCE_REVIEW_STATUSES,
  INTELLIGENCE_GOVERNANCE_RISK_LEVELS,
  INTELLIGENCE_GOVERNANCE_STANDARD_KINDS,
  INTELLIGENCE_GOVERNANCE_STANDARD_STATUSES,
  PRODUCT_INTELLIGENCE_GOVERNANCE_BASE,
  PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_GOVERNANCE_ID,
  PRODUCT_INTELLIGENCE_GOVERNANCE_VERSION,
} from "./governance.constants";

export type IntelligenceGovernanceStandardKind =
  (typeof INTELLIGENCE_GOVERNANCE_STANDARD_KINDS)[number];
export type IntelligenceGovernanceStandardStatus =
  (typeof INTELLIGENCE_GOVERNANCE_STANDARD_STATUSES)[number];
export type IntelligenceGovernanceReviewStatus =
  (typeof INTELLIGENCE_GOVERNANCE_REVIEW_STATUSES)[number];
export type IntelligenceGovernanceApproval =
  (typeof INTELLIGENCE_GOVERNANCE_APPROVALS)[number];
export type IntelligenceGovernanceRiskLevel =
  (typeof INTELLIGENCE_GOVERNANCE_RISK_LEVELS)[number];
export type IntelligenceGovernanceBindingStatus =
  (typeof INTELLIGENCE_GOVERNANCE_BINDING_STATUSES)[number];
export type IntelligenceGovernanceReadinessVerdict =
  (typeof INTELLIGENCE_GOVERNANCE_READINESS_VERDICTS)[number];
export type IntelligenceGovernanceMetadata = Record<string, unknown>;

export type IntelligenceGovernanceStandard = {
  id: string;
  standardKey: string;
  kind: IntelligenceGovernanceStandardKind;
  status: IntelligenceGovernanceStandardStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: IntelligenceGovernanceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterIntelligenceGovernanceStandardInput = {
  id?: string;
  standardKey: string;
  kind: IntelligenceGovernanceStandardKind;
  title: string;
  summary: string;
  metadata?: IntelligenceGovernanceMetadata;
};

export type UpdateIntelligenceGovernanceStandardStatusInput = {
  standardId: string;
  status: IntelligenceGovernanceStandardStatus;
};

/** Governance review — soft-ref to compatibility matrixKey. */
export type IntelligenceGovernanceReview = {
  id: string;
  standardId: string;
  reviewKey: string;
  sequence: number;
  status: IntelligenceGovernanceReviewStatus;
  approval: IntelligenceGovernanceApproval;
  riskLevel: IntelligenceGovernanceRiskLevel;
  matrixKeyRef: string;
  summary: string;
  detail: string;
  metadata: IntelligenceGovernanceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterIntelligenceGovernanceReviewInput = {
  id?: string;
  standardId: string;
  reviewKey: string;
  sequence: number;
  approval: IntelligenceGovernanceApproval;
  riskLevel: IntelligenceGovernanceRiskLevel;
  matrixKeyRef: string;
  summary: string;
  metadata?: IntelligenceGovernanceMetadata;
};

export type UpdateIntelligenceGovernanceReviewStatusInput = {
  reviewId: string;
  status: IntelligenceGovernanceReviewStatus;
};

/** Soft binding of review to freeze-gate / pair key. */
export type IntelligenceGovernanceBinding = {
  id: string;
  standardId: string;
  reviewId: string;
  bindingKey: string;
  freezeGateRef: string;
  pairKeyRef: string;
  status: IntelligenceGovernanceBindingStatus;
  detail: string;
  metadata: IntelligenceGovernanceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindIntelligenceGovernanceReviewInput = {
  id?: string;
  standardId: string;
  reviewId: string;
  bindingKey: string;
  freezeGateRef: string;
  pairKeyRef: string;
  metadata?: IntelligenceGovernanceMetadata;
};

export type IntelligenceGovernanceReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type IntelligenceGovernanceReadinessResult = {
  verdict: IntelligenceGovernanceReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: IntelligenceGovernanceReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type IntelligenceGovernanceManifest = {
  governanceRuntimeId: typeof PRODUCT_INTELLIGENCE_GOVERNANCE_ID;
  version: typeof PRODUCT_INTELLIGENCE_GOVERNANCE_VERSION;
  freezeVersion: typeof PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION;
  base: typeof PRODUCT_INTELLIGENCE_GOVERNANCE_BASE;
  standardCount: number;
  reviewCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
