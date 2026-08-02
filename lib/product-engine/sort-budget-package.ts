/**
 * FEAT-26 — Sort Budget Packages
 * Sorts existing Budget Packages (reuses searchBudgetPackages / list catalog).
 */
import type { BudgetPackageListItem } from "./list-budget-package";
import {
  searchBudgetPackages,
  type BudgetPackageSearchQuery,
} from "./search-budget-package";

export const FEAT_26_ID = "FEAT-26" as const;
export const SORT_BUDGET_PACKAGE_CAPABILITY = "SortBudgetPackages" as const;

export const BUDGET_PACKAGE_SORT_STATUSES = ["SORTED"] as const;

export type BudgetPackageSortStatus =
  (typeof BUDGET_PACKAGE_SORT_STATUSES)[number];

export const BUDGET_PACKAGE_SORT_FIELDS = [
  "packageId",
  "budgetId",
  "generationStatus",
  "generatedTime",
] as const;

export type BudgetPackageSortField =
  (typeof BUDGET_PACKAGE_SORT_FIELDS)[number];

export const BUDGET_PACKAGE_SORT_DIRECTIONS = ["asc", "desc"] as const;

export type BudgetPackageSortDirection =
  (typeof BUDGET_PACKAGE_SORT_DIRECTIONS)[number];

/** Sort query — reuses search/list filters plus sort field / direction. */
export type BudgetPackageSortQuery = BudgetPackageSearchQuery &
  Readonly<{
    sortBy?: BudgetPackageSortField;
    sortDir?: BudgetPackageSortDirection;
  }>;

export type SortBudgetPackagesResult = Readonly<{
  featId: typeof FEAT_26_ID;
  capability: typeof SORT_BUDGET_PACKAGE_CAPABILITY;
  sortedResults: readonly BudgetPackageListItem[];
  sortStatus: BudgetPackageSortStatus;
  sortTime: string;
}>;

function nowIso(): string {
  return new Date().toISOString();
}

function fieldValue(
  item: BudgetPackageListItem,
  field: BudgetPackageSortField,
): string {
  switch (field) {
    case "packageId":
      return item.packageId;
    case "budgetId":
      return item.budgetId;
    case "generationStatus":
      return item.generationStatus;
    case "generatedTime":
      return item.generatedTime ?? "";
  }
}

/**
 * Sort existing Budget Packages.
 * Reuses searchBudgetPackages; does not generate or mutate packages.
 */
export function sortBudgetPackages(
  query: BudgetPackageSortQuery = {},
): SortBudgetPackagesResult {
  const searched = searchBudgetPackages({
    budgetId: query.budgetId,
    packageId: query.packageId,
    generationStatus: query.generationStatus,
    q: query.q,
  });

  const sortBy = query.sortBy ?? "packageId";
  const sortDir = query.sortDir ?? "asc";
  const factor = sortDir === "desc" ? -1 : 1;

  const sortedResults = searched.searchResults
    .slice()
    .sort(
      (a, b) =>
        factor *
        fieldValue(a, sortBy).localeCompare(fieldValue(b, sortBy)),
    );

  return {
    featId: FEAT_26_ID,
    capability: SORT_BUDGET_PACKAGE_CAPABILITY,
    sortedResults,
    sortStatus: "SORTED",
    sortTime: nowIso(),
  };
}
