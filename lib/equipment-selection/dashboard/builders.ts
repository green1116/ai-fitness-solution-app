import { buildCompatibilitySnapshot } from "../compatibility/builders";
import { buildEquipmentDifferentiationSnapshot } from "../equipment-differentiation/builders";
import { buildRequirementProfile } from "../equipment-requirement/builders";
import { buildAllBrandPackages } from "../equipment-package/builders";
import { buildModelSelectionSnapshot } from "../model-selection/builders";
import { SELECTION_BIDDER_BRANDS } from "../shared/types";

export function buildEquipmentSelectionDashboardMetrics(input?: {
  deploymentId?: string;
}): {
  requirementReadiness: number;
  modelReadiness: number;
  packageReadiness: number;
  compatibilityReadiness: number;
  differentiationReadiness: number;
  equipmentDifferentiationScore: number;
  summary: string;
} {
  const deploymentId = input?.deploymentId ?? "equipment-selection-dashboard-default";

  const requirement = buildRequirementProfile({ deploymentId });
  const modelScores = SELECTION_BIDDER_BRANDS.map((brand) =>
    buildModelSelectionSnapshot({ deploymentId, bidderBrand: brand }).modelReadiness,
  );
  const packages = buildAllBrandPackages({ deploymentId });
  const packageScores = packages.map((pkg) => {
    const totalQty = pkg.equipmentList.reduce((s, i) => s + i.quantity, 0);
    return Math.min(100, Math.round((totalQty / requirement.totalMinQuantity) * 100));
  });
  const compatibility = buildCompatibilitySnapshot({ deploymentId });
  const differentiation = buildEquipmentDifferentiationSnapshot({ deploymentId });

  const requirementReadiness = requirement.requirementReadiness;
  const modelReadiness = Math.round(modelScores.reduce((s, v) => s + v, 0) / modelScores.length);
  const packageReadiness = Math.round(packageScores.reduce((s, v) => s + v, 0) / packageScores.length);
  const compatibilityReadiness = compatibility.compatibilityScore;
  const differentiationReadiness = differentiation.equipmentDifferentiationScore;
  const equipmentDifferentiationScore = differentiationReadiness;

  return {
    requirementReadiness,
    modelReadiness,
    packageReadiness,
    compatibilityReadiness,
    differentiationReadiness,
    equipmentDifferentiationScore,
    summary: `equipment-selection-dashboard diffScore=${equipmentDifferentiationScore}% requirement=${requirementReadiness}% model=${modelReadiness}% package=${packageReadiness}% compatibility=${compatibilityReadiness}%`,
  };
}
