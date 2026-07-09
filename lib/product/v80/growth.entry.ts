/**
 * V80 PRODUCT P2 — Growth & sales entry
 */
export { assertGrowthPass, buildGrowth } from "./growth.builder";
export { isSalesFunnelComplete, SALES_FUNNEL_STAGES } from "./growth.funnel.spec";
export {
  CONVERSION_TRIGGERS,
  getTriggersByPlan,
  isConversionTriggersComplete,
} from "./growth.conversion.spec";
export { ENTERPRISE_GTM_MOTIONS, isEnterpriseGtmComplete } from "./growth.gtm.spec";
export {
  EXPANSION_PATHS,
  getExpansionFromPlan,
  isExpansionEngineComplete,
} from "./growth.expansion.spec";
export { V80_PRODUCT_GROWTH_FREEZE_VERSION, V80_PRODUCT_GROWTH_VERSION } from "./growth.types";
export type { GrowthReport } from "./growth.types";

import { buildGrowth } from "./growth.builder";
import type { GrowthReport } from "./growth.types";

export function runGrowth(input?: { deploymentId?: string }): GrowthReport {
  return buildGrowth(input);
}

export function formatGrowthSummary(report: GrowthReport): string {
  return [
    "V80 PRODUCT Growth",
    `  ready: ${report.growthReady}`,
    `  score: ${report.readinessScore}/100`,
    `  productization: ${report.productizationReady}`,
    `  funnel: ${report.manifest.funnelStages}`,
    `  triggers: ${report.manifest.conversionTriggers}`,
    `  gtm motions: ${report.manifest.gtmMotions}`,
    `  expansion paths: ${report.manifest.expansionPaths}`,
  ].join("\n");
}
