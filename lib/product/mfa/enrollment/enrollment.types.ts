/**
 * Product MFA — Enrollment types
 */

import type {
  MFA_ENROLLMENT_STATUSES,
  MFA_FACTOR_KINDS,
} from "../factor/factor.constants";

export type MfaFactorKind = (typeof MFA_FACTOR_KINDS)[number];
export type MfaEnrollmentStatus = (typeof MFA_ENROLLMENT_STATUSES)[number];
export type EnrollmentMetadata = Record<string, unknown>;

export type MfaEnrollment = {
  id: string;
  principalId: string;
  kind: MfaFactorKind;
  status: MfaEnrollmentStatus;
  label: string;
  detail: string;
  metadata: EnrollmentMetadata;
  enrolledAt: string;
  activatedAt?: string;
};

export type EnrollFactorInput = {
  id?: string;
  principalId: string;
  kind: MfaFactorKind;
  label: string;
  metadata?: EnrollmentMetadata;
};

export type ActivateEnrollmentInput = {
  enrollmentId: string;
};

export type DisableEnrollmentInput = {
  enrollmentId: string;
};
