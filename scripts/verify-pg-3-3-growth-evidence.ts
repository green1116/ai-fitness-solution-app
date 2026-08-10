/**
 * PG-3.3 — Growth Evidence verification
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
  PG_3_2_ID,
  buildCommercialHealth,
  clearCommercialHealth,
} from "../lib/release/revenue/commercial-health";
import {
  GROWTH_EVIDENCE_CAPABILITY,
  GROWTH_EVIDENCE_VERSION,
  PG_3_3_ID,
  PG3_COMMERCIAL_HEALTH_BASELINE,
  buildGrowthEvidence,
  clearGrowthEvidence,
  getGrowthEvidence,
  growthEvidenceFingerprint,
} from "../lib/release/revenue/growth-evidence";
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
  console.log("=== PG-3.3 Growth Evidence ===\n");

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
  const commercial = buildCommercialHealth();

  const first = buildGrowthEvidence();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === PG_3_3_ID, "PG-3.3 id");
  assert(first.capability === GROWTH_EVIDENCE_CAPABILITY, "capability");
  assert(first.version === GROWTH_EVIDENCE_VERSION, "version");
  assert(first.baselineTag === PG3_COMMERCIAL_HEALTH_BASELINE, "baseline");
  assert(first.baselineTag === "pg3-commercial-health-v1", "baseline literal");
  assert(first.parentPack === PG_3_2_ID, "parent pack");
  assert(
    first.commercialHealthFingerprint === commercial.fingerprint,
    "parent fp",
  );
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noDatabase === true, "noDatabase");
  assert(first.scope.noUi === true, "noUi");
  assert(first.scope.noBilling === true, "noBilling");
  console.log("PASS Build");

  assert(first.events.length > commercial.records.length, "event count");
  assert(
    first.events.every((e) => e.growthEventId.startsWith("grw-pg33-")),
    "event ids",
  );
  assert(
    first.events.every((e) => e.source.actor === "system"),
    "source actor",
  );
  assert(
    first.events.every((e) => e.source.source === "pg-3-revenue-chain"),
    "source chain",
  );
  assert(
    first.events.every(
      (e) =>
        e.evidenceReference.commercialHealthFingerprint ===
        commercial.fingerprint,
    ),
    "evidence ref",
  );
  assert(
    first.events.some((e) => e.signalType === "EXPANSION_OPPORTUNITY"),
    "expansion events present",
  );
  assert(
    first.events.some((e) => e.opportunitySignal === "ACTIVE"),
    "active opportunity",
  );
  assert(
    first.events.some((e) => e.opportunitySignal === "QUALIFIED"),
    "qualified opportunity",
  );
  console.log("PASS Growth contract");

  const second = buildGrowthEvidence();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    growthEvidenceFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(getGrowthEvidence().fingerprint === first.fingerprint, "get cache");

  clearGrowthEvidence();
  const third = buildGrowthEvidence();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== PG-3.3 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
  console.log(`events: ${first.events.length}`);
}

main();
