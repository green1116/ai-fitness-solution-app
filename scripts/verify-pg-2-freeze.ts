/**
 * PG-2 Freeze — Customer Adoption Baseline verification
 */
import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
  buildGaRelease,
  clearGaRelease,
} from "../lib/release/ga-release";
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
  PG_2_COMPONENTS,
  PG_2_FREEZE_CAPABILITY,
  PG_2_FREEZE_CODENAME,
  PG_2_FREEZE_DATE,
  PG_2_FREEZE_ID,
  PG_2_FREEZE_VERSION,
  PG2_CUSTOMER_ACTIVITY_EVIDENCE_BASELINE,
  buildPg2FreezeManifest,
  clearPg2FreezeManifest,
  getPg2FreezeManifest,
  pg2FreezeManifestFingerprint,
} from "../lib/release/customer/pg2-freeze-manifest";
import {
  buildDeploymentEvidenceFoundation,
  clearDeploymentEvidenceFoundation,
} from "../lib/release/health/deployment-evidence-foundation";
import {
  PG_1_FREEZE_ID,
  PG_1_FREEZE_VERSION,
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
  console.log("=== PG-2 Freeze — Customer Adoption Baseline ===\n");

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
  const activity = buildCustomerActivityEvidence();

  const first = buildPg2FreezeManifest();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === PG_2_FREEZE_ID, "freeze id");
  assert(first.capability === PG_2_FREEZE_CAPABILITY, "capability");
  assert(first.version === PG_2_FREEZE_VERSION, "version");
  assert(first.codename === PG_2_FREEZE_CODENAME, "codename");
  assert(first.freezeDate === PG_2_FREEZE_DATE, "freeze date");
  assert(
    first.baselineTag === PG2_CUSTOMER_ACTIVITY_EVIDENCE_BASELINE,
    "baseline",
  );
  assert(
    first.baselineTag === "pg2-customer-activity-evidence-v1",
    "baseline literal",
  );
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.immutable === true, "immutable");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noDatabase === true, "noDatabase");
  assert(first.scope.noUi === true, "noUi");
  assert(first.scope.components === "PG-2.1~PG-2.3", "components scope");
  assert(first.scope.closure === "PG-2-Freeze", "closure");
  console.log("PASS Build");

  assert(first.components.length === 3, "component count");
  assert(
    first.components.map((c) => c.id).join(",") ===
      PG_2_COMPONENTS.map((c) => c.id).join(","),
    "component order",
  );
  assert(
    first.components.every((c) => c.status === "frozen"),
    "all frozen",
  );
  assert(
    first.versionReferences.gaVersion === GA_RELEASE_VERSION,
    "version ga",
  );
  assert(
    first.versionReferences.gaFreezeVersion === GA_RELEASE_FREEZE_VERSION,
    "version freeze",
  );
  assert(
    first.versionReferences.gaBaseline === GA_RELEASE_BASELINE,
    "version ga baseline",
  );
  assert(
    first.versionReferences.commitReference === RELEASE_HEALTH_COMMIT_REF,
    "version commit",
  );
  assert(
    first.versionReferences.parentFreeze === PG_1_FREEZE_VERSION,
    "parent freeze version",
  );
  assert(
    first.versionReferences.parentFreezeId === PG_1_FREEZE_ID,
    "parent freeze id",
  );
  assert(
    first.verificationSummary.status === "PASS",
    "verification summary PASS",
  );
  assert(first.verificationSummary.certified === true, "certified flag");
  assert(
    first.verificationSummary.activityFingerprint === activity.fingerprint,
    "activity fp link",
  );
  assert(first.verificationSummary.componentCount === 3, "summary components");
  assert(first.verificationSummary.customerCount === 6, "summary customers");
  assert(
    first.verificationSummary.activityCount === activity.activities.length,
    "summary activities",
  );
  assert(first.rollbackReference.strategy === "ep-freeze-baseline", "rollback");
  assert(first.rollbackReference.ready === true, "rollback ready");
  assert(first.rollbackReference.restoreTargets.length === 4, "rollback targets");
  assert(first.certification === "certified", "certification");
  console.log("PASS Freeze contract");

  const second = buildPg2FreezeManifest();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    pg2FreezeManifestFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(getPg2FreezeManifest().fingerprint === first.fingerprint, "get cache");

  clearPg2FreezeManifest();
  const third = buildPg2FreezeManifest();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== PG-2 FREEZE VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
  console.log(`version: ${first.version}`);
}

main();
