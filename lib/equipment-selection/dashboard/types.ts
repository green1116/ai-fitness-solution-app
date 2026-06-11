import type { EQUIPMENT_SELECTION_VERSION } from "../shared/types";

export const EQUIPMENT_SELECTION_DASHBOARD_RUNTIME_VERSION = "v19.3-equipment-selection-dashboard-1" as const;

export interface EquipmentSelectionDashboardRuntimePayload {
  version: typeof EQUIPMENT_SELECTION_DASHBOARD_RUNTIME_VERSION;
  selectionVersion: typeof EQUIPMENT_SELECTION_VERSION;
  requirementReadiness: number;
  modelReadiness: number;
  packageReadiness: number;
  compatibilityReadiness: number;
  differentiationReadiness: number;
  equipmentDifferentiationScore: number;
  summary: string;
}
