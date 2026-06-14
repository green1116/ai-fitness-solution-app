import { buildIndustryMarketplace } from "@/lib/industry-marketplace";
import type { IndustryMarketplace } from "@/lib/industry-marketplace";
import type { MarketplaceSignal, RegistryValidation } from "./shared/types";
import { CANONICAL_MARKETPLACE_INTELLIGENCE_SUBJECT_ID } from "./shared/types";

function buildSignalForRecord(record: IndustryMarketplace): MarketplaceSignal {
  const compositeSignalStrength = Math.round(
    record.score.visibilityScore * 0.2 +
      record.score.matchingScore * 0.25 +
      record.score.transactionScore * 0.25 +
      record.score.retentionScore * 0.15 +
      record.score.confidenceScore * 0.15,
  );

  return {
    signalId: `marketplace-signal-${record.marketplaceId}`,
    marketplaceId: record.marketplaceId,
    marketplaceType: record.marketplaceType,
    subjectId: record.subjectId,
    visibilitySignal: record.score.visibilityScore,
    matchingSignal: record.score.matchingScore,
    transactionSignal: record.score.transactionScore,
    retentionSignal: record.score.retentionScore,
    confidenceSignal: record.score.confidenceScore,
    compositeSignalStrength,
    mode: "industry-marketplace-intelligence",
  };
}

export function buildMarketplaceSignals(): MarketplaceSignal[] {
  return buildIndustryMarketplace().map(buildSignalForRecord);
}

export function getMarketplaceSignalsByType(
  marketplaceType: IndustryMarketplace["marketplaceType"],
): MarketplaceSignal[] {
  return buildMarketplaceSignals().filter((signal) => signal.marketplaceType === marketplaceType);
}

export function validateMarketplaceSignalRegistry(): RegistryValidation {
  const signals = buildMarketplaceSignals();
  const requiredTypes: IndustryMarketplace["marketplaceType"][] = [
    "supplier",
    "brand",
    "tender",
    "partnership",
  ];

  const typeCoverage = requiredTypes.every((type) =>
    signals.some((signal) => signal.marketplaceType === type),
  );

  const signalValid = signals.every(
    (signal) =>
      signal.visibilitySignal > 0 &&
      signal.matchingSignal > 0 &&
      signal.transactionSignal > 0 &&
      signal.retentionSignal > 0 &&
      signal.confidenceSignal > 0 &&
      signal.compositeSignalStrength > 0,
  );

  const canonical = signals.filter(
    (signal) => signal.subjectId === CANONICAL_MARKETPLACE_INTELLIGENCE_SUBJECT_ID,
  );

  const valid = signals.length >= 8 && typeCoverage && signalValid && canonical.length >= 1;

  return {
    valid,
    count: signals.length,
    summary: `marketplace-signal count=${signals.length} types=${requiredTypes.filter((t) => signals.some((s) => s.marketplaceType === t)).length}/4 valid=${valid}`,
  };
}
