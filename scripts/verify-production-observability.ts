/**
 * V3.7-H2 Production Observability — smoke verification
 */
import { BUILD_FREEZE_MANIFEST } from "../lib/commercialization/stabilization/build-freeze";
import {
  PRODUCTION_OBSERVABILITY_VERSION,
  RUNTIME_OBSERVABILITY_VERSION,
  OPS_SUMMARY_VERSION,
  RELEASE_GATE_VIEW_VERSION,
  PRODUCTION_STATUS_MANIFEST_VERSION,
  buildProductionObservabilityFoundation,
  buildRuntimeObservabilitySnapshot,
  buildOpsSummaryLayer,
  buildReleaseGateView,
  buildProductionStatusManifest,
} from "../lib/commercialization/observability";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testObservabilitySnapshot() {
  const snapshot = buildRuntimeObservabilitySnapshot({ deploymentId: "h2-obs" });
  assert(snapshot.version === RUNTIME_OBSERVABILITY_VERSION, "observability version");
  assert(snapshot.buildStatus === "pass", "build pass");
  assert(snapshot.tscStatus === "pass", "tsc pass");
  assert(snapshot.verificationStatus === "pass", "verification pass");
  assert(snapshot.freezeStatus === "intact", "freeze intact");
  assert(snapshot.readinessStatus === "pass", "readiness pass");
  assert(snapshot.hardeningStatus === "pass", "hardening pass");
  assert(snapshot.releaseConfidence >= 80, "release confidence");
  assert(snapshot.incidentLevel === "informational", "incident informational");

  console.log("✓ runtime observability snapshot");
  console.log(" ", snapshot.summary);
}

function testOpsSummary() {
  const ops = buildOpsSummaryLayer({ deploymentId: "h2-ops" });
  assert(ops.version === OPS_SUMMARY_VERSION, "ops version");
  assert(ops.buildSummary.includes("BuildFreeze"), "build summary");
  assert(ops.releaseSummary.includes("release-readiness"), "release summary");
  assert(ops.readinessSummary.includes("operational-readiness"), "readiness summary");
  assert(ops.hardeningSummary.includes("production-hardening"), "hardening summary");
  assert(ops.incidentSummary.includes("fatal=INC-FATAL"), "incident summary");

  console.log("✓ ops summary layer");
  console.log(" ", ops.summary);
}

function testReleaseGateView() {
  const gate = buildReleaseGateView({ deploymentId: "h2-gate" });
  assert(gate.version === RELEASE_GATE_VIEW_VERSION, "gate version");
  assert(gate.releasable === true, "releasable");
  assert(gate.blocked === false, "not blocked");
  assert(gate.warningCount === 0, "no warnings");
  assert(gate.confidenceScore >= 80, "confidence");
  assert(gate.gateReason.length > 0, "gate reason");

  console.log("✓ release gate view");
  console.log(" ", gate.summary);
  console.log(" ", gate.gateReason);
}

function testProductionStatusManifest() {
  const status = buildProductionStatusManifest({ deploymentId: "h2-status" });
  assert(status.version === PRODUCTION_STATUS_MANIFEST_VERSION, "status version");
  assert(status.BUILD_FREEZE_VERSION.length > 0, "freeze version");
  assert(status.HARDENING_VERSION.length > 0, "hardening version");
  assert(status.OBSERVABILITY_VERSION.length > 0, "observability version");
  assert(status.buildPassed === true, "build passed");
  assert(status.tscPassed === true, "tsc passed");
  assert(status.verificationPassed === true, "verification passed");
  assert(status.hardeningPassed === true, "hardening passed");
  assert(status.releaseReady === true, "release ready");
  assert(BUILD_FREEZE_MANIFEST.buildPassed, "freeze baseline");

  console.log("✓ production status manifest");
  console.log(" ", status.summary);
}

function testFoundationAggregate() {
  const foundation = buildProductionObservabilityFoundation({ deploymentId: "h2-foundation" });
  assert(foundation.version === PRODUCTION_OBSERVABILITY_VERSION, "foundation version");
  assert(foundation.observability.snapshotId.includes("OBS-V37H2"), "observability linked");
  assert(foundation.ops.summaryId.includes("OPS-V37H2"), "ops linked");
  assert(foundation.releaseGate.gateId.includes("GATE-V37H2"), "gate linked");
  assert(foundation.status.manifestId.includes("STATUS-V37H2"), "status linked");
  assert(foundation.status.releaseReady, "release ready");

  console.log("✓ production observability foundation");
  console.log(" ", foundation.summary);
}

function main() {
  testObservabilitySnapshot();
  testOpsSummary();
  testReleaseGateView();
  testProductionStatusManifest();
  testFoundationAggregate();
  console.log("\nAll production observability checks passed.");
}

main();
