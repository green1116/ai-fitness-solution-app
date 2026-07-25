/**
 * Product MFA — readiness / manifest types
 */

import type {
  MFA_MANAGER_STATUSES,
  MFA_READINESS_VERDICTS,
  PRODUCT_MFA_SECURITY_BASE,
  PRODUCT_MFA_SECURITY_FREEZE_VERSION,
  PRODUCT_MFA_SECURITY_ID,
  PRODUCT_MFA_SECURITY_VERSION,
} from "./factor.constants";

export type MfaReadinessVerdict = (typeof MFA_READINESS_VERDICTS)[number];
export type MfaManagerStatus = (typeof MFA_MANAGER_STATUSES)[number];

export type MfaReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type MfaReadinessResult = {
  verdict: MfaReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: MfaReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type MfaRegistryManifest = {
  foundationId: typeof PRODUCT_MFA_SECURITY_ID;
  version: typeof PRODUCT_MFA_SECURITY_VERSION;
  freezeVersion: typeof PRODUCT_MFA_SECURITY_FREEZE_VERSION;
  base: typeof PRODUCT_MFA_SECURITY_BASE;
  enrollmentCount: number;
  challengeCount: number;
  assertionCount: number;
  recoveryCount: number;
};
