import { buildRequirementProfile } from "../equipment-requirement/builders";
import { buildAllBrandPackages } from "../equipment-package/builders";
import type { CompatibilitySnapshot } from "./types";

export function buildCompatibilitySnapshot(input?: { deploymentId?: string }): CompatibilitySnapshot {
  const deploymentId = input?.deploymentId ?? "compatibility-default";
  const requirement = buildRequirementProfile({ deploymentId });
  const packages = buildAllBrandPackages({ deploymentId });

  const categoryScores = packages.map((pkg) => {
    const requiredCats = ["cardio", "strength", "functional"];
    const covered = requiredCats.filter((cat) => (pkg.categoryDistribution[cat] ?? 0) > 0).length;
    return Math.round((covered / requiredCats.length) * 100);
  });

  const quantityScores = packages.map((pkg) => {
    const totalQty = pkg.equipmentList.reduce((s, i) => s + i.quantity, 0);
    return Math.min(100, Math.round((totalQty / requirement.totalMinQuantity) * 100));
  });

  const requirementScores = packages.map((pkg) => {
    const hasCardio = (pkg.categoryDistribution.cardio ?? 0) >= requirement.cardioRequirement.minQuantity;
    const hasStrength = (pkg.categoryDistribution.strength ?? 0) >= requirement.strengthRequirement.minQuantity;
    const hasFunctional = (pkg.categoryDistribution.functional ?? 0) >= requirement.functionalRequirement.minQuantity;
    const met = [hasCardio, hasStrength, hasFunctional].filter(Boolean).length;
    return Math.round((met / 3) * 100);
  });

  const categoryCoverage = Math.round(categoryScores.reduce((s, v) => s + v, 0) / categoryScores.length);
  const quantityCoverage = Math.round(quantityScores.reduce((s, v) => s + v, 0) / quantityScores.length);
  const requirementCoverage = Math.round(requirementScores.reduce((s, v) => s + v, 0) / requirementScores.length);
  const compatibilityScore = Math.round((categoryCoverage + quantityCoverage + requirementCoverage) / 3);

  return {
    snapshotId: `compatibility-${deploymentId}`,
    categoryCoverage,
    quantityCoverage,
    requirementCoverage,
    compatibilityScore,
  };
}
