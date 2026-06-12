import type { EQUIPMENT_SELECTION_VERSION } from "../shared/types";

export const BUDGET_PACKAGE_RUNTIME_VERSION = "v19.3-budget-package-1" as const;

export interface BudgetPackage {
  packageId: string;
  label: string;
  routeType: "premium" | "balanced" | "value";
  bidderBrand: string;
  equipmentPackageId: string;
  totalBudgetMin: number;
  totalBudgetMax: number;
  currency: string;
  equipmentCount: number;
  budgetPerUnit: number;
}

export interface BudgetPackageSnapshot {
  snapshotId: string;
  premiumBudgetPackage: BudgetPackage;
  balancedBudgetPackage: BudgetPackage;
  valueBudgetPackage: BudgetPackage;
  budgetPackageReadiness: number;
}

export interface BudgetPackageRuntimePayload {
  version: typeof BUDGET_PACKAGE_RUNTIME_VERSION;
  selectionVersion: typeof EQUIPMENT_SELECTION_VERSION;
  snapshot: BudgetPackageSnapshot;
  budgetPackageReadiness: number;
  summary: string;
}
