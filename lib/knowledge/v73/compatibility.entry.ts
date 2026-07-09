/**
 * V73 P4 — Knowledge compatibility entry (read-only)
 */
export {
  COMPATIBILITY_CONSTRAINT_CATALOG,
  KNOWLEDGE_VERSION_PAIR_CATALOG,
  buildCompatibilityConstraintManifest,
  buildCompatibilityMatrix,
  buildVersionPairManifest,
  computeDeclarativeCompatibilityPass,
  getCompatibilityConstraintById,
  getVersionPairById,
  getVersionPairsBySourceRef,
  isKnowledgeCompatibilityRefsAligned,
} from "./compatibility.matrix";
export {
  assertKnowledgeCompatibilityPass,
  buildKnowledgeCompatibility,
} from "./compatibility.builder";
export {
  V73_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION,
  V73_KNOWLEDGE_COMPATIBILITY_VERSION,
} from "./knowledge.compatibility";
export type {
  Constraint,
  KnowledgeCompatibilityReport,
  KnowledgeCompatibilitySignals,
  Matrix,
  VersionPair,
} from "./knowledge.compatibility";

import { buildKnowledgeCompatibility } from "./compatibility.builder";
import type {
  KnowledgeCompatibilityReport,
  KnowledgeCompatibilitySignals,
} from "./knowledge.compatibility";

export function runKnowledgeCompatibility(input?: {
  deploymentId?: string;
  signals?: KnowledgeCompatibilitySignals;
}): KnowledgeCompatibilityReport {
  return buildKnowledgeCompatibility(input);
}

export function formatKnowledgeCompatibilitySummary(
  report: KnowledgeCompatibilityReport,
): string {
  const lines = [
    "V73 Knowledge Compatibility",
    `  ready: ${report.compatibilityReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  knowledge-policy: ${report.knowledgePolicyVersion} (ready=${report.knowledgePolicyReady})`,
    `  pairs: ${report.pairs.pairCount}`,
    `  constraints: ${report.constraints.entryCount}`,
    `  matrix rows: ${report.matrix.rowCount}`,
    `  compatible: ${report.matrix.compatibleCount}`,
    `  incompatible: ${report.matrix.incompatibleCount}`,
  ];
  return lines.join("\n");
}
