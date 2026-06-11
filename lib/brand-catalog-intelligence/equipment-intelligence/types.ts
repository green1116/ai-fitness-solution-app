import type { BRAND_CATALOG_INTELLIGENCE_VERSION, ReadinessStubMode } from "../shared/types";

export const EQUIPMENT_INTELLIGENCE_RUNTIME_VERSION = "v19.1-equipment-intelligence-1" as const;

export const EQUIPMENT_INTEL_CATEGORIES = [
  "cardio",
  "strength",
  "functional",
  "group-training",
  "recovery",
] as const;
export type EquipmentIntelCategory = (typeof EQUIPMENT_INTEL_CATEGORIES)[number];

export interface TechnicalSpecifications {
  dimensions: string;
  weightKg: number;
  powerRequirement: string;
  maxUserWeightKg: number;
  connectivity: string[];
}

export interface CommercialSpecifications {
  warrantyYears: number;
  leadTimeDays: number;
  installationComplexity: "low" | "medium" | "high";
  targetVenue: string[];
}

export interface MaintenanceSpecifications {
  intervalDays: number;
  avgAnnualCost: number;
  sparePartsAvailability: "high" | "medium" | "low";
  technicianSkillLevel: "basic" | "certified" | "specialist";
}

export interface EquipmentIntelligenceProfile {
  profileId: string;
  modelId: string;
  modelName: string;
  brandName: string;
  category: EquipmentIntelCategory;
  technical: TechnicalSpecifications;
  commercial: CommercialSpecifications;
  maintenance: MaintenanceSpecifications;
  intelligenceScore: number;
  mode: ReadinessStubMode;
}

export interface EquipmentIntelligenceSnapshot {
  snapshotId: string;
  profiles: EquipmentIntelligenceProfile[];
  categoryCoverage: Record<EquipmentIntelCategory, number>;
  equipmentReadiness: number;
}

export interface EquipmentIntelligenceRuntimePayload {
  version: typeof EQUIPMENT_INTELLIGENCE_RUNTIME_VERSION;
  brandCatalogVersion: typeof BRAND_CATALOG_INTELLIGENCE_VERSION;
  snapshot: EquipmentIntelligenceSnapshot;
  equipmentReadiness: number;
  summary: string;
}
