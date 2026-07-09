/**
 * V70 P7 — Delivery compliance entry (read-only)
 */
export {
  COMPLIANCE_AUDIT_TRAIL_CATALOG,
  COMPLIANCE_EXCEPTION_CATALOG,
  COMPLIANCE_ITEM_CATALOG,
  COMPLIANCE_SIGNOFF_CATALOG,
  FREEZE_GATE_CATALOG,
  buildComplianceAuditTrailManifest,
  buildComplianceChecklistManifest,
  buildComplianceExceptionManifest,
  buildComplianceSignoffManifest,
  buildFreezeGateManifest,
  computeDeclarativeCompliancePass,
  getComplianceItemById,
  getComplianceItemsByReleaseRef,
  getFreezeGateByItemRef,
  getSignoffByItemRef,
  isDeliveryComplianceRefsAligned,
} from "./compliance.checklist";
export { assertDeliveryCompliancePass, buildDeliveryCompliance } from "./compliance.builder";
export {
  V70_DELIVERY_COMPLIANCE_FREEZE_VERSION,
  V70_DELIVERY_COMPLIANCE_VERSION,
} from "./delivery.compliance";
export type {
  ComplianceAuditTrail,
  ComplianceException,
  ComplianceItem,
  ComplianceSignoff,
  DeliveryComplianceReport,
  DeliveryComplianceSignals,
  FreezeGate,
} from "./delivery.compliance";

import { buildDeliveryCompliance } from "./compliance.builder";
import type {
  DeliveryComplianceReport,
  DeliveryComplianceSignals,
} from "./delivery.compliance";

export function runDeliveryCompliance(input?: {
  deploymentId?: string;
  signals?: DeliveryComplianceSignals;
}): DeliveryComplianceReport {
  return buildDeliveryCompliance(input);
}

export function formatDeliveryComplianceSummary(
  report: DeliveryComplianceReport,
): string {
  const lines = [
    "V70 Delivery Compliance",
    `  ready: ${report.complianceReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  lifecycle-management: ${report.lifecycleManagementVersion} (ready=${report.lifecycleManagementReady})`,
    `  checklist items: ${report.checklist.itemCount}`,
    `  passed: ${report.checklist.passedCount}`,
    `  freeze gates: ${report.freezeGates.gateCount}`,
    `  signoffs: ${report.signoffs.entryCount}`,
  ];
  return lines.join("\n");
}
