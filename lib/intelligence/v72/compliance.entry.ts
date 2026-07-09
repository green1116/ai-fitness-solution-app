/**
 * V72 P7 — Intelligence compliance entry (read-only)
 */
export {
  COMPLIANCE_AUDIT_TRAIL_CATALOG,
  COMPLIANCE_EXCEPTION_CATALOG,
  COMPLIANCE_FREEZE_GATE_CATALOG,
  COMPLIANCE_ITEM_CATALOG,
  COMPLIANCE_SIGNOFF_CATALOG,
  buildComplianceAuditTrailManifest,
  buildComplianceChecklistManifest,
  buildComplianceExceptionManifest,
  buildComplianceSignoffManifest,
  buildFreezeGateManifest,
  computeDeclarativeCompliancePass,
  getComplianceItemById,
  getComplianceItemsByIntelligenceRef,
  getFreezeGateByItemRef,
  getSignoffByItemRef,
  isIntelligenceComplianceRefsAligned,
} from "./compliance.checklist";
export {
  assertIntelligenceCompliancePass,
  buildIntelligenceCompliance,
} from "./compliance.builder";
export {
  V72_INTELLIGENCE_COMPLIANCE_FREEZE_VERSION,
  V72_INTELLIGENCE_COMPLIANCE_VERSION,
} from "./intelligence.compliance";
export type {
  AuditTrail,
  ComplianceItem,
  Exception,
  FreezeGate,
  IntelligenceComplianceReport,
  IntelligenceComplianceSignals,
  Signoff,
} from "./intelligence.compliance";

import { buildIntelligenceCompliance } from "./compliance.builder";
import type {
  IntelligenceComplianceReport,
  IntelligenceComplianceSignals,
} from "./intelligence.compliance";

export function runIntelligenceCompliance(input?: {
  deploymentId?: string;
  signals?: IntelligenceComplianceSignals;
}): IntelligenceComplianceReport {
  return buildIntelligenceCompliance(input);
}

export function formatIntelligenceComplianceSummary(
  report: IntelligenceComplianceReport,
): string {
  const lines = [
    "V72 Intelligence Compliance",
    `  ready: ${report.complianceReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  intelligence-lifecycle: ${report.intelligenceLifecycleVersion} (ready=${report.intelligenceLifecycleReady})`,
    `  checklist items: ${report.checklist.itemCount}`,
    `  passed: ${report.checklist.passedCount}`,
    `  freeze gates: ${report.freezeGates.gateCount}`,
    `  signoffs: ${report.signoffs.entryCount}`,
  ];
  return lines.join("\n");
}
