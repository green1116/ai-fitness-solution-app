/**
 * ARL-1 — Application Release Change Foundation verification
 */
import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_VERSION,
  buildGaRelease,
  clearGaRelease,
} from "../lib/release/ga-release";
import {
  APPLICATION_RELEASE_CHANGE_CAPABILITY,
  APPLICATION_RELEASE_CHANGE_TYPES,
  APPLICATION_RELEASE_CHANGE_VERSION,
  ARL_1_ID,
  PG3_COMMERCIAL_GROWTH_FREEZE_BASELINE,
  applicationReleaseChangeFingerprint,
  buildApplicationReleaseChange,
  clearApplicationReleaseChange,
  getApplicationReleaseChange,
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
  PG_3_FREEZE_ID,
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
  console.log("=== ARL-1 Application Release Change ===\n");

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
  const freeze = buildPg3FreezeManifest();

  const first = buildApplicationReleaseChange();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === ARL_1_ID, "ARL-1 id");
  assert(
    first.capability === APPLICATION_RELEASE_CHANGE_CAPABILITY,
    "capability",
  );
  assert(first.version === APPLICATION_RELEASE_CHANGE_VERSION, "version");
  assert(
    first.baselineTag === PG3_COMMERCIAL_GROWTH_FREEZE_BASELINE,
    "baseline",
  );
  assert(
    first.baselineTag === "pg3-commercial-growth-freeze-v1",
    "baseline literal",
  );
  assert(first.pg3FreezeFingerprint === freeze.fingerprint, "parent fp");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noDatabase === true, "noDatabase");
  assert(first.scope.noUi === true, "noUi");
  assert(first.scope.gaBaselineUnchanged === true, "ga baseline unchanged");
  console.log("PASS Build");

  assert(
    first.changes.length === APPLICATION_RELEASE_CHANGE_TYPES.length,
    "change count",
  );
  assert(
    first.changes.map((c) => c.changeType).join(",") ===
      APPLICATION_RELEASE_CHANGE_TYPES.join(","),
    "change type order",
  );
  assert(
    first.changes.every((c) => c.status === "VERIFIED"),
    "all verified",
  );
  assert(
    first.changes.every((c) => c.changeId.startsWith("arl1-chg-")),
    "change ids",
  );
  assert(
    first.changes.every((c) => c.releaseReference.releaseId === RELEASE_ID),
    "release refs",
  );
  assert(
    first.changes.every((c) => c.releaseReference.gaVersion === GA_RELEASE_VERSION),
    "ga version",
  );
  assert(
    first.changes.every(
      (c) => c.releaseReference.gaBaseline === GA_RELEASE_BASELINE,
    ),
    "ga baseline",
  );
  assert(
    first.changes.every(
      (c) => c.releaseReference.commitReference === RELEASE_HEALTH_COMMIT_REF,
    ),
    "commit ref",
  );
  assert(
    first.changes.every((c) => c.releaseReference.parentPack === PG_3_FREEZE_ID),
    "parent pack",
  );
  assert(first.rollbackReference.strategy === "ep-freeze-baseline", "rollback");
  assert(first.rollbackReference.ready === true, "rollback ready");
  console.log("PASS Change contract");

  const second = buildApplicationReleaseChange();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    applicationReleaseChangeFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(
    getApplicationReleaseChange().fingerprint === first.fingerprint,
    "get cache",
  );

  clearApplicationReleaseChange();
  const third = buildApplicationReleaseChange();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== ARL-1 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
}

main();
