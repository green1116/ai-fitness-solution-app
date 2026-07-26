/**
 * Product Integration Governance — public exports
 * Isolated namespace: lib/product/integration-governance
 */

export {
  INTEGRATION_GOVERNANCE_COMPLIANCE_VERDICTS,
  INTEGRATION_GOVERNANCE_MANAGER_STATUSES,
  INTEGRATION_GOVERNANCE_POLICY_KINDS,
  INTEGRATION_GOVERNANCE_POLICY_STATUSES,
  INTEGRATION_GOVERNANCE_READINESS_VERDICTS,
  INTEGRATION_GOVERNANCE_REVIEW_VERDICTS,
  INTEGRATION_GOVERNANCE_STANDARD_LEVELS,
  PRODUCT_INTEGRATION_GOVERNANCE_BASE,
  PRODUCT_INTEGRATION_GOVERNANCE_FREEZE_TAG,
  PRODUCT_INTEGRATION_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_INTEGRATION_GOVERNANCE_ID,
  PRODUCT_INTEGRATION_GOVERNANCE_VERSION,
} from "./management/management.constants";

export type {
  IntegrationGovernanceManagerStatus,
  IntegrationGovernanceReadinessCheck,
  IntegrationGovernanceReadinessResult,
  IntegrationGovernanceReadinessVerdict,
  IntegrationGovernanceRegistryManifest,
} from "./management/management.types";

export type {
  IntegrationGovernancePolicy,
  IntegrationGovernancePolicyKind,
  IntegrationGovernancePolicyMetadata,
  IntegrationGovernancePolicyStatus,
  RegisterIntegrationGovernancePolicyInput,
  UpdateIntegrationGovernancePolicyStatusInput,
} from "./policy/policy.types";

export {
  clearIntegrationGovernancePolicies,
  getIntegrationGovernancePolicy,
  listIntegrationGovernancePolicies,
  registerIntegrationGovernancePolicy,
  updateIntegrationGovernancePolicyStatus,
} from "./policy/policy.registry";

export type {
  IntegrationGovernanceStandard,
  IntegrationGovernanceStandardLevel,
  IntegrationGovernanceStandardMetadata,
  RegisterIntegrationGovernanceStandardInput,
} from "./standard/standard.types";

export {
  clearIntegrationGovernanceStandards,
  getIntegrationGovernanceStandard,
  listIntegrationGovernanceStandards,
  registerIntegrationGovernanceStandard,
} from "./standard/standard.registry";

export type {
  IntegrationGovernanceReview,
  IntegrationGovernanceReviewMetadata,
  IntegrationGovernanceReviewVerdict,
  RecordIntegrationGovernanceReviewInput,
} from "./review/review.types";

export {
  clearIntegrationGovernanceReviews,
  getIntegrationGovernanceReview,
  listIntegrationGovernanceReviews,
  recordIntegrationGovernanceReview,
} from "./review/review.registry";

export type {
  IntegrationGovernanceCompliance,
  IntegrationGovernanceComplianceMetadata,
  IntegrationGovernanceComplianceVerdict,
  RecordIntegrationGovernanceComplianceInput,
} from "./compliance/compliance.types";

export {
  clearIntegrationGovernanceCompliances,
  getIntegrationGovernanceCompliance,
  listIntegrationGovernanceCompliances,
  recordIntegrationGovernanceCompliance,
} from "./compliance/compliance.registry";

export type { IntegrationGovernanceReleaseManifest } from "./manifest/manifest.registry";

export {
  clearIntegrationGovernanceReleaseManifests,
  createIntegrationGovernanceReleaseManifest,
  getIntegrationGovernanceReleaseManifest,
  listIntegrationGovernanceReleaseManifests,
} from "./manifest/manifest.registry";

export {
  assertIntegrationGovernanceReadinessReady,
  evaluateIntegrationGovernanceReadiness,
} from "./management/management.readiness";

export {
  clearIntegrationGovernanceLayer,
  createIntegrationGovernanceManager,
  getIntegrationGovernanceRegistryManifest,
  type IntegrationGovernanceManager,
  type IntegrationGovernanceManagerSnapshot,
} from "./integration-governance.manager";

export {
  assertProductIntegrationGovernanceReleaseGatePass,
  checkProductIntegrationGovernanceReleaseGate,
  PRODUCT_INTEGRATION_GOVERNANCE_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
