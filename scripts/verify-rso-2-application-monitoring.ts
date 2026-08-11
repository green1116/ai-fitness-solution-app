/**
 * RSO-2 — Application Monitoring Layer verification
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
  RUNTIME_HEALTH_VERSION,
  buildRuntimeHealth,
  clearRuntimeHealth,
} from "../lib/runtime/health";
import {
  APPLICATION_MONITORING_CAPABILITY,
  APPLICATION_MONITORING_VERSION,
  RSO1_RUNTIME_HEALTH_BASELINE,
  RSO_2_ID,
  applicationMonitoringFingerprint,
  buildApplicationMonitoring,
  clearApplicationMonitoring,
  getApplicationMonitoring,
} from "../lib/runtime/monitoring";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== RSO-2 Application Monitoring Layer ===\n");

  clearApplicationMonitoring();
  clearRuntimeHealth();
  const health = buildRuntimeHealth();
  const first = buildApplicationMonitoring();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === RSO_2_ID, "RSO-2 id");
  assert(first.capability === APPLICATION_MONITORING_CAPABILITY, "capability");
  assert(first.version === APPLICATION_MONITORING_VERSION, "version");
  assert(first.parentPack === RSO_1_ID, "parent pack");
  assert(first.parentVersion === RUNTIME_HEALTH_VERSION, "parent version");
  assert(
    first.runtimeHealthFingerprint === health.fingerprint,
    "RSO-1 reuse fingerprint",
  );
  assert(first.healthStatus === health.status, "health status reuse");
  assert(first.signalCount === health.checks.length, "signal count matches");
  assert(first.gaVersion === GA_RELEASE_VERSION, "ga version");
  assert(first.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noLiveMonitoring === true, "noLiveMonitoring");
  assert(first.scope.noIncident === true, "noIncident");
  assert(first.scope.noRecovery === true, "noRecovery");
  console.log("PASS RSO-1 reuse");

  assert(
    first.signals.map((s) => s.sourceCheckId).join(",") ===
      HEALTH_CHECK_IDS.join(","),
    "signal source order",
  );
  assert(
    first.signals.map((s) => s.ordinal).join(",") ===
      health.checks.map((_, i) => i + 1).join(","),
    "ordinal order",
  );
  assert(
    first.signals.every((s, i) => s.ordinal === i + 1),
    "contiguous ordinals",
  );
  console.log("PASS Ordering");

  assert(first.baselineTag === RSO1_RUNTIME_HEALTH_BASELINE, "pack baseline");
  assert(
    first.baselineTag === "rso1-runtime-health-v1",
    "pack baseline literal",
  );
  assert(
    first.parentBaseline === POST_GA_PRODUCTION_BASELINE,
    "parent baseline",
  );
  assert(
    first.parentBaseline === "post-ga-production-baseline-v1",
    "post-ga baseline trace",
  );
  console.log("PASS Baseline trace");

  assert(first.status === "QUIET", "monitoring QUIET");
  assert(first.infoCount === first.signalCount, "all INFO");
  assert(first.warnCount === 0, "no WARN");
  assert(first.criticalCount === 0, "no CRITICAL");

  const second = buildApplicationMonitoring();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    applicationMonitoringFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(
    getApplicationMonitoring().fingerprint === first.fingerprint,
    "get cache",
  );

  clearApplicationMonitoring();
  const third = buildApplicationMonitoring();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== RSO-2 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
  console.log(`parentBaseline: ${first.parentBaseline}`);
  console.log(`monitoringStatus: ${first.status}`);
}

main();
