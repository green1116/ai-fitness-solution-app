/**
 * V73 P5 — Knowledge governance entry (read-only)
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
  isKnowledgeGovernanceRefsAligned,
} from "./governance.rules";
export {
  assertKnowledgeGovernancePass,
  buildKnowledgeGovernance,
} from "./governance.builder";
export {
  V73_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION,
  V73_KNOWLEDGE_GOVERNANCE_VERSION,
} from "./knowledge.governance";
export type {
  Approval,
  AuditTrail,
  Escalation,
  Exception,
  FreezeGate,
  GovernanceRule,
  GovernanceScope,
  KnowledgeGovernanceReport,
  KnowledgeGovernanceSignals,
  Review,
  RiskLevel,
  Signoff,
} from "./knowledge.governance";

import { buildKnowledgeGovernance } from "./governance.builder";
import type {
  KnowledgeGovernanceReport,
  KnowledgeGovernanceSignals,
} from "./knowledge.governance";

export function runKnowledgeGovernance(input?: {
  deploymentId?: string;
  signals?: KnowledgeGovernanceSignals;
}): KnowledgeGovernanceReport {
  return buildKnowledgeGovernance(input);
}

export function formatKnowledgeGovernanceSummary(
  report: KnowledgeGovernanceReport,
): string {
  const lines = [
    "V73 Knowledge Governance",
    `  ready: ${report.governanceReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  knowledge-compatibility: ${report.knowledgeCompatibilityVersion} (ready=${report.knowledgeCompatibilityReady})`,
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
