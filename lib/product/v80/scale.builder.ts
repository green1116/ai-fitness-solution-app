/**
 * V80 PRODUCT P3 — Scale builder (read-only P2 consumer)
 */
import { buildGrowth } from "./growth.builder";
import { V80_PRODUCT_GROWTH_VERSION } from "./growth.types";
import { isMarketDominanceComplete, MARKET_DOMINANCE_PILLARS } from "./scale.dominance.spec";
import { isChannelScalingComplete, CHANNEL_SCALING_MODELS } from "./scale.channel.spec";
import { isEnterpriseReplicationComplete, ENTERPRISE_REPLICATION_MODELS } from "./scale.replication.spec";
import { isGrowthFlywheelComplete, GROWTH_FLYWHEEL } from "./scale.flywheel.spec";
import type { ScaleManifest, ScaleReport } from "./scale.types";
import { V80_PRODUCT_SCALE_FREEZE_VERSION, V80_PRODUCT_SCALE_VERSION } from "./scale.types";

export function buildScaleManifest(input: { growthReady: boolean }): ScaleManifest {
  const dominanceComplete = isMarketDominanceComplete();
  const channelComplete = isChannelScalingComplete();
  const replicationComplete = isEnterpriseReplicationComplete();
  const flywheelComplete = isGrowthFlywheelComplete();

  const scaleComplete =
    input.growthReady &&
    dominanceComplete &&
    channelComplete &&
    replicationComplete &&
    flywheelComplete;

  return {
    version: V80_PRODUCT_SCALE_VERSION,
    growthVersion: V80_PRODUCT_GROWTH_VERSION,
    dominancePillars: MARKET_DOMINANCE_PILLARS.length,
    channelModels: CHANNEL_SCALING_MODELS.length,
    replicationModels: ENTERPRISE_REPLICATION_MODELS.length,
    flywheelStages: GROWTH_FLYWHEEL.length,
    scaleComplete,
    summary: `scale complete=${scaleComplete} flywheel=${GROWTH_FLYWHEEL.length}`,
  };
}

export function buildScale(input?: { deploymentId?: string }): ScaleReport {
  const deploymentId = input?.deploymentId ?? "v80-product-scale-default";
  const growth = buildGrowth({ deploymentId });
  const manifest = buildScaleManifest({ growthReady: growth.growthReady });

  const scaleReady = growth.growthReady && manifest.scaleComplete;

  return {
    version: V80_PRODUCT_SCALE_VERSION,
    freezeVersion: V80_PRODUCT_SCALE_FREEZE_VERSION,
    reportId: `scale-${deploymentId}`,
    growthReady: growth.growthReady,
    manifest,
    dominance: MARKET_DOMINANCE_PILLARS,
    channels: CHANNEL_SCALING_MODELS,
    replication: ENTERPRISE_REPLICATION_MODELS,
    flywheel: GROWTH_FLYWHEEL,
    scaleReady,
    readinessScore: scaleReady ? 100 : 0,
    summary: `scale ready=${scaleReady} growth=${growth.growthReady}`,
  };
}

export function assertScalePass(report: ScaleReport): asserts report is ScaleReport & { scaleReady: true } {
  if (!report.scaleReady) {
    throw new Error(`V80 PRODUCT scale not ready: ${report.summary}`);
  }
}
