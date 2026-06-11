import { finalizeRuntime, runStage } from "../shared/runtime";
import type { SelectionRuntimeResult, SelectionStageResult } from "../shared/types";
import { EQUIPMENT_SELECTION_VERSION } from "../shared/types";
import { buildEquipmentSelectionDashboardMetrics } from "./builders";
import type { EquipmentSelectionDashboardRuntimePayload } from "./types";
import { EQUIPMENT_SELECTION_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateEquipmentSelectionDashboardRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const metrics = buildEquipmentSelectionDashboardMetrics(input);
  return {
    valid:
      metrics.equipmentDifferentiationScore >= 80 &&
      metrics.requirementReadiness > 0 &&
      metrics.differentiationReadiness >= 80,
  };
}

export function runEquipmentSelectionDashboardRuntime(input?: {
  deploymentId?: string;
}): SelectionRuntimeResult<EquipmentSelectionDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "equipment-selection-dashboard-default";
  const stages: SelectionStageResult[] = [];

  const metrics = runStage("equipment-selection-dashboard-metrics", "Equipment Selection Dashboard", () => buildEquipmentSelectionDashboardMetrics({ deploymentId }), stages);
  const validation = runStage("equipment-selection-dashboard-validate", "Dashboard Validation", () => validateEquipmentSelectionDashboardRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Equipment selection dashboard validation failed — differentiation must be >= 80%");

  const payload: EquipmentSelectionDashboardRuntimePayload = {
    version: EQUIPMENT_SELECTION_DASHBOARD_RUNTIME_VERSION,
    selectionVersion: EQUIPMENT_SELECTION_VERSION,
    requirementReadiness: metrics.requirementReadiness,
    modelReadiness: metrics.modelReadiness,
    packageReadiness: metrics.packageReadiness,
    compatibilityReadiness: metrics.compatibilityReadiness,
    differentiationReadiness: metrics.differentiationReadiness,
    equipmentDifferentiationScore: metrics.equipmentDifferentiationScore,
    summary: metrics.summary,
  };

  return finalizeRuntime({ domain: "equipment-selection-dashboard", deploymentId, stages, payload, summary: payload.summary });
}
