/**
 * PG-3.2 — Commercial Health verification
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
  COMMERCIAL_HEALTH_CAPABILITY,
  COMMERCIAL_HEALTH_VERSION,
  PG_3_2_ID,
  PG3_REVENUE_LIFECYCLE_BASELINE,
  buildCommercialHealth,
  clearCommercialHealth,
  commercialHealthFingerprint,
  getCommercialHealth,
} from "../lib/release/revenue/commercial-health";
import {
  PG_3_1_ID,
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
  console.log("=== PG-3.2 Commercial Health ===\n");

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
  const revenue = buildRevenueLifecycleRegistry();

  const first = buildCommercialHealth();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === PG_3_2_ID, "PG-3.2 id");
  assert(first.capability === COMMERCIAL_HEALTH_CAPABILITY, "capability");
  assert(first.version === COMMERCIAL_HEALTH_VERSION, "version");
  assert(first.baselineTag === PG3_REVENUE_LIFECYCLE_BASELINE, "baseline");
  assert(first.baselineTag === "pg3-revenue-lifecycle-v1", "baseline literal");
  assert(first.parentPack === PG_3_1_ID, "parent pack");
  assert(
    first.revenueLifecycleFingerprint === revenue.fingerprint,
    "parent fp",
  );
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noLiveProbes === true, "noLiveProbes");
  assert(first.scope.noDatabase === true, "noDatabase");
  assert(first.scope.noUi === true, "noUi");
  assert(first.scope.noBilling === true, "noBilling");
  console.log("PASS Build");

  assert(first.records.length === revenue.records.length, "record count");
  assert(
    first.records.map((r) => r.customerId).join(",") ===
      revenue.records.map((r) => r.customerId).join(","),
    "customer id order",
  );
  assert(first.records[0]!.commercialHealth === "WATCH", "pipeline health");
  assert(first.records[0]!.growthSignal === "NONE", "pipeline growth");
  assert(first.records[0]!.retentionSignal === "WEAK", "pipeline retention");
  assert(first.records[0]!.expansionReadiness === "NOT_READY", "pipeline ready");
  assert(first.records[2]!.commercialHealth === "HEALTHY", "paid health");
  assert(first.records[2]!.retentionSignal === "STABLE", "paid retention");
  assert(first.records[2]!.expansionReadiness === "CANDIDATE", "paid ready");
  assert(first.records[3]!.expansionReadiness === "READY", "renewing ready");
  assert(first.records[4]!.growthSignal === "HIGH", "expanding growth");
  assert(first.records[4]!.expansionReadiness === "IN_MOTION", "expanding ready");
  assert(first.records[5]!.commercialHealth === "CRITICAL", "risk health");
  assert(first.records[5]!.retentionSignal === "CRITICAL", "risk retention");
  assert(first.records[5]!.revenueStatus === "CHURNING", "risk revenue");
  console.log("PASS Commercial contract");

  const second = buildCommercialHealth();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    commercialHealthFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(getCommercialHealth().fingerprint === first.fingerprint, "get cache");

  clearCommercialHealth();
  const third = buildCommercialHealth();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== PG-3.2 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
}

main();
