/**
 * V3.7-H4 Production Audit & Release Trace — smoke verification
 */
import { BUILD_FREEZE_MANIFEST } from "../lib/commercialization/stabilization/build-freeze";
import {
  PRODUCTION_AUDIT_VERSION,
  AUDIT_SNAPSHOT_VERSION,
  RELEASE_TRACE_MANIFEST_VERSION,
  INCIDENT_TRACE_VERSION,
  VERIFICATION_EVIDENCE_BUNDLE_VERSION,
  buildProductionAuditFoundation,
  buildAuditSnapshot,
  buildReleaseTraceManifest,
  buildIncidentTrace,
  buildVerificationEvidenceBundle,
} from "../lib/commercialization/audit";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testAuditSnapshot() {
  const snapshot = buildAuditSnapshot({ deploymentId: "h4-audit" });
  assert(snapshot.version === AUDIT_SNAPSHOT_VERSION, "audit snapshot version");
  assert(snapshot.buildStatus === "pass", "build pass");
  assert(snapshot.tscStatus === "pass", "tsc pass");
  assert(snapshot.verificationStatus === "pass", "verification pass");
  assert(snapshot.freezeStatus === "intact", "freeze intact");
  assert(snapshot.hardeningStatus === "pass", "hardening pass");
  assert(snapshot.observabilityStatus === "pass", "observability pass");
  assert(snapshot.dashboardStatus === "pass", "dashboard pass");
  assert(snapshot.releaseConfidence >= 80, "release confidence");
  assert(snapshot.incidentLevel === "informational", "incident level");
  assert(snapshot.releasable === true, "releasable");

  console.log("✓ audit snapshot");
  console.log(" ", snapshot.summary);
}

function testReleaseTraceManifest() {
  const trace = buildReleaseTraceManifest({ deploymentId: "h4-trace" });
  assert(trace.version === RELEASE_TRACE_MANIFEST_VERSION, "trace version");
  assert(trace.BUILD_FREEZE_VERSION.length > 0, "freeze version");
  assert(trace.HARDENING_VERSION.length > 0, "hardening version");
  assert(trace.OBSERVABILITY_VERSION.length > 0, "observability version");
  assert(trace.DASHBOARD_VERSION.length > 0, "dashboard version");
  assert(trace.AUDIT_VERSION.length > 0, "audit version");
  assert(trace.buildPassed === true, "build passed");
  assert(trace.tscPassed === true, "tsc passed");
  assert(trace.verificationPassed === true, "verification passed");
  assert(trace.hardeningPassed === true, "hardening passed");
  assert(trace.observabilityPassed === true, "observability passed");
  assert(trace.dashboardPassed === true, "dashboard passed");
  assert(trace.releaseReady === true, "release ready");
  assert(BUILD_FREEZE_MANIFEST.buildPassed, "freeze baseline");

  console.log("✓ release trace manifest");
  console.log(" ", trace.summary);
}

function testIncidentTrace() {
  const incident = buildIncidentTrace({ deploymentId: "h4-incident" });
  assert(incident.incidentId.includes("INC-V37H4"), "incident id");
  assert(incident.incidentLevel === "informational", "incident level");
  assert(incident.incidentReason.length > 0, "incident reason");
  assert(incident.detectedAt.length > 0, "detected at");
  assert(incident.resolutionState === "not-applicable", "resolution state");
  assert(incident.relatedSignals.length >= 5, "related signals");

  console.log("✓ incident trace layer");
  console.log(" ", `level=${incident.incidentLevel} state=${incident.resolutionState}`);
}

function testVerificationEvidenceBundle() {
  const evidence = buildVerificationEvidenceBundle({ deploymentId: "h4-evidence" });
  assert(evidence.version === VERIFICATION_EVIDENCE_BUNDLE_VERSION, "evidence version");
  assert(evidence.buildEvidence.includes("BuildFreeze"), "build evidence");
  assert(evidence.tscEvidence.includes("tscPassed=true"), "tsc evidence");
  assert(evidence.verifyEvidence.includes("verify:audit"), "verify evidence");
  assert(evidence.hardeningEvidence.includes("production-hardening"), "hardening evidence");
  assert(evidence.observabilityEvidence.includes("production-observability"), "observability evidence");
  assert(evidence.dashboardEvidence.includes("production-dashboard"), "dashboard evidence");

  console.log("✓ verification evidence bundle");
  console.log(" ", evidence.summary);
}

function testAuditFoundation() {
  const foundation = buildProductionAuditFoundation({ deploymentId: "h4-foundation" });
  assert(foundation.version === PRODUCTION_AUDIT_VERSION, "foundation version");
  assert(foundation.snapshot.snapshotId.includes("AUD-V37H4"), "snapshot linked");
  assert(foundation.releaseTrace.manifestId.includes("TRACE-V37H4"), "trace linked");
  assert(foundation.incident.incidentId.includes("INC-V37H4"), "incident linked");
  assert(foundation.evidence.bundleId.includes("EVD-V37H4"), "evidence linked");
  assert(foundation.snapshot.releasable, "releasable");
  assert(foundation.releaseTrace.releaseReady, "release ready");

  console.log("✓ production audit foundation");
  console.log(" ", foundation.summary);
}

function main() {
  testAuditSnapshot();
  testReleaseTraceManifest();
  testIncidentTrace();
  testVerificationEvidenceBundle();
  testAuditFoundation();
  console.log("\nAll production audit checks passed.");
}

main();
