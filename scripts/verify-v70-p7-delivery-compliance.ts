/**
 * V70 P7 — Delivery Compliance Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertDeliveryCompliancePass,
  buildDeliveryCompliance,
  COMPLIANCE_AUDIT_TRAIL_CATALOG,
  COMPLIANCE_EXCEPTION_CATALOG,
  COMPLIANCE_ITEM_CATALOG,
  COMPLIANCE_SIGNOFF_CATALOG,
  computeDeclarativeCompliancePass,
  formatDeliveryComplianceSummary,
  FREEZE_GATE_CATALOG,
  getComplianceItemById,
  getComplianceItemsByReleaseRef,
  getFreezeGateByItemRef,
  getSignoffByItemRef,
  isDeliveryComplianceRefsAligned,
  runDeliveryCompliance,
  V70_DELIVERY_COMPLIANCE_FREEZE_VERSION,
  V70_DELIVERY_COMPLIANCE_VERSION,
} from "../lib/delivery/v70/compliance.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v70-p7-delivery-compliance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/delivery/v70/delivery.compliance.ts",
    "lib/delivery/v70/compliance.checklist.ts",
    "lib/delivery/v70/compliance.builder.ts",
    "lib/delivery/v70/compliance.entry.ts",
    "docs/V70-P7-DELIVERY-COMPLIANCE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V70 delivery compliance module structure");
}

function testInventories() {
  check(COMPLIANCE_ITEM_CATALOG.length >= 6, "compliance item catalog");
  check(COMPLIANCE_EXCEPTION_CATALOG.length >= 6, "compliance exception catalog");
  check(COMPLIANCE_AUDIT_TRAIL_CATALOG.length >= 6, "compliance audit trail catalog");
  check(FREEZE_GATE_CATALOG.length >= 6, "freeze gate catalog");
  check(COMPLIANCE_SIGNOFF_CATALOG.length >= 6, "compliance signoff catalog");
  check(isDeliveryComplianceRefsAligned(), "delivery compliance refs aligned");
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
  const item = getComplianceItemById("DLV-CMP-001");
  check(item?.passed === true, "DLV-CMP-001 passed");
  check(item?.freezeGate === "DLV-CMP-GATE-001", "DLV-CMP-001 freeze gate");

  const releaseItems = getComplianceItemsByReleaseRef("DLV-REL-003");
  check(releaseItems.length >= 1, "DLV-REL-003 compliance items");

  const gate = getFreezeGateByItemRef("DLV-CMP-005");
  check(gate?.gateKind === "delivery-catalog", "DLV-CMP-005 freeze gate kind");

  const signoff = getSignoffByItemRef("DLV-CMP-001");
  check(signoff?.signoffStatus === "signed", "DLV-CMP-001 signoff signed");

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
  const incomplete = runDeliveryCompliance({
    deploymentId: DEPLOYMENT_ID,
    signals: { lifecycleManagementReady: false },
  });
  check(!incomplete.complianceReady, "incomplete lifecycle not ready");

  const ready = buildDeliveryCompliance({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V70_DELIVERY_COMPLIANCE_VERSION, "compliance version");
  check(ready.freezeVersion === V70_DELIVERY_COMPLIANCE_FREEZE_VERSION, "freeze version");
  check(ready.lifecycleManagementReady, "P6 lifecycle ready");
  check(ready.checklist.checklistComplete, "checklist complete");
  check(ready.exceptions.catalogComplete, "exceptions complete");
  check(ready.auditTrails.catalogComplete, "audit trails complete");
  check(ready.freezeGates.catalogComplete, "freeze gates complete");
  check(ready.signoffs.catalogComplete, "signoffs complete");
  check(ready.complianceReady, "compliance ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertDeliveryCompliancePass(ready);

  console.log("✓ delivery compliance report");
  console.log(formatDeliveryComplianceSummary(ready));
  console.log("\n✅ V70 P7 Delivery Compliance — verify PASS");
}

function main() {
  console.log("V70 P7 Delivery Compliance Verification\n");
  checkModuleStructure();
  testInventories();
  testComplianceFields();
  testComplianceQueries();
  testReport();
}

main();
