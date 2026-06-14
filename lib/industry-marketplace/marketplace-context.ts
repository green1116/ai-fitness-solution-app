import type { RegistryValidation } from "./shared/types";
import { buildIndustryMarketplace } from "./marketplace-registry";
import type {
  IndustryMarketplaceStatus,
  IndustryMarketplaceType,
  MarketplaceContext,
} from "./shared/types";
import {
  CANONICAL_MARKETPLACE_SUBJECT_ID,
  INDUSTRY_MARKETPLACE_TAG,
  INDUSTRY_MARKETPLACE_VERSION,
} from "./shared/types";

function buildTypeBreakdown(
  marketplaceRecords: ReturnType<typeof buildIndustryMarketplace>,
): Record<IndustryMarketplaceType, number> {
  const breakdown: Record<IndustryMarketplaceType, number> = {
    supplier: 0,
    brand: 0,
    tender: 0,
    partnership: 0,
  };

  for (const record of marketplaceRecords) {
    breakdown[record.marketplaceType] += 1;
  }

  return breakdown;
}

function buildStatusBreakdown(
  marketplaceRecords: ReturnType<typeof buildIndustryMarketplace>,
): Record<IndustryMarketplaceStatus, number> {
  const breakdown: Record<IndustryMarketplaceStatus, number> = {
    listed: 0,
    visible: 0,
    matched: 0,
    engaged: 0,
    transacting: 0,
    fulfilled: 0,
    retained: 0,
    archived: 0,
  };

  for (const record of marketplaceRecords) {
    breakdown[record.marketplaceStatus] += 1;
  }

  return breakdown;
}

export function buildMarketplaceContext(): MarketplaceContext {
  const marketplaceRecords = buildIndustryMarketplace();

  return {
    contextId: `marketplace-context-${INDUSTRY_MARKETPLACE_VERSION}`,
    marketplaceRecords,
    marketplaceCount: marketplaceRecords.length,
    typeBreakdown: buildTypeBreakdown(marketplaceRecords),
    statusBreakdown: buildStatusBreakdown(marketplaceRecords),
    marketplaceReady: marketplaceRecords.length > 0,
    mode: "industry-marketplace",
  };
}

export function validateMarketplaceContextState(context: MarketplaceContext): boolean {
  const canonical = context.marketplaceRecords.filter(
    (record) => record.subjectId === CANONICAL_MARKETPLACE_SUBJECT_ID,
  );

  return (
    context.marketplaceReady &&
    context.marketplaceCount >= 8 &&
    context.marketplaceRecords.length === context.marketplaceCount &&
    Object.values(context.typeBreakdown).every((count) => count > 0) &&
    Object.values(context.statusBreakdown).every((count) => count > 0) &&
    canonical.length >= 1 &&
    context.mode === "industry-marketplace"
  );
}

export function validateMarketplaceContextRegistry(): RegistryValidation {
  const context = buildMarketplaceContext();
  const valid =
    validateMarketplaceContextState(context) &&
    INDUSTRY_MARKETPLACE_VERSION === "v35-industry-marketplace-1" &&
    INDUSTRY_MARKETPLACE_TAG === "v35-industry-marketplace-foundation";

  return {
    valid,
    count: context.marketplaceCount,
    summary: `marketplace-context count=${context.marketplaceCount} types=4/4 statuses=8/8 valid=${valid}`,
  };
}
