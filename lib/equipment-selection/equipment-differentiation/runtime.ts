import { finalizeRuntime, runStage } from "../shared/runtime";
import type { SelectionRuntimeResult, SelectionStageResult } from "../shared/types";
import { EQUIPMENT_SELECTION_VERSION } from "../shared/types";
import { buildEquipmentDifferentiationSnapshot, validateEquipmentDifferentiationThreshold } from "./builders";
import type { EquipmentDifferentiationRuntimePayload } from "./types";
import { EQUIPMENT_DIFFERENTIATION_RUNTIME_VERSION } from "./types";

export function validateEquipmentDifferentiationRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const result = validateEquipmentDifferentiationThreshold({ deploymentId: input?.deploymentId, minScore: 80 });
  return {
    valid:
      result.valid &&
      buildEquipmentDifferentiationSnapshot(input).comparisons.length === 4,
  };
}

export function runEquipmentDifferentiationRuntime(input?: {
  deploymentId?: string;
}): SelectionRuntimeResult<EquipmentDifferentiationRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "equipment-differentiation-default";
  const stages: SelectionStageResult[] = [];

  const snapshot = runStage("equipment-differentiation-build", "Equipment Differentiation", () => buildEquipmentDifferentiationSnapshot({ deploymentId }), stages);
  const validation = runStage("equipment-differentiation-validate", "Differentiation Validation", () => validateEquipmentDifferentiationRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Equipment differentiation validation failed — score must be >= 80%");

  const payload: EquipmentDifferentiationRuntimePayload = {
    version: EQUIPMENT_DIFFERENTIATION_RUNTIME_VERSION,
    selectionVersion: EQUIPMENT_SELECTION_VERSION,
    snapshot,
    equipmentDifferentiationScore: snapshot.equipmentDifferentiationScore,
    summary: `equipment-differentiation score=${snapshot.equipmentDifferentiationScore}% model=${snapshot.modelDifferentiation}% package=${snapshot.packageDifferentiation}% spec=${snapshot.specificationDifferentiation}%`,
  };

  return finalizeRuntime({ domain: "equipment-differentiation", deploymentId, stages, payload, summary: payload.summary });
}
