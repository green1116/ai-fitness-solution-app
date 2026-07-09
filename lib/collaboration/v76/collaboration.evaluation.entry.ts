/**
 * V76 P5 — Collaboration evaluation catalog entry (read-only)
 */
export {
  COLLABORATION_EVALUATION_CATALOG_ENTRIES,
  COLLABORATION_EVALUATION_VALIDATION_CATALOG,
  buildCollaborationEvaluationCatalogManifest,
  buildCollaborationEvaluationValidationManifest,
  computeCollaborationDeclarativeEvaluationDeclared,
  getCollaborationEvaluationCatalogEntriesByKind,
  getCollaborationEvaluationCatalogEntryById,
  getCollaborationEvaluationValidationByEvaluationRef,
  isCollaborationEvaluationCatalogRefsAligned,
} from "./collaboration.evaluation.catalog";
export {
  assertCollaborationEvaluationCatalogPass,
  buildCollaborationEvaluationCatalog,
} from "./collaboration.evaluation.builder";
export {
  V76_COLLABORATION_EVALUATION_FREEZE_VERSION,
  V76_COLLABORATION_EVALUATION_VERSION,
} from "./collaboration.evaluation";
export type {
  CollaborationEvaluationCatalogEntry,
  CollaborationEvaluationCatalogReport,
  CollaborationEvaluationCatalogSignals,
  CollaborationEvaluationKind,
  CollaborationEvaluationPriority,
  CollaborationEvaluationValidation,
} from "./collaboration.evaluation";

import { buildCollaborationEvaluationCatalog } from "./collaboration.evaluation.builder";
import type {
  CollaborationEvaluationCatalogReport,
  CollaborationEvaluationCatalogSignals,
} from "./collaboration.evaluation";

export function runCollaborationEvaluationCatalog(input?: {
  deploymentId?: string;
  signals?: CollaborationEvaluationCatalogSignals;
}): CollaborationEvaluationCatalogReport {
  return buildCollaborationEvaluationCatalog(input);
}

export function formatCollaborationEvaluationCatalogSummary(
  report: CollaborationEvaluationCatalogReport,
): string {
  const lines = [
    "V76 Collaboration Evaluation Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  collaboration-constraint-catalog: ${report.collaborationConstraintCatalogVersion} (ready=${report.collaborationConstraintCatalogReady})`,
    `  evaluations: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
