import { runBrandComparisonRuntime } from "../brand-comparison/runtime";
import { runBrandIntelligenceRuntime } from "../brand-intelligence/runtime";
import { runBudgetMappingRuntime } from "../budget-mapping/runtime";
import { runEquipmentIntelligenceRuntime } from "../equipment-intelligence/runtime";
import { runEquipmentMatchingRuntime } from "../equipment-matching/runtime";

export function buildBrandCatalogDashboardMetrics(input?: {
  deploymentId?: string;
}): {
  brandReadiness: number;
  equipmentReadiness: number;
  comparisonReadiness: number;
  matchingReadiness: number;
  budgetMappingReadiness: number;
  summary: string;
} {
  const deploymentId = input?.deploymentId ?? "brand-catalog-dashboard-default";

  const brandIntel = runBrandIntelligenceRuntime({ deploymentId });
  const equipIntel = runEquipmentIntelligenceRuntime({ deploymentId });
  const comparison = runBrandComparisonRuntime({ deploymentId });
  const matching = runEquipmentMatchingRuntime({ deploymentId });
  const budget = runBudgetMappingRuntime({ deploymentId });

  const brandReadiness = brandIntel.payload.intelligenceReadiness;
  const equipmentReadiness = equipIntel.payload.equipmentReadiness;
  const comparisonReadiness = comparison.payload.comparisonReadiness;
  const matchingReadiness = matching.payload.matchingReadiness;
  const budgetMappingReadiness = budget.payload.budgetMappingReadiness;

  return {
    brandReadiness,
    equipmentReadiness,
    comparisonReadiness,
    matchingReadiness,
    budgetMappingReadiness,
    summary: `brand-catalog-dashboard brand=${brandReadiness}% equipment=${equipmentReadiness}% comparison=${comparisonReadiness}% matching=${matchingReadiness}% budget=${budgetMappingReadiness}%`,
  };
}
