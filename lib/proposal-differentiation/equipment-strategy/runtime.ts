import { finalizeRuntime, runStage } from "../shared/runtime";
import type { DifferentiationRuntimeResult, DifferentiationStageResult } from "../shared/types";
import { PROPOSAL_DIFFERENTIATION_VERSION } from "../shared/types";
import { buildEquipmentStrategySnapshot } from "./builders";
import type { EquipmentStrategyRuntimePayload } from "./types";
import { EQUIPMENT_STRATEGY_RUNTIME_VERSION } from "./types";

export function validateEquipmentStrategyRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").DifferentiationBidderBrand;
}): { valid: boolean } {
  const snapshot = buildEquipmentStrategySnapshot(input);
  return {
    valid:
      snapshot.equipmentStrategyScore > 0 &&
      snapshot.preferredEquipmentSet.length >= 1 &&
      snapshot.upgradePath.length >= 2,
  };
}

export function runEquipmentStrategyRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").DifferentiationBidderBrand;
}): DifferentiationRuntimeResult<EquipmentStrategyRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "equipment-strategy-default";
  const stages: DifferentiationStageResult[] = [];

  const snapshot = runStage("equipment-strategy-build", "Equipment Strategy", () => buildEquipmentStrategySnapshot(input), stages);
  const validation = runStage("equipment-strategy-validate", "Equipment Validation", () => validateEquipmentStrategyRuntime(input), stages);
  if (!validation.valid) throw new Error("Equipment strategy validation failed");

  const payload: EquipmentStrategyRuntimePayload = {
    version: EQUIPMENT_STRATEGY_RUNTIME_VERSION,
    differentiationVersion: PROPOSAL_DIFFERENTIATION_VERSION,
    snapshot,
    equipmentStrategyScore: snapshot.equipmentStrategyScore,
    summary: `equipment-strategy bidder=${snapshot.bidderBrand} preferred=${snapshot.preferredEquipmentSet.length} alternative=${snapshot.alternativeEquipmentSet.length} score=${snapshot.equipmentStrategyScore}`,
  };

  return finalizeRuntime({ domain: "equipment-strategy", deploymentId, stages, payload, summary: payload.summary });
}
