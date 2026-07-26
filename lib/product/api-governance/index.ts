/**
 * Product API Governance — public exports
 * Isolated namespace: lib/product/api-governance
 */

export {
  GOVERNANCE_COMPLIANCE_VERDICTS,
  GOVERNANCE_MANAGER_STATUSES,
  GOVERNANCE_POLICY_KINDS,
  GOVERNANCE_POLICY_STATUSES,
  GOVERNANCE_READINESS_VERDICTS,
  GOVERNANCE_REVIEW_VERDICTS,
  GOVERNANCE_STANDARD_LEVELS,
  PRODUCT_API_GOVERNANCE_BASE,
  PRODUCT_API_GOVERNANCE_FREEZE_TAG,
  PRODUCT_API_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_API_GOVERNANCE_ID,
  PRODUCT_API_GOVERNANCE_VERSION,
} from "./management/management.constants";

export type {
  GovernanceManagerStatus,
  GovernanceReadinessCheck,
  GovernanceReadinessResult,
  GovernanceReadinessVerdict,
  GovernanceRegistryManifest,
} from "./management/management.types";

export type {
  GovernancePolicy,
  GovernancePolicyKind,
  GovernancePolicyMetadata,
  GovernancePolicyStatus,
  RegisterGovernancePolicyInput,
  UpdateGovernancePolicyStatusInput,
} from "./policy/policy.types";

export {
  clearGovernancePolicies,
  getGovernancePolicy,
  listGovernancePolicies,
  registerGovernancePolicy,
  updateGovernancePolicyStatus,
} from "./policy/policy.registry";

export type {
  GovernanceStandard,
  GovernanceStandardLevel,
  GovernanceStandardMetadata,
  RegisterGovernanceStandardInput,
} from "./standard/standard.types";

export {
  clearGovernanceStandards,
  getGovernanceStandard,
  listGovernanceStandards,
  registerGovernanceStandard,
} from "./standard/standard.registry";

export type {
  GovernanceReview,
  GovernanceReviewMetadata,
  GovernanceReviewVerdict,
  RecordGovernanceReviewInput,
} from "./review/review.types";

export {
  clearGovernanceReviews,
  getGovernanceReview,
  listGovernanceReviews,
  recordGovernanceReview,
} from "./review/review.registry";

export type {
  GovernanceCompliance,
  GovernanceComplianceMetadata,
  GovernanceComplianceVerdict,
  RecordGovernanceComplianceInput,
} from "./compliance/compliance.types";

export {
  clearGovernanceCompliances,
  getGovernanceCompliance,
  listGovernanceCompliances,
  recordGovernanceCompliance,
} from "./compliance/compliance.registry";

export type { ApiGovernanceReleaseManifest } from "./manifest/manifest.registry";

export {
  clearApiGovernanceReleaseManifests,
  createApiGovernanceReleaseManifest,
  getApiGovernanceReleaseManifest,
  listApiGovernanceReleaseManifests,
} from "./manifest/manifest.registry";

export {
  assertApiGovernanceReadinessReady,
  evaluateApiGovernanceReadiness,
} from "./management/management.readiness";

export {
  clearApiGovernanceLayer,
  createApiGovernanceManager,
  getApiGovernanceRegistryManifest,
  type ApiGovernanceManager,
  type GovernanceManagerSnapshot,
} from "./api-governance.manager";

export {
  assertProductApiGovernanceReleaseGatePass,
  checkProductApiGovernanceReleaseGate,
  PRODUCT_API_GOVERNANCE_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
