import { buildEquipmentCatalogSnapshot } from "@/lib/bidder-intelligence/equipment-catalog/builders";
import type {
  EquipmentIntelCategory,
  EquipmentIntelligenceProfile,
  EquipmentIntelligenceSnapshot,
} from "./types";

const EXTENDED_EQUIPMENT: Array<{
  modelName: string;
  brandName: string;
  category: EquipmentIntelCategory;
  priceMin: number;
  priceMax: number;
}> = [
  { modelName: "T5 Treadmill", brandName: "Life Fitness", category: "cardio", priceMin: 85000, priceMax: 120000 },
  { modelName: "Skillrun", brandName: "Technogym", category: "cardio", priceMin: 150000, priceMax: 220000 },
  { modelName: "SYNRGY360", brandName: "Life Fitness", category: "functional", priceMin: 180000, priceMax: 250000 },
  { modelName: "SH-T8000", brandName: "Shuhua", category: "cardio", priceMin: 35000, priceMax: 55000 },
  { modelName: "Matrix S-Drive", brandName: "Matrix", category: "cardio", priceMin: 65000, priceMax: 95000 },
  { modelName: "Johnson A5700", brandName: "Johnson", category: "strength", priceMin: 45000, priceMax: 72000 },
  { modelName: "Impulse IT7000", brandName: "Impulse", category: "strength", priceMin: 28000, priceMax: 42000 },
  { modelName: "Technogym Skillbike", brandName: "Technogym", category: "group-training", priceMin: 95000, priceMax: 140000 },
  { modelName: "AI Smart Bike Pro", brandName: "IntelligentFit", category: "cardio", priceMin: 28000, priceMax: 45000 },
  { modelName: "Recovery Station R1", brandName: "IntelligentFit", category: "recovery", priceMin: 18000, priceMax: 32000 },
];

export function buildEquipmentIntelligenceProfiles(input?: { deploymentId?: string }): EquipmentIntelligenceProfile[] {
  const deploymentId = input?.deploymentId ?? "equipment-intelligence-default";
  const catalog = buildEquipmentCatalogSnapshot({ deploymentId });

  return EXTENDED_EQUIPMENT.map((equip, index) => {
    const catalogMatch = catalog.models.find((m) => m.modelName === equip.modelName);
    const maintMatch = catalogMatch
      ? catalog.maintenanceProfiles.find((p) => p.modelId === catalogMatch.modelId)
      : undefined;

    const priceMid = Math.round((equip.priceMin + equip.priceMax) / 2);
    const intelligenceScore = Math.min(95, Math.round(70 + (priceMid / 5000) + (index % 5) * 2));

    return {
      profileId: `equip-intel-${equip.modelName.toLowerCase().replace(/\s+/g, "-")}-${deploymentId}`,
      modelId: catalogMatch?.modelId ?? `model-ext-${index}-${deploymentId}`,
      modelName: equip.modelName,
      brandName: equip.brandName,
      category: equip.category,
      technical: {
        dimensions: `${180 + index * 5} x ${80 + index * 2} x ${140 + index * 3} cm`,
        weightKg: 120 + index * 15,
        powerRequirement: index % 2 === 0 ? "220V / 10A" : "220V / 15A",
        maxUserWeightKg: 150 + index * 5,
        connectivity: equip.brandName === "IntelligentFit" || equip.brandName === "Technogym"
          ? ["Bluetooth", "WiFi", "Cloud API"]
          : ["Basic console"],
      },
      commercial: {
        warrantyYears: equip.priceMax > 100000 ? 3 : 2,
        leadTimeDays: equip.brandName === "Shuhua" || equip.brandName === "Impulse" ? 14 : 30,
        installationComplexity: equip.category === "functional" ? "high" : "medium",
        targetVenue: equip.category === "group-training"
          ? ["campus", "enterprise"]
          : equip.priceMax < 50000
            ? ["community", "government"]
            : ["enterprise", "hotel"],
      },
      maintenance: {
        intervalDays: maintMatch?.maintenanceIntervalDays ?? 90,
        avgAnnualCost: maintMatch?.avgRepairCost ? maintMatch.avgRepairCost * 4 : 4800,
        sparePartsAvailability: maintMatch?.sparePartsAvailability ?? "medium",
        technicianSkillLevel: equip.priceMax > 120000 ? "specialist" : "certified",
      },
      intelligenceScore,
      mode: "readiness-stub",
    };
  });
}

export function buildEquipmentIntelligenceSnapshot(input?: { deploymentId?: string }): EquipmentIntelligenceSnapshot {
  const deploymentId = input?.deploymentId ?? "equipment-intelligence-default";
  const profiles = buildEquipmentIntelligenceProfiles({ deploymentId });

  const categoryCoverage = { cardio: 0, strength: 0, functional: 0, "group-training": 0, recovery: 0 };
  for (const profile of profiles) {
    categoryCoverage[profile.category] += 1;
  }

  const categoryBreadth = Object.values(categoryCoverage).filter((c) => c > 0).length;
  const avgScore = Math.round(profiles.reduce((s, p) => s + p.intelligenceScore, 0) / profiles.length);
  const equipmentReadiness = Math.round((categoryBreadth / 5) * avgScore);

  return {
    snapshotId: `equipment-intelligence-${deploymentId}`,
    profiles,
    categoryCoverage,
    equipmentReadiness,
  };
}
