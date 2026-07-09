/**
 * V72 P5 — Intelligence governance entry (read-only)
 */
export {
  ESCALATION_CATALOG,
  FREEZE_GATE_CATALOG,
  GOVERNANCE_AUDIT_TRAIL_CATALOG,
  GOVERNANCE_EXCEPTION_CATALOG,
  GOVERNANCE_RULE_CATALOG,
  REVIEW_CATALOG,
  SIGNOFF_CATALOG,
  buildEscalationManifest,
  buildFreezeGateManifest,
  buildGovernanceAuditTrailManifest,
  buildGovernanceExceptionManifest,
  buildGovernanceRuleManifest,
  buildReviewManifest,
  buildSignoffManifest,
  computeDeclarativeGovernanceRiskBlock,
  getAuditTrailByRuleRef,
  getEscalationByRuleRef,
  getExceptionByRuleRef,
  getFreezeGateByRuleRef,
  getGovernanceRuleById,
  getGovernanceRulesByRiskLevel,
  getGovernanceRulesByScope,
  getReviewByRuleRef,
  getSignoffByRuleRef,
  isIntelligenceGovernanceRefsAligned,
} from "./governance.rules";
export {
  assertIntelligenceGovernancePass,
  buildIntelligenceGovernance,
} from "./governance.builder";
export {
  V72_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION,
  V72_INTELLIGENCE_GOVERNANCE_VERSION,
} from "./intelligence.governance";
export type {
  Approval,
  AuditTrail,
  Escalation,
  Exception,
  FreezeGate,
  GovernanceRule,
  GovernanceScope,
  IntelligenceGovernanceReport,
  IntelligenceGovernanceSignals,
  Review,
  RiskLevel,
  Signoff,
} from "./intelligence.governance";

import { buildIntelligenceGovernance } from "./governance.builder";
import type {
  IntelligenceGovernanceReport,
  IntelligenceGovernanceSignals,
} from "./intelligence.governance";

export function runIntelligenceGovernance(input?: {
  deploymentId?: string;
  signals?: IntelligenceGovernanceSignals;
}): IntelligenceGovernanceReport {
  return buildIntelligenceGovernance(input);
}

export function formatIntelligenceGovernanceSummary(
  report: IntelligenceGovernanceReport,
): string {
  const lines = [
    "V72 Intelligence Governance",
    `  ready: ${report.governanceReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  intelligence-compatibility: ${report.intelligenceCompatibilityVersion} (ready=${report.intelligenceCompatibilityReady})`,
    `  governance rules: ${report.rules.ruleCount}`,
    `  reviews: ${report.reviews.entryCount}`,
    `  exceptions: ${report.exceptions.entryCount}`,
    `  escalations: ${report.escalations.entryCount}`,
    `  audit trails: ${report.auditTrails.entryCount}`,
    `  freeze gates: ${report.freezeGates.entryCount}`,
    `  signoffs: ${report.signoffs.entryCount}`,
  ];
  return lines.join("\n");
}
