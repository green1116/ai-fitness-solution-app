/**
 * V3.7-H6 Production Release Ledger & Evidence Export — smoke verification
 */
import { BUILD_FREEZE_MANIFEST } from "../lib/commercialization/stabilization/build-freeze";
import {
  PRODUCTION_RELEASE_LEDGER_VERSION,
  RELEASE_LEDGER_DTO_VERSION,
  RELEASE_LEDGER_VERSION,
  EVIDENCE_EXPORT_VERSION,
  buildProductionReleaseLedgerFoundation,
  buildReleaseLedgerDto,
  buildReleaseLedger,
  buildEvidenceExport,
  type ReleaseLedger,
  type EvidenceExport,
} from "../lib/commercialization/release-ledger";

const LEDGER_KEYS: (keyof ReleaseLedger)[] = [
  "version",
  "ledgerId",
  "capturedAt",
  "ledgerSummary",
  "releaseTrace",
  "readiness",
  "confidence",
  "incident",
  "verificationLineage",
  "evidenceBundle",
  "dto",
];

const EXPORT_KEYS: (keyof EvidenceExport)[] = [
  "version",
  "exportId",
  "auditEvidence",
  "buildEvidence",
  "verificationEvidence",
  "hardeningEvidence",
  "observabilityEvidence",
  "dashboardEvidence",
  "summary",
];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testReleaseLedgerDto() {
  const dto = buildReleaseLedgerDto({ deploymentId: "h6-dto" });
  assert(dto.version === RELEASE_LEDGER_DTO_VERSION, "dto version");
  assert(dto.releaseId.includes("RL-V37H6"), "release id");
  assert(dto.deploymentId === "h6-dto", "deployment id");
  assert(dto.buildStatus === "pass", "build pass");
  assert(dto.tscStatus === "pass", "tsc pass");
  assert(dto.verificationStatus === "pass", "verification pass");
  assert(dto.hardeningStatus === "pass", "hardening pass");
  assert(dto.observabilityStatus === "pass", "observability pass");
  assert(dto.dashboardStatus === "pass", "dashboard pass");
  assert(dto.auditStatus === "pass", "audit pass");
  assert(dto.releasable === true, "releasable");
  assert(dto.releaseReady === true, "release ready");
  assert(dto.confidenceScore >= 80, "confidence score");
  assert(dto.incidentLevel === "informational", "incident level");
  assert(dto.gateReason.length > 0, "gate reason");

  console.log("✓ release ledger DTO");
  console.log(" ", `releaseId=${dto.releaseId} releasable=${dto.releasable} gate=${dto.gateReason.slice(0, 60)}`);
}

function testReleaseLedger() {
  const ledger = buildReleaseLedger({ deploymentId: "h6-ledger" });
  assert(ledger.version === RELEASE_LEDGER_VERSION, "ledger version");
  assert(ledger.ledgerId.includes("LED-V37H6"), "ledger id");
  assert(ledger.ledgerSummary.length > 0, "ledger summary");
  assert(ledger.releaseTrace.manifestId.includes("TRACE-V37H4"), "release trace");
  assert(ledger.readiness.releaseReady, "readiness release ready");
  assert(ledger.confidence.confidenceScore >= 80, "confidence");
  assert(ledger.incident.incidentId.includes("INC-V37H4"), "incident");
  assert(ledger.verificationLineage.bundleId.includes("EVD-V37H4"), "verification lineage");
  assert(ledger.evidenceBundle.buildEvidence.includes("BuildFreeze"), "evidence bundle");
  assert(ledger.dto.releaseId.includes("RL-V37H6"), "dto linked");

  for (const key of LEDGER_KEYS) {
    assert(key in ledger, `ledger shape missing ${key}`);
  }

  console.log("✓ release ledger");
  console.log(" ", ledger.ledgerSummary);
}

function testEvidenceExport() {
  const exp = buildEvidenceExport({ deploymentId: "h6-export" });
  assert(exp.version === EVIDENCE_EXPORT_VERSION, "export version");
  assert(exp.exportId.includes("EXP-V37H6"), "export id");
  assert(exp.auditEvidence.includes("audit-snapshot"), "audit evidence");
  assert(exp.buildEvidence.includes("BuildFreeze"), "build evidence");
  assert(exp.verificationEvidence.includes("runtimeVerified"), "verification evidence");
  assert(exp.hardeningEvidence.includes("production-hardening"), "hardening evidence");
  assert(exp.observabilityEvidence.includes("production-observability"), "observability evidence");
  assert(exp.dashboardEvidence.includes("production-dashboard"), "dashboard evidence");

  for (const key of EXPORT_KEYS) {
    assert(key in exp, `export shape missing ${key}`);
  }

  console.log("✓ evidence export");
  console.log(" ", exp.summary);
}

function testReleaseTraceSummary() {
  const ledger = buildReleaseLedger({ deploymentId: "h6-trace" });
  const trace = ledger.releaseTrace;
  assert(trace.BUILD_FREEZE_VERSION.length > 0, "freeze version");
  assert(trace.buildPassed === BUILD_FREEZE_MANIFEST.buildPassed, "build passed");
  assert(trace.tscPassed === BUILD_FREEZE_MANIFEST.tscPassed, "tsc passed");
  assert(trace.verificationPassed, "verification passed");
  assert(trace.releaseReady, "release ready");

  console.log("✓ release trace summary");
  console.log(" ", `manifest=${trace.manifestId} releaseReady=${trace.releaseReady}`);
}

function testReadinessConfidenceIncident() {
  const ledger = buildReleaseLedger({ deploymentId: "h6-readiness" });
  assert(ledger.readiness.releasable, "releasable");
  assert(ledger.readiness.hardeningReady, "hardening ready");
  assert(ledger.readiness.observabilityReady, "observability ready");
  assert(ledger.readiness.dashboardReady, "dashboard ready");
  assert(!ledger.readiness.blocked, "not blocked");
  assert(ledger.confidence.readinessScore >= 80, "readiness score");
  assert(ledger.incident.gateReason.length > 0, "gate reason on incident");
  assert(ledger.incident.resolutionState === "not-applicable", "resolution state");

  console.log("✓ readiness / confidence / incident aggregation");
  console.log(
    " ",
    `confidence=${ledger.confidence.confidenceScore} incident=${ledger.incident.incidentLevel}`,
  );
}

function testFoundation() {
  const foundation = buildProductionReleaseLedgerFoundation({ deploymentId: "h6-foundation" });
  assert(foundation.version === PRODUCTION_RELEASE_LEDGER_VERSION, "foundation version");
  assert(foundation.foundationId.includes("PRL-V37H6"), "foundation id");
  assert(foundation.dto.releasable, "dto releasable");
  assert(foundation.ledger.readiness.releaseReady, "ledger ready");
  assert(foundation.evidenceExport.exportId.includes("EXP-V37H6"), "export linked");

  console.log("✓ production release ledger foundation");
  console.log(" ", foundation.summary);
}

function main() {
  testReleaseLedgerDto();
  testReleaseLedger();
  testEvidenceExport();
  testReleaseTraceSummary();
  testReadinessConfidenceIncident();
  testFoundation();
  console.log("\nAll production release ledger checks passed.");
}

main();
