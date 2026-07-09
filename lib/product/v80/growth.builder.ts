/**
 * V80 PRODUCT P2 — Growth builder (read-only P1 consumer)
 */
import { buildProductization } from "./productization.builder";
import { V80_PRODUCT_PRODUCTIZATION_VERSION } from "./productization.types";
import { isConversionTriggersComplete, CONVERSION_TRIGGERS } from "./growth.conversion.spec";
import { isExpansionEngineComplete, EXPANSION_PATHS } from "./growth.expansion.spec";
import { isSalesFunnelComplete, SALES_FUNNEL_STAGES } from "./growth.funnel.spec";
import { isEnterpriseGtmComplete, ENTERPRISE_GTM_MOTIONS } from "./growth.gtm.spec";
import type { GrowthManifest, GrowthReport } from "./growth.types";
import { V80_PRODUCT_GROWTH_FREEZE_VERSION, V80_PRODUCT_GROWTH_VERSION } from "./growth.types";

export function buildGrowthManifest(input: { productizationReady: boolean }): GrowthManifest {
  const funnelComplete = isSalesFunnelComplete();
  const conversionComplete = isConversionTriggersComplete();
  const gtmComplete = isEnterpriseGtmComplete();
  const expansionComplete = isExpansionEngineComplete();

  const growthComplete =
    input.productizationReady &&
    funnelComplete &&
    conversionComplete &&
    gtmComplete &&
    expansionComplete;

  return {
    version: V80_PRODUCT_GROWTH_VERSION,
    productizationVersion: V80_PRODUCT_PRODUCTIZATION_VERSION,
    funnelStages: SALES_FUNNEL_STAGES.length,
    conversionTriggers: CONVERSION_TRIGGERS.length,
    gtmMotions: ENTERPRISE_GTM_MOTIONS.length,
    expansionPaths: EXPANSION_PATHS.length,
    growthComplete,
    summary: `growth complete=${growthComplete} funnel=${SALES_FUNNEL_STAGES.length}`,
  };
}

export function buildGrowth(input?: { deploymentId?: string }): GrowthReport {
  const deploymentId = input?.deploymentId ?? "v80-product-growth-default";
  const productization = buildProductization({ deploymentId });
  const manifest = buildGrowthManifest({ productizationReady: productization.productizationReady });

  const growthReady = productization.productizationReady && manifest.growthComplete;

  return {
    version: V80_PRODUCT_GROWTH_VERSION,
    freezeVersion: V80_PRODUCT_GROWTH_FREEZE_VERSION,
    reportId: `growth-${deploymentId}`,
    productizationReady: productization.productizationReady,
    manifest,
    funnel: SALES_FUNNEL_STAGES,
    conversionTriggers: CONVERSION_TRIGGERS,
    gtmMotions: ENTERPRISE_GTM_MOTIONS,
    expansionPaths: EXPANSION_PATHS,
    growthReady,
    readinessScore: growthReady ? 100 : 0,
    summary: `growth ready=${growthReady} productization=${productization.productizationReady}`,
  };
}

export function assertGrowthPass(report: GrowthReport): asserts report is GrowthReport & { growthReady: true } {
  if (!report.growthReady) {
    throw new Error(`V80 PRODUCT growth not ready: ${report.summary}`);
  }
}
