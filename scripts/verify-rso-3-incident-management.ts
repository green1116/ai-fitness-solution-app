/**
 * RSO-3 — Incident Management Foundation verification
 */
import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_VERSION,
} from "../lib/release/ga-release";
import { POST_GA_PRODUCTION_BASELINE } from "../lib/release/health/release-health-registry";
import { RELEASE_ID } from "../lib/release/release-readiness";
import { buildRuntimeHealth, clearRuntimeHealth } from "../lib/runtime/health";
import {
  APPLICATION_MONITORING_VERSION,
  RSO1_RUNTIME_HEALTH_BASELINE,
  RSO_2_ID,
  buildApplicationMonitoring,
  clearApplicationMonitoring,
} from "../lib/runtime/monitoring";
import {
  INCIDENT_SEVERITIES,
  RSO2_APPLICATION_MONITORING_BASELINE,
  RSO_3_ID,
  RUNTIME_INCIDENT_CAPABILITY,
  RUNTIME_INCIDENT_VERSION,
  buildRuntimeIncidents,
  clearRuntimeIncidents,
  getRuntimeIncidents,
  runtimeIncidentsFingerprint,
} from "../lib/runtime/incident";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== RSO-3 Incident Management Foundation ===\n");

  clearRuntimeIncidents();
  clearApplicationMonitoring();
  clearRuntimeHealth();
  buildRuntimeHealth();
  const monitoring = buildApplicationMonitoring();
  const first = buildRuntimeIncidents();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === RSO_3_ID, "RSO-3 id");
  assert(first.capability === RUNTIME_INCIDENT_CAPABILITY, "capability");
  assert(first.version === RUNTIME_INCIDENT_VERSION, "version");
  assert(first.parentPack === RSO_2_ID, "parent pack");
  assert(first.parentVersion === APPLICATION_MONITORING_VERSION, "parent ver");
  assert(
    first.applicationMonitoringFingerprint === monitoring.fingerprint,
    "RSO-2 reuse fingerprint",
  );
  assert(first.monitoringStatus === monitoring.status, "monitoring status");
  assert(
    first.incidentCount === monitoring.signalCount,
    "incident count matches signals",
  );
  assert(first.gaVersion === GA_RELEASE_VERSION, "ga version");
  assert(first.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noRecovery === true, "noRecovery");
  assert(first.scope.noExternalAlerting === true, "noExternalAlerting");
  console.log("PASS RSO-2 reuse");

  assert(
    first.incidents.every((i) =>
      (INCIDENT_SEVERITIES as readonly string[]).includes(i.severity),
    ),
    "severity contract",
  );
  assert(first.incidents.every((i) => i.severity === "NONE"), "quiet → NONE");
  assert(first.noneCount === first.incidentCount, "noneCount");
  assert(first.openCount === 0, "no open");
  assert(first.observedCount === first.incidentCount, "all observed");
  assert(first.criticalCount === 0, "no critical");
  assert(first.status === "CLEAR", "surface CLEAR");
  console.log("PASS Severity");

  assert(
    first.incidents.map((i) => i.sourceCheckId).join(",") ===
      monitoring.signals.map((s) => s.sourceCheckId).join(","),
    "source check order",
  );
  assert(
    first.incidents.map((i) => i.sourceSignalId).join(",") ===
      monitoring.signals.map((s) => s.signalId).join(","),
    "source signal order",
  );
  assert(
    first.incidents.every((i, idx) => i.ordinal === idx + 1),
    "contiguous ordinals",
  );
  console.log("PASS Ordering");

  assert(
    first.baselineTag === RSO2_APPLICATION_MONITORING_BASELINE,
    "pack baseline",
  );
  assert(
    first.baselineTag === "rso2-application-monitoring-v1",
    "pack baseline literal",
  );
  assert(
    first.parentBaseline === RSO1_RUNTIME_HEALTH_BASELINE,
    "parent baseline",
  );
  assert(
    first.productionBaseline === POST_GA_PRODUCTION_BASELINE,
    "production baseline",
  );
  assert(
    first.productionBaseline === "post-ga-production-baseline-v1",
    "post-ga baseline trace",
  );
  console.log("PASS Baseline trace");

  const second = buildRuntimeIncidents();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    runtimeIncidentsFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(getRuntimeIncidents().fingerprint === first.fingerprint, "get cache");

  clearRuntimeIncidents();
  const third = buildRuntimeIncidents();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== RSO-3 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
  console.log(`parentBaseline: ${first.parentBaseline}`);
  console.log(`productionBaseline: ${first.productionBaseline}`);
  console.log(`incidentStatus: ${first.status}`);
}

main();
