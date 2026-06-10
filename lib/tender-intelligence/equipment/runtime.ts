import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  TenderIntelligenceRuntimeResult,
  TenderIntelligenceStageResult,
} from "../shared/types";
import { TENDER_INTELLIGENCE_VERSION } from "../shared/types";
import { buildEquipmentIntelligence } from "./builders";
import type { EquipmentIntelligenceRuntimePayload } from "./types";
import { EQUIPMENT_INTELLIGENCE_RUNTIME_VERSION } from "./types";

export function validateEquipmentIntelligenceRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "equipment-default";
  const equipment = buildEquipmentIntelligence({ deploymentId });
  return {
    valid:
      equipment.zones.length >= 3 &&
      equipment.density >= 0 &&
      equipment.recommendation.length > 0,
  };
}

export function runEquipmentIntelligenceRuntime(input?: {
  deploymentId?: string;
}): TenderIntelligenceRuntimeResult<EquipmentIntelligenceRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "equipment-default";
  const stages: TenderIntelligenceStageResult[] = [];

  const equipment = runStage(
    "equipment-intelligence",
    "Equipment Intelligence",
    () => buildEquipmentIntelligence({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "equipment-validate",
    "Equipment Validation",
    () => validateEquipmentIntelligenceRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Equipment intelligence validation failed");

  const payload: EquipmentIntelligenceRuntimePayload = {
    version: EQUIPMENT_INTELLIGENCE_RUNTIME_VERSION,
    intelligenceVersion: TENDER_INTELLIGENCE_VERSION,
    equipment,
    summary: `equipment-intelligence complexity=${equipment.complexity} zones=${equipment.zones.length}`,
  };

  return finalizeRuntime({ domain: "equipment-intelligence", deploymentId, stages, payload, summary: payload.summary });
}
