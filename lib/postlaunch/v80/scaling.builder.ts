/**
 * V80 POST-LAUNCH P3 — Revenue scaling builder (read-only P2 consumer)
 */
import { buildRevenueOptimization } from "./optimization.builder";
import { V80_POSTLAUNCH_OPTIMIZATION_VERSION } from "./optimization.types";

import { isRevenueCompoundingLoopsComplete, REVENUE_COMPOUNDING_LOOPS } from "./scaling.compounding.spec";
import { CHANNEL_SCALING_SYSTEM, isChannelScalingSystemComplete } from "./scaling.channels.spec";
import { isSalesAutomationEngineComplete, SALES_AUTOMATION_ENGINE } from "./scaling.sales-automation.spec";
import { ENTERPRISE_EXPANSION_MODEL, isEnterpriseExpansionModelComplete } from "./scaling.enterprise-expansion.spec";
import type { RevenueScalingReport, ScalingManifest } from "./scaling.types";
import { V80_POSTLAUNCH_SCALING_FREEZE_VERSION, V80_POSTLAUNCH_SCALING_VERSION } from "./scaling.types";

export function buildScalingManifest(input: { optimizationReady: boolean }): ScalingManifest {
  const compoundingComplete = isRevenueCompoundingLoopsComplete();
  const channelComplete = isChannelScalingSystemComplete();
  const automationComplete = isSalesAutomationEngineComplete();
  const expansionComplete = isEnterpriseExpansionModelComplete();

  const scalingComplete =
    input.optimizationReady && compoundingComplete && channelComplete && automationComplete && expansionComplete;

  return {
    version: V80_POSTLAUNCH_SCALING_VERSION,
    optimizationVersion: V80_POSTLAUNCH_OPTIMIZATION_VERSION,
    compoundingLoops: REVENUE_COMPOUNDING_LOOPS.length,
    channelSystems: CHANNEL_SCALING_SYSTEM.length,
    salesAutomationSteps: SALES_AUTOMATION_ENGINE.length,
    enterpriseExpansions: ENTERPRISE_EXPANSION_MODEL.length,
    scalingComplete,
    summary: `scaling complete=${scalingComplete} loops=${REVENUE_COMPOUNDING_LOOPS.length}`,
  };
}

export function buildRevenueScaling(input?: { deploymentId?: string }): RevenueScalingReport {
  const deploymentId = input?.deploymentId ?? "v80-postlaunch-scaling";
  const revenueOptimization = buildRevenueOptimization({ deploymentId });
  const manifest = buildScalingManifest({ optimizationReady: revenueOptimization.optimizationReady });

  const scalingReady = revenueOptimization.optimizationReady && manifest.scalingComplete;

  return {
    version: V80_POSTLAUNCH_SCALING_VERSION,
    freezeVersion: V80_POSTLAUNCH_SCALING_FREEZE_VERSION,
    reportId: `scaling-${deploymentId}`,
    optimizationReady: revenueOptimization.optimizationReady,
    manifest,
    compoundingLoops: REVENUE_COMPOUNDING_LOOPS,
    channelScaling: CHANNEL_SCALING_SYSTEM,
    salesAutomation: SALES_AUTOMATION_ENGINE,
    enterpriseExpansion: ENTERPRISE_EXPANSION_MODEL,
    revenueOptimization,
    scalingReady,
    readinessScore: scalingReady ? 100 : 0,
    summary: `scaling ready=${scalingReady} optimization=${revenueOptimization.optimizationReady}`,
  };
}

export function assertRevenueScalingPass(
  report: RevenueScalingReport,
): asserts report is RevenueScalingReport & { scalingReady: true } {
  if (!report.scalingReady) {
    throw new Error(`V80 POST-LAUNCH scaling not ready: ${report.summary}`);
  }
}

export function formatScalingSummary(report: RevenueScalingReport): string {
  return [
    `V80 POST-LAUNCH P3 Revenue Scaling`,
    `  version: ${report.version}`,
    `  scalingReady: ${report.scalingReady}`,
    `  compoundingLoops: ${report.compoundingLoops.length} cycles`,
    `  channelScaling: ${report.channelScaling.length} channels`,
    `  salesAutomation: ${report.salesAutomation.length} automation steps`,
    `  enterpriseExpansion: ${report.enterpriseExpansion.length} expansion models`,
    `  readinessScore: ${report.readinessScore}`,
  ].join("\n");
}

export function runRevenueScaling(input?: { deploymentId?: string }) {
  return buildRevenueScaling(input);
}
