/**
 * ARL-4 — Application Deployment Evidence Layer verification
 */
import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_VERSION,
  buildGaRelease,
  clearGaRelease,
} from "../lib/release/ga-release";
import {
  ARL_4_ID,
  ARL3_RELEASE_VERIFICATION_BASELINE,
  APPLICATION_DEPLOYMENT_EVIDENCE_CAPABILITY,
  APPLICATION_DEPLOYMENT_EVIDENCE_DEPLOY_REF,
  APPLICATION_DEPLOYMENT_EVIDENCE_VERSION,
  applicationDeploymentEvidenceFingerprint,
  buildApplicationDeploymentEvidence,
  clearApplicationDeploymentEvidence,
  getApplicationDeploymentEvidence,
} from "../lib/release/application/deployment";
import {
  buildApplicationReleaseCandidate,
  clearApplicationReleaseCandidate,
} from "../lib/release/application/candidate";
import {
  buildApplicationReleaseChange,
  clearApplicationReleaseChange,
} from "../lib/release/application/change";
import {
  ARL_3_ID,
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
  console.log("=== ARL-4 Application Deployment Evidence ===\n");

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
  const verification = buildApplicationReleaseVerification();

  const first = buildApplicationDeploymentEvidence();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === ARL_4_ID, "ARL-4 id");
  assert(
    first.capability === APPLICATION_DEPLOYMENT_EVIDENCE_CAPABILITY,
    "capability",
  );
  assert(first.version === APPLICATION_DEPLOYMENT_EVIDENCE_VERSION, "version");
  assert(first.baselineTag === ARL3_RELEASE_VERIFICATION_BASELINE, "baseline");
  assert(
    first.baselineTag === "arl3-release-verification-v1",
    "baseline literal",
  );
  assert(first.evidenceId === "arl4-evidence-application-1", "evidence id");
  assert(first.parentPack === ARL_3_ID, "parent pack");
  assert(
    first.verificationFingerprint === verification.fingerprint,
    "parent fp",
  );
  assert(first.verificationId === verification.verificationId, "verification id");
  assert(first.verificationStatus === "PASS", "verification PASS");
  assert(first.gaVersion === GA_RELEASE_VERSION, "ga version");
  assert(first.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  assert(first.commitReference === RELEASE_HEALTH_COMMIT_REF, "commit");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noLiveDeploy === true, "noLiveDeploy");
  assert(first.scope.gaBaselineUnchanged === true, "ga lock");
  console.log("PASS Build");

  assert(first.environment === "production", "environment");
  assert(first.provider === "vercel", "provider");
  assert(
    first.deploymentRef === APPLICATION_DEPLOYMENT_EVIDENCE_DEPLOY_REF,
    "deploy ref",
  );
  assert(first.contractVersion === "arl-4-deploy-evidence-1", "contract");
  assert(first.productionUrl === null, "url unset");
  assert(first.deploymentId === null, "deploy id unset");
  assert(first.deployedAt === null, "deployedAt unset");
  assert(first.rollbackReference.ready === true, "rollback ready");
  assert(first.rollbackReference.strategy === "ep-freeze-baseline", "rollback");
  console.log("PASS Deployment evidence contract");

  const second = buildApplicationDeploymentEvidence();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    applicationDeploymentEvidenceFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(
    getApplicationDeploymentEvidence().fingerprint === first.fingerprint,
    "get cache",
  );

  clearApplicationDeploymentEvidence();
  const third = buildApplicationDeploymentEvidence();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== ARL-4 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
}

main();
