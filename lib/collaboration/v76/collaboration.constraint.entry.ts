/**
 * V76 P4 — Collaboration constraint catalog entry (read-only)
 */
export {
  COLLABORATION_CONSTRAINT_CATALOG_ENTRIES,
  COLLABORATION_CONSTRAINT_VALIDATION_CATALOG,
  buildCollaborationConstraintCatalogManifest,
  buildCollaborationConstraintValidationManifest,
  computeCollaborationDeclarativeConstraintBlock,
  getCollaborationConstraintCatalogEntriesByKind,
  getCollaborationConstraintCatalogEntryById,
  getCollaborationConstraintValidationByConstraintRef,
  isCollaborationConstraintCatalogRefsAligned,
} from "./collaboration.constraint.catalog";
export {
  assertCollaborationConstraintCatalogPass,
  buildCollaborationConstraintCatalog,
} from "./collaboration.constraint.builder";
export {
  V76_COLLABORATION_CONSTRAINT_FREEZE_VERSION,
  V76_COLLABORATION_CONSTRAINT_VERSION,
} from "./collaboration.constraint";
export type {
  CollaborationConstraintCatalogEntry,
  CollaborationConstraintCatalogReport,
  CollaborationConstraintCatalogSignals,
  CollaborationConstraintKind,
  CollaborationConstraintLevel,
  CollaborationConstraintPriority,
  CollaborationConstraintValidation,
} from "./collaboration.constraint";

import { buildCollaborationConstraintCatalog } from "./collaboration.constraint.builder";
import type {
  CollaborationConstraintCatalogReport,
  CollaborationConstraintCatalogSignals,
} from "./collaboration.constraint";

export function runCollaborationConstraintCatalog(input?: {
  deploymentId?: string;
  signals?: CollaborationConstraintCatalogSignals;
}): CollaborationConstraintCatalogReport {
  return buildCollaborationConstraintCatalog(input);
}

export function formatCollaborationConstraintCatalogSummary(
  report: CollaborationConstraintCatalogReport,
): string {
  const lines = [
    "V76 Collaboration Constraint Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  collaboration-context-catalog: ${report.collaborationContextCatalogVersion} (ready=${report.collaborationContextCatalogReady})`,
    `  constraints: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
