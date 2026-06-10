import type { TENDER_INTELLIGENCE_VERSION } from "../shared/types";

export const EQUIPMENT_INTELLIGENCE_RUNTIME_VERSION =
  "v12.0-equipment-intelligence-runtime-1" as const;

export type EquipmentComplexity = "basic" | "standard" | "advanced" | "premium";

export interface EquipmentIntelligence {
  intelligenceId: string;
  complexity: EquipmentComplexity;
  density: number;
  densityUnit: string;
  recommendation: string;
  zones: string[];
  summary: string;
}

export interface EquipmentIntelligenceRuntimePayload {
  version: typeof EQUIPMENT_INTELLIGENCE_RUNTIME_VERSION;
  intelligenceVersion: typeof TENDER_INTELLIGENCE_VERSION;
  equipment: EquipmentIntelligence;
  summary: string;
}
