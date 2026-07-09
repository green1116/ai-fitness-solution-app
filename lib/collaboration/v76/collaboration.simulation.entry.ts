/**
 * V76 P6 — Collaboration simulation catalog entry (read-only)
 */
export {
  COLLABORATION_SIMULATION_CATALOG_ENTRIES,
  COLLABORATION_SIMULATION_VALIDATION_CATALOG,
  buildCollaborationSimulationCatalogManifest,
  buildCollaborationSimulationValidationManifest,
  computeCollaborationDeclarativeSimulationDeclared,
  getCollaborationSimulationCatalogEntriesByKind,
  getCollaborationSimulationCatalogEntryById,
  getCollaborationSimulationValidationBySimulationRef,
  isCollaborationSimulationCatalogRefsAligned,
} from "./collaboration.simulation.catalog";
export {
  assertCollaborationSimulationCatalogPass,
  buildCollaborationSimulationCatalog,
} from "./collaboration.simulation.builder";
export {
  V76_COLLABORATION_SIMULATION_FREEZE_VERSION,
  V76_COLLABORATION_SIMULATION_VERSION,
} from "./collaboration.simulation";
export type {
  CollaborationSimulationCatalogEntry,
  CollaborationSimulationCatalogReport,
  CollaborationSimulationCatalogSignals,
  CollaborationSimulationKind,
  CollaborationSimulationPriority,
  CollaborationSimulationValidation,
} from "./collaboration.simulation";

import { buildCollaborationSimulationCatalog } from "./collaboration.simulation.builder";
import type {
  CollaborationSimulationCatalogReport,
  CollaborationSimulationCatalogSignals,
} from "./collaboration.simulation";

export function runCollaborationSimulationCatalog(input?: {
  deploymentId?: string;
  signals?: CollaborationSimulationCatalogSignals;
}): CollaborationSimulationCatalogReport {
  return buildCollaborationSimulationCatalog(input);
}

export function formatCollaborationSimulationCatalogSummary(
  report: CollaborationSimulationCatalogReport,
): string {
  const lines = [
    "V76 Collaboration Simulation Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  collaboration-evaluation-catalog: ${report.collaborationEvaluationCatalogVersion} (ready=${report.collaborationEvaluationCatalogReady})`,
    `  simulations: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
