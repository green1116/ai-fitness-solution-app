import { buildBrandIntelligenceProfiles } from "@/lib/brand-catalog-intelligence/brand-intelligence/builders";
import type { DifferentiationBidderBrand } from "../shared/types";
import type { BrandStrategyOption, BrandStrategySnapshot } from "./types";

function buildStrategyOption(input: {
  deploymentId: string;
  strategyType: "premium" | "balanced" | "value";
  label: string;
  focusBrands: string[];
  positioning: string;
}): BrandStrategyOption {
  return {
    strategyId: `brand-strat-${input.strategyType}-${input.deploymentId}`,
    strategyType: input.strategyType,
    label: input.label,
    focusBrands: input.focusBrands,
    positioning: input.positioning,
    rationale: `${input.label} — focus on ${input.focusBrands.join(", ")} for ${input.positioning}`,
  };
}

const BRAND_STRATEGY_MAP: Record<DifferentiationBidderBrand, "premium" | "balanced" | "value"> = {
  Technogym: "premium",
  "Life Fitness": "premium",
  Matrix: "balanced",
  Shuhua: "value",
};

export function buildBrandStrategySnapshot(input?: {
  deploymentId?: string;
  bidderBrand?: DifferentiationBidderBrand;
}): BrandStrategySnapshot {
  const deploymentId = input?.deploymentId ?? "brand-strategy-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const profiles = buildBrandIntelligenceProfiles({ deploymentId });
  const brandProfile = profiles.find((p) => p.brandName === bidderBrand);
  if (!brandProfile) throw new Error(`Brand profile not found: ${bidderBrand}`);

  const premiumBrands = profiles.filter((p) => p.brandTier === "premium").map((p) => p.brandName);
  const commercialBrands = profiles.filter((p) => p.brandTier === "commercial").map((p) => p.brandName);
  const valueBrands = profiles.filter((p) => p.brandTier === "value").map((p) => p.brandName);

  const premiumStrategy = buildStrategyOption({
    deploymentId,
    strategyType: "premium",
    label: "Premium Strategy",
    focusBrands: premiumBrands,
    positioning: "Design-led wellness with premium service and lifecycle value",
  });

  const balancedStrategy = buildStrategyOption({
    deploymentId,
    strategyType: "balanced",
    label: "Balanced Strategy",
    focusBrands: commercialBrands,
    positioning: "Price-performance balance with reliable delivery and support",
  });

  const valueStrategy = buildStrategyOption({
    deploymentId,
    strategyType: "value",
    label: "Value Strategy",
    focusBrands: valueBrands,
    positioning: "Cost-effective procurement with compliance-friendly domestic options",
  });

  const selectedType = BRAND_STRATEGY_MAP[bidderBrand];
  const selectedStrategy =
    selectedType === "premium" ? premiumStrategy
      : selectedType === "balanced" ? balancedStrategy
        : valueStrategy;

  selectedStrategy.focusBrands = [bidderBrand, ...selectedStrategy.focusBrands.filter((b) => b !== bidderBrand).slice(0, 1)];
  selectedStrategy.positioning = `${brandProfile.marketPosition} — led by ${bidderBrand}`;
  selectedStrategy.rationale = `Bidder ${bidderBrand} (${brandProfile.brandTier}) → ${selectedStrategy.label}`;

  return {
    snapshotId: `brand-strategy-${bidderBrand}-${deploymentId}`,
    bidderBrand,
    selectedStrategy,
    premiumStrategy,
    balancedStrategy,
    valueStrategy,
    strategyScore: brandProfile.intelligenceScore,
  };
}
