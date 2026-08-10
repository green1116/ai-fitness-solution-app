/**
 * PG-1.2 — Runtime Health Foundation verification
 */
import {
  buildGaRelease,
  clearGaRelease,
} from "../lib/release/ga-release";
import {
  PG_1_1_ID,
  POST_GA_PRODUCTION_BASELINE,
  buildReleaseHealthRegistry,
  clearReleaseHealthRegistry,
} from "../lib/release/health/release-health-registry";
import {
  PG_1_2_ID,
  PG1_RELEASE_HEALTH_BASELINE,
  RUNTIME_HEALTH_CAPABILITY,
  RUNTIME_HEALTH_VERSION,
  buildRuntimeHealthFoundation,
  clearRuntimeHealthFoundation,
  getRuntimeHealthFoundation,
  runtimeHealthFoundationFingerprint,
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
  console.log("=== PG-1.2 Runtime Health Foundation ===\n");

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
  const releaseHealth = buildReleaseHealthRegistry();

  const first = buildRuntimeHealthFoundation();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === PG_1_2_ID, "PG-1.2 id");
  assert(first.capability === RUNTIME_HEALTH_CAPABILITY, "capability");
  assert(first.version === RUNTIME_HEALTH_VERSION, "version");
  assert(first.baselineTag === PG1_RELEASE_HEALTH_BASELINE, "baseline");
  assert(first.baselineTag === "pg1-release-health-v1", "baseline literal");
  assert(first.parentPack === PG_1_1_ID, "parent pack");
  assert(first.parentBaseline === POST_GA_PRODUCTION_BASELINE, "parent baseline");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(
    first.releaseHealthFingerprint === releaseHealth.fingerprint,
    "parent fingerprint link",
  );
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noLiveProbes === true, "noLiveProbes");
  assert(first.scope.noDatabase === true, "noDatabase");
  assert(first.scope.noUi === true, "noUi");
  console.log("PASS Build");

  assert(first.applicationStatus === "UP", "application UP");
  assert(first.releaseStatus === "PASS", "release PASS");
  assert(first.databaseReadiness === "READY", "database signal READY");
  assert(first.apiReadiness === "READY", "api signal READY");
  assert(first.dependencies.length === 4, "dependency count");
  assert(
    first.dependencies.every((d) => d.status === "HEALTHY"),
    "dependencies HEALTHY",
  );
  assert(
    first.dependencies.map((d) => d.id).join(",") ===
      "dep-next,dep-prisma,dep-vercel,dep-ga-release",
    "dependency order",
  );
  console.log("PASS Health contract");

  const second = buildRuntimeHealthFoundation();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    runtimeHealthFoundationFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(
    getRuntimeHealthFoundation().fingerprint === first.fingerprint,
    "get cache",
  );

  clearRuntimeHealthFoundation();
  const third = buildRuntimeHealthFoundation();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== PG-1.2 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
}

main();
