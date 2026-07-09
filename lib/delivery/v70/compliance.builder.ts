/**
 * V70 P7 — Delivery compliance builder (read-only)
 */
import {
  buildComplianceAuditTrailManifest,
  buildComplianceChecklistManifest,
  buildComplianceExceptionManifest,
  buildComplianceSignoffManifest,
  buildFreezeGateManifest,
  isDeliveryComplianceRefsAligned,
} from "./compliance.checklist";
import type {
  DeliveryComplianceReport,
  DeliveryComplianceSignals,
} from "./delivery.compliance";
import {
  V70_DELIVERY_COMPLIANCE_FREEZE_VERSION,
  V70_DELIVERY_COMPLIANCE_VERSION,
} from "./delivery.compliance";
import { buildLifecycleManagement } from "./lifecycle.builder";
import { V70_LIFECYCLE_MANAGEMENT_VERSION } from "./lifecycle.management";

const DEFAULT_SIGNALS: DeliveryComplianceSignals = {
  lifecycleManagementReady: true,
  checklistComplete: true,
  exceptionsComplete: true,
  auditTrailsComplete: true,
  freezeGatesComplete: true,
  signoffsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildDeliveryCompliance(input?: {
  deploymentId?: string;
  signals?: DeliveryComplianceSignals;
}): DeliveryComplianceReport {
  const deploymentId = input?.deploymentId ?? "v70-delivery-compliance-default";

  const lifecycleManagement = buildLifecycleManagement({ deploymentId });
  const checklist = buildComplianceChecklistManifest();
  const exceptions = buildComplianceExceptionManifest();
  const auditTrails = buildComplianceAuditTrailManifest();
  const freezeGates = buildFreezeGateManifest();
  const signoffs = buildComplianceSignoffManifest();
  const refsAligned = isDeliveryComplianceRefsAligned();

  const signals: DeliveryComplianceSignals = {
    ...DEFAULT_SIGNALS,
    lifecycleManagementReady: lifecycleManagement.managementReady,
    checklistComplete: checklist.checklistComplete,
    exceptionsComplete: exceptions.catalogComplete,
    auditTrailsComplete: auditTrails.catalogComplete,
    freezeGatesComplete: freezeGates.catalogComplete,
    signoffsComplete: signoffs.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V70_DELIVERY_COMPLIANCE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const complianceReady =
    lifecycleManagement.managementReady &&
    checklist.checklistComplete &&
    exceptions.catalogComplete &&
    auditTrails.catalogComplete &&
    freezeGates.catalogComplete &&
    signoffs.catalogComplete &&
    refsAligned &&
    signals.lifecycleManagementReady !== false;

  return {
    version: V70_DELIVERY_COMPLIANCE_VERSION,
    freezeVersion: V70_DELIVERY_COMPLIANCE_FREEZE_VERSION,
    reportId: `delivery-compliance-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    lifecycleManagementVersion: V70_LIFECYCLE_MANAGEMENT_VERSION,
    lifecycleManagementReady: lifecycleManagement.managementReady,
    checklist,
    exceptions,
    auditTrails,
    freezeGates,
    signoffs,
    complianceReady,
    readinessScore: complianceReady ? 100 : 0,
    summary: [
      `delivery-compliance ready=${complianceReady}`,
      `items=${checklist.itemCount}`,
      `passed=${checklist.passedCount}`,
      `exceptions=${exceptions.entryCount}`,
      `audits=${auditTrails.entryCount}`,
      `gates=${freezeGates.gateCount}`,
      `signoffs=${signoffs.entryCount}`,
      `refsAligned=${refsAligned}`,
      `lifecycle=${lifecycleManagement.managementReady}`,
    ].join(" "),
  };
}

export function assertDeliveryCompliancePass(
  report: DeliveryComplianceReport,
): asserts report is DeliveryComplianceReport & { complianceReady: true } {
  if (!report.complianceReady) {
    throw new Error(`V70 delivery compliance not ready: ${report.summary}`);
  }
}
