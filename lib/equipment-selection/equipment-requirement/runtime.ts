import { finalizeRuntime, runStage } from "../shared/runtime";
import type { SelectionRuntimeResult, SelectionStageResult } from "../shared/types";
import { EQUIPMENT_SELECTION_VERSION } from "../shared/types";
import { buildRequirementProfile } from "./builders";
import type { EquipmentRequirementRuntimePayload } from "./types";
import { EQUIPMENT_REQUIREMENT_RUNTIME_VERSION } from "./types";

export function validateEquipmentRequirementRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const profile = buildRequirementProfile(input);
  return { valid: profile.requirementReadiness > 0 && profile.totalMinQuantity >= 8 };
}

export function runEquipmentRequirementRuntime(input?: {
  deploymentId?: string;
}): SelectionRuntimeResult<EquipmentRequirementRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "equipment-requirement-default";
  const stages: SelectionStageResult[] = [];

  const profile = runStage("equipment-requirement-build", "Equipment Requirement", () => buildRequirementProfile({ deploymentId }), stages);
  const validation = runStage("equipment-requirement-validate", "Requirement Validation", () => validateEquipmentRequirementRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Equipment requirement validation failed");

  const payload: EquipmentRequirementRuntimePayload = {
    version: EQUIPMENT_REQUIREMENT_RUNTIME_VERSION,
    selectionVersion: EQUIPMENT_SELECTION_VERSION,
    profile,
    requirementReadiness: profile.requirementReadiness,
    summary: `equipment-requirement tender=${profile.projectName} categories=5 minQty=${profile.totalMinQuantity} readiness=${profile.requirementReadiness}%`,
  };

  return finalizeRuntime({ domain: "equipment-requirement", deploymentId, stages, payload, summary: payload.summary });
}
