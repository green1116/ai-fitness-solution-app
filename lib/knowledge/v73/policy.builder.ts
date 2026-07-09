/**
 * V73 P3 — Knowledge policy builder (read-only)
 */
import { buildKnowledgeDependency } from "./dependency.builder";
import { V73_KNOWLEDGE_DEPENDENCY_VERSION } from "./knowledge.dependency";
import {
  buildAuditTrailManifest,
  buildPolicyExceptionManifest,
  buildPolicyRuleManifest,
  buildRequiredCheckManifest,
  isKnowledgePolicyRefsAligned,
} from "./policy.rules";
import type { KnowledgePolicyReport, KnowledgePolicySignals } from "./knowledge.policy";
import {
  V73_KNOWLEDGE_POLICY_FREEZE_VERSION,
  V73_KNOWLEDGE_POLICY_VERSION,
} from "./knowledge.policy";

const DEFAULT_SIGNALS: KnowledgePolicySignals = {
  knowledgeDependencyReady: true,
  rulesComplete: true,
  checksComplete: true,
  exceptionsComplete: true,
  auditTrailsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildKnowledgePolicy(input?: {
  deploymentId?: string;
  signals?: KnowledgePolicySignals;
}): KnowledgePolicyReport {
  const deploymentId = input?.deploymentId ?? "v73-knowledge-policy-default";

  const knowledgeDependency = buildKnowledgeDependency({ deploymentId });
  const rules = buildPolicyRuleManifest();
  const requiredChecks = buildRequiredCheckManifest();
  const exceptions = buildPolicyExceptionManifest();
  const auditTrails = buildAuditTrailManifest();
  const refsAligned = isKnowledgePolicyRefsAligned();

  const signals: KnowledgePolicySignals = {
    ...DEFAULT_SIGNALS,
    knowledgeDependencyReady: knowledgeDependency.dependencyReady,
    rulesComplete: rules.catalogComplete,
    checksComplete: requiredChecks.catalogComplete,
    exceptionsComplete: exceptions.catalogComplete,
    auditTrailsComplete: auditTrails.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V73_KNOWLEDGE_POLICY_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const policyReady =
    knowledgeDependency.dependencyReady &&
    rules.catalogComplete &&
    requiredChecks.catalogComplete &&
    exceptions.catalogComplete &&
    auditTrails.catalogComplete &&
    refsAligned &&
    signals.knowledgeDependencyReady !== false;

  return {
    version: V73_KNOWLEDGE_POLICY_VERSION,
    freezeVersion: V73_KNOWLEDGE_POLICY_FREEZE_VERSION,
    reportId: `knowledge-policy-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    knowledgeDependencyVersion: V73_KNOWLEDGE_DEPENDENCY_VERSION,
    knowledgeDependencyReady: knowledgeDependency.dependencyReady,
    rules,
    requiredChecks,
    exceptions,
    auditTrails,
    policyReady,
    readinessScore: policyReady ? 100 : 0,
    summary: [
      `knowledge-policy ready=${policyReady}`,
      `rules=${rules.ruleCount}`,
      `checks=${requiredChecks.entryCount}`,
      `exceptions=${exceptions.entryCount}`,
      `audits=${auditTrails.entryCount}`,
      `refsAligned=${refsAligned}`,
      `dependency=${knowledgeDependency.dependencyReady}`,
    ].join(" "),
  };
}

export function assertKnowledgePolicyPass(
  report: KnowledgePolicyReport,
): asserts report is KnowledgePolicyReport & { policyReady: true } {
  if (!report.policyReady) {
    throw new Error(`V73 knowledge policy not ready: ${report.summary}`);
  }
}
