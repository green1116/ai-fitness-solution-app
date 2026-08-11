/**
 * RSO-1 — Runtime Health Foundation verification
 */
import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_VERSION,
} from "../lib/release/ga-release";
import { POST_GA_PRODUCTION_BASELINE } from "../lib/release/health/release-health-registry";
import { RELEASE_ID } from "../lib/release/release-readiness";
import {
  HEALTH_CHECK_IDS,
  RSO_1_ID,
  RUNTIME_HEALTH_CAPABILITY,
  RUNTIME_HEALTH_VERSION,
  buildRuntimeHealth,
  clearRuntimeHealth,
  getRuntimeHealth,
  runtimeHealthFingerprint,
} from "../lib/runtime/health";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== RSO-1 Runtime Health Foundation ===\n");

  clearRuntimeHealth();
  const first = buildRuntimeHealth();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === RSO_1_ID, "RSO-1 id");
  assert(first.capability === RUNTIME_HEALTH_CAPABILITY, "capability");
  assert(first.version === RUNTIME_HEALTH_VERSION, "version");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noLiveProbes === true, "noLiveProbes");
  assert(first.scope.noDatabase === true, "noDatabase");
  assert(first.scope.gaBaselineUnchanged === true, "ga lock scope");
  console.log("PASS Build");

  assert(first.status === "UP", "overall UP");
  assert(first.checks.length === HEALTH_CHECK_IDS.length, "check count");
  assert(
    first.checks.map((c) => c.id).join(",") === HEALTH_CHECK_IDS.join(","),
    "check order",
  );
  assert(first.checks.every((c) => c.result === "PASS"), "all checks PASS");
  assert(first.checks.every((c) => c.status === "UP"), "check status UP");
  assert(first.passedCount === HEALTH_CHECK_IDS.length, "passedCount");
  assert(first.failedCount === 0, "failedCount");
  assert(first.gaVersion === GA_RELEASE_VERSION, "ga version");
  assert(first.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  console.log("PASS Status contract");

  assert(first.baselineTag === POST_GA_PRODUCTION_BASELINE, "baseline ref");
  assert(
    first.baselineTag === "post-ga-production-baseline-v1",
    "baseline literal",
  );
  console.log("PASS Baseline reference");

  const second = buildRuntimeHealth();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    runtimeHealthFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(getRuntimeHealth().fingerprint === first.fingerprint, "get cache");

  clearRuntimeHealth();
  const third = buildRuntimeHealth();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== RSO-1 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
  console.log(`healthStatus: ${first.status}`);
}

main();
