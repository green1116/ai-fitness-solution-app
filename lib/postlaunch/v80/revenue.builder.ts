/**
 * V80 POST-LAUNCH P1 — Revenue builder (read-only DEPLOY P2 + PRODUCT P2 consumer)
 */
import { buildCutover } from "@/lib/deploy/v80/cutover.builder";
import { V80_DEPLOY_CUTOVER_VERSION } from "@/lib/deploy/v80/cutover.types";
import { buildGrowth } from "@/lib/product/v80/growth.builder";
import { CONVERSION_TRIGGERS } from "@/lib/product/v80/growth.conversion.spec";
import { V80_PRODUCT_GROWTH_VERSION } from "@/lib/product/v80/growth.types";
import { FIRST_TENANT_LIVE_FLOW } from "@/lib/deploy/v80/deploy.first-tenant.spec";

import { isHighConversionEntryPointsComplete, HIGH_CONVERSION_ENTRY_POINTS } from "./revenue.entrypoints.spec";
import { isFirstCustomerRevenuePathComplete, FIRST_CUSTOMER_REVENUE_PATH } from "./revenue.first-customer.spec";
import { isRevenueLoopComplete, REVENUE_ACTIVATION_LOOP } from "./revenue.loop.spec";
import { isPricingPressureComplete, PRICING_PRESSURE_POINTS } from "./revenue.pricing-pressure.spec";
import type { RevenueActivationReport, RevenueManifest } from "./revenue.types";
import { V80_POSTLAUNCH_REVENUE_FREEZE_VERSION, V80_POSTLAUNCH_REVENUE_VERSION } from "./revenue.types";

export function buildRevenueManifest(input: {
  cutoverReady: boolean;
  growthReady: boolean;
}): RevenueManifest {
  const loopComplete = isRevenueLoopComplete();
  const entryComplete = isHighConversionEntryPointsComplete();
  const firstCustomerComplete = isFirstCustomerRevenuePathComplete();
  const pressureComplete = isPricingPressureComplete();

  const revenueActivationComplete =
    input.cutoverReady &&
    input.growthReady &&
    loopComplete &&
    entryComplete &&
    firstCustomerComplete &&
    pressureComplete;

  return {
    version: V80_POSTLAUNCH_REVENUE_VERSION,
    cutoverVersion: V80_DEPLOY_CUTOVER_VERSION,
    growthVersion: V80_PRODUCT_GROWTH_VERSION,
    loopStages: REVENUE_ACTIVATION_LOOP.length,
    entryPoints: HIGH_CONVERSION_ENTRY_POINTS.length,
    firstCustomerSteps: FIRST_CUSTOMER_REVENUE_PATH.length,
    pressurePoints: PRICING_PRESSURE_POINTS.length,
    revenueActivationComplete,
    summary: `revenue activation complete=${revenueActivationComplete} loop=${REVENUE_ACTIVATION_LOOP.length}`,
  };
}

export function buildRevenueActivation(input?: { deploymentId?: string }): RevenueActivationReport {
  const deploymentId = input?.deploymentId ?? "v80-postlaunch-revenue";
  const cutover = buildCutover({ deploymentId });
  const growth = buildGrowth({ deploymentId });
  const manifest = buildRevenueManifest({
    cutoverReady: cutover.cutoverReady,
    growthReady: growth.growthReady,
  });

  const revenueReady = cutover.cutoverReady && growth.growthReady && manifest.revenueActivationComplete;

  return {
    version: V80_POSTLAUNCH_REVENUE_VERSION,
    freezeVersion: V80_POSTLAUNCH_REVENUE_FREEZE_VERSION,
    reportId: `revenue-${deploymentId}`,
    cutoverReady: cutover.cutoverReady,
    growthReady: growth.growthReady,
    manifest,
    activationLoop: REVENUE_ACTIVATION_LOOP,
    entryPoints: HIGH_CONVERSION_ENTRY_POINTS,
    firstCustomerPath: FIRST_CUSTOMER_REVENUE_PATH,
    pricingPressure: PRICING_PRESSURE_POINTS,
    conversionTriggers: CONVERSION_TRIGGERS,
    firstTenantFlow: FIRST_TENANT_LIVE_FLOW,
    revenueReady,
    readinessScore: revenueReady ? 100 : 0,
    summary: `revenue ready=${revenueReady} cutover=${cutover.cutoverReady} growth=${growth.growthReady}`,
  };
}

export function assertRevenueActivationPass(
  report: RevenueActivationReport,
): asserts report is RevenueActivationReport & { revenueReady: true } {
  if (!report.revenueReady) {
    throw new Error(`V80 POST-LAUNCH revenue not ready: ${report.summary}`);
  }
}

export function formatRevenueSummary(report: RevenueActivationReport): string {
  return [
    `V80 POST-LAUNCH P1 Revenue Activation`,
    `  version: ${report.version}`,
    `  revenueReady: ${report.revenueReady}`,
    `  loop: ${report.activationLoop.length} stages (usage→value→billing→upgrade)`,
    `  entryPoints: ${report.entryPoints.length} ranked hooks`,
    `  firstCustomer: ${report.firstCustomerPath.length} revenue checkpoints`,
    `  pricingPressure: ${report.pricingPressure.length} paywall points`,
    `  readinessScore: ${report.readinessScore}`,
  ].join("\n");
}

export function runRevenueActivation(input?: { deploymentId?: string }) {
  return buildRevenueActivation(input);
}
