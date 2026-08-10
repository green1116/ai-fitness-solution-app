/**
 * PG-2.1 — Customer Lifecycle Registry verification
 */
import {
  buildGaRelease,
  clearGaRelease,
} from "../lib/release/ga-release";
import {
  CUSTOMER_LIFECYCLE_REGISTRY_CAPABILITY,
  CUSTOMER_LIFECYCLE_REGISTRY_VERSION,
  CUSTOMER_LIFECYCLE_STAGES,
  PG_2_1_ID,
  PG1_FREEZE_BASELINE,
  buildCustomerLifecycleRegistry,
  clearCustomerLifecycleRegistry,
  customerLifecycleRegistryFingerprint,
  getCustomerLifecycleRegistry,
} from "../lib/release/customer/customer-lifecycle-registry";
import {
  buildDeploymentEvidenceFoundation,
  clearDeploymentEvidenceFoundation,
} from "../lib/release/health/deployment-evidence-foundation";
import {
  PG_1_FREEZE_ID,
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
  console.log("=== PG-2.1 Customer Lifecycle Registry ===\n");

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
  const freeze = buildPg1FreezeManifest();

  const first = buildCustomerLifecycleRegistry();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === PG_2_1_ID, "PG-2.1 id");
  assert(
    first.capability === CUSTOMER_LIFECYCLE_REGISTRY_CAPABILITY,
    "capability",
  );
  assert(first.version === CUSTOMER_LIFECYCLE_REGISTRY_VERSION, "version");
  assert(first.baselineTag === PG1_FREEZE_BASELINE, "baseline");
  assert(first.baselineTag === "pg1-freeze", "baseline literal");
  assert(first.parentPack === PG_1_FREEZE_ID, "parent pack");
  assert(first.pg1FreezeFingerprint === freeze.fingerprint, "parent fp");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noDatabase === true, "noDatabase");
  assert(first.scope.noUi === true, "noUi");
  assert(first.scope.noBilling === true, "noBilling");
  console.log("PASS Build");

  assert(first.customers.length === CUSTOMER_LIFECYCLE_STAGES.length, "count");
  assert(
    first.customers.map((c) => c.lifecycleStage).join(",") ===
      CUSTOMER_LIFECYCLE_STAGES.join(","),
    "stage order",
  );
  for (const [i, row] of first.customers.entries()) {
    assert(row.ordinal === i + 1, `ordinal ${i + 1}`);
    assert(row.customerId.startsWith("cust-pg21-"), `customer id ${i + 1}`);
    assert(typeof row.onboardingStatus === "string", `onboarding ${i + 1}`);
    assert(typeof row.activationStatus === "string", `activation ${i + 1}`);
    assert(typeof row.adoptionStatus === "string", `adoption ${i + 1}`);
  }
  assert(first.customers[0]!.onboardingStatus === "NOT_STARTED", "prospect onboarding");
  assert(first.customers[2]!.activationStatus === "ACTIVATED", "active activation");
  assert(first.customers[3]!.adoptionStatus === "ESTABLISHED", "adopting adoption");
  console.log("PASS Lifecycle contract");

  const second = buildCustomerLifecycleRegistry();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    customerLifecycleRegistryFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(
    getCustomerLifecycleRegistry().fingerprint === first.fingerprint,
    "get cache",
  );

  clearCustomerLifecycleRegistry();
  const third = buildCustomerLifecycleRegistry();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== PG-2.1 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
}

main();
