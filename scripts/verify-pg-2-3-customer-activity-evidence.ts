/**
 * PG-2.3 — Customer Activity Evidence verification
 */
import {
  buildGaRelease,
  clearGaRelease,
} from "../lib/release/ga-release";
import {
  buildAdoptionHealth,
  clearAdoptionHealth,
  PG_2_2_ID,
} from "../lib/release/customer/adoption-health";
import {
  CUSTOMER_ACTIVITY_EVIDENCE_CAPABILITY,
  CUSTOMER_ACTIVITY_EVIDENCE_VERSION,
  PG_2_3_ID,
  PG2_2_ADOPTION_HEALTH_BASELINE,
  buildCustomerActivityEvidence,
  clearCustomerActivityEvidence,
  customerActivityEvidenceFingerprint,
  getCustomerActivityEvidence,
} from "../lib/release/customer/customer-activity-evidence";
import {
  buildCustomerLifecycleRegistry,
  clearCustomerLifecycleRegistry,
} from "../lib/release/customer/customer-lifecycle-registry";
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
  console.log("=== PG-2.3 Customer Activity Evidence ===\n");

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

  const first = buildCustomerActivityEvidence();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === PG_2_3_ID, "PG-2.3 id");
  assert(
    first.capability === CUSTOMER_ACTIVITY_EVIDENCE_CAPABILITY,
    "capability",
  );
  assert(first.version === CUSTOMER_ACTIVITY_EVIDENCE_VERSION, "version");
  assert(first.baselineTag === PG2_2_ADOPTION_HEALTH_BASELINE, "baseline");
  assert(first.baselineTag === "pg2-2-adoption-health", "baseline literal");
  assert(first.parentPack === PG_2_2_ID, "parent pack");
  assert(
    first.adoptionHealthFingerprint === adoption.fingerprint,
    "parent fp",
  );
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noDatabase === true, "noDatabase");
  assert(first.scope.noUi === true, "noUi");
  assert(first.scope.noBilling === true, "noBilling");
  console.log("PASS Build");

  assert(first.activities.length > adoption.records.length, "activity count");
  assert(
    first.activities.every((a) => a.activityId.startsWith("act-pg23-")),
    "activity ids",
  );
  assert(
    first.activities.every((a) => a.source.actor === "system"),
    "source actor",
  );
  assert(
    first.activities.every((a) => a.source.source === "pg-2-customer-chain"),
    "source chain",
  );
  assert(
    first.activities.every(
      (a) =>
        a.evidenceReference.adoptionHealthFingerprint === adoption.fingerprint,
    ),
    "evidence ref",
  );
  assert(
    first.activities.every((a) => a.lifecycleRelation.parentPack === PG_2_2_ID),
    "lifecycle parent",
  );
  assert(
    first.activities.some((a) => a.activityType === "RISK_FLAGGED"),
    "risk activities present",
  );
  assert(
    first.activities.filter((a) => a.customerId === adoption.records[0]!.customerId)
      .length >= 3,
    "prospect activities",
  );
  console.log("PASS Activity contract");

  const second = buildCustomerActivityEvidence();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    customerActivityEvidenceFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(
    getCustomerActivityEvidence().fingerprint === first.fingerprint,
    "get cache",
  );

  clearCustomerActivityEvidence();
  const third = buildCustomerActivityEvidence();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== PG-2.3 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
  console.log(`activities: ${first.activities.length}`);
}

main();
