/**
 * V76 P6 — Collaboration simulation catalog builder (read-only)
 */
import { buildCollaborationEvaluationCatalog } from "./collaboration.evaluation.builder";
import { V76_COLLABORATION_EVALUATION_VERSION } from "./collaboration.evaluation";
import {
  buildCollaborationSimulationCatalogManifest,
  buildCollaborationSimulationValidationManifest,
  isCollaborationSimulationCatalogRefsAligned,
} from "./collaboration.simulation.catalog";
import type {
  CollaborationSimulationCatalogReport,
  CollaborationSimulationCatalogSignals,
} from "./collaboration.simulation";
import {
  V76_COLLABORATION_SIMULATION_FREEZE_VERSION,
  V76_COLLABORATION_SIMULATION_VERSION,
} from "./collaboration.simulation";

const DEFAULT_SIGNALS: CollaborationSimulationCatalogSignals = {
  collaborationEvaluationCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildCollaborationSimulationCatalog(input?: {
  deploymentId?: string;
  signals?: CollaborationSimulationCatalogSignals;
}): CollaborationSimulationCatalogReport {
  const deploymentId = input?.deploymentId ?? "v76-collaboration-simulation-catalog-default";

  const collaborationEvaluationCatalog = buildCollaborationEvaluationCatalog({ deploymentId });
  const catalog = buildCollaborationSimulationCatalogManifest();
  const validations = buildCollaborationSimulationValidationManifest();
  const refsAligned = isCollaborationSimulationCatalogRefsAligned();

  const signals: CollaborationSimulationCatalogSignals = {
    ...DEFAULT_SIGNALS,
    collaborationEvaluationCatalogReady: collaborationEvaluationCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V76_COLLABORATION_SIMULATION_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    collaborationEvaluationCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.collaborationEvaluationCatalogReady !== false;

  return {
    version: V76_COLLABORATION_SIMULATION_VERSION,
    freezeVersion: V76_COLLABORATION_SIMULATION_FREEZE_VERSION,
    reportId: `collaboration-simulation-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    collaborationEvaluationCatalogVersion: V76_COLLABORATION_EVALUATION_VERSION,
    collaborationEvaluationCatalogReady: collaborationEvaluationCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `collaboration-simulation-catalog ready=${catalogReady}`,
      `simulations=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `evaluationCatalog=${collaborationEvaluationCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertCollaborationSimulationCatalogPass(
  report: CollaborationSimulationCatalogReport,
): asserts report is CollaborationSimulationCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V76 collaboration simulation catalog not ready: ${report.summary}`);
  }
}
