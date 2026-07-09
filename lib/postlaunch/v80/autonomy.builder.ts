/**
 * V80 POST-LAUNCH P4 — Autonomous growth builder (read-only P3 consumer)
 */
import { buildRevenueScaling } from "./scaling.builder";
import { V80_POSTLAUNCH_SCALING_VERSION } from "./scaling.types";

import { AUTONOMOUS_LEAD_GENERATION, isAutonomousLeadGenerationComplete } from "./autonomy.lead-generation.spec";
import { isSelfGeneratingSalesMotionComplete, SELF_GENERATING_SALES_MOTION } from "./autonomy.sales-motion.spec";
import { AUTONOMOUS_EXPANSION_ENGINE, isAutonomousExpansionEngineComplete } from "./autonomy.expansion-engine.spec";
import { CLOSED_LOOP_GROWTH_FLYWHEEL, isClosedLoopGrowthFlywheelComplete } from "./autonomy.flywheel.spec";
import type { AutonomousGrowthReport, AutonomyManifest } from "./autonomy.types";
import { V80_POSTLAUNCH_AUTONOMY_FREEZE_VERSION, V80_POSTLAUNCH_AUTONOMY_VERSION } from "./autonomy.types";

export function buildAutonomyManifest(input: { scalingReady: boolean }): AutonomyManifest {
  const leadComplete = isAutonomousLeadGenerationComplete();
  const salesComplete = isSelfGeneratingSalesMotionComplete();
  const expansionComplete = isAutonomousExpansionEngineComplete();
  const flywheelComplete = isClosedLoopGrowthFlywheelComplete();

  const autonomyComplete =
    input.scalingReady && leadComplete && salesComplete && expansionComplete && flywheelComplete;

  return {
    version: V80_POSTLAUNCH_AUTONOMY_VERSION,
    scalingVersion: V80_POSTLAUNCH_SCALING_VERSION,
    leadSignals: AUTONOMOUS_LEAD_GENERATION.length,
    salesMotionSteps: SELF_GENERATING_SALES_MOTION.length,
    expansionRules: AUTONOMOUS_EXPANSION_ENGINE.length,
    flywheelStages: CLOSED_LOOP_GROWTH_FLYWHEEL.length,
    autonomyComplete,
    summary: `autonomy complete=${autonomyComplete} leads=${AUTONOMOUS_LEAD_GENERATION.length}`,
  };
}

export function buildAutonomousGrowth(input?: { deploymentId?: string }): AutonomousGrowthReport {
  const deploymentId = input?.deploymentId ?? "v80-postlaunch-autonomy";
  const revenueScaling = buildRevenueScaling({ deploymentId });
  const manifest = buildAutonomyManifest({ scalingReady: revenueScaling.scalingReady });

  const autonomyReady = revenueScaling.scalingReady && manifest.autonomyComplete;

  return {
    version: V80_POSTLAUNCH_AUTONOMY_VERSION,
    freezeVersion: V80_POSTLAUNCH_AUTONOMY_FREEZE_VERSION,
    reportId: `autonomy-${deploymentId}`,
    scalingReady: revenueScaling.scalingReady,
    manifest,
    leadGeneration: AUTONOMOUS_LEAD_GENERATION,
    salesMotion: SELF_GENERATING_SALES_MOTION,
    expansionEngine: AUTONOMOUS_EXPANSION_ENGINE,
    growthFlywheel: CLOSED_LOOP_GROWTH_FLYWHEEL,
    revenueScaling,
    autonomyReady,
    readinessScore: autonomyReady ? 100 : 0,
    summary: `autonomy ready=${autonomyReady} scaling=${revenueScaling.scalingReady}`,
  };
}

export function assertAutonomousGrowthPass(
  report: AutonomousGrowthReport,
): asserts report is AutonomousGrowthReport & { autonomyReady: true } {
  if (!report.autonomyReady) {
    throw new Error(`V80 POST-LAUNCH autonomy not ready: ${report.summary}`);
  }
}

export function formatAutonomySummary(report: AutonomousGrowthReport): string {
  return [
    `V80 POST-LAUNCH P4 Autonomous Growth`,
    `  version: ${report.version}`,
    `  autonomyReady: ${report.autonomyReady}`,
    `  leadGeneration: ${report.leadGeneration.length} autonomous signals`,
    `  salesMotion: ${report.salesMotion.length} self-generating steps`,
    `  expansionEngine: ${report.expansionEngine.length} expansion rules`,
    `  growthFlywheel: ${report.growthFlywheel.length} closed-loop stages`,
    `  readinessScore: ${report.readinessScore}`,
  ].join("\n");
}

export function runAutonomousGrowth(input?: { deploymentId?: string }) {
  return buildAutonomousGrowth(input);
}
