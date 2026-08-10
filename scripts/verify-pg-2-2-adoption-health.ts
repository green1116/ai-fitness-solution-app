/**
 * PG-2.2 — Adoption Health verification
 */
import {
  buildGaRelease,
  clearGaRelease,
} from "../lib/release/ga-release";
import {
  ADOPTION_HEALTH_CAPABILITY,
  ADOPTION_HEALTH_VERSION,
  PG_2_2_ID,
  PG2_1_CUSTOMER_LIFECYCLE_BASELINE,
  adoptionHealthFingerprint,
  buildAdoptionHealth,
  clearAdoptionHealth,
  getAdoptionHealth,
} from "../lib/release/customer/adoption-health";
import {
  PG_2_1_ID,
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
  console.log("=== PG-2.2 Adoption Health ===\n");

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
  const lifecycle = buildCustomerLifecycleRegistry();

  const first = buildAdoptionHealth();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === PG_2_2_ID, "PG-2.2 id");
  assert(first.capability === ADOPTION_HEALTH_CAPABILITY, "capability");
  assert(first.version === ADOPTION_HEALTH_VERSION, "version");
  assert(first.baselineTag === PG2_1_CUSTOMER_LIFECYCLE_BASELINE, "baseline");
  assert(first.baselineTag === "pg2-1-customer-lifecycle", "baseline literal");
  assert(first.parentPack === PG_2_1_ID, "parent pack");
  assert(first.lifecycleFingerprint === lifecycle.fingerprint, "parent fp");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noLiveProbes === true, "noLiveProbes");
  assert(first.scope.noDatabase === true, "noDatabase");
  assert(first.scope.noUi === true, "noUi");
  assert(first.scope.noBilling === true, "noBilling");
  console.log("PASS Build");

  assert(first.records.length === lifecycle.customers.length, "record count");
  assert(
    first.records.map((r) => r.customerId).join(",") ===
      lifecycle.customers.map((c) => c.customerId).join(","),
    "customer id order",
  );
  assert(first.records[0]!.adoptionLevel === "NONE", "prospect level");
  assert(first.records[0]!.usageSignal === "NONE", "prospect usage");
  assert(first.records[0]!.healthStatus === "WATCH", "prospect health");
  assert(first.records[0]!.riskSignal === "MEDIUM", "prospect risk");
  assert(first.records[3]!.adoptionLevel === "MEDIUM", "adopting level");
  assert(first.records[3]!.usageSignal === "MODERATE", "adopting usage");
  assert(first.records[3]!.healthStatus === "HEALTHY", "adopting health");
  assert(first.records[5]!.adoptionLevel === "CRITICAL_GAP", "churn level");
  assert(first.records[5]!.usageSignal === "DECLINING", "churn usage");
  assert(first.records[5]!.healthStatus === "CRITICAL", "churn health");
  assert(first.records[5]!.riskSignal === "HIGH", "churn risk");
  console.log("PASS Adoption contract");

  const second = buildAdoptionHealth();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    adoptionHealthFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(getAdoptionHealth().fingerprint === first.fingerprint, "get cache");

  clearAdoptionHealth();
  const third = buildAdoptionHealth();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== PG-2.2 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
}

main();
