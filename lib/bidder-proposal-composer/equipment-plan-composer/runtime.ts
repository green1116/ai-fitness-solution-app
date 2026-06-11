import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ComposerRuntimeResult, ComposerStageResult } from "../shared/types";
import { BIDDER_PROPOSAL_COMPOSER_VERSION } from "../shared/types";
import { buildEquipmentPlanComposition } from "./builders";
import type { EquipmentPlanComposerRuntimePayload } from "./types";
import { EQUIPMENT_PLAN_COMPOSER_RUNTIME_VERSION } from "./types";

export function validateEquipmentPlanComposerRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ComposerBidderBrand;
}): { valid: boolean } {
  const c = buildEquipmentPlanComposition(input);
  return { valid: c.equipmentPlanReadiness > 0 && c.upgradePath.length >= 2 };
}

export function runEquipmentPlanComposerRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ComposerBidderBrand;
}): ComposerRuntimeResult<EquipmentPlanComposerRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "equipment-plan-composer-default";
  const stages: ComposerStageResult[] = [];

  const composition = runStage("equipment-plan-composer-build", "Equipment Plan Composer", () => buildEquipmentPlanComposition(input), stages);
  const validation = runStage("equipment-plan-composer-validate", "Equipment Plan Validation", () => validateEquipmentPlanComposerRuntime(input), stages);
  if (!validation.valid) throw new Error("Equipment plan composer validation failed");

  const payload: EquipmentPlanComposerRuntimePayload = {
    version: EQUIPMENT_PLAN_COMPOSER_RUNTIME_VERSION,
    composerVersion: BIDDER_PROPOSAL_COMPOSER_VERSION,
    composition,
    equipmentPlanReadiness: composition.equipmentPlanReadiness,
    summary: `equipment-plan-composer ${composition.proposalLabel} models=${composition.modelJustification.length} readiness=${composition.equipmentPlanReadiness}%`,
  };

  return finalizeRuntime({ domain: "equipment-plan-composer", deploymentId, stages, payload, summary: payload.summary });
}
