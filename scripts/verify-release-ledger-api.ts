/**
 * V3.7-H7 Release Ledger API & Evidence Export — smoke verification
 */
import {
  RELEASE_LEDGER_VERSION,
  EVIDENCE_EXPORT_VERSION,
  buildReleaseLedger,
  buildEvidenceExport,
  buildProductionReleaseLedgerFoundation,
  type ReleaseLedger,
  type EvidenceExport,
} from "../lib/commercialization/release-ledger";

const RELEASE_LEDGER_API_KEYS: (keyof ReleaseLedger)[] = [
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

const EVIDENCE_EXPORT_API_KEYS: (keyof EvidenceExport)[] = [
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

const RELEASE_LEDGER_PAGE_FIELDS = [
  "releaseReady",
  "incidentLevel",
  "confidenceScore",
  "gateReason",
  "BUILD_FREEZE_VERSION",
] as const;

const EVIDENCE_EXPORT_PAGE_FIELDS = [
  "buildEvidence",
  "tscEvidence",
  "verificationEvidence",
  "hardeningEvidence",
  "observabilityEvidence",
  "dashboardEvidence",
  "auditEvidence",
  "ledgerSummary",
] as const;

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testReleaseLedgerApiShape() {
  const ledger = buildReleaseLedger({ deploymentId: "h7-ledger-api" });
  assert(ledger.version === RELEASE_LEDGER_VERSION, "ledger version");
  for (const key of RELEASE_LEDGER_API_KEYS) {
    assert(key in ledger, `release ledger API missing ${key}`);
  }
  assert(ledger.dto.releaseReady, "release ready");
  assert(ledger.dto.gateReason.length > 0, "gate reason");
  assert(ledger.releaseTrace.AUDIT_VERSION.length > 0, "audit version");

  console.log("✓ release ledger API shape");
  console.log(" ", `endpoint=GET /api/commercialization/release-ledger ledgerId=${ledger.ledgerId}`);
}

function testEvidenceExportApiShape() {
  const exp = buildEvidenceExport({ deploymentId: "h7-export-api" });
  assert(exp.version === EVIDENCE_EXPORT_VERSION, "export version");
  for (const key of EVIDENCE_EXPORT_API_KEYS) {
    assert(key in exp, `evidence export API missing ${key}`);
  }
  assert(exp.buildEvidence.includes("BuildFreeze"), "build evidence");
  assert(exp.auditEvidence.includes("audit-snapshot"), "audit evidence");

  console.log("✓ evidence export API shape");
  console.log(" ", `endpoint=GET /api/commercialization/evidence-export exportId=${exp.exportId}`);
}

function testReleaseLedgerPageShape() {
  const ledger = buildReleaseLedger({ deploymentId: "h7-ledger-page" });
  const dto = ledger.dto;
  const trace = ledger.releaseTrace;

  const pageData: Record<(typeof RELEASE_LEDGER_PAGE_FIELDS)[number], unknown> = {
    releaseReady: dto.releaseReady,
    incidentLevel: dto.incidentLevel,
    confidenceScore: dto.confidenceScore,
    gateReason: dto.gateReason,
    BUILD_FREEZE_VERSION: trace.BUILD_FREEZE_VERSION,
  };

  for (const field of RELEASE_LEDGER_PAGE_FIELDS) {
    assert(field in pageData, `release ledger page missing ${field}`);
    assert(pageData[field] !== undefined && pageData[field] !== "", `page field empty: ${field}`);
  }
  assert(dto.releaseReady === true, "page release ready");
  assert(dto.confidenceScore >= 80, "page confidence");

  console.log("✓ release ledger page shape");
  console.log(
    " ",
    `route=/dashboard/release-ledger releaseReady=${dto.releaseReady} incident=${dto.incidentLevel}`,
  );
}

function testEvidenceExportPageShape() {
  const foundation = buildProductionReleaseLedgerFoundation({ deploymentId: "h7-export-page" });
  const exp = foundation.evidenceExport;
  const lineage = foundation.ledger.verificationLineage;

  const pageData: Record<(typeof EVIDENCE_EXPORT_PAGE_FIELDS)[number], string> = {
    buildEvidence: exp.buildEvidence,
    tscEvidence: lineage.tscEvidence,
    verificationEvidence: exp.verificationEvidence,
    hardeningEvidence: exp.hardeningEvidence,
    observabilityEvidence: exp.observabilityEvidence,
    dashboardEvidence: exp.dashboardEvidence,
    auditEvidence: exp.auditEvidence,
    ledgerSummary: foundation.ledger.ledgerSummary,
  };

  for (const field of EVIDENCE_EXPORT_PAGE_FIELDS) {
    assert(field in pageData, `evidence export page missing ${field}`);
    assert(pageData[field].length > 0, `page field empty: ${field}`);
  }
  assert(pageData.tscEvidence.includes("tscPassed"), "tsc evidence");
  assert(pageData.ledgerSummary.includes("release-ledger"), "ledger summary");

  console.log("✓ evidence export page shape");
  console.log(" ", `route=/dashboard/evidence-export exportId=${exp.exportId}`);
}

function main() {
  testReleaseLedgerApiShape();
  testEvidenceExportApiShape();
  testReleaseLedgerPageShape();
  testEvidenceExportPageShape();
  console.log("\nAll release ledger API checks passed.");
}

main();
