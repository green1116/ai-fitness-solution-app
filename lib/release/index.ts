/**
 * V3.7 FINAL Production Release Baseline —unified foundation
 */

export * from "./shared";
export * from "./release-context";
export * from "./freeze";
export * from "./baseline";
export * from "./integrity";
export * from "./snapshot";
export * from "./governance";
export * from "./final";

export {
  RELEASE_ID,
  RELEASE_WP1_ID,
  RELEASE_READINESS_CAPABILITY,
  RELEASE_READINESS_VERSION,
  RELEASE_READINESS_BASELINE,
  RELEASE_EP_FREEZE_IDS,
  buildReleaseReadiness,
  getReleaseReadiness,
  releaseReadinessFingerprint,
  clearReleaseReadiness,
  type ReleaseEpFreezeId,
  type ReleaseEpFreezeRef,
  type ReleaseReadinessChecks,
  type ReleaseRollbackGate,
  type ReleaseReadiness,
} from "./release-readiness";

export {
  RELEASE_WP2_ID,
  RELEASE_CANDIDATE_CAPABILITY,
  RELEASE_CANDIDATE_VERSION,
  RELEASE_CANDIDATE_BASELINE,
  buildReleaseCandidate,
  getReleaseCandidate,
  releaseCandidateFingerprint,
  clearReleaseCandidate,
  type ReleaseCandidate,
} from "./release-candidate";

export {
  RELEASE_WP3_ID,
  PRODUCTION_VALIDATION_CAPABILITY,
  PRODUCTION_VALIDATION_VERSION,
  PRODUCTION_VALIDATION_BASELINE,
  buildProductionValidation,
  getProductionValidation,
  productionValidationFingerprint,
  clearProductionValidation,
  type ProductionValidationChecks,
  type ProductionValidation,
} from "./production-validation";

export {
  RELEASE_WP4_ID,
  GA_RELEASE_CAPABILITY,
  GA_RELEASE_VERSION,
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_CODENAME,
  GA_RELEASE_FREEZE_DATE,
  GA_RELEASE_BASELINE,
  buildGaRelease,
  getGaRelease,
  gaReleaseFingerprint,
  clearGaRelease,
  type GaRelease,
} from "./ga-release";

export {
  PG_1_1_ID,
  RELEASE_HEALTH_REGISTRY_CAPABILITY,
  RELEASE_HEALTH_REGISTRY_VERSION,
  POST_GA_PRODUCTION_BASELINE,
  RELEASE_HEALTH_COMMIT_REF,
  RELEASE_HEALTH_GA_TAG,
  RELEASE_HEALTH_FREEZE_TAG,
  buildReleaseHealthRegistry,
  getReleaseHealthRegistry,
  releaseHealthRegistryFingerprint,
  clearReleaseHealthRegistry,
  ensureGaThenBuildReleaseHealth,
  type ReleaseHealthVerificationStatus,
  type ReleaseHealthDeploymentMetadata,
  type ReleaseHealthRollbackReference,
  type ReleaseHealthRecord,
} from "./health/release-health-registry";

export {
  PG_1_2_ID,
  RUNTIME_HEALTH_CAPABILITY,
  RUNTIME_HEALTH_VERSION,
  PG1_RELEASE_HEALTH_BASELINE,
  buildRuntimeHealthFoundation,
  getRuntimeHealthFoundation,
  runtimeHealthFoundationFingerprint,
  clearRuntimeHealthFoundation,
  ensureReleaseHealthThenBuildRuntime,
  type ApplicationHealthStatus,
  type ReleaseHealthStatus,
  type ReadinessSignal,
  type DependencyHealthStatus,
  type RuntimeDependencyStatus,
  type RuntimeHealthFoundation,
} from "./health/runtime-health-foundation";

