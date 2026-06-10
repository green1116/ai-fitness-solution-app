import { buildCommercialPlatformInventories } from "./registry";
import { COMMERCIAL_FREEZE_TAG, COMMERCIAL_LAYER_ORDER } from "./registry";
import { buildCommercialPlatformReport } from "./report";
import { runCommercialPlatformDashboardRuntime } from "./dashboard";
import type { CommercialPlatformEvidence } from "./shared/types";
import { COMMERCIAL_PLATFORM_FREEZE_VERSION } from "./shared/types";

export const COMMERCIAL_PLATFORM_FREEZE_DOMAINS = [
  "commercial-platform-report",
  "commercial-platform-dashboard",
] as const;

export function buildCommercialPlatformEvidence(input?: {
  deploymentId?: string;
}): CommercialPlatformEvidence {
  const deploymentId = input?.deploymentId ?? "commercial-platform-freeze-default";

  const report = buildCommercialPlatformReport({ deploymentId });
  const dashboard = runCommercialPlatformDashboardRuntime({ deploymentId });

  if (dashboard.status !== "success") {
    throw new Error("Commercial platform dashboard evidence failed");
  }

  const moduleEvidence = dashboard.payload.layerScores.map((layerScore) => {
    const layerModules = report.inventories.capability.filter(
      (entry) => entry.layer === layerScore.layer,
    );
    const moduleIds = [...new Set(layerModules.map((entry) => entry.moduleId))];
    return {
      moduleId: moduleIds.join("+") || layerScore.layer,
      layer: layerScore.layer as (typeof COMMERCIAL_LAYER_ORDER)[number],
      domainCount: layerModules.length,
      allSuccess: layerScore.stability === 100,
      summary: `${layerScore.layer} completeness=${layerScore.completeness}% stability=${layerScore.stability}%`,
    };
  });

  return {
    evidenceId: `evidence-commercial-platform-freeze-${deploymentId}`,
    version: COMMERCIAL_PLATFORM_FREEZE_VERSION,
    freezeTag: COMMERCIAL_FREEZE_TAG,
    layers: [...COMMERCIAL_LAYER_ORDER],
    moduleEvidence,
    inventories: buildCommercialPlatformInventories(),
    generatedAt: new Date().toISOString(),
    summary: `commercial-platform-freeze-evidence layers=${COMMERCIAL_LAYER_ORDER.length} modules=${report.moduleCount} domains=${report.domainCount} commercialization=${dashboard.payload.commercializationReadiness}%`,
  };
}
