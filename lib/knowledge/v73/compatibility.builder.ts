/**
 * V73 P4 — Knowledge compatibility builder (read-only)
 */
import {
  buildCompatibilityConstraintManifest,
  buildCompatibilityMatrix,
  buildVersionPairManifest,
  isKnowledgeCompatibilityRefsAligned,
} from "./compatibility.matrix";
import { buildKnowledgePolicy } from "./policy.builder";
import { V73_KNOWLEDGE_POLICY_VERSION } from "./knowledge.policy";
import type {
  KnowledgeCompatibilityReport,
  KnowledgeCompatibilitySignals,
} from "./knowledge.compatibility";
import {
  V73_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION,
  V73_KNOWLEDGE_COMPATIBILITY_VERSION,
} from "./knowledge.compatibility";

const DEFAULT_SIGNALS: KnowledgeCompatibilitySignals = {
  knowledgePolicyReady: true,
  pairsComplete: true,
  constraintsComplete: true,
  matrixComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildKnowledgeCompatibility(input?: {
  deploymentId?: string;
  signals?: KnowledgeCompatibilitySignals;
}): KnowledgeCompatibilityReport {
  const deploymentId = input?.deploymentId ?? "v73-knowledge-compatibility-default";

  const knowledgePolicy = buildKnowledgePolicy({ deploymentId });
  const pairs = buildVersionPairManifest();
  const constraints = buildCompatibilityConstraintManifest();
  const matrix = buildCompatibilityMatrix();
  const refsAligned = isKnowledgeCompatibilityRefsAligned();

  const signals: KnowledgeCompatibilitySignals = {
    ...DEFAULT_SIGNALS,
    knowledgePolicyReady: knowledgePolicy.policyReady,
    pairsComplete: pairs.catalogComplete,
    constraintsComplete: constraints.catalogComplete,
    matrixComplete: matrix.matrixComplete,
    refsAligned,
    freezeVersionDeclared: V73_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const compatibilityReady =
    knowledgePolicy.policyReady &&
    pairs.catalogComplete &&
    constraints.catalogComplete &&
    matrix.matrixComplete &&
    refsAligned &&
    signals.knowledgePolicyReady !== false;

  return {
    version: V73_KNOWLEDGE_COMPATIBILITY_VERSION,
    freezeVersion: V73_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION,
    reportId: `knowledge-compatibility-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    knowledgePolicyVersion: V73_KNOWLEDGE_POLICY_VERSION,
    knowledgePolicyReady: knowledgePolicy.policyReady,
    pairs,
    constraints,
    matrix,
    compatibilityReady,
    readinessScore: compatibilityReady ? 100 : 0,
    summary: [
      `knowledge-compatibility ready=${compatibilityReady}`,
      `pairs=${pairs.pairCount}`,
      `constraints=${constraints.entryCount}`,
      `matrix=${matrix.rowCount}`,
      `compatible=${matrix.compatibleCount}`,
      `refsAligned=${refsAligned}`,
      `policy=${knowledgePolicy.policyReady}`,
    ].join(" "),
  };
}

export function assertKnowledgeCompatibilityPass(
  report: KnowledgeCompatibilityReport,
): asserts report is KnowledgeCompatibilityReport & { compatibilityReady: true } {
  if (!report.compatibilityReady) {
    throw new Error(`V73 knowledge compatibility not ready: ${report.summary}`);
  }
}
