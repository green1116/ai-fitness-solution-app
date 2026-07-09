/**
 * V73 P7 — Knowledge compliance builder (read-only)
 */
import {
  buildComplianceAuditTrailManifest,
  buildComplianceChecklistManifest,
  buildComplianceExceptionManifest,
  buildComplianceFreezeGateManifest,
  buildComplianceSignoffManifest,
  isKnowledgeComplianceRefsAligned,
} from "./compliance.checklist";
import type {
  KnowledgeComplianceReport,
  KnowledgeComplianceSignals,
} from "./knowledge.compliance";
import {
  V73_KNOWLEDGE_COMPLIANCE_FREEZE_VERSION,
  V73_KNOWLEDGE_COMPLIANCE_VERSION,
} from "./knowledge.compliance";
import { buildKnowledgeLifecycle } from "./lifecycle.builder";
import { V73_KNOWLEDGE_LIFECYCLE_VERSION } from "./lifecycle.management";

const DEFAULT_SIGNALS: KnowledgeComplianceSignals = {
  knowledgeLifecycleReady: true,
  checklistComplete: true,
  exceptionsComplete: true,
  auditTrailsComplete: true,
  freezeGatesComplete: true,
  signoffsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildKnowledgeCompliance(input?: {
  deploymentId?: string;
  signals?: KnowledgeComplianceSignals;
}): KnowledgeComplianceReport {
  const deploymentId = input?.deploymentId ?? "v73-knowledge-compliance-default";

  const knowledgeLifecycle = buildKnowledgeLifecycle({ deploymentId });
  const checklist = buildComplianceChecklistManifest();
  const exceptions = buildComplianceExceptionManifest();
  const auditTrails = buildComplianceAuditTrailManifest();
  const freezeGates = buildComplianceFreezeGateManifest();
  const signoffs = buildComplianceSignoffManifest();
  const refsAligned = isKnowledgeComplianceRefsAligned();

  const signals: KnowledgeComplianceSignals = {
    ...DEFAULT_SIGNALS,
    knowledgeLifecycleReady: knowledgeLifecycle.lifecycleReady,
    checklistComplete: checklist.checklistComplete,
    exceptionsComplete: exceptions.catalogComplete,
    auditTrailsComplete: auditTrails.catalogComplete,
    freezeGatesComplete: freezeGates.catalogComplete,
    signoffsComplete: signoffs.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V73_KNOWLEDGE_COMPLIANCE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const complianceReady =
    knowledgeLifecycle.lifecycleReady &&
    checklist.checklistComplete &&
    exceptions.catalogComplete &&
    auditTrails.catalogComplete &&
    freezeGates.catalogComplete &&
    signoffs.catalogComplete &&
    refsAligned &&
    signals.knowledgeLifecycleReady !== false;

  return {
    version: V73_KNOWLEDGE_COMPLIANCE_VERSION,
    freezeVersion: V73_KNOWLEDGE_COMPLIANCE_FREEZE_VERSION,
    reportId: `knowledge-compliance-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    knowledgeLifecycleVersion: V73_KNOWLEDGE_LIFECYCLE_VERSION,
    knowledgeLifecycleReady: knowledgeLifecycle.lifecycleReady,
    checklist,
    exceptions,
    auditTrails,
    freezeGates,
    signoffs,
    complianceReady,
    readinessScore: complianceReady ? 100 : 0,
    summary: [
      `knowledge-compliance ready=${complianceReady}`,
      `items=${checklist.itemCount}`,
      `passed=${checklist.passedCount}`,
      `exceptions=${exceptions.entryCount}`,
      `audits=${auditTrails.entryCount}`,
      `gates=${freezeGates.gateCount}`,
      `signoffs=${signoffs.entryCount}`,
      `refsAligned=${refsAligned}`,
      `lifecycle=${knowledgeLifecycle.lifecycleReady}`,
    ].join(" "),
  };
}

export function assertKnowledgeCompliancePass(
  report: KnowledgeComplianceReport,
): asserts report is KnowledgeComplianceReport & { complianceReady: true } {
  if (!report.complianceReady) {
    throw new Error(`V73 knowledge compliance not ready: ${report.summary}`);
  }
}
