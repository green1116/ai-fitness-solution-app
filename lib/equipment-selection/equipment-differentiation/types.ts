import type { EQUIPMENT_SELECTION_VERSION } from "../shared/types";

export const EQUIPMENT_DIFFERENTIATION_RUNTIME_VERSION = "v19.3-equipment-differentiation-1" as const;

export interface ProposalVariantComparison {
  proposalLabel: string;
  bidderBrand: string;
  packageLabel: string;
  modelNames: string[];
  totalBudget: number;
  routeType: string;
}

export interface EquipmentDifferentiationSnapshot {
  snapshotId: string;
  comparisons: ProposalVariantComparison[];
  modelDifferentiation: number;
  packageDifferentiation: number;
  specificationDifferentiation: number;
  equipmentDifferentiationScore: number;
}

export interface EquipmentDifferentiationRuntimePayload {
  version: typeof EQUIPMENT_DIFFERENTIATION_RUNTIME_VERSION;
  selectionVersion: typeof EQUIPMENT_SELECTION_VERSION;
  snapshot: EquipmentDifferentiationSnapshot;
  equipmentDifferentiationScore: number;
  summary: string;
}
