/**
 * V76 P3 — Collaboration context catalog entry (read-only)
 */
export {
  COLLABORATION_CONTEXT_CATALOG_ENTRIES,
  COLLABORATION_CONTEXT_VALIDATION_CATALOG,
  buildCollaborationContextCatalogManifest,
  buildCollaborationContextValidationManifest,
  computeCollaborationDeclarativeContextValid,
  getCollaborationContextCatalogEntriesByDomain,
  getCollaborationContextCatalogEntryById,
  getCollaborationContextValidationByContextRef,
  isCollaborationContextCatalogRefsAligned,
} from "./collaboration.context.catalog";
export {
  assertCollaborationContextCatalogPass,
  buildCollaborationContextCatalog,
} from "./collaboration.context.builder";
export {
  V76_COLLABORATION_CONTEXT_FREEZE_VERSION,
  V76_COLLABORATION_CONTEXT_VERSION,
} from "./collaboration.context";
export type {
  CollaborationContextCatalogEntry,
  CollaborationContextCatalogReport,
  CollaborationContextCatalogSignals,
  CollaborationContextDomainKind,
  CollaborationContextLifecycle,
  CollaborationContextPriority,
  CollaborationContextValidation,
} from "./collaboration.context";

import { buildCollaborationContextCatalog } from "./collaboration.context.builder";
import type {
  CollaborationContextCatalogReport,
  CollaborationContextCatalogSignals,
} from "./collaboration.context";

export function runCollaborationContextCatalog(input?: {
  deploymentId?: string;
  signals?: CollaborationContextCatalogSignals;
}): CollaborationContextCatalogReport {
  return buildCollaborationContextCatalog(input);
}

export function formatCollaborationContextCatalogSummary(
  report: CollaborationContextCatalogReport,
): string {
  const lines = [
    "V76 Collaboration Context Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  collaboration-policy-catalog: ${report.collaborationPolicyCatalogVersion} (ready=${report.collaborationPolicyCatalogReady})`,
    `  contexts: ${report.catalog.entryCount}`,
    `  domains: ${report.catalog.domainCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
