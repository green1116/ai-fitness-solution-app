import {
  COMMERCIAL_FREEZE_TAG,
  COMMERCIAL_LAYER_ORDER,
  buildCommercialPlatformInventories,
  countInventoryTotals,
} from "../registry";
import type { CommercialPlatformReport } from "../shared/types";
import { COMMERCIAL_PLATFORM_FREEZE_VERSION } from "../shared/types";

export function buildCommercialPlatformReport(input?: {
  deploymentId?: string;
}): CommercialPlatformReport {
  const deploymentId = input?.deploymentId ?? "commercial-platform-freeze-default";
  const inventories = buildCommercialPlatformInventories();
  const totals = countInventoryTotals(inventories);

  return {
    version: COMMERCIAL_PLATFORM_FREEZE_VERSION,
    reportId: `commercial-platform-report-${deploymentId}`,
    deploymentId,
    freezeTag: COMMERCIAL_FREEZE_TAG,
    layers: [...COMMERCIAL_LAYER_ORDER],
    moduleCount: totals.moduleCount,
    domainCount: totals.domainCount,
    inventories,
    summary: [
      `commercial-platform-freeze tag=${COMMERCIAL_FREEZE_TAG}`,
      `layers=${totals.layerCount}`,
      `modules=${totals.moduleCount}`,
      `domains=${totals.domainCount}`,
      `capabilities=${inventories.capability.length}`,
      `dependencies=${inventories.dependency.length}`,
      `runtimes=${inventories.runtime.length}`,
      `apis=${inventories.api.length}`,
      `verifies=${inventories.verify.length}`,
      `docs=${inventories.documentation.length}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
