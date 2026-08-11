/**
 * RSO-5 — Tenant Operations Runtime verification
 */
import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_VERSION,
} from "../lib/release/ga-release";
import { POST_GA_PRODUCTION_BASELINE } from "../lib/release/health/release-health-registry";
import { RELEASE_ID } from "../lib/release/release-readiness";
import { buildRuntimeHealth, clearRuntimeHealth } from "../lib/runtime/health";
import {
  buildRuntimeIncidents,
  clearRuntimeIncidents,
} from "../lib/runtime/incident";
import {
  buildApplicationMonitoring,
  clearApplicationMonitoring,
} from "../lib/runtime/monitoring";
import {
  RECOVERY_WORKFLOW_VERSION,
  RSO3_INCIDENT_MANAGEMENT_BASELINE,
  RSO_4_ID,
  buildRecoveryWorkflow,
  clearRecoveryWorkflow,
} from "../lib/runtime/recovery";
import {
  RSO4_RECOVERY_WORKFLOW_BASELINE,
  RSO_5_ID,
  TENANT_OPERATIONS_CAPABILITY,
  TENANT_OPERATIONS_VERSION,
  TENANT_OPERATION_STATUSES,
  buildTenantOperations,
  clearTenantOperations,
  getTenantOperations,
  tenantOperationsFingerprint,
} from "../lib/runtime/tenant";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== RSO-5 Tenant Operations Runtime ===\n");

  clearTenantOperations();
  clearRecoveryWorkflow();
  clearRuntimeIncidents();
  clearApplicationMonitoring();
  clearRuntimeHealth();
  buildRuntimeHealth();
  buildApplicationMonitoring();
  buildRuntimeIncidents();
  const recovery = buildRecoveryWorkflow();
  const first = buildTenantOperations();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === RSO_5_ID, "RSO-5 id");
  assert(first.capability === TENANT_OPERATIONS_CAPABILITY, "capability");
  assert(first.version === TENANT_OPERATIONS_VERSION, "version");
  assert(first.parentPack === RSO_4_ID, "parent pack");
  assert(first.parentVersion === RECOVERY_WORKFLOW_VERSION, "parent version");
  assert(
    first.recoveryWorkflowFingerprint === recovery.fingerprint,
    "RSO-4 reuse fingerprint",
  );
  assert(
    first.recoveryWorkflowStatus === recovery.status,
    "recovery status reuse",
  );
  assert(
    first.operationCount === recovery.actionCount,
    "operation count matches actions",
  );
  assert(first.gaVersion === GA_RELEASE_VERSION, "ga version");
  assert(first.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noBilling === true, "noBilling");
  assert(first.scope.noLicense === true, "noLicense");
  console.log("PASS RSO-4 reuse");

  assert(
    first.operations.every((o) =>
      (TENANT_OPERATION_STATUSES as readonly string[]).includes(o.status),
    ),
    "status contract",
  );
  assert(
    first.operations.every((o, i) => {
      const action = recovery.actions[i];
      if (!action) return false;
      if (action.status === "IDLE") return o.status === "STABLE";
      if (action.status === "PLANNED") return o.status === "WATCH";
      if (action.status === "ARMED") return o.status === "STAGED";
      if (action.status === "HELD") return o.status === "SUSPENDED";
      return false;
    }),
    "status mapping",
  );
  assert(first.stableCount === first.operationCount, "all STABLE when quiet");
  assert(first.watchCount === 0, "no watch");
  assert(first.suspendedCount === 0, "no suspended");
  assert(first.status === "NOMINAL", "surface NOMINAL");
  console.log("PASS Status mapping");

  assert(
    first.operations.map((o) => o.sourceActionId).join(",") ===
      recovery.actions.map((a) => a.actionId).join(","),
    "source action order",
  );
  assert(
    first.operations.map((o) => o.sourceCheckId).join(",") ===
      recovery.actions.map((a) => a.sourceCheckId).join(","),
    "source check order",
  );
  assert(
    first.operations.every((o, idx) => o.ordinal === idx + 1),
    "contiguous ordinals",
  );
  console.log("PASS Ordering");

  assert(
    first.baselineTag === RSO4_RECOVERY_WORKFLOW_BASELINE,
    "pack baseline",
  );
  assert(
    first.baselineTag === "rso4-recovery-workflow-v1",
    "pack baseline literal",
  );
  assert(
    first.parentBaseline === RSO3_INCIDENT_MANAGEMENT_BASELINE,
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

  const second = buildTenantOperations();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    tenantOperationsFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(getTenantOperations().fingerprint === first.fingerprint, "get cache");

  clearTenantOperations();
  const third = buildTenantOperations();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== RSO-5 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
  console.log(`parentBaseline: ${first.parentBaseline}`);
  console.log(`productionBaseline: ${first.productionBaseline}`);
  console.log(`tenantOpsStatus: ${first.status}`);
}

main();
