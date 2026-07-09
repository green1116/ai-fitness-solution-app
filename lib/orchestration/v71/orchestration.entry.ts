/**
 * V71 P1 — Orchestration catalog entry (read-only)
 */
export {
  ORCHESTRATION_CATALOG,
  buildOrchestrationCatalogManifest,
  getOrchestrationById,
  getOrchestrationsByAction,
  getOrchestrationsByTrigger,
} from "./orchestration.catalog";
export { assertOrchestrationCatalogPass, buildOrchestrationCatalog } from "./orchestration.builder";
export { V71_ORCHESTRATION_FREEZE_VERSION, V71_ORCHESTRATION_VERSION } from "./orchestration.types";
export type { OrchestrationCatalogReport, OrchestrationCatalogSignals } from "./orchestration.types";

import { buildOrchestrationCatalog } from "./orchestration.builder";
import type { OrchestrationCatalogReport, OrchestrationCatalogSignals } from "./orchestration.types";

export function runOrchestrationCatalog(input?: {
  deploymentId?: string;
  signals?: OrchestrationCatalogSignals;
}): OrchestrationCatalogReport {
  return buildOrchestrationCatalog(input);
}

export function formatOrchestrationCatalogSummary(report: OrchestrationCatalogReport): string {
  const lines = [
    "V71 Orchestration Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  orchestrations: ${report.manifest.entryCount}`,
    `  triggers: ${report.manifest.triggerCount}`,
    `  actions: ${report.manifest.actionCount}`,
  ];
  return lines.join("\n");
}
