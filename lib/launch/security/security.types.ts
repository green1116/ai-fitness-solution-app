/**
 * Launch P4 — Security Readiness types
 */

import type {
  ACCESS_REVIEW_STATUSES,
  ACCESS_REVIEW_TARGETS,
  AUDIT_VALIDATION_STATUSES,
  COMPLIANCE_CHECK_IDS,
  COMPLIANCE_ITEM_STATUSES,
  LAUNCH_SECURITY_READINESS_BASE,
  LAUNCH_SECURITY_READINESS_FREEZE_VERSION,
  LAUNCH_SECURITY_READINESS_ID,
  LAUNCH_SECURITY_READINESS_VERSION,
  SECURITY_MANAGER_STATUSES,
  SECURITY_PROFILE_STATUSES,
  SECURITY_READINESS_VERDICTS,
} from "./security.constants";

export type SecurityProfileStatus = (typeof SECURITY_PROFILE_STATUSES)[number];
export type AccessReviewStatus = (typeof ACCESS_REVIEW_STATUSES)[number];
export type AccessReviewTarget = (typeof ACCESS_REVIEW_TARGETS)[number];
export type ComplianceCheckId = (typeof COMPLIANCE_CHECK_IDS)[number];
export type ComplianceItemStatus = (typeof COMPLIANCE_ITEM_STATUSES)[number];
export type AuditValidationStatus = (typeof AUDIT_VALIDATION_STATUSES)[number];
export type SecurityReadinessVerdict =
  (typeof SECURITY_READINESS_VERDICTS)[number];
export type SecurityManagerStatus = (typeof SECURITY_MANAGER_STATUSES)[number];

export type SecurityMetadata = Record<string, unknown>;

/** Security profile. */
export type SecurityProfile = {
  id: string;
  name: string;
  productId: string;
  productionProfileId: string;
  organizationId?: string;
  productTenantId?: string;
  demoTenantId?: string;
  reviewerUserId: string;
  status: SecurityProfileStatus;
  metadata: SecurityMetadata;
  createdAt: string;
};

export type CreateSecurityProfileInput = {
  id?: string;
  name: string;
  productId: string;
  productionProfileId: string;
  organizationId?: string;
  productTenantId?: string;
  demoTenantId?: string;
  reviewerUserId: string;
  status?: SecurityProfileStatus;
  metadata?: SecurityMetadata;
};

/** Access review. */
export type AccessReviewFinding = {
  target: AccessReviewTarget;
  ok: boolean;
  detail: string;
};

export type AccessReview = {
  id: string;
  securityProfileId: string;
  status: AccessReviewStatus;
  findings: AccessReviewFinding[];
  passed: boolean;
  reviewedAt?: string;
  updatedAt: string;
};

export type StartAccessReviewInput = {
  id?: string;
  securityProfileId: string;
  permission?: string;
  apiKeyId?: string;
  apiCatalogEntryId?: string;
};

/** Compliance checklist. */
export type ComplianceChecklistItem = {
  checkId: ComplianceCheckId;
  label: string;
  required: boolean;
  status: ComplianceItemStatus;
  detail: string;
  updatedAt?: string;
};

export type ComplianceChecklist = {
  id: string;
  securityProfileId: string;
  items: ComplianceChecklistItem[];
  complete: boolean;
  updatedAt: string;
};

export type CreateComplianceChecklistInput = {
  id?: string;
  securityProfileId: string;
};

export type SetComplianceItemInput = {
  checklistId: string;
  checkId: ComplianceCheckId;
  status: ComplianceItemStatus;
  detail?: string;
};

/** Audit validation. */
export type AuditValidationResult = {
  id: string;
  securityProfileId: string;
  status: AuditValidationStatus;
  adminAuditCount: number;
  apiAuditCount: number;
  detail: string;
  validatedAt: string;
};

export type ValidateAuditInput = {
  id?: string;
  securityProfileId: string;
  minAdminAudits?: number;
  minApiAudits?: number;
};

/** Security readiness. */
export type SecurityReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type SecurityReadinessResult = {
  securityProfileId: string;
  verdict: SecurityReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: SecurityReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type SecurityRegistryManifest = {
  securityReadinessId: typeof LAUNCH_SECURITY_READINESS_ID;
  version: typeof LAUNCH_SECURITY_READINESS_VERSION;
  freezeVersion: typeof LAUNCH_SECURITY_READINESS_FREEZE_VERSION;
  base: typeof LAUNCH_SECURITY_READINESS_BASE;
  profileCount: number;
  accessReviewCount: number;
  checklistCount: number;
  auditValidationCount: number;
};
