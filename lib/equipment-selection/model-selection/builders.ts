import { buildCatalogModels, getBrandPackageConfig } from "../bridge/catalog-bridge";
import type { SelectionBidderBrand } from "../shared/types";
import type { ModelSelectionEntry, ModelSelectionSnapshot } from "./types";

const BRAND_UPGRADE_MAP: Record<SelectionBidderBrand, string> = {
  Technogym: "Technogym Skillbike",
  "Life Fitness": "SYNRGY360",
  Matrix: "Matrix S-Drive",
  Shuhua: "SH-T8000",
};

function toEntry(
  model: ReturnType<typeof buildCatalogModels>[number],
  role: ModelSelectionEntry["selectionRole"],
  routeType: ModelSelectionEntry["routeType"],
): ModelSelectionEntry {
  return {
    modelId: model.modelId,
    modelName: model.modelName,
    brandName: model.brandName,
    category: model.category,
    selectionRole: role,
    routeType,
    unitPriceEstimate: model.unitPriceEstimate,
  };
}

export function buildModelSelectionSnapshot(input?: {
  deploymentId?: string;
  bidderBrand?: SelectionBidderBrand;
}): ModelSelectionSnapshot {
  const deploymentId = input?.deploymentId ?? "model-selection-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const config = getBrandPackageConfig(bidderBrand);
  const models = buildCatalogModels({ deploymentId });

  const brandModels = models.filter((m) => m.brandName === bidderBrand);
  const primaryName = config.primaryModels[0];
  const preferredSource = brandModels.find((m) => m.modelName === primaryName) ?? brandModels[0];
  if (!preferredSource) throw new Error(`No models for brand: ${bidderBrand}`);

  const alternativeSource =
    brandModels.find((m) => m.modelName !== preferredSource.modelName) ??
    models.find((m) => m.category === preferredSource.category && m.brandName !== bidderBrand)!;

  const upgradeName = BRAND_UPGRADE_MAP[bidderBrand];
  const upgradeSource =
    brandModels.find((m) => m.modelName === upgradeName) ??
    models.sort((a, b) => b.unitPriceEstimate - a.unitPriceEstimate).find((m) => m.brandName === bidderBrand) ??
    preferredSource;

  const modelReadiness = Math.round(
    (brandModels.length / 2) * 40 +
      (preferredSource.connectivity.length > 1 ? 30 : 15) +
      (upgradeSource.unitPriceEstimate > preferredSource.unitPriceEstimate ? 30 : 20),
  );

  return {
    snapshotId: `model-selection-${bidderBrand}-${deploymentId}`,
    bidderBrand,
    routeType: config.route,
    preferredModel: toEntry(preferredSource, "preferred", config.route),
    alternativeModel: toEntry(alternativeSource, "alternative", config.route),
    upgradeModel: toEntry(upgradeSource, "upgrade", config.route),
    modelReadiness: Math.min(100, modelReadiness),
  };
}
