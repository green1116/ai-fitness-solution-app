import type { BIDDER_INTELLIGENCE_VERSION, ReadinessStubMode } from "../shared/types";

export const EQUIPMENT_CATALOG_RUNTIME_VERSION = "v19.0-equipment-catalog-1" as const;

export const EQUIPMENT_CATEGORIES = [
  "cardio",
  "strength",
  "functional",
  "smart-connected",
  "recovery",
] as const;
export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number];

export interface EquipmentModel {
  modelId: string;
  modelName: string;
  category: EquipmentCategory;
  brandId: string;
  brandName: string;
  priceRangeMin: number;
  priceRangeMax: number;
  currency: string;
  mode: ReadinessStubMode;
}

export interface MaintenanceProfile {
  profileId: string;
  modelId: string;
  maintenanceIntervalDays: number;
  avgRepairCost: number;
  expectedLifespanYears: number;
  sparePartsAvailability: "high" | "medium" | "low";
}

export interface EquipmentCatalogSnapshot {
  catalogId: string;
  models: EquipmentModel[];
  maintenanceProfiles: MaintenanceProfile[];
  categoryCoverage: Record<EquipmentCategory, number>;
  catalogReadiness: number;
}

export interface EquipmentCatalogRuntimePayload {
  version: typeof EQUIPMENT_CATALOG_RUNTIME_VERSION;
  bidderIntelligenceVersion: typeof BIDDER_INTELLIGENCE_VERSION;
  snapshot: EquipmentCatalogSnapshot;
  catalogReadiness: number;
  summary: string;
}
