import type { KNOWLEDGE_BASE_VERSION, ReadinessStubMode } from "../shared/types";

export const EQUIPMENT_KNOWLEDGE_RUNTIME_VERSION = "v12.5-equipment-knowledge-1" as const;

export const EQUIPMENT_CATEGORIES = [
  "cardio",
  "strength",
  "functional",
  "rehabilitation",
  "group-fitness",
] as const;

export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number];

export interface EquipmentProfile {
  profileId: string;
  category: EquipmentCategory;
  name: string;
  specs: string[];
  lifespanYears: number;
}

export interface DeploymentScenario {
  scenarioId: string;
  category: EquipmentCategory;
  environment: string;
  layoutNotes: string;
  capacityUsers: number;
}

export interface MaintenanceProfile {
  maintenanceId: string;
  category: EquipmentCategory;
  frequencyDays: number;
  tasks: string[];
  sparePartsLevel: "low" | "medium" | "high";
}

export interface EquipmentKnowledgeAsset {
  assetId: string;
  category: EquipmentCategory;
  categoryLabel: string;
  profile: EquipmentProfile;
  deployment: DeploymentScenario;
  maintenance: MaintenanceProfile;
  mode: ReadinessStubMode;
}

export interface EquipmentKnowledgeRuntimePayload {
  version: typeof EQUIPMENT_KNOWLEDGE_RUNTIME_VERSION;
  knowledgeVersion: typeof KNOWLEDGE_BASE_VERSION;
  assets: EquipmentKnowledgeAsset[];
  assetCount: number;
  summary: string;
}
