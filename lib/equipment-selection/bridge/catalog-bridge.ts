import { buildEquipmentIntelligenceProfiles } from "@/lib/brand-catalog-intelligence/equipment-intelligence/builders";
import { buildTenderRequirementSet } from "@/lib/brand-catalog-intelligence/equipment-matching/builders";
import type { SelectionBidderBrand, SelectionCategory } from "../shared/types";

export interface CatalogModelEntry {
  modelId: string;
  modelName: string;
  brandName: string;
  category: SelectionCategory;
  unitPriceEstimate: number;
  connectivity: string[];
  warrantyYears: number;
}

const BRAND_PACKAGE_CONFIG: Record<
  SelectionBidderBrand,
  { route: "premium" | "balanced" | "value"; packageLabel: string; primaryModels: string[] }
> = {
  Technogym: {
    route: "premium",
    packageLabel: "Premium Equipment Package",
    primaryModels: ["Skillrun", "Technogym Skillbike"],
  },
  "Life Fitness": {
    route: "premium",
    packageLabel: "Reliability Equipment Package",
    primaryModels: ["T5 Treadmill", "SYNRGY360"],
  },
  Matrix: {
    route: "balanced",
    packageLabel: "Balanced Equipment Package",
    primaryModels: ["Matrix S-Drive"],
  },
  Shuhua: {
    route: "value",
    packageLabel: "Value Equipment Package",
    primaryModels: ["SH-T8000", "Impulse IT7000"],
  },
};

export function getBrandPackageConfig(brand: SelectionBidderBrand) {
  return BRAND_PACKAGE_CONFIG[brand];
}

export function buildCatalogModels(input?: { deploymentId?: string }): CatalogModelEntry[] {
  const deploymentId = input?.deploymentId ?? "equipment-selection-default";
  const profiles = buildEquipmentIntelligenceProfiles({ deploymentId });

  return profiles.map((p) => ({
    modelId: p.modelId,
    modelName: p.modelName,
    brandName: p.brandName,
    category: p.category as SelectionCategory,
    unitPriceEstimate: Math.round(
      p.commercial.warrantyYears * 25000 + p.intelligenceScore * 600,
    ),
    connectivity: p.technical.connectivity,
    warrantyYears: p.commercial.warrantyYears,
  }));
}

export function buildSelectionTenderContext(input?: { deploymentId?: string }) {
  const deploymentId = input?.deploymentId ?? "equipment-selection-default";
  const tenderReq = buildTenderRequirementSet({ deploymentId });
  return {
    tenderId: tenderReq.requirementId,
    projectName: tenderReq.projectName,
    requiredCategories: tenderReq.requiredCategories as SelectionCategory[],
    budgetTier: tenderReq.budgetTier,
    minEquipmentCount: tenderReq.minEquipmentCount,
  };
}
