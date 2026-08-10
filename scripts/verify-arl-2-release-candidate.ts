/**
 * ARL-2 — Application Release Candidate Engine verification
 */
import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_VERSION,
  buildGaRelease,
  clearGaRelease,
} from "../lib/release/ga-release";
import {
  ARL_2_ID,
  ARL1_RELEASE_CHANGE_BASELINE,
  APPLICATION_RELEASE_CANDIDATE_CAPABILITY,
  APPLICATION_RELEASE_CANDIDATE_GATES,
  APPLICATION_RELEASE_CANDIDATE_VERSION,
  applicationReleaseCandidateFingerprint,
  buildApplicationReleaseCandidate,
  clearApplicationReleaseCandidate,
  getApplicationReleaseCandidate,
} from "../lib/release/application/candidate";
import {
  ARL_1_ID,
  buildApplicationReleaseChange,
  clearApplicationReleaseChange,
} from "../lib/release/application/change";
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
  console.log("=== ARL-2 Application Release Candidate ===\n");

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
  const change = buildApplicationReleaseChange();

  const first = buildApplicationReleaseCandidate();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === ARL_2_ID, "ARL-2 id");
  assert(
    first.capability === APPLICATION_RELEASE_CANDIDATE_CAPABILITY,
    "capability",
  );
  assert(first.version === APPLICATION_RELEASE_CANDIDATE_VERSION, "version");
  assert(first.baselineTag === ARL1_RELEASE_CHANGE_BASELINE, "baseline");
  assert(first.baselineTag === "arl1-release-change-v1", "baseline literal");
  assert(first.candidateId === "arl2-rc-application-1", "candidate id");
  assert(first.parentPack === ARL_1_ID, "parent pack");
  assert(first.changeFingerprint === change.fingerprint, "parent fp");
  assert(first.gaVersion === GA_RELEASE_VERSION, "ga version");
  assert(first.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  assert(first.commitReference === RELEASE_HEALTH_COMMIT_REF, "commit");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.gaBaselineUnchanged === true, "ga lock");
  console.log("PASS Build");

  assert(first.status === "READY", "status READY");
  assert(first.certification === "certified", "certified");
  assert(first.changeStatus === "VERIFIED", "change verified");
  assert(first.changeCount === 4, "change count");
  assert(
    first.gates.length === APPLICATION_RELEASE_CANDIDATE_GATES.length,
    "gates",
  );
  assert(
    first.gates.map((g) => g.gate).join(",") ===
      APPLICATION_RELEASE_CANDIDATE_GATES.join(","),
    "gate order",
  );
  assert(first.gates.every((g) => g.passed === true), "all gates pass");
  assert(first.rollbackReference.ready === true, "rollback ready");
  console.log("PASS Candidate contract");

  const second = buildApplicationReleaseCandidate();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    applicationReleaseCandidateFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(
    getApplicationReleaseCandidate().fingerprint === first.fingerprint,
    "get cache",
  );

  clearApplicationReleaseCandidate();
  const third = buildApplicationReleaseCandidate();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== ARL-2 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
}

main();
