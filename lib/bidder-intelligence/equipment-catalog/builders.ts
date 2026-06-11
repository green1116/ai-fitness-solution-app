import type { EquipmentCatalogSnapshot, EquipmentModel, MaintenanceProfile } from "./types";

export function buildEquipmentModels(input?: { deploymentId?: string }): EquipmentModel[] {
  const deploymentId = input?.deploymentId ?? "equipment-catalog-default";
  return [
    { modelId: `model-t5-${deploymentId}`, modelName: "T5 Treadmill", category: "cardio", brandId: `brand-lf-${deploymentId}`, brandName: "Life Fitness", priceRangeMin: 85000, priceRangeMax: 120000, currency: "CNY", mode: "readiness-stub" },
    { modelId: `model-syn-${deploymentId}`, modelName: "SYNRGY360", category: "functional", brandId: `brand-lf-${deploymentId}`, brandName: "Life Fitness", priceRangeMin: 180000, priceRangeMax: 250000, currency: "CNY", mode: "readiness-stub" },
    { modelId: `model-skill-${deploymentId}`, modelName: "Skillrun", category: "smart-connected", brandId: `brand-ts-${deploymentId}`, brandName: "Technogym", priceRangeMin: 150000, priceRangeMax: 220000, currency: "CNY", mode: "readiness-stub" },
    { modelId: `model-sh-run-${deploymentId}`, modelName: "SH-T8000", category: "cardio", brandId: `brand-sh-${deploymentId}`, brandName: "Shuhua", priceRangeMin: 35000, priceRangeMax: 55000, currency: "CNY", mode: "readiness-stub" },
    { modelId: `model-ai-bike-${deploymentId}`, modelName: "AI Smart Bike Pro", category: "smart-connected", brandId: `brand-int-${deploymentId}`, brandName: "IntelligentFit", priceRangeMin: 28000, priceRangeMax: 45000, currency: "CNY", mode: "readiness-stub" },
    { modelId: `model-ai-row-${deploymentId}`, modelName: "AI Row Trainer", category: "cardio", brandId: `brand-int-${deploymentId}`, brandName: "IntelligentFit", priceRangeMin: 32000, priceRangeMax: 48000, currency: "CNY", mode: "readiness-stub" },
  ];
}

export function buildMaintenanceProfiles(input?: { deploymentId?: string }): MaintenanceProfile[] {
  const deploymentId = input?.deploymentId ?? "equipment-catalog-default";
  const models = buildEquipmentModels({ deploymentId });
  return models.map((model, index) => ({
    profileId: `maint-${model.modelId}`,
    modelId: model.modelId,
    maintenanceIntervalDays: 90 + index * 15,
    avgRepairCost: 1200 + index * 300,
    expectedLifespanYears: 8 - Math.floor(index / 3),
    sparePartsAvailability: index % 3 === 0 ? "high" : index % 3 === 1 ? "medium" : "low",
  }));
}

export function buildEquipmentCatalogSnapshot(input?: { deploymentId?: string }): EquipmentCatalogSnapshot {
  const deploymentId = input?.deploymentId ?? "equipment-catalog-default";
  const models = buildEquipmentModels({ deploymentId });
  const maintenanceProfiles = buildMaintenanceProfiles({ deploymentId });

  const categoryCoverage = { cardio: 0, strength: 0, functional: 0, "smart-connected": 0, recovery: 0 };
  for (const model of models) {
    categoryCoverage[model.category] += 1;
  }

  const categoryBreadth = Object.values(categoryCoverage).filter((count) => count > 0).length;
  const highAvailability = maintenanceProfiles.filter((p) => p.sparePartsAvailability === "high").length;
  const catalogReadiness = Math.round((categoryBreadth / 5) * 100 * (highAvailability / maintenanceProfiles.length + 0.5));

  return {
    catalogId: `equipment-catalog-${deploymentId}`,
    models,
    maintenanceProfiles,
    categoryCoverage,
    catalogReadiness,
  };
}
