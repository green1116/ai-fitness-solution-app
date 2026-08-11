/**
 * RSO-8 — Runtime Operations Freeze verification
 */
import {
  buildApplicationReleaseFeedback,
  clearApplicationReleaseFeedback,
} from "../lib/release/application/feedback";
import {
  buildApplicationReleaseCandidate,
  clearApplicationReleaseCandidate,
} from "../lib/release/application/candidate";
import {
  buildApplicationReleaseChange,
  clearApplicationReleaseChange,
} from "../lib/release/application/change";
import {
  buildApplicationDeploymentEvidence,
  clearApplicationDeploymentEvidence,
} from "../lib/release/application/deployment";
import {
  buildApplicationProductionRelease,
  clearApplicationProductionRelease,
} from "../lib/release/application/production-release";
import {
  buildApplicationReleaseVerification,
  clearApplicationReleaseVerification,
} from "../lib/release/application/verification";
import {
  buildAdoptionHealth,
  clearAdoptionHealth,
} from "../lib/release/customer/adoption-health";
import {
  buildCustomerActivityEvidence,
  clearCustomerActivityEvidence,
} from "../lib/release/customer/customer-activity-evidence";
import {
  buildCustomerLifecycleRegistry,
  clearCustomerLifecycleRegistry,
} from "../lib/release/customer/customer-lifecycle-registry";
import {
  buildPg2FreezeManifest,
  clearPg2FreezeManifest,
} from "../lib/release/customer/pg2-freeze-manifest";
import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_VERSION,
  buildGaRelease,
  clearGaRelease,
} from "../lib/release/ga-release";
import {
  POST_GA_PRODUCTION_BASELINE,
  RELEASE_HEALTH_COMMIT_REF,
  buildReleaseHealthRegistry,
  clearReleaseHealthRegistry,
} from "../lib/release/health/release-health-registry";
import {
  buildDeploymentEvidenceFoundation,
  clearDeploymentEvidenceFoundation,
} from "../lib/release/health/deployment-evidence-foundation";
import {
  buildPg1FreezeManifest,
  clearPg1FreezeManifest,
} from "../lib/release/health/pg1-freeze-manifest";
import {
  buildProductionAuditFoundation,
  clearProductionAuditFoundation,
} from "../lib/release/health/production-audit-foundation";
import {
  buildRuntimeHealthFoundation,
  clearRuntimeHealthFoundation,
} from "../lib/release/health/runtime-health-foundation";
import {
  buildProductionValidation,
  clearProductionValidation,
} from "../lib/release/production-validation";
import {
  buildCommercialHealth,
  clearCommercialHealth,
} from "../lib/release/revenue/commercial-health";
import {
  buildGrowthEvidence,
  clearGrowthEvidence,
} from "../lib/release/revenue/growth-evidence";
import {
  buildPg3FreezeManifest,
  clearPg3FreezeManifest,
} from "../lib/release/revenue/pg3-freeze-manifest";
import {
  buildRevenueLifecycleRegistry,
  clearRevenueLifecycleRegistry,
} from "../lib/release/revenue/revenue-lifecycle-registry";
import {
  buildReleaseCandidate,
  clearReleaseCandidate,
} from "../lib/release/release-candidate";
import {
  RELEASE_ID,
  buildReleaseReadiness,
  clearReleaseReadiness,
} from "../lib/release/release-readiness";
import {
  buildOperationsFeedback,
  clearOperationsFeedback,
} from "../lib/runtime/feedback";
import {
  ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1,
  RSO7_OPERATIONS_FEEDBACK_BASELINE,
  RSO_8_ID,
  RSO_RUNTIME_COMPONENTS,
  RUNTIME_OPERATIONS_FREEZE_CAPABILITY,
  RUNTIME_OPERATIONS_FREEZE_CODENAME,
  RUNTIME_OPERATIONS_FREEZE_DATE,
  RUNTIME_OPERATIONS_FREEZE_VERSION,
  buildRuntimeOperationsFreeze,
  clearRuntimeOperationsFreeze,
  getRuntimeOperationsFreeze,
  runtimeOperationsFreezeFingerprint,
} from "../lib/runtime/freeze";
import {
  buildRuntimeHealth,
  clearRuntimeHealth,
  getRuntimeHealth,
} from "../lib/runtime/health";
import {
  buildRuntimeIncidents,
  clearRuntimeIncidents,
  getRuntimeIncidents,
} from "../lib/runtime/incident";
import {
  buildApplicationMonitoring,
  clearApplicationMonitoring,
  getApplicationMonitoring,
} from "../lib/runtime/monitoring";
import {
  buildRecoveryWorkflow,
  clearRecoveryWorkflow,
  getRecoveryWorkflow,
} from "../lib/runtime/recovery";
import {
  buildServiceReliability,
  clearServiceReliability,
  getServiceReliability,
} from "../lib/runtime/reliability";
import {
  buildTenantOperations,
  clearTenantOperations,
  getTenantOperations,
} from "../lib/runtime/tenant";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== RSO-8 Runtime Operations Freeze ===\n");

  clearRuntimeOperationsFreeze();
  clearOperationsFeedback();
  clearServiceReliability();
  clearTenantOperations();
  clearRecoveryWorkflow();
  clearRuntimeIncidents();
  clearApplicationMonitoring();
  clearRuntimeHealth();
  clearApplicationReleaseFeedback();
  clearApplicationProductionRelease();
  clearApplicationDeploymentEvidence();
  clearApplicationReleaseVerification();
  clearApplicationReleaseCandidate();
  clearApplicationReleaseChange();
  clearPg3FreezeManifest();
  clearGrowthEvidence();
  clearCommercialHealth();
  clearRevenueLifecycleRegistry();
  clearPg2FreezeManifest();
  clearCustomerActivityEvidence();
  clearAdoptionHealth();
  clearCustomerLifecycleRegistry();
  clearPg1FreezeManifest();
  clearProductionAuditFoundation();
  clearDeploymentEvidenceFoundation();
  clearRuntimeHealthFoundation();
  clearReleaseHealthRegistry();
  clearGaRelease();
  clearProductionValidation();
  clearReleaseCandidate();
  clearReleaseReadiness();

  buildReleaseReadiness();
  buildReleaseCandidate();
  buildProductionValidation();
  buildGaRelease();
  const releaseHealth = buildReleaseHealthRegistry();
  buildRuntimeHealthFoundation();
  buildDeploymentEvidenceFoundation();
  buildProductionAuditFoundation();
  buildPg1FreezeManifest();
  buildCustomerLifecycleRegistry();
  buildAdoptionHealth();
  buildCustomerActivityEvidence();
  buildPg2FreezeManifest();
  buildRevenueLifecycleRegistry();
  buildCommercialHealth();
  buildGrowthEvidence();
  buildPg3FreezeManifest();
  buildApplicationReleaseChange();
  buildApplicationReleaseCandidate();
  buildApplicationReleaseVerification();
  buildApplicationDeploymentEvidence();
  buildApplicationProductionRelease();
  buildApplicationReleaseFeedback();

  const health = buildRuntimeHealth();
  const monitoring = buildApplicationMonitoring();
  const incidents = buildRuntimeIncidents();
  const recovery = buildRecoveryWorkflow();
  const tenantOps = buildTenantOperations();
  const reliability = buildServiceReliability();
  const feedback = buildOperationsFeedback();
  const first = buildRuntimeOperationsFreeze();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === RSO_8_ID, "RSO-8 id");
  assert(first.capability === RUNTIME_OPERATIONS_FREEZE_CAPABILITY, "capability");
  assert(first.version === RUNTIME_OPERATIONS_FREEZE_VERSION, "version");
  assert(first.codename === RUNTIME_OPERATIONS_FREEZE_CODENAME, "codename");
  assert(first.freezeDate === RUNTIME_OPERATIONS_FREEZE_DATE, "freeze date");
  assert(
    first.verificationSummary.operationsFeedbackFingerprint ===
      feedback.fingerprint,
    "feedback fingerprint",
  );
  assert(
    first.manifest.componentFingerprints["RSO-1"] === health.fingerprint,
    "RSO-1 fp",
  );
  assert(
    first.manifest.componentFingerprints["RSO-2"] === monitoring.fingerprint,
    "RSO-2 fp",
  );
  assert(
    first.manifest.componentFingerprints["RSO-3"] === incidents.fingerprint,
    "RSO-3 fp",
  );
  assert(
    first.manifest.componentFingerprints["RSO-4"] === recovery.fingerprint,
    "RSO-4 fp",
  );
  assert(
    first.manifest.componentFingerprints["RSO-5"] === tenantOps.fingerprint,
    "RSO-5 fp",
  );
  assert(
    first.manifest.componentFingerprints["RSO-6"] === reliability.fingerprint,
    "RSO-6 fp",
  );
  assert(
    first.manifest.componentFingerprints["RSO-7"] === feedback.fingerprint,
    "RSO-7 fp",
  );
  assert(getRuntimeHealth().fingerprint === health.fingerprint, "health get");
  assert(
    getApplicationMonitoring().fingerprint === monitoring.fingerprint,
    "monitoring get",
  );
  assert(
    getRuntimeIncidents().fingerprint === incidents.fingerprint,
    "incidents get",
  );
  assert(
    getRecoveryWorkflow().fingerprint === recovery.fingerprint,
    "recovery get",
  );
  assert(
    getTenantOperations().fingerprint === tenantOps.fingerprint,
    "tenant get",
  );
  assert(
    getServiceReliability().fingerprint === reliability.fingerprint,
    "reliability get",
  );
  console.log("PASS Full RSO-1..RSO-7 chain");

  assert(first.baselineTag === RSO7_OPERATIONS_FEEDBACK_BASELINE, "pack baseline");
  assert(
    first.baselineTag === "rso7-operations-feedback-v1",
    "pack baseline literal",
  );
  assert(
    first.baseline.productBaseline === ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1,
    "product baseline",
  );
  assert(
    first.baseline.productionBaseline === POST_GA_PRODUCTION_BASELINE,
    "production baseline",
  );
  assert(
    first.baseline.productionBaseline === "post-ga-production-baseline-v1",
    "post-ga literal",
  );
  assert(first.baseline.productionBaselineImmutable === true, "immutable post-ga");
  assert(first.baseline.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  assert(first.baseline.gaVersion === GA_RELEASE_VERSION, "ga version");
  assert(
    first.baseline.commitReference === RELEASE_HEALTH_COMMIT_REF,
    "commit",
  );
  assert(
    first.manifest.productionBaseline === POST_GA_PRODUCTION_BASELINE,
    "manifest production baseline",
  );
  assert(first.scope.productionBaselineUnchanged === true, "scope lock");
  console.log("PASS Baseline trace");

  assert(first.manifest.components.length === 7, "component count");
  assert(
    first.manifest.components.map((c) => c.id).join(",") ===
      RSO_RUNTIME_COMPONENTS.map((c) => c.id).join(","),
    "component order",
  );
  assert(
    first.manifest.components.every((c) => c.status === "frozen"),
    "all frozen",
  );
  assert(first.fingerprint.length === 64, "fingerprint length");

  const second = buildRuntimeOperationsFreeze();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    runtimeOperationsFreezeFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(
    getRuntimeOperationsFreeze().fingerprint === first.fingerprint,
    "get cache",
  );
  clearRuntimeOperationsFreeze();
  const third = buildRuntimeOperationsFreeze();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic manifest");

  assert(first.verificationSummary.status === "PASS", "verification PASS");
  assert(first.verificationSummary.certified === true, "certified summary");
  assert(first.certification === "certified", "certification");
  assert(first.verificationSummary.componentCount === 7, "verify component count");
  assert(first.scope.immutable === true, "immutable");
  assert(first.scope.freezeOnly === true, "freezeOnly");
  assert(first.scope.noNewRuntimeCapability === true, "noNewRuntimeCapability");
  assert(first.scope.closure === "RSO-8-Freeze", "closure");
  console.log("PASS Freeze integrity");

  assert(first.rollbackReference.ready === true, "rollback ready");
  assert(first.rollbackReference.mocked === false, "rollback not mocked");
  assert(
    first.rollbackReference.strategy ===
      releaseHealth.rollbackReference.strategy,
    "rollback strategy",
  );
  assert(
    first.rollbackReference.restoreTargets.join(",") ===
      releaseHealth.rollbackReference.restoreTargets.join(","),
    "rollback targets",
  );
  assert(
    first.rollbackReference.gaVersion === GA_RELEASE_VERSION,
    "rollback ga",
  );
  console.log("PASS Rollback reference");

  console.log("\n=== RSO-8 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
  console.log(`productBaseline: ${first.baseline.productBaseline}`);
  console.log(`productionBaseline: ${first.baseline.productionBaseline}`);
  console.log(`certification: ${first.certification}`);
}

main();
