/**
 * Product Compliance — Governance & Compliance public exports
 * Isolated namespace: lib/product/compliance
 */

export {
  COMPLIANCE_ASSESSMENT_RESULTS,
  COMPLIANCE_CONTROL_STATUSES,
  COMPLIANCE_EVIDENCE_KINDS,
  COMPLIANCE_FRAMEWORK_KINDS,
  COMPLIANCE_FRAMEWORK_STATUSES,
  COMPLIANCE_MANAGER_STATUSES,
  COMPLIANCE_READINESS_VERDICTS,
  PRODUCT_COMPLIANCE_FREEZE_VERSION,
  PRODUCT_COMPLIANCE_GOVERNANCE_BASE,
  PRODUCT_COMPLIANCE_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_COMPLIANCE_GOVERNANCE_ID,
  PRODUCT_COMPLIANCE_GOVERNANCE_VERSION,
} from "./governance/governance.constants";

export type {
  ComplianceManagerStatus,
  ComplianceReadinessCheck,
  ComplianceReadinessResult,
  ComplianceReadinessVerdict,
  ComplianceRegistryManifest,
} from "./governance/governance.types";

export type {
  ComplianceFramework,
  ComplianceFrameworkKind,
  ComplianceFrameworkStatus,
  FrameworkMetadata,
  RegisterComplianceFrameworkInput,
  UpdateComplianceFrameworkStatusInput,
} from "./framework/framework.types";

export {
  clearComplianceFrameworks,
  getComplianceFramework,
  listComplianceFrameworks,
  registerComplianceFramework,
  updateComplianceFrameworkStatus,
} from "./framework/framework.registry";

export type {
  ComplianceControl,
  ComplianceControlStatus,
  ControlMetadata,
  DefineComplianceControlInput,
  UpdateComplianceControlStatusInput,
} from "./control/control.types";

export {
  clearComplianceControls,
  defineComplianceControl,
  getComplianceControl,
  listComplianceControls,
  updateComplianceControlStatus,
} from "./control/control.registry";

export type {
  CollectComplianceEvidenceInput,
  ComplianceEvidence,
  ComplianceEvidenceKind,
  EvidenceMetadata,
} from "./evidence/evidence.types";

export {
  clearComplianceEvidences,
  collectComplianceEvidence,
  getComplianceEvidence,
  listComplianceEvidences,
} from "./evidence/evidence.registry";

export type {
  AssessmentMetadata,
  ComplianceAssessment,
  ComplianceAssessmentResult,
  RunComplianceAssessmentInput,
} from "./assessment/assessment.types";

export {
  clearComplianceAssessments,
  getComplianceAssessment,
  listComplianceAssessments,
  runComplianceAssessment,
} from "./assessment/assessment.registry";

export {
  assertComplianceGovernanceReadinessReady,
  evaluateComplianceGovernanceReadiness,
} from "./governance/governance.readiness";

export {
  clearComplianceGovernanceLayer,
  createComplianceManager,
  getComplianceRegistryManifest,
  type ComplianceManager,
  type ComplianceManagerSnapshot,
} from "./compliance.manager";

export {
  assertProductComplianceReleaseGatePass,
  checkProductComplianceReleaseGate,
  PRODUCT_COMPLIANCE_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
