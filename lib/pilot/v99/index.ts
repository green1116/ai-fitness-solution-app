/**
 * V99 — Platform readiness & production certification
 */

export {
  V99_PRODUCTION_READINESS_VERSION,
  type ArtifactLink,
  type AuditReference,
  type CertificationActionEntry,
  type CertificationActionType,
  type CertificationGate,
  type CertificationPackage,
  type GateStatus,
  type OverallReadiness,
  type ProductionReadinessDashboard,
  type ReadinessDimension,
  type ReadinessDimensionResult,
  type ReadinessSummary,
  type RiskSummaryItem,
} from "./production-readiness/readiness.types";

export {
  clearCertificationCacheForTests,
  getCertificationPackage,
  getCertifiedAt,
  getGateOverride,
  listCertificationActions,
  listCertificationPackages,
} from "./production-readiness/certification-cache";

export {
  buildArtifactLinks,
  buildAuditReferences,
  buildCertificationGates,
  buildReadinessDimensions,
  buildReadinessSummary,
  buildRiskSummary,
  computeOverallReadiness,
  evaluateArchitecture,
  evaluateCompliance,
  evaluateDelivery,
  evaluateGovernance,
  evaluateOperations,
  evaluateWorkflow,
} from "./production-readiness/readiness.service";

export {
  certifyProductionReady,
  generateCertificationPackage,
  recordGateReview,
  waiveGate,
} from "./production-readiness/certification.service";

export {
  buildCertificationPackageDetail,
  buildProductionReadinessDashboard,
} from "./production-readiness/readiness-dashboard.service";
