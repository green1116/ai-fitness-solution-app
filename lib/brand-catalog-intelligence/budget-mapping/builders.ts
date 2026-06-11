import { buildBrandIntelligenceProfiles } from "../brand-intelligence/builders";
import { buildEquipmentIntelligenceProfiles } from "../equipment-intelligence/builders";
import type { BudgetMappingSnapshot, BudgetProfile } from "./types";

const TIER_BRANDS: Record<"low" | "mid" | "premium", string[]> = {
  low: ["Shuhua", "Impulse"],
  mid: ["Matrix", "Johnson", "IntelligentFit"],
  premium: ["Technogym", "Life Fitness"],
};

function buildBudgetProfile(input: {
  deploymentId: string;
  tier: "low" | "mid" | "premium";
  label: string;
  quantities: number[];
}): BudgetProfile {
  const profiles = buildEquipmentIntelligenceProfiles({ deploymentId: input.deploymentId });
  const brandProfiles = buildBrandIntelligenceProfiles({ deploymentId: input.deploymentId });
  const tierBrands = new Set(TIER_BRANDS[input.tier]);

  const eligible = profiles.filter((p) => tierBrands.has(p.brandName));
  const fallback = profiles.filter(
    (p) => brandProfiles.find((b) => b.brandName === p.brandName)?.brandTier ===
      (input.tier === "low" ? "value" : input.tier === "mid" ? "commercial" : "premium"),
  );
  const selected = (eligible.length >= 2 ? eligible : fallback).slice(0, 4);
  const equipmentItems = selected.map((profile, index) => {
    const unitPrice = input.tier === "low" ? 35000 + index * 5000
      : input.tier === "mid" ? 65000 + index * 10000
        : 120000 + index * 20000;
    return {
      modelName: profile.modelName,
      brandName: profile.brandName,
      unitPriceEstimate: unitPrice,
      quantity: input.quantities[index] ?? 2,
    };
  });

  const totalMin = equipmentItems.reduce((s, item) => s + item.unitPriceEstimate * item.quantity, 0);
  const totalMax = Math.round(totalMin * 1.15);

  return {
    profileId: `budget-${input.tier}-${input.deploymentId}`,
    tier: input.tier,
    label: input.label,
    totalBudgetMin: totalMin,
    totalBudgetMax: totalMax,
    currency: "CNY",
    equipmentItems,
    coverageScore: Math.round((selected.length / 4) * 100),
  };
}

export function buildBudgetMappingSnapshot(input?: { deploymentId?: string }): BudgetMappingSnapshot {
  const deploymentId = input?.deploymentId ?? "budget-mapping-default";

  const lowBudgetProfile = buildBudgetProfile({
    deploymentId,
    tier: "low",
    label: "Low Budget Profile — Value brands, essential coverage",
    quantities: [4, 3, 2, 2],
  });

  const midBudgetProfile = buildBudgetProfile({
    deploymentId,
    tier: "mid",
    label: "Mid Budget Profile — Commercial brands, balanced mix",
    quantities: [3, 3, 2, 1],
  });

  const premiumBudgetProfile = buildBudgetProfile({
    deploymentId,
    tier: "premium",
    label: "Premium Budget Profile — Premium brands, full capability",
    quantities: [2, 2, 2, 1],
  });

  const budgetMappingReadiness = Math.round(
    (lowBudgetProfile.coverageScore + midBudgetProfile.coverageScore + premiumBudgetProfile.coverageScore) / 3,
  );

  return {
    snapshotId: `budget-mapping-${deploymentId}`,
    lowBudgetProfile,
    midBudgetProfile,
    premiumBudgetProfile,
    budgetMappingReadiness,
  };
}
