/**
 * Product M13 — OS Governance domain types
 */

import type {
  OS_GOVERNANCE_APPROVALS,
  OS_GOVERNANCE_BINDING_STATUSES,
  OS_GOVERNANCE_READINESS_VERDICTS,
  OS_GOVERNANCE_REVIEW_STATUSES,
  OS_GOVERNANCE_RISK_LEVELS,
  OS_GOVERNANCE_STANDARD_KINDS,
  OS_GOVERNANCE_STANDARD_STATUSES,
  PRODUCT_OS_GOVERNANCE_BASE,
  PRODUCT_OS_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_OS_GOVERNANCE_ID,
  PRODUCT_OS_GOVERNANCE_VERSION,
} from "./governance.constants";

export type OsGovernanceStandardKind =
  (typeof OS_GOVERNANCE_STANDARD_KINDS)[number];
export type OsGovernanceStandardStatus =
  (typeof OS_GOVERNANCE_STANDARD_STATUSES)[number];
export type OsGovernanceReviewStatus =
  (typeof OS_GOVERNANCE_REVIEW_STATUSES)[number];
export type OsGovernanceApproval = (typeof OS_GOVERNANCE_APPROVALS)[number];
export type OsGovernanceRiskLevel = (typeof OS_GOVERNANCE_RISK_LEVELS)[number];
export type OsGovernanceBindingStatus =
  (typeof OS_GOVERNANCE_BINDING_STATUSES)[number];
export type OsGovernanceReadinessVerdict =
  (typeof OS_GOVERNANCE_READINESS_VERDICTS)[number];
export type OsGovernanceMetadata = Record<string, unknown>;

export type OsGovernanceStandard = {
  id: string;
  standardKey: string;
  kind: OsGovernanceStandardKind;
  status: OsGovernanceStandardStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: OsGovernanceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOsGovernanceStandardInput = {
  id?: string;
  standardKey: string;
  kind: OsGovernanceStandardKind;
  title: string;
  summary: string;
  metadata?: OsGovernanceMetadata;
};

export type UpdateOsGovernanceStandardStatusInput = {
  standardId: string;
  status: OsGovernanceStandardStatus;
};

/** Governance review — soft-ref to compatibility matrixKey. */
export type OsGovernanceReview = {
  id: string;
  standardId: string;
  reviewKey: string;
  sequence: number;
  status: OsGovernanceReviewStatus;
  approval: OsGovernanceApproval;
  riskLevel: OsGovernanceRiskLevel;
  matrixKeyRef: string;
  summary: string;
  detail: string;
  metadata: OsGovernanceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOsGovernanceReviewInput = {
  id?: string;
  standardId: string;
  reviewKey: string;
  sequence: number;
  approval: OsGovernanceApproval;
  riskLevel: OsGovernanceRiskLevel;
  matrixKeyRef: string;
  summary: string;
  metadata?: OsGovernanceMetadata;
};

export type UpdateOsGovernanceReviewStatusInput = {
  reviewId: string;
  status: OsGovernanceReviewStatus;
};

/** Soft binding of review to freeze-gate / pair key. */
export type OsGovernanceBinding = {
  id: string;
  standardId: string;
  reviewId: string;
  bindingKey: string;
  freezeGateRef: string;
  pairKeyRef: string;
  status: OsGovernanceBindingStatus;
  detail: string;
  metadata: OsGovernanceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindOsGovernanceReviewInput = {
  id?: string;
  standardId: string;
  reviewId: string;
  bindingKey: string;
  freezeGateRef: string;
  pairKeyRef: string;
  metadata?: OsGovernanceMetadata;
};

export type OsGovernanceReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type OsGovernanceReadinessResult = {
  verdict: OsGovernanceReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: OsGovernanceReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type OsGovernanceManifest = {
  governanceRuntimeId: typeof PRODUCT_OS_GOVERNANCE_ID;
  version: typeof PRODUCT_OS_GOVERNANCE_VERSION;
  freezeVersion: typeof PRODUCT_OS_GOVERNANCE_FREEZE_VERSION;
  base: typeof PRODUCT_OS_GOVERNANCE_BASE;
  standardCount: number;
  reviewCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
