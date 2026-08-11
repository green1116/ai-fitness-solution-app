/**
 * RSO-6 — Service Reliability Metrics verification
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
  buildRecoveryWorkflow,
  clearRecoveryWorkflow,
} from "../lib/runtime/recovery";
import {
  RELIABILITY_GRADES,
  RSO5_TENANT_OPERATIONS_BASELINE,
  RSO_6_ID,
  SERVICE_RELIABILITY_CAPABILITY,
  SERVICE_RELIABILITY_VERSION,
  buildServiceReliability,
  clearServiceReliability,
  getServiceReliability,
  serviceReliabilityFingerprint,
} from "../lib/runtime/reliability";
import {
  RSO4_RECOVERY_WORKFLOW_BASELINE,
  RSO_5_ID,
  TENANT_OPERATIONS_VERSION,
  buildTenantOperations,
  clearTenantOperations,
} from "../lib/runtime/tenant";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== RSO-6 Service Reliability Metrics ===\n");

  clearServiceReliability();
  clearTenantOperations();
  clearRecoveryWorkflow();
  clearRuntimeIncidents();
  clearApplicationMonitoring();
  clearRuntimeHealth();
  buildRuntimeHealth();
  buildApplicationMonitoring();
  buildRuntimeIncidents();
  buildRecoveryWorkflow();
  const tenantOps = buildTenantOperations();
  const first = buildServiceReliability();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === RSO_6_ID, "RSO-6 id");
  assert(first.capability === SERVICE_RELIABILITY_CAPABILITY, "capability");
  assert(first.version === SERVICE_RELIABILITY_VERSION, "version");
  assert(first.parentPack === RSO_5_ID, "parent pack");
  assert(first.parentVersion === TENANT_OPERATIONS_VERSION, "parent version");
  assert(
    first.tenantOperationsFingerprint === tenantOps.fingerprint,
    "RSO-5 reuse fingerprint",
  );
  assert(
    first.tenantOperationsStatus === tenantOps.status,
    "tenant ops status reuse",
  );
  assert(
    first.metricCount === tenantOps.operationCount,
    "metric count matches operations",
  );
  assert(first.gaVersion === GA_RELEASE_VERSION, "ga version");
  assert(first.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noExternalMonitoring === true, "noExternalMonitoring");
  assert(first.scope.noApm === true, "noApm");
  assert(first.scope.noSla === true, "noSla");
  assert(first.scope.noBilling === true, "noBilling");
  console.log("PASS RSO-5 reuse");

  assert(
    first.metrics.every((m) =>
      (RELIABILITY_GRADES as readonly string[]).includes(m.grade),
    ),
    "grade contract",
  );
  assert(
    first.metrics.every((m, i) => {
      const op = tenantOps.operations[i];
      if (!op) return false;
      if (op.status === "STABLE") {
        return m.grade === "EXCELLENT" && m.score === 100;
      }
      if (op.status === "WATCH") {
        return m.grade === "GOOD" && m.score === 85;
      }
      if (op.status === "STAGED") {
        return m.grade === "FAIR" && m.score === 70;
      }
      if (op.status === "SUSPENDED") {
        return m.grade === "POOR" && m.score === 40;
      }
      return false;
    }),
    "metric mapping",
  );
  assert(first.excellentCount === first.metricCount, "all EXCELLENT");
  assert(first.goodCount === 0, "no GOOD");
  assert(first.poorCount === 0, "no POOR");
  assert(first.averageScore === 100, "average 100");
  assert(first.status === "HEALTHY", "surface HEALTHY");
  console.log("PASS Metric mapping");

  assert(
    first.metrics.map((m) => m.sourceOperationId).join(",") ===
      tenantOps.operations.map((o) => o.operationId).join(","),
    "source operation order",
  );
  assert(
    first.metrics.map((m) => m.sourceCheckId).join(",") ===
      tenantOps.operations.map((o) => o.sourceCheckId).join(","),
    "source check order",
  );
  assert(
    first.metrics.map((m) => m.tenantId).join(",") ===
      tenantOps.operations.map((o) => o.tenantId).join(","),
    "tenant order",
  );
  assert(
    first.metrics.every((m, idx) => m.ordinal === idx + 1),
    "contiguous ordinals",
  );
  console.log("PASS Ordering");

  assert(
    first.baselineTag === RSO5_TENANT_OPERATIONS_BASELINE,
    "pack baseline",
  );
  assert(
    first.baselineTag === "rso5-tenant-operations-v1",
    "pack baseline literal",
  );
  assert(
    first.parentBaseline === RSO4_RECOVERY_WORKFLOW_BASELINE,
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

  const second = buildServiceReliability();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    serviceReliabilityFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(
    getServiceReliability().fingerprint === first.fingerprint,
    "get cache",
  );

  clearServiceReliability();
  const third = buildServiceReliability();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== RSO-6 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
  console.log(`parentBaseline: ${first.parentBaseline}`);
  console.log(`productionBaseline: ${first.productionBaseline}`);
  console.log(`reliabilityStatus: ${first.status}`);
}

main();