export {
  PG_1_3_ID,
  DEPLOYMENT_EVIDENCE_CAPABILITY,
  DEPLOYMENT_EVIDENCE_VERSION,
  PG1_RUNTIME_HEALTH_BASELINE,
  DEPLOYMENT_EVIDENCE_DEPLOY_REF,
  buildDeploymentEvidenceFoundation,
  getDeploymentEvidenceFoundation,
  deploymentEvidenceFoundationFingerprint,
  clearDeploymentEvidenceFoundation,
  ensureRuntimeThenBuildDeploymentEvidence,
  type DeploymentEvidenceEnvironment,
  type DeploymentEvidenceVerificationStatus,
  type DeploymentEvidenceReleaseReference,
  type DeploymentEvidenceCommitReference,
  type DeploymentEvidenceDeploymentReference,
  type DeploymentEvidenceFoundation,
} from "./health/deployment-evidence-foundation";

export {
  PG_1_4_ID,
  PRODUCTION_AUDIT_CAPABILITY,
  PRODUCTION_AUDIT_VERSION,
  PG1_DEPLOYMENT_EVIDENCE_BASELINE,
  PRODUCTION_AUDIT_EVENT_TYPES,
  buildProductionAuditFoundation,
  getProductionAuditFoundation,
  productionAuditFoundationFingerprint,
  clearProductionAuditFoundation,
  ensureEvidenceThenBuildProductionAudit,
  type ProductionAuditEventType,
  type ProductionAuditActorSource,
  type ProductionAuditReleaseReference,
  type ProductionAuditVerificationReference,
  type ProductionAuditEvent,
  type ProductionAuditFoundation,
} from "./health/production-audit-foundation";

export {
  PG_1_FREEZE_ID,
  PG_1_FREEZE_CAPABILITY,
  PG_1_FREEZE_VERSION,
  PG_1_FREEZE_CODENAME,
  PG_1_FREEZE_DATE,
  PG1_PRODUCTION_AUDIT_BASELINE,
  PG_1_COMPONENTS,
  buildPg1FreezeManifest,
  getPg1FreezeManifest,
  pg1FreezeManifestFingerprint,
  clearPg1FreezeManifest,
  ensureAuditThenBuildPg1Freeze,
  type Pg1ComponentStatus,
  type Pg1ComponentEntry,
  type Pg1VersionReferences,
  type Pg1VerificationSummary,
  type Pg1FreezeManifest,
} from "./health/pg1-freeze-manifest";

export {
  PG_2_1_ID,
  CUSTOMER_LIFECYCLE_REGISTRY_CAPABILITY,
  CUSTOMER_LIFECYCLE_REGISTRY_VERSION,
  PG1_FREEZE_BASELINE,
  CUSTOMER_LIFECYCLE_STAGES,
  ONBOARDING_STATUSES,
  ACTIVATION_STATUSES,
  ADOPTION_STATUSES,
  buildCustomerLifecycleRegistry,
  getCustomerLifecycleRegistry,
  customerLifecycleRegistryFingerprint,
  clearCustomerLifecycleRegistry,
  ensurePg1FreezeThenBuildCustomerLifecycle,
  type CustomerLifecycleStage,
  type OnboardingStatus,
  type ActivationStatus,
  type AdoptionStatus,
  type CustomerLifecycleRecord,
  type CustomerLifecycleRegistry,
} from "./customer/customer-lifecycle-registry";

export {
  PG_2_2_ID,
  ADOPTION_HEALTH_CAPABILITY,
  ADOPTION_HEALTH_VERSION,
  PG2_1_CUSTOMER_LIFECYCLE_BASELINE,
  ADOPTION_LEVELS,
  USAGE_SIGNALS,
  ADOPTION_HEALTH_STATUSES,
  ADOPTION_RISK_SIGNALS,
  buildAdoptionHealth,
  getAdoptionHealth,
  adoptionHealthFingerprint,
  clearAdoptionHealth,
  ensureLifecycleThenBuildAdoptionHealth,
  type AdoptionLevel,
  type UsageSignal,
  type AdoptionHealthStatus,
  type AdoptionRiskSignal,
  type AdoptionHealthRecord,
  type AdoptionHealthFoundation,
} from "./customer/adoption-health";

