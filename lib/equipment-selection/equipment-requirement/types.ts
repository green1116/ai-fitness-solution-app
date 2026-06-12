import type { EQUIPMENT_SELECTION_VERSION } from "../shared/types";

export const EQUIPMENT_REQUIREMENT_RUNTIME_VERSION = "v19.3-equipment-requirement-1" as const;

export interface CategoryRequirement {
  category: string;
  minQuantity: number;
  priority: "required" | "recommended" | "optional";
  specification: string;
}

export interface RequirementProfile {
  profileId: string;
  tenderId: string;
  projectName: string;
  cardioRequirement: CategoryRequirement;
  strengthRequirement: CategoryRequirement;
  functionalRequirement: CategoryRequirement;
  recoveryRequirement: CategoryRequirement;
  groupTrainingRequirement: CategoryRequirement;
  totalMinQuantity: number;
  requirementReadiness: number;
}

export interface EquipmentRequirementRuntimePayload {
  version: typeof EQUIPMENT_REQUIREMENT_RUNTIME_VERSION;
  selectionVersion: typeof EQUIPMENT_SELECTION_VERSION;
  profile: RequirementProfile;
  requirementReadiness: number;
  summary: string;
}
