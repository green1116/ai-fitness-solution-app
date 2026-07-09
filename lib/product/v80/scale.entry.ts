/**
 * V80 PRODUCT P3 — Scale & market domination entry
 */
export { assertScalePass, buildScale } from "./scale.builder";
export { isMarketDominanceComplete, MARKET_DOMINANCE_PILLARS } from "./scale.dominance.spec";
export {
  CHANNEL_SCALING_MODELS,
  getChannelsByType,
  isChannelScalingComplete,
} from "./scale.channel.spec";
export { ENTERPRISE_REPLICATION_MODELS, isEnterpriseReplicationComplete } from "./scale.replication.spec";
export { GROWTH_FLYWHEEL, isGrowthFlywheelComplete } from "./scale.flywheel.spec";
export { V80_PRODUCT_SCALE_FREEZE_VERSION, V80_PRODUCT_SCALE_VERSION } from "./scale.types";
export type { ScaleReport } from "./scale.types";

import { buildScale } from "./scale.builder";
import type { ScaleReport } from "./scale.types";

export function runScale(input?: { deploymentId?: string }): ScaleReport {
  return buildScale(input);
}

export function formatScaleSummary(report: ScaleReport): string {
  return [
    "V80 PRODUCT Scale",
    `  ready: ${report.scaleReady}`,
    `  score: ${report.readinessScore}/100`,
    `  growth: ${report.growthReady}`,
    `  dominance: ${report.manifest.dominancePillars}`,
    `  channels: ${report.manifest.channelModels}`,
    `  replication: ${report.manifest.replicationModels}`,
    `  flywheel: ${report.manifest.flywheelStages}`,
  ].join("\n");
}
