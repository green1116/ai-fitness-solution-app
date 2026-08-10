/**
 * PG-3.1 — Revenue Lifecycle Registry verification
 */
import {
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
  PG_2_FREEZE_ID,
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
  COMMERCIAL_STAGES,
  PG_3_1_ID,
  PG2_CUSTOMER_ADOPTION_FREEZE_BASELINE,
  REVENUE_LIFECYCLE_REGISTRY_CAPABILITY,
  REVENUE_LIFECYCLE_REGISTRY_VERSION,
  buildRevenueLifecycleRegistry,
  clearRevenueLifecycleRegistry,
  getRevenueLifecycleRegistry,
  revenueLifecycleRegistryFingerprint,
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
  console.log("=== PG-3.1 Revenue Lifecycle Registry ===\n");

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
  const freeze = buildPg2FreezeManifest();

  const first = buildRevenueLifecycleRegistry();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === PG_3_1_ID, "PG-3.1 id");
  assert(
    first.capability === REVENUE_LIFECYCLE_REGISTRY_CAPABILITY,
    "capability",
  );
  assert(first.version === REVENUE_LIFECYCLE_REGISTRY_VERSION, "version");
  assert(first.baselineTag === PG2_CUSTOMER_ADOPTION_FREEZE_BASELINE, "baseline");
  assert(
    first.baselineTag === "pg2-customer-adoption-freeze-v1",
    "baseline literal",
  );
  assert(first.parentPack === PG_2_FREEZE_ID, "parent pack");
  assert(first.pg2FreezeFingerprint === freeze.fingerprint, "parent fp");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noDatabase === true, "noDatabase");
  assert(first.scope.noUi === true, "noUi");
  assert(first.scope.noBilling === true, "noBilling");
  console.log("PASS Build");

  assert(first.records.length === COMMERCIAL_STAGES.length, "record count");
  assert(
    first.records.map((r) => r.commercialStage).join(",") ===
      COMMERCIAL_STAGES.join(","),
    "commercial stage order",
  );
  assert(first.records[0]!.subscriptionState === "NONE", "prospect sub");
  assert(first.records[0]!.revenueStatus === "NONE", "prospect revenue");
  assert(first.records[0]!.expansionSignal === "NONE", "prospect expansion");
  assert(first.records[2]!.subscriptionState === "ACTIVE", "active sub");
  assert(first.records[2]!.revenueStatus === "RECOGNIZED", "active revenue");
  assert(first.records[4]!.commercialStage === "EXPANDING", "expansion stage");
  assert(first.records[4]!.expansionSignal === "HIGH", "expansion signal");
  assert(first.records[3]!.commercialStage === "RENEWING", "renewing stage");
  assert(first.records[5]!.commercialStage === "AT_RISK", "churn commercial");
  assert(first.records[5]!.revenueStatus === "CHURNING", "churn revenue");
  console.log("PASS Revenue contract");

  const second = buildRevenueLifecycleRegistry();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    revenueLifecycleRegistryFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(
    getRevenueLifecycleRegistry().fingerprint === first.fingerprint,
    "get cache",
  );

  clearRevenueLifecycleRegistry();
  const third = buildRevenueLifecycleRegistry();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== PG-3.1 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
}

main();
