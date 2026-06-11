import { buildCatalogModels, getBrandPackageConfig } from "../bridge/catalog-bridge";
import { buildRequirementProfile } from "../equipment-requirement/builders";
import { buildModelSelectionSnapshot } from "../model-selection/builders";
import type { SelectionBidderBrand } from "../shared/types";
import type { EquipmentPackage, EquipmentPackageSnapshot, PackageEquipmentItem } from "./types";

const BRAND_PACKAGE_ITEMS: Record<SelectionBidderBrand, Array<{ modelName: string; quantity: number }>> = {
  Technogym: [
    { modelName: "Skillrun", quantity: 4 },
    { modelName: "Technogym Skillbike", quantity: 3 },
    { modelName: "Recovery Station R1", quantity: 2 },
  ],
  "Life Fitness": [
    { modelName: "T5 Treadmill", quantity: 5 },
    { modelName: "SYNRGY360", quantity: 3 },
    { modelName: "Johnson A5700", quantity: 4 },
  ],
  Matrix: [
    { modelName: "Matrix S-Drive", quantity: 4 },
    { modelName: "AI Smart Bike Pro", quantity: 3 },
    { modelName: "Recovery Station R1", quantity: 1 },
  ],
  Shuhua: [
    { modelName: "SH-T8000", quantity: 4 },
    { modelName: "Impulse IT7000", quantity: 3 },
  ],
};

function buildPackageForBrand(input: {
  deploymentId: string;
  bidderBrand: SelectionBidderBrand;
}): EquipmentPackage {
  const { deploymentId, bidderBrand } = input;
  const config = getBrandPackageConfig(bidderBrand);
  const models = buildCatalogModels({ deploymentId });
  const items = BRAND_PACKAGE_ITEMS[bidderBrand];

  const equipmentList: PackageEquipmentItem[] = items.map((item) => {
    const model = models.find((m) => m.modelName === item.modelName);
    if (!model) throw new Error(`Model not found: ${item.modelName}`);
    return {
      modelId: model.modelId,
      modelName: model.modelName,
      brandName: model.brandName,
      category: model.category,
      quantity: item.quantity,
      unitPriceEstimate: model.unitPriceEstimate,
    };
  });

  const categoryDistribution: Record<string, number> = {};
  for (const item of equipmentList) {
    categoryDistribution[item.category] = (categoryDistribution[item.category] ?? 0) + item.quantity;
  }

  const modelMapping = Object.fromEntries(
    equipmentList.map((item) => [item.category, item.modelName]),
  );

  const totalBudgetEstimate = equipmentList.reduce(
    (sum, item) => sum + item.unitPriceEstimate * item.quantity,
    0,
  );

  return {
    packageId: `package-${bidderBrand.toLowerCase().replace(/\s+/g, "-")}-${deploymentId}`,
    packageLabel: config.packageLabel,
    routeType: config.route,
    bidderBrand,
    equipmentList,
    modelMapping,
    categoryDistribution,
    totalBudgetEstimate,
  };
}

export function buildEquipmentPackageSnapshot(input?: {
  deploymentId?: string;
  bidderBrand?: SelectionBidderBrand;
}): EquipmentPackageSnapshot {
  const deploymentId = input?.deploymentId ?? "equipment-package-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const requirement = buildRequirementProfile({ deploymentId });
  void buildModelSelectionSnapshot({ deploymentId, bidderBrand });

  const premiumPackage = buildPackageForBrand({ deploymentId, bidderBrand: "Technogym" });
  const balancedPackage = buildPackageForBrand({ deploymentId, bidderBrand: "Matrix" });
  const valuePackage = buildPackageForBrand({ deploymentId, bidderBrand: "Shuhua" });
  const selectedPackage = buildPackageForBrand({ deploymentId, bidderBrand });

  const totalQty = selectedPackage.equipmentList.reduce((s, i) => s + i.quantity, 0);
  const categoriesCovered = Object.keys(selectedPackage.categoryDistribution).length;
  const packageReadiness = Math.round(
    (totalQty / requirement.totalMinQuantity) * 50 +
      (categoriesCovered / 5) * 50,
  );

  return {
    snapshotId: `equipment-package-${bidderBrand}-${deploymentId}`,
    premiumPackage,
    balancedPackage,
    valuePackage,
    selectedPackage,
    packageReadiness: Math.min(100, packageReadiness),
  };
}

export function buildAllBrandPackages(input?: { deploymentId?: string }): EquipmentPackage[] {
  const deploymentId = input?.deploymentId ?? "equipment-package-default";
  return (["Technogym", "Life Fitness", "Matrix", "Shuhua"] as SelectionBidderBrand[]).map(
    (brand) => buildPackageForBrand({ deploymentId, bidderBrand: brand }),
  );
}
