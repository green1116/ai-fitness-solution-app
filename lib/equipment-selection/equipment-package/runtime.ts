import { finalizeRuntime, runStage } from "../shared/runtime";
import type { SelectionRuntimeResult, SelectionStageResult } from "../shared/types";
import { EQUIPMENT_SELECTION_VERSION } from "../shared/types";
import { buildEquipmentPackageSnapshot } from "./builders";
import type { EquipmentPackageRuntimePayload } from "./types";
import { EQUIPMENT_PACKAGE_RUNTIME_VERSION } from "./types";

export function validateEquipmentPackageRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").SelectionBidderBrand;
}): { valid: boolean } {
  const snapshot = buildEquipmentPackageSnapshot(input);
  return {
    valid:
      snapshot.packageReadiness > 0 &&
      snapshot.selectedPackage.equipmentList.length >= 2,
  };
}

export function runEquipmentPackageRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").SelectionBidderBrand;
}): SelectionRuntimeResult<EquipmentPackageRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "equipment-package-default";
  const stages: SelectionStageResult[] = [];

  const snapshot = runStage("equipment-package-build", "Equipment Package", () => buildEquipmentPackageSnapshot(input), stages);
  const validation = runStage("equipment-package-validate", "Package Validation", () => validateEquipmentPackageRuntime(input), stages);
  if (!validation.valid) throw new Error("Equipment package validation failed");

  const payload: EquipmentPackageRuntimePayload = {
    version: EQUIPMENT_PACKAGE_RUNTIME_VERSION,
    selectionVersion: EQUIPMENT_SELECTION_VERSION,
    snapshot,
    packageReadiness: snapshot.packageReadiness,
    summary: `equipment-package bidder=${snapshot.selectedPackage.bidderBrand} label="${snapshot.selectedPackage.packageLabel}" items=${snapshot.selectedPackage.equipmentList.length} budget=${snapshot.selectedPackage.totalBudgetEstimate}`,
  };

  return finalizeRuntime({ domain: "equipment-package", deploymentId, stages, payload, summary: payload.summary });
}
