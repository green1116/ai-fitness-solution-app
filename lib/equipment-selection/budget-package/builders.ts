import { buildAllBrandPackages } from "../equipment-package/builders";
import type { BudgetPackage, BudgetPackageSnapshot } from "./types";

function toBudgetPackage(
  equipmentPkg: ReturnType<typeof buildAllBrandPackages>[number],
): BudgetPackage {
  const totalQty = equipmentPkg.equipmentList.reduce((s, i) => s + i.quantity, 0);
  const totalBudgetMin = equipmentPkg.totalBudgetEstimate;
  const totalBudgetMax = Math.round(totalBudgetMin * 1.12);

  return {
    packageId: `budget-${equipmentPkg.packageId}`,
    label: `${equipmentPkg.packageLabel} Budget`,
    routeType: equipmentPkg.routeType,
    bidderBrand: equipmentPkg.bidderBrand,
    equipmentPackageId: equipmentPkg.packageId,
    totalBudgetMin,
    totalBudgetMax,
    currency: "CNY",
    equipmentCount: totalQty,
    budgetPerUnit: Math.round(totalBudgetMin / totalQty),
  };
}

export function buildBudgetPackageSnapshot(input?: { deploymentId?: string }): BudgetPackageSnapshot {
  const deploymentId = input?.deploymentId ?? "budget-package-default";
  const packages = buildAllBrandPackages({ deploymentId });

  const technogym = packages.find((p) => p.bidderBrand === "Technogym")!;
  const matrix = packages.find((p) => p.bidderBrand === "Matrix")!;
  const shuhua = packages.find((p) => p.bidderBrand === "Shuhua")!;

  const premiumBudgetPackage = toBudgetPackage(technogym);
  const balancedBudgetPackage = toBudgetPackage(matrix);
  const valueBudgetPackage = toBudgetPackage(shuhua);

  const spreads = [
    premiumBudgetPackage.totalBudgetMin,
    balancedBudgetPackage.totalBudgetMin,
    valueBudgetPackage.totalBudgetMin,
  ];
  const max = Math.max(...spreads);
  const min = Math.min(...spreads);
  const budgetSpread = max > 0 ? ((max - min) / max) * 100 : 0;
  const budgetPackageReadiness = Math.round(Math.min(100, budgetSpread + 40));

  return {
    snapshotId: `budget-package-${deploymentId}`,
    premiumBudgetPackage,
    balancedBudgetPackage,
    valueBudgetPackage,
    budgetPackageReadiness,
  };
}
