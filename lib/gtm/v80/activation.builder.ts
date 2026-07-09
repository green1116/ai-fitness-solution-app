/**
 * V80 GTM P1 — Customer activation builder (read-only POST P4 consumer)
 */
import { buildAutonomousGrowth } from "@/lib/postlaunch/v80/autonomy.builder";
import { V80_POSTLAUNCH_AUTONOMY_VERSION } from "@/lib/postlaunch/v80/autonomy.types";

import { FIRST_CUSTOMER_ACQUISITION, isFirstCustomerAcquisitionComplete } from "./activation.first-customer.spec";
import { INITIAL_SALES_MOTION, isInitialSalesMotionComplete } from "./activation.sales-motion.spec";
import { isRevenueValidationLoopComplete, REVENUE_VALIDATION_LOOP } from "./activation.validation-loop.spec";
import { GTM_ENTRY_POINTS, isGtmEntryPointsComplete } from "./activation.entry-channel.spec";
import type { ActivationManifest, CustomerActivationReport } from "./activation.types";
import { V80_GTM_ACTIVATION_FREEZE_VERSION, V80_GTM_ACTIVATION_VERSION } from "./activation.types";

export function buildActivationManifest(input: { autonomyReady: boolean }): ActivationManifest {
  const firstCustomerComplete = isFirstCustomerAcquisitionComplete();
  const salesMotionComplete = isInitialSalesMotionComplete();
  const validationComplete = isRevenueValidationLoopComplete();
  const entryComplete = isGtmEntryPointsComplete();

  const activationComplete =
    input.autonomyReady && firstCustomerComplete && salesMotionComplete && validationComplete && entryComplete;

  return {
    version: V80_GTM_ACTIVATION_VERSION,
    autonomyVersion: V80_POSTLAUNCH_AUTONOMY_VERSION,
    firstCustomerTargets: FIRST_CUSTOMER_ACQUISITION.length,
    salesMotionPriorities: INITIAL_SALES_MOTION.length,
    validationSteps: REVENUE_VALIDATION_LOOP.length,
    entryPoints: GTM_ENTRY_POINTS.length,
    activationComplete,
    summary: `activation complete=${activationComplete} targets=${FIRST_CUSTOMER_ACQUISITION.length}`,
  };
}

export function buildCustomerActivation(input?: { deploymentId?: string }): CustomerActivationReport {
  const deploymentId = input?.deploymentId ?? "v80-gtm-activation";
  const autonomousGrowth = buildAutonomousGrowth({ deploymentId });
  const manifest = buildActivationManifest({ autonomyReady: autonomousGrowth.autonomyReady });

  const activationReady = autonomousGrowth.autonomyReady && manifest.activationComplete;

  return {
    version: V80_GTM_ACTIVATION_VERSION,
    freezeVersion: V80_GTM_ACTIVATION_FREEZE_VERSION,
    reportId: `gtm-activation-${deploymentId}`,
    autonomyReady: autonomousGrowth.autonomyReady,
    manifest,
    firstCustomerStrategy: FIRST_CUSTOMER_ACQUISITION,
    initialSalesMotion: INITIAL_SALES_MOTION,
    revenueValidationLoop: REVENUE_VALIDATION_LOOP,
    gtmEntryPoints: GTM_ENTRY_POINTS,
    autonomousGrowth,
    activationReady,
    readinessScore: activationReady ? 100 : 0,
    summary: `activation ready=${activationReady} autonomy=${autonomousGrowth.autonomyReady}`,
  };
}

export function assertCustomerActivationPass(
  report: CustomerActivationReport,
): asserts report is CustomerActivationReport & { activationReady: true } {
  if (!report.activationReady) {
    throw new Error(`V80 GTM activation not ready: ${report.summary}`);
  }
}

export function formatActivationSummary(report: CustomerActivationReport): string {
  return [
    `V80 GTM P1 Real Customer Activation`,
    `  version: ${report.version}`,
    `  activationReady: ${report.activationReady}`,
    `  firstCustomerTargets: ${report.firstCustomerStrategy.length} ICP segments`,
    `  salesMotion: ${report.initialSalesMotion.length} prioritized channels`,
    `  validationLoop: ${report.revenueValidationLoop.length} proof steps`,
    `  gtmEntry: ${report.gtmEntryPoints[0]?.channel ?? "—"} (rank 1)`,
    `  readinessScore: ${report.readinessScore}`,
  ].join("\n");
}

export function runCustomerActivation(input?: { deploymentId?: string }) {
  return buildCustomerActivation(input);
}