export {
  PG_2_3_ID,
  CUSTOMER_ACTIVITY_EVIDENCE_CAPABILITY,
  CUSTOMER_ACTIVITY_EVIDENCE_VERSION,
  PG2_2_ADOPTION_HEALTH_BASELINE,
  CUSTOMER_ACTIVITY_TYPES,
  buildCustomerActivityEvidence,
  getCustomerActivityEvidence,
  customerActivityEvidenceFingerprint,
  clearCustomerActivityEvidence,
  ensureAdoptionThenBuildActivityEvidence,
  type CustomerActivityType,
  type CustomerActivitySource,
  type CustomerActivityEvidenceReference,
  type CustomerActivityLifecycleRelation,
  type CustomerActivityEvidenceRecord,
  type CustomerActivityEvidenceFoundation,
} from "./customer/customer-activity-evidence";

export {
  PG_2_FREEZE_ID,
  PG_2_FREEZE_CAPABILITY,
  PG_2_FREEZE_VERSION,
  PG_2_FREEZE_CODENAME,
  PG_2_FREEZE_DATE,
  PG2_CUSTOMER_ACTIVITY_EVIDENCE_BASELINE,
  PG_2_COMPONENTS,
  buildPg2FreezeManifest,
  getPg2FreezeManifest,
  pg2FreezeManifestFingerprint,
  clearPg2FreezeManifest,
  ensureActivityThenBuildPg2Freeze,
  type Pg2ComponentStatus,
  type Pg2ComponentEntry,
  type Pg2VersionReferences,
  type Pg2VerificationSummary,
  type Pg2FreezeManifest,
} from "./customer/pg2-freeze-manifest";

import { buildProductionFreezeManifest } from "./freeze/freeze-manifest";
import { buildReleaseBaselineSummary } from "./baseline/release-baseline-summary";
import { buildIntegrityVerification } from "./integrity/integrity-verification";
import { buildSnapshotManifest } from "./snapshot/snapshot-manifest";
import { buildFinalReleaseGovernanceBundle } from "./final/final-release-governance";
import { buildFinalReleaseSummary } from "./final/final-release-summary";
import { buildFreezeLockState } from "./freeze/freeze-lock";

export const V37_PRODUCTION_RELEASE_VERSION = "3.7-final-foundation-1" as const;

export type V37ProductionReleaseFoundation = {
  version: typeof V37_PRODUCTION_RELEASE_VERSION;
  foundationId: string;
  freeze: ReturnType<typeof buildProductionFreezeManifest>;
  baseline: ReturnType<typeof buildReleaseBaselineSummary>;
  integrity: ReturnType<typeof buildIntegrityVerification>;
  snapshots: ReturnType<typeof buildSnapshotManifest>;
  governance: ReturnType<typeof buildFinalReleaseGovernanceBundle>;
  final: ReturnType<typeof buildFinalReleaseSummary>;
  lock: ReturnType<typeof buildFreezeLockState>;
  foundationSummary: string;
};

export function buildV37ProductionReleaseFoundation(input?: {
  deploymentId?: string;
}): V37ProductionReleaseFoundation {
  const deploymentId = input?.deploymentId ?? "v37-production-release";
  const foundationId = `V37PRF-${deploymentId.slice(0, 8)}`;
  const freeze = buildProductionFreezeManifest({ deploymentId });
  const baseline = buildReleaseBaselineSummary({ deploymentId });
  const integrity = buildIntegrityVerification({ deploymentId });
  const snapshots = buildSnapshotManifest({ deploymentId });
  const governance = buildFinalReleaseGovernanceBundle({ deploymentId });
  const final = buildFinalReleaseSummary({ deploymentId });
  const lock = buildFreezeLockState({ deploymentId });

  return {
    version: V37_PRODUCTION_RELEASE_VERSION,
    foundationId,
    freeze,
    baseline,
    integrity,
    snapshots,
    governance,
    final,
    lock,
    foundationSummary: `v37-production-release id=${foundationId} freeze=${freeze.freezeId} productionReady=${final.productionReady} locked=${lock.locked} confidence=${final.readiness.confidenceScore}`,
  };
}
