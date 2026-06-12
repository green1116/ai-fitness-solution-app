import { buildPackagingContext } from "../bridge/packaging-bridge";
import type { PackagingBidderBrand } from "../shared/types";
import { BRAND_STRATEGY_TIER } from "../shared/types";

const LIFECYCLE_MULTIPLIERS: Record<PackagingBidderBrand, { maintenance: number; replacement: number; years: number }> = {
  Technogym: { maintenance: 0.18, replacement: 0.35, years: 10 },
  "Life Fitness": { maintenance: 0.14, replacement: 0.28, years: 10 },
  Matrix: { maintenance: 0.16, replacement: 0.32, years: 8 },
  Shuhua: { maintenance: 0.12, replacement: 0.40, years: 7 },
};

export function buildLifecycleCostProfile(input?: {
  deploymentId?: string;
  bidderBrand?: PackagingBidderBrand;
}) {
  const deploymentId = input?.deploymentId ?? "lifecycle-cost-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const ctx = buildPackagingContext({ deploymentId, bidderBrand });
  const mult = LIFECYCLE_MULTIPLIERS[bidderBrand];
  const strategyTier = BRAND_STRATEGY_TIER[bidderBrand];

  const acquisitionCost = ctx.totalBudgetMin;
  const maintenanceCost = Math.round(acquisitionCost * mult.maintenance);
  const replacementCost = Math.round(acquisitionCost * mult.replacement);
  const totalLifecycleCost = acquisitionCost + maintenanceCost + replacementCost;

  const lifecycleReadiness = Math.min(
    100,
    Math.round(
      ctx.budgetStrategyScore * 0.5 +
        (totalLifecycleCost > acquisitionCost ? 30 : 0) +
        (strategyTier === "premium" ? 20 : strategyTier === "balanced" ? 15 : 10),
    ),
  );

  return {
    profileId: `lifecycle-cost-${bidderBrand}-${deploymentId}`,
    proposalLabel: ctx.proposalLabel,
    bidderBrand,
    strategyTier,
    acquisitionCost,
    maintenanceCost,
    replacementCost,
    totalLifecycleCost,
    lifecycleReadiness,
  };
}
