/**
 * V73 P7 — Knowledge compliance entry (read-only)
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
  buildComplianceFreezeGateManifest,
  buildComplianceSignoffManifest,
  computeDeclarativeCompliancePass,
  getComplianceItemById,
  getComplianceItemsByKnowledgeRef,
  getFreezeGateByItemRef,
  getSignoffByItemRef,
  isKnowledgeComplianceRefsAligned,
} from "./compliance.checklist";
export {
  assertKnowledgeCompliancePass,
  buildKnowledgeCompliance,
} from "./compliance.builder";
export {
  V73_KNOWLEDGE_COMPLIANCE_FREEZE_VERSION,
  V73_KNOWLEDGE_COMPLIANCE_VERSION,
} from "./knowledge.compliance";
export type {
  AuditTrail,
  ComplianceItem,
  Evidence,
  Exception,
  Failed,
  FreezeGate,
  KnowledgeComplianceReport,
  KnowledgeComplianceSignals,
  Passed,
  Required,
  Review,
  Signoff,
} from "./knowledge.compliance";

import { buildKnowledgeCompliance } from "./compliance.builder";
import type {
  KnowledgeComplianceReport,
  KnowledgeComplianceSignals,
} from "./knowledge.compliance";

export function runKnowledgeCompliance(input?: {
  deploymentId?: string;
  signals?: KnowledgeComplianceSignals;
}): KnowledgeComplianceReport {
  return buildKnowledgeCompliance(input);
}

export function formatKnowledgeComplianceSummary(
  report: KnowledgeComplianceReport,
): string {
  const lines = [
    "V73 Knowledge Compliance",
    `  ready: ${report.complianceReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  knowledge-lifecycle: ${report.knowledgeLifecycleVersion} (ready=${report.knowledgeLifecycleReady})`,
    `  checklist items: ${report.checklist.itemCount}`,
    `  passed: ${report.checklist.passedCount}`,
    `  freeze gates: ${report.freezeGates.gateCount}`,
    `  signoffs: ${report.signoffs.entryCount}`,
  ];
  return lines.join("\n");
}
