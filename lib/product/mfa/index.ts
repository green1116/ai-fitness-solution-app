/**
 * Product MFA — Multi-Factor Authentication public exports
 * Isolated namespace: lib/product/mfa
 */

export {
  MFA_ASSERTION_RESULTS,
  MFA_CHALLENGE_STATUSES,
  MFA_ENROLLMENT_STATUSES,
  MFA_FACTOR_KINDS,
  MFA_MANAGER_STATUSES,
  MFA_READINESS_VERDICTS,
  PRODUCT_MFA_FREEZE_VERSION,
  PRODUCT_MFA_SECURITY_BASE,
  PRODUCT_MFA_SECURITY_FREEZE_VERSION,
  PRODUCT_MFA_SECURITY_ID,
  PRODUCT_MFA_SECURITY_VERSION,
} from "./factor/factor.constants";

export type {
  MfaManagerStatus,
  MfaReadinessCheck,
  MfaReadinessResult,
  MfaReadinessVerdict,
  MfaRegistryManifest,
} from "./factor/factor.types";

export type {
  ActivateEnrollmentInput,
  DisableEnrollmentInput,
  EnrollmentMetadata,
  EnrollFactorInput,
  MfaEnrollment,
  MfaEnrollmentStatus,
  MfaFactorKind,
} from "./enrollment/enrollment.types";

export {
  activateEnrollment,
  clearEnrollments,
  disableEnrollment,
  enrollFactor,
  getEnrollment,
  listEnrollments,
} from "./enrollment/enrollment.registry";

export type {
  ChallengeMetadata,
  IssueChallengeInput,
  MfaChallenge,
  MfaChallengeStatus,
  ResolveChallengeInput,
} from "./challenge/challenge.types";

export {
  clearChallenges,
  getChallenge,
  issueChallenge,
  listChallenges,
  resolveChallenge,
} from "./challenge/challenge.registry";

export type {
  AssertFactorInput,
  AssertionMetadata,
  MfaAssertion,
  MfaAssertionResult,
} from "./assertion/assertion.types";

export {
  assertFactor,
  clearAssertions,
  getAssertion,
  listAssertions,
} from "./assertion/assertion.registry";

export type {
  ConsumeRecoveryCodeInput,
  IssueRecoveryCodesInput,
  MfaRecoveryCode,
  RecoveryMetadata,
} from "./recovery/recovery.types";

export {
  clearRecoveryCodes,
  consumeRecoveryCode,
  getRecoveryCode,
  issueRecoveryCodes,
  listRecoveryCodes,
} from "./recovery/recovery.registry";

export {
  assertMfaSecurityReadinessReady,
  evaluateMfaSecurityReadiness,
} from "./factor/factor.readiness";

export {
  clearMfaSecurityLayer,
  createMfaManager,
  getMfaRegistryManifest,
  type MfaManager,
  type MfaManagerSnapshot,
} from "./mfa.manager";

export {
  assertProductMfaReleaseGatePass,
  checkProductMfaReleaseGate,
  PRODUCT_MFA_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
