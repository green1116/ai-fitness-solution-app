import { buildCompatibilitySnapshot } from "../compatibility/builders";
import { buildEquipmentDifferentiationSnapshot } from "../equipment-differentiation/builders";
import { buildRequirementProfile } from "../equipment-requirement/builders";
import { buildAllBrandPackages } from "../equipment-package/builders";
import { buildCatalogModels } from "../bridge/catalog-bridge";
import type { EquipmentSelectionReport } from "../shared/types";
import { EQUIPMENT_SELECTION_VERSION } from "../shared/types";

export function buildEquipmentSelectionReport(input?: {
  deploymentId?: string;
}): EquipmentSelectionReport {
  const deploymentId = input?.deploymentId ?? "equipment-selection-report-default";
  const requirement = buildRequirementProfile({ deploymentId });
  const packages = buildAllBrandPackages({ deploymentId });
  const catalog = buildCatalogModels({ deploymentId });
  const compatibility = buildCompatibilitySnapshot({ deploymentId });
  const differentiation = buildEquipmentDifferentiationSnapshot({ deploymentId });

  const allModels = new Set(packages.flatMap((p) => p.equipmentList.map((i) => i.modelName)));
  const modelCoverage = Math.round((allModels.size / catalog.length) * 100);
  const requirementCoverage = requirement.requirementReadiness;
  const packageCoverage = Math.round(
    packages.filter((p) => p.equipmentList.length >= 3).length / packages.length * 100,
  );

  return {
    version: EQUIPMENT_SELECTION_VERSION,
    reportId: `equipment-selection-report-${deploymentId}`,
    deploymentId,
    tenderId: requirement.tenderId,
    requirementCoverage,
    modelCoverage,
    packageCoverage,
    compatibilityScore: compatibility.compatibilityScore,
    equipmentDifferentiationScore: differentiation.equipmentDifferentiationScore,
    packages: packages.map((p) => ({
      bidderBrand: p.bidderBrand,
      packageLabel: p.packageLabel,
      modelCount: p.equipmentList.length,
      budgetMin: p.totalBudgetEstimate,
      budgetMax: Math.round(p.totalBudgetEstimate * 1.12),
    })),
    summary: [
      "equipment-selection-report",
      `requirementCoverage=${requirementCoverage}%`,
      `modelCoverage=${modelCoverage}%`,
      `packageCoverage=${packageCoverage}%`,
      `compatibilityScore=${compatibility.compatibilityScore}%`,
      `equipmentDifferentiationScore=${differentiation.equipmentDifferentiationScore}%`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
