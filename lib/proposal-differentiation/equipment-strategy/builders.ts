import { buildEquipmentIntelligenceProfiles } from "@/lib/brand-catalog-intelligence/equipment-intelligence/builders";
import { buildDifferentiationTenderContext } from "../bridge/tender-context";
import type { DifferentiationBidderBrand } from "../shared/types";
import type { EquipmentSetItem, EquipmentStrategySnapshot } from "./types";

const UPGRADE_PATHS: Record<DifferentiationBidderBrand, string[]> = {
  Technogym: ["Skillrun → Skillbike connected ecosystem", "Add wellness recovery zone", "Premium digital coaching platform"],
  "Life Fitness": ["T5 → SYNRGY360 functional zone", "Add strength circuit package", "Enterprise console integration"],
  Matrix: ["S-Drive cardio core → functional add-on", "Upgrade to smart-connected tier", "Expand group training zone"],
  Shuhua: ["SH-T8000 cardio base → domestic strength mix", "Phase 2 smart upgrade path", "Community recovery add-on"],
};

export function buildEquipmentStrategySnapshot(input?: {
  deploymentId?: string;
  bidderBrand?: DifferentiationBidderBrand;
}): EquipmentStrategySnapshot {
  const deploymentId = input?.deploymentId ?? "equipment-strategy-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const tender = buildDifferentiationTenderContext({ deploymentId, bidderBrand });
  const profiles = buildEquipmentIntelligenceProfiles({ deploymentId });

  const brandEquipment = profiles.filter((p) => p.brandName === bidderBrand);
  const categoryMatches = profiles.filter((p) => tender.requiredCategories.includes(p.category));

  const preferredSource = brandEquipment.length >= 2 ? brandEquipment : categoryMatches;
  const preferredEquipmentSet: EquipmentSetItem[] = preferredSource.slice(0, 3).map((p, i) => ({
    modelId: p.modelId,
    modelName: p.modelName,
    brandName: p.brandName,
    category: p.category,
    role: i === 0 ? "core" : "supplement",
  }));

  const alternativeEquipmentSet: EquipmentSetItem[] = categoryMatches
    .filter((p) => p.brandName !== bidderBrand)
    .slice(0, 3)
    .map((p) => ({
      modelId: p.modelId,
      modelName: p.modelName,
      brandName: p.brandName,
      category: p.category,
      role: "supplement" as const,
    }));

  const equipmentStrategyScore = Math.round(
    (preferredEquipmentSet.length / 3) * 50 +
      (alternativeEquipmentSet.length / 3) * 30 +
      (UPGRADE_PATHS[bidderBrand].length / 3) * 20,
  ) * (preferredEquipmentSet.length > 0 ? 1 : 0.5) + (brandEquipment.length > 0 ? 20 : 0);

  return {
    snapshotId: `equipment-strategy-${bidderBrand}-${deploymentId}`,
    bidderBrand,
    preferredEquipmentSet,
    alternativeEquipmentSet,
    upgradePath: UPGRADE_PATHS[bidderBrand],
    equipmentStrategyScore: Math.min(100, equipmentStrategyScore),
  };
}
