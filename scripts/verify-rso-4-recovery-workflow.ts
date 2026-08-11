/**
 * RSO-4 — Recovery Workflow Foundation verification
 */
import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_VERSION,
} from "../lib/release/ga-release";
import { POST_GA_PRODUCTION_BASELINE } from "../lib/release/health/release-health-registry";
import { RELEASE_ID } from "../lib/release/release-readiness";
import { buildRuntimeHealth, clearRuntimeHealth } from "../lib/runtime/health";
import {
  RSO2_APPLICATION_MONITORING_BASELINE,
  RSO_3_ID,
  RUNTIME_INCIDENT_VERSION,
  buildRuntimeIncidents,
  clearRuntimeIncidents,
} from "../lib/runtime/incident";
import {
  buildApplicationMonitoring,
  clearApplicationMonitoring,
} from "../lib/runtime/monitoring";
import {
  RECOVERY_STATUSES,
  RSO3_INCIDENT_MANAGEMENT_BASELINE,
  RSO_4_ID,
  RECOVERY_WORKFLOW_CAPABILITY,
  RECOVERY_WORKFLOW_VERSION,
  buildRecoveryWorkflow,
  clearRecoveryWorkflow,
  getRecoveryWorkflow,
  recoveryWorkflowFingerprint,
} from "../lib/runtime/recovery";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== RSO-4 Recovery Workflow Foundation ===\n");

  clearRecoveryWorkflow();
  clearRuntimeIncidents();
  clearApplicationMonitoring();
  clearRuntimeHealth();
  buildRuntimeHealth();
  buildApplicationMonitoring();
  const incidents = buildRuntimeIncidents();
  const first = buildRecoveryWorkflow();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === RSO_4_ID, "RSO-4 id");
  assert(first.capability === RECOVERY_WORKFLOW_CAPABILITY, "capability");
  assert(first.version === RECOVERY_WORKFLOW_VERSION, "version");
  assert(first.parentPack === RSO_3_ID, "parent pack");
  assert(first.parentVersion === RUNTIME_INCIDENT_VERSION, "parent version");
  assert(
    first.runtimeIncidentsFingerprint === incidents.fingerprint,
    "RSO-3 reuse fingerprint",
  );
  assert(
    first.incidentSurfaceStatus === incidents.status,
    "incident surface reuse",
  );
  assert(
    first.actionCount === incidents.incidentCount,
    "action count matches incidents",
  );
  assert(first.gaVersion === GA_RELEASE_VERSION, "ga version");
  assert(first.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noDeploymentAutomation === true, "noDeploymentAutomation");
  assert(first.scope.noExternalIntegration === true, "noExternalIntegration");
  console.log("PASS RSO-3 reuse");

  assert(
    first.actions.every((a) =>
      (RECOVERY_STATUSES as readonly string[]).includes(a.status),
    ),
    "status contract",
  );
  assert(
    first.actions.every((a, i) => {
      const incident = incidents.incidents[i];
      if (!incident) return false;
      if (incident.severity === "NONE" || incident.state === "OBSERVED") {
        return a.status === "IDLE" && a.intent === "MONITOR";
      }
      if (incident.severity === "MEDIUM") {
        return a.status === "PLANNED" && a.intent === "REVIEW";
      }
      if (incident.severity === "HIGH" || incident.severity === "CRITICAL") {
        return a.status === "HELD" && a.intent === "HOLD";
      }
      return a.status === "IDLE";
    }),
    "status mapping",
  );
  assert(first.idleCount === first.actionCount, "all IDLE when clear");
  assert(first.plannedCount === 0, "no planned");
  assert(first.heldCount === 0, "no held");
  assert(first.status === "QUIESCENT", "workflow QUIESCENT");
  console.log("PASS Status mapping");

  assert(
    first.actions.map((a) => a.sourceIncidentId).join(",") ===
      incidents.incidents.map((i) => i.incidentId).join(","),
    "source incident order",
  );
  assert(
    first.actions.map((a) => a.sourceCheckId).join(",") ===
      incidents.incidents.map((i) => i.sourceCheckId).join(","),
    "source check order",
  );
  assert(
    first.actions.every((a, idx) => a.ordinal === idx + 1),
    "contiguous ordinals",
  );
  console.log("PASS Ordering");

  assert(
    first.baselineTag === RSO3_INCIDENT_MANAGEMENT_BASELINE,
    "pack baseline",
  );
  assert(
    first.baselineTag === "rso3-incident-management-v1",
    "pack baseline literal",
  );
  assert(
    first.parentBaseline === RSO2_APPLICATION_MONITORING_BASELINE,
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

  const second = buildRecoveryWorkflow();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    recoveryWorkflowFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(getRecoveryWorkflow().fingerprint === first.fingerprint, "get cache");

  clearRecoveryWorkflow();
  const third = buildRecoveryWorkflow();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== RSO-4 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
  console.log(`parentBaseline: ${first.parentBaseline}`);
  console.log(`productionBaseline: ${first.productionBaseline}`);
  console.log(`recoveryStatus: ${first.status}`);
}

main();
