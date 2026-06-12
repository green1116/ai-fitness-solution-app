import { runBudgetPackageRuntime } from "./budget-package";
import { runCompatibilityRuntime } from "./compatibility";
import { runEquipmentSelectionDashboardRuntime } from "./dashboard";
import { runEquipmentDifferentiationRuntime } from "./equipment-differentiation";
import { runEquipmentRequirementRuntime } from "./equipment-requirement";
import { runEquipmentPackageRuntime } from "./equipment-package";
import { runModelSelectionRuntime } from "./model-selection";
import type { EquipmentSelectionEvidence } from "./shared/types";
import { EQUIPMENT_SELECTION_VERSION } from "./shared/types";

export const EQUIPMENT_SELECTION_DOMAINS = [
  "equipment-requirement",
  "model-selection",
  "equipment-package",
  "compatibility",
  "equipment-differentiation",
  "budget-package",
  "equipment-selection-dashboard",
] as const;

export function buildEquipmentSelectionEvidence(input?: {
  deploymentId?: string;
}): EquipmentSelectionEvidence {
  const deploymentId = input?.deploymentId ?? "equipment-selection-default";

  const runtimes = [
    runEquipmentRequirementRuntime({ deploymentId }),
    runModelSelectionRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runEquipmentPackageRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runCompatibilityRuntime({ deploymentId }),
    runEquipmentDifferentiationRuntime({ deploymentId }),
    runBudgetPackageRuntime({ deploymentId }),
    runEquipmentSelectionDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`Equipment selection evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-equipment-selection-${deploymentId}`,
    version: EQUIPMENT_SELECTION_VERSION,
    domains: [...EQUIPMENT_SELECTION_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `equipment-selection-evidence domains=${EQUIPMENT_SELECTION_DOMAINS.length} allSuccess=true`,
  };
}
