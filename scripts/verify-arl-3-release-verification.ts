/**
 * ARL-3 — Application Release Verification Pipeline verification
 */
import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_VERSION,
  buildGaRelease,
  clearGaRelease,
} from "../lib/release/ga-release";
import {
  ARL_2_ID,
  buildApplicationReleaseCandidate,
  clearApplicationReleaseCandidate,
} from "../lib/release/application/candidate";
import {
  buildApplicationReleaseChange,
  clearApplicationReleaseChange,
} from "../lib/release/application/change";
import {
  ARL_3_ID,
  ARL2_RELEASE_CANDIDATE_BASELINE,
  APPLICATION_RELEASE_VERIFICATION_CAPABILITY,
  APPLICATION_RELEASE_VERIFICATION_CHECKS,
  APPLICATION_RELEASE_VERIFICATION_VERSION,
  applicationReleaseVerificationFingerprint,
  buildApplicationReleaseVerification,
  clearApplicationReleaseVerification,
  getApplicationReleaseVerification,
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
  console.log("=== ARL-3 Application Release Verification ===\n");

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
  const candidate = buildApplicationReleaseCandidate();

  const first = buildApplicationReleaseVerification();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === ARL_3_ID, "ARL-3 id");
  assert(
    first.capability === APPLICATION_RELEASE_VERIFICATION_CAPABILITY,
    "capability",
  );
  assert(first.version === APPLICATION_RELEASE_VERIFICATION_VERSION, "version");
  assert(first.baselineTag === ARL2_RELEASE_CANDIDATE_BASELINE, "baseline");
  assert(
    first.baselineTag === "arl2-release-candidate-v1",
    "baseline literal",
  );
  assert(first.verificationId === "arl3-verify-application-1", "verification id");
  assert(first.parentPack === ARL_2_ID, "parent pack");
  assert(first.candidateFingerprint === candidate.fingerprint, "parent fp");
  assert(first.candidateId === candidate.candidateId, "candidate id");
  assert(first.gaVersion === GA_RELEASE_VERSION, "ga version");
  assert(first.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  assert(first.commitReference === RELEASE_HEALTH_COMMIT_REF, "commit");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.gaBaselineUnchanged === true, "ga lock");
  console.log("PASS Build");

  assert(first.status === "PASS", "status PASS");
  assert(first.certification === "certified", "certified");
  assert(first.candidateStatus === "READY", "candidate ready");
  assert(
    first.checks.length === APPLICATION_RELEASE_VERIFICATION_CHECKS.length,
    "check count",
  );
  assert(
    first.checks.map((c) => c.check).join(",") ===
      APPLICATION_RELEASE_VERIFICATION_CHECKS.join(","),
    "check order",
  );
  assert(first.checks.every((c) => c.passed === true), "all checks pass");
  assert(first.passedCount === first.checks.length, "passed count");
  assert(first.failedCount === 0, "failed count");
  assert(first.rollbackReference.ready === true, "rollback ready");
  console.log("PASS Verification contract");

  const second = buildApplicationReleaseVerification();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    applicationReleaseVerificationFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(
    getApplicationReleaseVerification().fingerprint === first.fingerprint,
    "get cache",
  );

  clearApplicationReleaseVerification();
  const third = buildApplicationReleaseVerification();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== ARL-3 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
}

main();
