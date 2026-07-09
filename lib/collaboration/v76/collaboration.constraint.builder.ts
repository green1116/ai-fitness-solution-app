/**
 * V76 P4 — Collaboration constraint catalog builder (read-only)
 */
import { buildCollaborationContextCatalog } from "./collaboration.context.builder";
import { V76_COLLABORATION_CONTEXT_VERSION } from "./collaboration.context";
import {
  buildCollaborationConstraintCatalogManifest,
  buildCollaborationConstraintValidationManifest,
  isCollaborationConstraintCatalogRefsAligned,
} from "./collaboration.constraint.catalog";
import type {
  CollaborationConstraintCatalogReport,
  CollaborationConstraintCatalogSignals,
} from "./collaboration.constraint";
import {
  V76_COLLABORATION_CONSTRAINT_FREEZE_VERSION,
  V76_COLLABORATION_CONSTRAINT_VERSION,
} from "./collaboration.constraint";

const DEFAULT_SIGNALS: CollaborationConstraintCatalogSignals = {
  collaborationContextCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildCollaborationConstraintCatalog(input?: {
  deploymentId?: string;
  signals?: CollaborationConstraintCatalogSignals;
}): CollaborationConstraintCatalogReport {
  const deploymentId = input?.deploymentId ?? "v76-collaboration-constraint-catalog-default";

  const collaborationContextCatalog = buildCollaborationContextCatalog({ deploymentId });
  const catalog = buildCollaborationConstraintCatalogManifest();
  const validations = buildCollaborationConstraintValidationManifest();
  const refsAligned = isCollaborationConstraintCatalogRefsAligned();

  const signals: CollaborationConstraintCatalogSignals = {
    ...DEFAULT_SIGNALS,
    collaborationContextCatalogReady: collaborationContextCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V76_COLLABORATION_CONSTRAINT_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    collaborationContextCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.collaborationContextCatalogReady !== false;

  return {
    version: V76_COLLABORATION_CONSTRAINT_VERSION,
    freezeVersion: V76_COLLABORATION_CONSTRAINT_FREEZE_VERSION,
    reportId: `collaboration-constraint-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    collaborationContextCatalogVersion: V76_COLLABORATION_CONTEXT_VERSION,
    collaborationContextCatalogReady: collaborationContextCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `collaboration-constraint-catalog ready=${catalogReady}`,
      `constraints=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `contextCatalog=${collaborationContextCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertCollaborationConstraintCatalogPass(
  report: CollaborationConstraintCatalogReport,
): asserts report is CollaborationConstraintCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V76 collaboration constraint catalog not ready: ${report.summary}`);
  }
}
