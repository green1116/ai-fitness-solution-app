/**
 * V73 P3 — Knowledge policy entry (read-only)
 */
export {
  AUDIT_TRAIL_CATALOG,
  POLICY_EXCEPTION_CATALOG,
  POLICY_RULE_CATALOG,
  REQUIRED_CHECK_CATALOG,
  buildAuditTrailManifest,
  buildPolicyExceptionManifest,
  buildPolicyRuleManifest,
  buildRequiredCheckManifest,
  computeDeclarativeEnforcementBlock,
  getAuditTrailByRuleRef,
  getExceptionByRuleRef,
  getPolicyRuleById,
  getPolicyRulesByScope,
  getRequiredCheckByRuleRef,
  isKnowledgePolicyRefsAligned,
} from "./policy.rules";
export { assertKnowledgePolicyPass, buildKnowledgePolicy } from "./policy.builder";
export {
  V73_KNOWLEDGE_POLICY_FREEZE_VERSION,
  V73_KNOWLEDGE_POLICY_VERSION,
} from "./knowledge.policy";
export type {
  AuditTrail,
  Exception,
  KnowledgePolicyReport,
  KnowledgePolicySignals,
  PolicyConstraint,
  PolicyRule,
  PolicyScope,
  RequiredCheck,
} from "./knowledge.policy";

import { buildKnowledgePolicy } from "./policy.builder";
import type { KnowledgePolicyReport, KnowledgePolicySignals } from "./knowledge.policy";

export function runKnowledgePolicy(input?: {
  deploymentId?: string;
  signals?: KnowledgePolicySignals;
}): KnowledgePolicyReport {
  return buildKnowledgePolicy(input);
}

export function formatKnowledgePolicySummary(report: KnowledgePolicyReport): string {
  const lines = [
    "V73 Knowledge Policy",
    `  ready: ${report.policyReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  knowledge-dependency: ${report.knowledgeDependencyVersion} (ready=${report.knowledgeDependencyReady})`,
    `  rules: ${report.rules.ruleCount}`,
    `  required checks: ${report.requiredChecks.entryCount}`,
    `  exceptions: ${report.exceptions.entryCount}`,
    `  audit trails: ${report.auditTrails.entryCount}`,
  ];
  return lines.join("\n");
}
