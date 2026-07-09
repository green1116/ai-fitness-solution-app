/**
 * V72 P7 — Intelligence Compliance Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertIntelligenceCompliancePass,
  buildIntelligenceCompliance,
  COMPLIANCE_AUDIT_TRAIL_CATALOG,
  COMPLIANCE_EXCEPTION_CATALOG,
  COMPLIANCE_FREEZE_GATE_CATALOG,
  COMPLIANCE_ITEM_CATALOG,
  COMPLIANCE_SIGNOFF_CATALOG,
  computeDeclarativeCompliancePass,
  formatIntelligenceComplianceSummary,
  getComplianceItemById,
  getComplianceItemsByIntelligenceRef,
  getFreezeGateByItemRef,
  getSignoffByItemRef,
  isIntelligenceComplianceRefsAligned,
  runIntelligenceCompliance,
  V72_INTELLIGENCE_COMPLIANCE_FREEZE_VERSION,
  V72_INTELLIGENCE_COMPLIANCE_VERSION,
} from "../lib/intelligence/v72/compliance.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v72-p7-intelligence-compliance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/intelligence/v72/intelligence.compliance.ts",
    "lib/intelligence/v72/compliance.checklist.ts",
    "lib/intelligence/v72/compliance.builder.ts",
    "lib/intelligence/v72/compliance.entry.ts",
    "docs/V72-P7-INTELLIGENCE-COMPLIANCE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V72 intelligence compliance module structure");
}

function testInventories() {
  check(COMPLIANCE_ITEM_CATALOG.length >= 6, "compliance item catalog");
  check(COMPLIANCE_EXCEPTION_CATALOG.length >= 6, "compliance exception catalog");
  check(COMPLIANCE_AUDIT_TRAIL_CATALOG.length >= 6, "compliance audit trail catalog");
  check(COMPLIANCE_FREEZE_GATE_CATALOG.length >= 6, "freeze gate catalog");
  check(COMPLIANCE_SIGNOFF_CATALOG.length >= 6, "compliance signoff catalog");
  check(isIntelligenceComplianceRefsAligned(), "intelligence compliance refs aligned");
  console.log("✓ checklist, exceptions, audits, gates, signoffs & alignment");
}

function testComplianceFields() {
  for (const item of COMPLIANCE_ITEM_CATALOG) {
    check(typeof item.required === "boolean", `${item.id} required`);
    check(typeof item.passed === "boolean", `${item.id} passed`);
    check(typeof item.failed === "boolean", `${item.id} failed`);
    check(item.passed !== item.failed, `${item.id} passed/failed exclusive`);
    check(item.evidence.length > 0, `${item.id} evidence`);
    check(item.review.length > 0, `${item.id} review`);
    check(item.exception.length > 0, `${item.id} exception`);
    check(item.auditTrail.length > 0, `${item.id} auditTrail`);
    check(item.freezeGate.length > 0, `${item.id} freezeGate`);
    check(item.signoff.length > 0, `${item.id} signoff`);
  }
  console.log("✓ compliance field coverage");
}

function testComplianceQueries() {
  const item = getComplianceItemById("INT-CMP-001");
  check(item?.passed === true, "INT-CMP-001 passed");
  check(item?.freezeGate === "INT-CMP-GATE-001", "INT-CMP-001 freeze gate");

  const intelligenceItems = getComplianceItemsByIntelligenceRef("INT-003");
  check(intelligenceItems.length >= 1, "INT-003 compliance items");

  const gate = getFreezeGateByItemRef("INT-CMP-005");
  check(gate?.gateKind === "intelligence-governance", "INT-CMP-005 freeze gate kind");

  const signoff = getSignoffByItemRef("INT-CMP-001");
  check(signoff?.signoffStatus === "signed", "INT-CMP-001 signoff signed");

  check(
    computeDeclarativeCompliancePass({ required: true, passed: true, failed: false }),
    "compliance pass required",
  );
  check(
    !computeDeclarativeCompliancePass({ required: true, passed: false, failed: true }),
    "compliance fail required",
  );

  console.log("✓ compliance queries");
}

function testReport() {
  const incomplete = runIntelligenceCompliance({
    deploymentId: DEPLOYMENT_ID,
    signals: { intelligenceLifecycleReady: false },
  });
  check(!incomplete.complianceReady, "incomplete lifecycle not ready");

  const ready = buildIntelligenceCompliance({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V72_INTELLIGENCE_COMPLIANCE_VERSION, "compliance version");
  check(ready.freezeVersion === V72_INTELLIGENCE_COMPLIANCE_FREEZE_VERSION, "freeze version");
  check(ready.intelligenceLifecycleReady, "P6 lifecycle ready");
  check(ready.checklist.checklistComplete, "checklist complete");
  check(ready.exceptions.catalogComplete, "exceptions complete");
  check(ready.auditTrails.catalogComplete, "audit trails complete");
  check(ready.freezeGates.catalogComplete, "freeze gates complete");
  check(ready.signoffs.catalogComplete, "signoffs complete");
  check(ready.complianceReady, "compliance ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertIntelligenceCompliancePass(ready);

  console.log("✓ intelligence compliance report");
  console.log(formatIntelligenceComplianceSummary(ready));
  console.log("\n✅ V72 P7 Intelligence Compliance — verify PASS");
}

function main() {
  console.log("V72 P7 Intelligence Compliance Verification\n");
  checkModuleStructure();
  testInventories();
  testComplianceFields();
  testComplianceQueries();
  testReport();
}

main();
