/**
 * PG-1 Freeze — Operations Baseline verification
 */
import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
  buildGaRelease,
  clearGaRelease,
} from "../lib/release/ga-release";
import {
  buildDeploymentEvidenceFoundation,
  clearDeploymentEvidenceFoundation,
} from "../lib/release/health/deployment-evidence-foundation";
import {
  PG_1_COMPONENTS,
  PG_1_FREEZE_CAPABILITY,
  PG_1_FREEZE_CODENAME,
  PG_1_FREEZE_DATE,
  PG_1_FREEZE_ID,
  PG_1_FREEZE_VERSION,
  PG1_PRODUCTION_AUDIT_BASELINE,
  buildPg1FreezeManifest,
  clearPg1FreezeManifest,
  getPg1FreezeManifest,
  pg1FreezeManifestFingerprint,
} from "../lib/release/health/pg1-freeze-manifest";
import {
  RELEASE_HEALTH_COMMIT_REF,
  buildReleaseHealthRegistry,
  clearReleaseHealthRegistry,
} from "../lib/release/health/release-health-registry";
import {
  buildProductionAuditFoundation,
  clearProductionAuditFoundation,
} from "../lib/release/health/production-audit-foundation";
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
  console.log("=== PG-1 Freeze — Operations Baseline ===\n");

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
  const audit = buildProductionAuditFoundation();

  const first = buildPg1FreezeManifest();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === PG_1_FREEZE_ID, "freeze id");
  assert(first.capability === PG_1_FREEZE_CAPABILITY, "capability");
  assert(first.version === PG_1_FREEZE_VERSION, "version");
  assert(first.codename === PG_1_FREEZE_CODENAME, "codename");
  assert(first.freezeDate === PG_1_FREEZE_DATE, "freeze date");
  assert(first.baselineTag === PG1_PRODUCTION_AUDIT_BASELINE, "baseline");
  assert(first.baselineTag === "pg1-production-audit-v1", "baseline literal");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.immutable === true, "immutable");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noDatabase === true, "noDatabase");
  assert(first.scope.noUi === true, "noUi");
  assert(first.scope.components === "PG-1.1~PG-1.4", "components scope");
  assert(first.scope.closure === "PG-1-Freeze", "closure");
  console.log("PASS Build");

  assert(first.components.length === 4, "component count");
  assert(
    first.components.map((c) => c.id).join(",") ===
      PG_1_COMPONENTS.map((c) => c.id).join(","),
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
    first.verificationSummary.status === "PASS",
    "verification summary PASS",
  );
  assert(first.verificationSummary.certified === true, "certified flag");
  assert(
    first.verificationSummary.auditFingerprint === audit.fingerprint,
    "audit fp link",
  );
  assert(first.verificationSummary.componentCount === 4, "summary components");
  assert(first.verificationSummary.auditEventCount === 4, "summary events");
  assert(first.rollbackReference.strategy === "ep-freeze-baseline", "rollback");
  assert(first.rollbackReference.ready === true, "rollback ready");
  assert(first.rollbackReference.restoreTargets.length === 4, "rollback targets");
  assert(first.certification === "certified", "certification");
  console.log("PASS Freeze contract");

  const second = buildPg1FreezeManifest();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    pg1FreezeManifestFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(getPg1FreezeManifest().fingerprint === first.fingerprint, "get cache");

  clearPg1FreezeManifest();
  const third = buildPg1FreezeManifest();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== PG-1 FREEZE VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
  console.log(`version: ${first.version}`);
}

main();
