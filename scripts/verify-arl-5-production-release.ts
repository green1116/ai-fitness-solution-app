/**
 * ARL-5 — Application Production Release Manager verification
 */
import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_VERSION,
  buildGaRelease,
  clearGaRelease,
} from "../lib/release/ga-release";
import {
  buildApplicationReleaseCandidate,
  clearApplicationReleaseCandidate,
} from "../lib/release/application/candidate";
import {
  buildApplicationReleaseChange,
  clearApplicationReleaseChange,
} from "../lib/release/application/change";
import {
  ARL_4_ID,
  buildApplicationDeploymentEvidence,
  clearApplicationDeploymentEvidence,
} from "../lib/release/application/deployment";
import {
  ARL_5_ID,
  ARL4_DEPLOYMENT_EVIDENCE_BASELINE,
  APPLICATION_PRODUCTION_RELEASE_CAPABILITY,
  APPLICATION_PRODUCTION_RELEASE_GATES,
  APPLICATION_PRODUCTION_RELEASE_VERSION,
  applicationProductionReleaseFingerprint,
  buildApplicationProductionRelease,
  clearApplicationProductionRelease,
  getApplicationProductionRelease,
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
  RELEASE_HEALTH_COMMIT_REF,
  buildReleaseHealthRegistry,
  clearReleaseHealthRegistry,
} from "../lib/release/health/release-health-registry";
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

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== ARL-5 Application Production Release ===\n");

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
  buildReleaseHealthRegistry();
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
  const evidence = buildApplicationDeploymentEvidence();

  const first = buildApplicationProductionRelease();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === ARL_5_ID, "ARL-5 id");
  assert(
    first.capability === APPLICATION_PRODUCTION_RELEASE_CAPABILITY,
    "capability",
  );
  assert(first.version === APPLICATION_PRODUCTION_RELEASE_VERSION, "version");
  assert(first.baselineTag === ARL4_DEPLOYMENT_EVIDENCE_BASELINE, "baseline");
  assert(
    first.baselineTag === "arl4-deployment-evidence-v1",
    "baseline literal",
  );
  assert(
    first.productionReleaseId === "arl5-production-release-1",
    "production release id",
  );
  assert(first.parentPack === ARL_4_ID, "parent pack");
  assert(first.evidenceFingerprint === evidence.fingerprint, "parent fp");
  assert(first.evidenceId === evidence.evidenceId, "evidence id");
  assert(first.verificationStatus === "PASS", "verification PASS");
  assert(first.status === "READY", "status READY");
  assert(first.certification === "certified", "certified");
  assert(first.gaVersion === GA_RELEASE_VERSION, "ga version");
  assert(first.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  assert(first.commitReference === RELEASE_HEALTH_COMMIT_REF, "commit");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noLiveDeploy === true, "noLiveDeploy");
  assert(first.scope.gaBaselineUnchanged === true, "ga lock");
  console.log("PASS Build");

  assert(
    first.gates.length === APPLICATION_PRODUCTION_RELEASE_GATES.length,
    "gate count",
  );
  assert(first.gates.every((g) => g.passed), "all gates pass");
  assert(first.environment === "production", "environment");
  assert(first.rollbackReference.ready === true, "rollback ready");
  assert(first.rollbackReference.strategy === "ep-freeze-baseline", "rollback");
  console.log("PASS Production release gates");

  const second = buildApplicationProductionRelease();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    applicationProductionReleaseFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(
    getApplicationProductionRelease().fingerprint === first.fingerprint,
    "get cache",
  );

  clearApplicationProductionRelease();
  const third = buildApplicationProductionRelease();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== ARL-5 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
}

main();
