/**
 * V72 P7 — Intelligence compliance builder (read-only)
 */
import {
  buildComplianceAuditTrailManifest,
  buildComplianceChecklistManifest,
  buildComplianceExceptionManifest,
  buildComplianceSignoffManifest,
  buildFreezeGateManifest,
  isIntelligenceComplianceRefsAligned,
} from "./compliance.checklist";
import type {
  IntelligenceComplianceReport,
  IntelligenceComplianceSignals,
} from "./intelligence.compliance";
import {
  V72_INTELLIGENCE_COMPLIANCE_FREEZE_VERSION,
  V72_INTELLIGENCE_COMPLIANCE_VERSION,
} from "./intelligence.compliance";
import { buildIntelligenceLifecycle } from "./lifecycle.builder";
import { V72_INTELLIGENCE_LIFECYCLE_VERSION } from "./lifecycle.management";

const DEFAULT_SIGNALS: IntelligenceComplianceSignals = {
  intelligenceLifecycleReady: true,
  checklistComplete: true,
  exceptionsComplete: true,
  auditTrailsComplete: true,
  freezeGatesComplete: true,
  signoffsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildIntelligenceCompliance(input?: {
  deploymentId?: string;
  signals?: IntelligenceComplianceSignals;
}): IntelligenceComplianceReport {
  const deploymentId = input?.deploymentId ?? "v72-intelligence-compliance-default";

  const intelligenceLifecycle = buildIntelligenceLifecycle({ deploymentId });
  const checklist = buildComplianceChecklistManifest();
  const exceptions = buildComplianceExceptionManifest();
  const auditTrails = buildComplianceAuditTrailManifest();
  const freezeGates = buildFreezeGateManifest();
  const signoffs = buildComplianceSignoffManifest();
  const refsAligned = isIntelligenceComplianceRefsAligned();

  const signals: IntelligenceComplianceSignals = {
    ...DEFAULT_SIGNALS,
    intelligenceLifecycleReady: intelligenceLifecycle.lifecycleReady,
    checklistComplete: checklist.checklistComplete,
    exceptionsComplete: exceptions.catalogComplete,
    auditTrailsComplete: auditTrails.catalogComplete,
    freezeGatesComplete: freezeGates.catalogComplete,
    signoffsComplete: signoffs.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V72_INTELLIGENCE_COMPLIANCE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const complianceReady =
    intelligenceLifecycle.lifecycleReady &&
    checklist.checklistComplete &&
    exceptions.catalogComplete &&
    auditTrails.catalogComplete &&
    freezeGates.catalogComplete &&
    signoffs.catalogComplete &&
    refsAligned &&
    signals.intelligenceLifecycleReady !== false;

  return {
    version: V72_INTELLIGENCE_COMPLIANCE_VERSION,
    freezeVersion: V72_INTELLIGENCE_COMPLIANCE_FREEZE_VERSION,
    reportId: `intelligence-compliance-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    intelligenceLifecycleVersion: V72_INTELLIGENCE_LIFECYCLE_VERSION,
    intelligenceLifecycleReady: intelligenceLifecycle.lifecycleReady,
    checklist,
    exceptions,
    auditTrails,
    freezeGates,
    signoffs,
    complianceReady,
    readinessScore: complianceReady ? 100 : 0,
    summary: [
      `intelligence-compliance ready=${complianceReady}`,
      `items=${checklist.itemCount}`,
      `passed=${checklist.passedCount}`,
      `exceptions=${exceptions.entryCount}`,
      `audits=${auditTrails.entryCount}`,
      `gates=${freezeGates.gateCount}`,
      `signoffs=${signoffs.entryCount}`,
      `refsAligned=${refsAligned}`,
      `lifecycle=${intelligenceLifecycle.lifecycleReady}`,
    ].join(" "),
  };
}

export function assertIntelligenceCompliancePass(
  report: IntelligenceComplianceReport,
): asserts report is IntelligenceComplianceReport & { complianceReady: true } {
  if (!report.complianceReady) {
    throw new Error(`V72 intelligence compliance not ready: ${report.summary}`);
  }
}
