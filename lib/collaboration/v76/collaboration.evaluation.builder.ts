/**
 * V76 P5 — Collaboration evaluation catalog builder (read-only)
 */
import { buildCollaborationConstraintCatalog } from "./collaboration.constraint.builder";
import { V76_COLLABORATION_CONSTRAINT_VERSION } from "./collaboration.constraint";
import {
  buildCollaborationEvaluationCatalogManifest,
  buildCollaborationEvaluationValidationManifest,
  isCollaborationEvaluationCatalogRefsAligned,
} from "./collaboration.evaluation.catalog";
import type {
  CollaborationEvaluationCatalogReport,
  CollaborationEvaluationCatalogSignals,
} from "./collaboration.evaluation";
import {
  V76_COLLABORATION_EVALUATION_FREEZE_VERSION,
  V76_COLLABORATION_EVALUATION_VERSION,
} from "./collaboration.evaluation";

const DEFAULT_SIGNALS: CollaborationEvaluationCatalogSignals = {
  collaborationConstraintCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildCollaborationEvaluationCatalog(input?: {
  deploymentId?: string;
  signals?: CollaborationEvaluationCatalogSignals;
}): CollaborationEvaluationCatalogReport {
  const deploymentId = input?.deploymentId ?? "v76-collaboration-evaluation-catalog-default";

  const collaborationConstraintCatalog = buildCollaborationConstraintCatalog({ deploymentId });
  const catalog = buildCollaborationEvaluationCatalogManifest();
  const validations = buildCollaborationEvaluationValidationManifest();
  const refsAligned = isCollaborationEvaluationCatalogRefsAligned();

  const signals: CollaborationEvaluationCatalogSignals = {
    ...DEFAULT_SIGNALS,
    collaborationConstraintCatalogReady: collaborationConstraintCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V76_COLLABORATION_EVALUATION_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    collaborationConstraintCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.collaborationConstraintCatalogReady !== false;

  return {
    version: V76_COLLABORATION_EVALUATION_VERSION,
    freezeVersion: V76_COLLABORATION_EVALUATION_FREEZE_VERSION,
    reportId: `collaboration-evaluation-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    collaborationConstraintCatalogVersion: V76_COLLABORATION_CONSTRAINT_VERSION,
    collaborationConstraintCatalogReady: collaborationConstraintCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `collaboration-evaluation-catalog ready=${catalogReady}`,
      `evaluations=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `constraintCatalog=${collaborationConstraintCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertCollaborationEvaluationCatalogPass(
  report: CollaborationEvaluationCatalogReport,
): asserts report is CollaborationEvaluationCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V76 collaboration evaluation catalog not ready: ${report.summary}`);
  }
}
