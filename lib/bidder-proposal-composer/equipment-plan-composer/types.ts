import type { BIDDER_PROPOSAL_COMPOSER_VERSION } from "../shared/types";

export const EQUIPMENT_PLAN_COMPOSER_RUNTIME_VERSION = "v19.4-equipment-plan-composer-1" as const;

export interface EquipmentPlanComposition {
  compositionId: string;
  proposalLabel: string;
  equipmentPlan: string;
  modelJustification: string[];
  upgradePath: string[];
  equipmentPlanReadiness: number;
}

export interface EquipmentPlanComposerRuntimePayload {
  version: typeof EQUIPMENT_PLAN_COMPOSER_RUNTIME_VERSION;
  composerVersion: typeof BIDDER_PROPOSAL_COMPOSER_VERSION;
  composition: EquipmentPlanComposition;
  equipmentPlanReadiness: number;
  summary: string;
}
