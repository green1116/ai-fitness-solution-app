/**
 * V71 P1 — Orchestration catalog builder (read-only)
 */
import { buildOrchestrationCatalogManifest } from "./orchestration.catalog";
import type { OrchestrationCatalogReport, OrchestrationCatalogSignals } from "./orchestration.types";
import { V71_ORCHESTRATION_FREEZE_VERSION, V71_ORCHESTRATION_VERSION } from "./orchestration.types";

const DEFAULT_SIGNALS: OrchestrationCatalogSignals = {
  catalogComplete: true,
  freezeVersionDeclared: true,
};

export function buildOrchestrationCatalog(input?: {
  deploymentId?: string;
  signals?: OrchestrationCatalogSignals;
}): OrchestrationCatalogReport {
  const deploymentId = input?.deploymentId ?? "v71-orchestration-catalog-default";
  const manifest = buildOrchestrationCatalogManifest();

  const signals: OrchestrationCatalogSignals = {
    ...DEFAULT_SIGNALS,
    catalogComplete: manifest.catalogComplete,
    freezeVersionDeclared: V71_ORCHESTRATION_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    manifest.catalogComplete &&
    signals.catalogComplete !== false &&
    signals.freezeVersionDeclared !== false;

  return {
    version: V71_ORCHESTRATION_VERSION,
    freezeVersion: V71_ORCHESTRATION_FREEZE_VERSION,
    reportId: `orchestration-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    manifest,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `orchestration-catalog ready=${catalogReady}`,
      `orchestrations=${manifest.entryCount}`,
      `triggers=${manifest.triggerCount}`,
      `actions=${manifest.actionCount}`,
      `freeze=${V71_ORCHESTRATION_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertOrchestrationCatalogPass(
  report: OrchestrationCatalogReport,
): asserts report is OrchestrationCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V71 orchestration catalog not ready: ${report.summary}`);
  }
}
