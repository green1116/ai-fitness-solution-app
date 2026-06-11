import type { DIFFERENTIATION_BIDDER_BRANDS, PROPOSAL_DIFFERENTIATION_VERSION } from "../shared/types";

export const EQUIPMENT_STRATEGY_RUNTIME_VERSION = "v19.2-equipment-strategy-1" as const;

export interface EquipmentSetItem {
  modelId: string;
  modelName: string;
  brandName: string;
  category: string;
  role: "core" | "supplement" | "upgrade";
}

export interface EquipmentStrategySnapshot {
  snapshotId: string;
  bidderBrand: (typeof DIFFERENTIATION_BIDDER_BRANDS)[number];
  preferredEquipmentSet: EquipmentSetItem[];
  alternativeEquipmentSet: EquipmentSetItem[];
  upgradePath: string[];
  equipmentStrategyScore: number;
}

export interface EquipmentStrategyRuntimePayload {
  version: typeof EQUIPMENT_STRATEGY_RUNTIME_VERSION;
  differentiationVersion: typeof PROPOSAL_DIFFERENTIATION_VERSION;
  snapshot: EquipmentStrategySnapshot;
  equipmentStrategyScore: number;
  summary: string;
}
