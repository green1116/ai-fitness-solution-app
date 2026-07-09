/**
 * V73 P5 — Knowledge governance builder (read-only)
 */
import { buildKnowledgeCompatibility } from "./compatibility.builder";
import { V73_KNOWLEDGE_COMPATIBILITY_VERSION } from "./knowledge.compatibility";
import {
  buildEscalationManifest,
  buildFreezeGateManifest,
  buildGovernanceAuditTrailManifest,
  buildGovernanceExceptionManifest,
  buildGovernanceRuleManifest,
  buildReviewManifest,
  buildSignoffManifest,
  isKnowledgeGovernanceRefsAligned,
} from "./governance.rules";
import type {
  KnowledgeGovernanceReport,
  KnowledgeGovernanceSignals,
} from "./knowledge.governance";
import {
  V73_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION,
  V73_KNOWLEDGE_GOVERNANCE_VERSION,
} from "./knowledge.governance";

const DEFAULT_SIGNALS: KnowledgeGovernanceSignals = {
  knowledgeCompatibilityReady: true,
  rulesComplete: true,
  reviewsComplete: true,
  exceptionsComplete: true,
  escalationsComplete: true,
  auditTrailsComplete: true,
  freezeGatesComplete: true,
  signoffsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildKnowledgeGovernance(input?: {
  deploymentId?: string;
  signals?: KnowledgeGovernanceSignals;
}): KnowledgeGovernanceReport {
  const deploymentId = input?.deploymentId ?? "v73-knowledge-governance-default";

  const knowledgeCompatibility = buildKnowledgeCompatibility({ deploymentId });
  const rules = buildGovernanceRuleManifest();
  const reviews = buildReviewManifest();
  const exceptions = buildGovernanceExceptionManifest();
  const escalations = buildEscalationManifest();
  const auditTrails = buildGovernanceAuditTrailManifest();
  const freezeGates = buildFreezeGateManifest();
  const signoffs = buildSignoffManifest();
  const refsAligned = isKnowledgeGovernanceRefsAligned();

  const signals: KnowledgeGovernanceSignals = {
    ...DEFAULT_SIGNALS,
    knowledgeCompatibilityReady: knowledgeCompatibility.compatibilityReady,
    rulesComplete: rules.catalogComplete,
    reviewsComplete: reviews.catalogComplete,
    exceptionsComplete: exceptions.catalogComplete,
    escalationsComplete: escalations.catalogComplete,
    auditTrailsComplete: auditTrails.catalogComplete,
    freezeGatesComplete: freezeGates.catalogComplete,
    signoffsComplete: signoffs.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V73_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const governanceReady =
    knowledgeCompatibility.compatibilityReady &&
    rules.catalogComplete &&
    reviews.catalogComplete &&
    exceptions.catalogComplete &&
    escalations.catalogComplete &&
    auditTrails.catalogComplete &&
    freezeGates.catalogComplete &&
    signoffs.catalogComplete &&
    refsAligned &&
    signals.knowledgeCompatibilityReady !== false;

  return {
    version: V73_KNOWLEDGE_GOVERNANCE_VERSION,
    freezeVersion: V73_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION,
    reportId: `knowledge-governance-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    knowledgeCompatibilityVersion: V73_KNOWLEDGE_COMPATIBILITY_VERSION,
    knowledgeCompatibilityReady: knowledgeCompatibility.compatibilityReady,
    rules,
    reviews,
    exceptions,
    escalations,
    auditTrails,
    freezeGates,
    signoffs,
    governanceReady,
    readinessScore: governanceReady ? 100 : 0,
    summary: [
      `knowledge-governance ready=${governanceReady}`,
      `rules=${rules.ruleCount}`,
      `reviews=${reviews.entryCount}`,
      `exceptions=${exceptions.entryCount}`,
      `escalations=${escalations.entryCount}`,
      `audits=${auditTrails.entryCount}`,
      `freezeGates=${freezeGates.entryCount}`,
      `signoffs=${signoffs.entryCount}`,
      `refsAligned=${refsAligned}`,
      `compatibility=${knowledgeCompatibility.compatibilityReady}`,
    ].join(" "),
  };
}

export function assertKnowledgeGovernancePass(
  report: KnowledgeGovernanceReport,
): asserts report is KnowledgeGovernanceReport & { governanceReady: true } {
  if (!report.governanceReady) {
    throw new Error(`V73 knowledge governance not ready: ${report.summary}`);
  }
}
