import { buildBudgetMappingSnapshot } from "@/lib/brand-catalog-intelligence/budget-mapping/builders";
import { buildBrandIntelligenceProfiles } from "@/lib/brand-catalog-intelligence/brand-intelligence/builders";
import type { DifferentiationBidderBrand } from "../shared/types";
import type { BudgetStrategyOption, BudgetStrategySnapshot } from "./types";

const BRAND_BUDGET_TIER: Record<DifferentiationBidderBrand, "premium" | "mid" | "value"> = {
  Technogym: "premium",
  "Life Fitness": "premium",
  Matrix: "mid",
  Shuhua: "value",
};

function toStrategyOption(
  profile: ReturnType<typeof buildBudgetMappingSnapshot>["lowBudgetProfile"],
  tier: "premium" | "mid" | "value",
  label: string,
): BudgetStrategyOption {
  return {
    strategyId: profile.profileId,
    tier,
    label,
    totalBudgetMin: profile.totalBudgetMin,
    totalBudgetMax: profile.totalBudgetMax,
    currency: profile.currency,
    equipmentCount: profile.equipmentItems.length,
    rationale: profile.label,
  };
}

export function buildBudgetStrategySnapshot(input?: {
  deploymentId?: string;
  bidderBrand?: DifferentiationBidderBrand;
}): BudgetStrategySnapshot {
  const deploymentId = input?.deploymentId ?? "budget-strategy-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const budgetMapping = buildBudgetMappingSnapshot({ deploymentId });
  const brandProfile = buildBrandIntelligenceProfiles({ deploymentId }).find((p) => p.brandName === bidderBrand);

  const premiumBudgetStrategy = toStrategyOption(
    budgetMapping.premiumBudgetProfile,
    "premium",
    "Premium Budget Strategy",
  );
  const midBudgetStrategy = toStrategyOption(
    budgetMapping.midBudgetProfile,
    "mid",
    "Mid Budget Strategy",
  );
  const valueBudgetStrategy = toStrategyOption(
    budgetMapping.lowBudgetProfile,
    "value",
    "Value Budget Strategy",
  );

  const selectedTier = BRAND_BUDGET_TIER[bidderBrand];
  const selectedStrategy =
    selectedTier === "premium" ? premiumBudgetStrategy
      : selectedTier === "mid" ? midBudgetStrategy
        : valueBudgetStrategy;

  selectedStrategy.rationale = `${bidderBrand} (${brandProfile?.brandTier ?? selectedTier}) → ${selectedStrategy.label}`;

  const budgetStrategyScore = Math.round(
    (selectedStrategy.equipmentCount / 4) * 60 +
      (budgetMapping.budgetMappingReadiness * 0.4),
  );

  return {
    snapshotId: `budget-strategy-${bidderBrand}-${deploymentId}`,
    bidderBrand,
    selectedStrategy,
    premiumBudgetStrategy,
    midBudgetStrategy,
    valueBudgetStrategy,
    budgetStrategyScore,
  };
}
