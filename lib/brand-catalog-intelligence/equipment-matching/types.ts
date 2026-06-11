import type { BRAND_CATALOG_INTELLIGENCE_VERSION } from "../shared/types";

export const EQUIPMENT_MATCHING_RUNTIME_VERSION = "v19.1-equipment-matching-1" as const;

export interface TenderRequirementSet {
  requirementId: string;
  projectName: string;
  requiredCategories: string[];
  budgetTier: "low" | "mid" | "premium";
  complianceTags: string[];
  minEquipmentCount: number;
}

export interface EquipmentMatchResult {
  modelId: string;
  modelName: string;
  brandName: string;
  category: string;
  matchingScore: number;
  matchReason: string;
}

export interface EquipmentMatchingSnapshot {
  snapshotId: string;
  tenderRequirements: TenderRequirementSet;
  preferredOptions: EquipmentMatchResult[];
  alternativeOptions: EquipmentMatchResult[];
  matchingReadiness: number;
}

export interface EquipmentMatchingRuntimePayload {
  version: typeof EQUIPMENT_MATCHING_RUNTIME_VERSION;
  brandCatalogVersion: typeof BRAND_CATALOG_INTELLIGENCE_VERSION;
  snapshot: EquipmentMatchingSnapshot;
  matchingReadiness: number;
  summary: string;
}
