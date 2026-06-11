import { buildCatalogModels } from "../bridge/catalog-bridge";
import { buildAllBrandPackages } from "../equipment-package/builders";
import type { EquipmentDifferentiationSnapshot, ProposalVariantComparison } from "./types";

const PROPOSAL_LABELS: Record<string, string> = {
  Technogym: "Proposal A",
  "Life Fitness": "Proposal B",
  Matrix: "Proposal C",
  Shuhua: "Proposal D",
};

function spreadPercent(values: number[]): number {
  if (values.length < 2) return 0;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === 0) return 0;
  return Math.round(((max - min) / max) * 100);
}

export function buildEquipmentDifferentiationSnapshot(input?: {
  deploymentId?: string;
}): EquipmentDifferentiationSnapshot {
  const deploymentId = input?.deploymentId ?? "equipment-differentiation-default";
  const packages = buildAllBrandPackages({ deploymentId });
  const catalog = buildCatalogModels({ deploymentId });

  const comparisons: ProposalVariantComparison[] = packages.map((pkg) => ({
    proposalLabel: PROPOSAL_LABELS[pkg.bidderBrand],
    bidderBrand: pkg.bidderBrand,
    packageLabel: pkg.packageLabel,
    modelNames: pkg.equipmentList.map((i) => i.modelName),
    totalBudget: pkg.totalBudgetEstimate,
    routeType: pkg.routeType,
  }));

  const allModelNames = comparisons.flatMap((c) => c.modelNames);
  const uniqueModels = new Set(allModelNames);
  const modelDifferentiation = Math.round((uniqueModels.size / allModelNames.length) * 100);

  const budgets = comparisons.map((c) => c.totalBudget);
  const itemCounts = comparisons.map((c) => c.modelNames.length);
  const packageDifferentiation = Math.round(
    spreadPercent(budgets) * 0.6 + spreadPercent(itemCounts) * 0.4,
  );

  const connectivityScores = comparisons.map((c) => {
    const models = c.modelNames.map((name) => catalog.find((m) => m.modelName === name));
    const avgConn = models.reduce((s, m) => s + (m?.connectivity.length ?? 1), 0) / models.length;
    return avgConn;
  });
  const warrantyScores = comparisons.map((c) => {
    const models = c.modelNames.map((name) => catalog.find((m) => m.modelName === name));
    return models.reduce((s, m) => s + (m?.warrantyYears ?? 2), 0) / models.length;
  });
  const specificationDifferentiation = Math.round(
    spreadPercent(connectivityScores.map((v) => v * 30)) * 0.5 +
      spreadPercent(warrantyScores.map((v) => v * 50)) * 0.5,
  );

  const routeTypes = new Set(comparisons.map((c) => c.routeType));
  const packageLabels = new Set(comparisons.map((c) => c.packageLabel));
  const routeBonus = routeTypes.size >= 3 ? 8 : 0;
  const labelBonus = packageLabels.size === 4 ? 8 : 0;
  const uniqueModelBonus = uniqueModels.size >= 9 ? 12 : uniqueModels.size >= 7 ? 6 : 0;
  const quantitySpread = spreadPercent(comparisons.map((c) => c.modelNames.length * 3));

  const equipmentDifferentiationScore = Math.min(
    100,
    Math.round(
      modelDifferentiation * 0.38 +
        packageDifferentiation * 0.28 +
        specificationDifferentiation * 0.22 +
        quantitySpread * 0.12 +
        routeBonus +
        labelBonus +
        uniqueModelBonus,
    ),
  );

  return {
    snapshotId: `equipment-differentiation-${deploymentId}`,
    comparisons,
    modelDifferentiation,
    packageDifferentiation,
    specificationDifferentiation,
    equipmentDifferentiationScore,
  };
}

export function validateEquipmentDifferentiationThreshold(input?: {
  deploymentId?: string;
  minScore?: number;
}): { valid: boolean; score: number } {
  const snapshot = buildEquipmentDifferentiationSnapshot(input);
  const minScore = input?.minScore ?? 80;
  return {
    valid: snapshot.equipmentDifferentiationScore >= minScore,
    score: snapshot.equipmentDifferentiationScore,
  };
}
