/**
 * ARL-6 — Release Feedback Loop Integration verification
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
  buildApplicationDeploymentEvidence,
  clearApplicationDeploymentEvidence,
} from "../lib/release/application/deployment";
import {
  ARL_6_ID,
  ARL5_PRODUCTION_RELEASE_BASELINE,
  APPLICATION_RELEASE_FEEDBACK_CAPABILITY,
  APPLICATION_RELEASE_FEEDBACK_CHANNELS,
  APPLICATION_RELEASE_FEEDBACK_VERSION,
  applicationReleaseFeedbackFingerprint,
  buildApplicationReleaseFeedback,
  clearApplicationReleaseFeedback,
  getApplicationReleaseFeedback,
} from "../lib/release/application/feedback";
import {
  ARL_5_ID,
  buildApplicationProductionRelease,
  clearApplicationProductionRelease,
} from "../lib/release/application/production-release";
import {
  buildApplicationReleaseVerification,
  clearApplicationReleaseVerification,
} from "../lib/release/application/verification";
import {
  PG_2_2_ID,
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
  PG_3_2_ID,
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
  console.log("=== ARL-6 Application Release Feedback Loop ===\n");

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
  buildReleaseHealthRegistry();
  buildRuntimeHealthFoundation();
  buildDeploymentEvidenceFoundation();
  buildProductionAuditFoundation();
  buildPg1FreezeManifest();
  buildCustomerLifecycleRegistry();
  const adoption = buildAdoptionHealth();
  buildCustomerActivityEvidence();
  buildPg2FreezeManifest();
  buildRevenueLifecycleRegistry();
  const commercial = buildCommercialHealth();
  buildGrowthEvidence();
  buildPg3FreezeManifest();
  buildApplicationReleaseChange();
  buildApplicationReleaseCandidate();
  buildApplicationReleaseVerification();
  buildApplicationDeploymentEvidence();
  const production = buildApplicationProductionRelease();

  const first = buildApplicationReleaseFeedback();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === ARL_6_ID, "ARL-6 id");
  assert(
    first.capability === APPLICATION_RELEASE_FEEDBACK_CAPABILITY,
    "capability",
  );
  assert(first.version === APPLICATION_RELEASE_FEEDBACK_VERSION, "version");
  assert(first.baselineTag === ARL5_PRODUCTION_RELEASE_BASELINE, "baseline");
  assert(
    first.baselineTag === "arl5-production-release-v1",
    "baseline literal",
  );
  assert(first.feedbackId === "arl6-feedback-loop-1", "feedback id");
  assert(first.parentPack === ARL_5_ID, "parent pack");
  assert(
    first.productionReleaseFingerprint === production.fingerprint,
    "parent fp",
  );
  assert(first.customerPack === PG_2_2_ID, "customer pack");
  assert(first.commercialPack === PG_3_2_ID, "commercial pack");
  assert(
    first.adoptionHealthFingerprint === adoption.fingerprint,
    "adoption fp",
  );
  assert(
    first.commercialHealthFingerprint === commercial.fingerprint,
    "commercial fp",
  );
  assert(first.productionStatus === "READY", "production READY");
  assert(first.status !== "BLOCKED", "loop not blocked");
  assert(first.certification === "certified", "certified");
  assert(first.gaVersion === GA_RELEASE_VERSION, "ga version");
  assert(first.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  assert(first.commitReference === RELEASE_HEALTH_COMMIT_REF, "commit");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noLiveProbes === true, "noLiveProbes");
  assert(first.scope.gaBaselineUnchanged === true, "ga lock");
  console.log("PASS Build");

  assert(
    first.channels.length === APPLICATION_RELEASE_FEEDBACK_CHANNELS.length,
    "channel count",
  );
  assert(first.records.length > 0, "joined records");
  assert(
    first.records.length === Math.min(
      adoption.records.length,
      commercial.records.length,
    ),
    "join size",
  );
  assert(
    first.customerSignalCount === adoption.records.length,
    "customer signals",
  );
  assert(
    first.commercialSignalCount === commercial.records.length,
    "commercial signals",
  );
  assert(first.escalateCount >= 1, "escalate present");
  assert(first.status === "WATCH", "watch with escalate");
  assert(
    first.records.every((r) =>
      ["RETAIN", "WATCH", "EXPAND", "ESCALATE"].includes(r.action),
    ),
    "actions valid",
  );
  assert(first.rollbackReference.ready === true, "rollback ready");
  console.log("PASS Feedback loop contract");

  const second = buildApplicationReleaseFeedback();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    applicationReleaseFeedbackFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(
    getApplicationReleaseFeedback().fingerprint === first.fingerprint,
    "get cache",
  );

  clearApplicationReleaseFeedback();
  const third = buildApplicationReleaseFeedback();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== ARL-6 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
  console.log(`loopStatus: ${first.status}`);
}

main();
