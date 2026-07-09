/**
 * V76 P3 — Collaboration context catalog builder (read-only)
 */
import { buildCollaborationPolicyCatalog } from "./collaboration.policy.builder";
import { V76_COLLABORATION_POLICY_VERSION } from "./collaboration.policy";
import {
  buildCollaborationContextCatalogManifest,
  buildCollaborationContextValidationManifest,
  isCollaborationContextCatalogRefsAligned,
} from "./collaboration.context.catalog";
import type {
  CollaborationContextCatalogReport,
  CollaborationContextCatalogSignals,
} from "./collaboration.context";
import {
  V76_COLLABORATION_CONTEXT_FREEZE_VERSION,
  V76_COLLABORATION_CONTEXT_VERSION,
} from "./collaboration.context";

const DEFAULT_SIGNALS: CollaborationContextCatalogSignals = {
  collaborationPolicyCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildCollaborationContextCatalog(input?: {
  deploymentId?: string;
  signals?: CollaborationContextCatalogSignals;
}): CollaborationContextCatalogReport {
  const deploymentId = input?.deploymentId ?? "v76-collaboration-context-catalog-default";

  const collaborationPolicyCatalog = buildCollaborationPolicyCatalog({ deploymentId });
  const catalog = buildCollaborationContextCatalogManifest();
  const validations = buildCollaborationContextValidationManifest();
  const refsAligned = isCollaborationContextCatalogRefsAligned();

  const signals: CollaborationContextCatalogSignals = {
    ...DEFAULT_SIGNALS,
    collaborationPolicyCatalogReady: collaborationPolicyCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V76_COLLABORATION_CONTEXT_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    collaborationPolicyCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.collaborationPolicyCatalogReady !== false;

  return {
    version: V76_COLLABORATION_CONTEXT_VERSION,
    freezeVersion: V76_COLLABORATION_CONTEXT_FREEZE_VERSION,
    reportId: `collaboration-context-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    collaborationPolicyCatalogVersion: V76_COLLABORATION_POLICY_VERSION,
    collaborationPolicyCatalogReady: collaborationPolicyCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `collaboration-context-catalog ready=${catalogReady}`,
      `contexts=${catalog.entryCount}`,
      `domains=${catalog.domainCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `policyCatalog=${collaborationPolicyCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertCollaborationContextCatalogPass(
  report: CollaborationContextCatalogReport,
): asserts report is CollaborationContextCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V76 collaboration context catalog not ready: ${report.summary}`);
  }
}
