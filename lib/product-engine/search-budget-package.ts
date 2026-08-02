/**
 * FEAT-25 — Search Budget Packages
 * Searches existing Budget Packages by query / filters (reuses list catalog).
 */
import {
  listBudgetPackages,
  type BudgetPackageListItem,
  type BudgetPackageListQuery,
} from "./list-budget-package";

export const FEAT_25_ID = "FEAT-25" as const;
export const SEARCH_BUDGET_PACKAGE_CAPABILITY =
  "SearchBudgetPackages" as const;

export const BUDGET_PACKAGE_SEARCH_STATUSES = ["SEARCHED"] as const;

export type BudgetPackageSearchStatus =
  (typeof BUDGET_PACKAGE_SEARCH_STATUSES)[number];

/** Search query / filters — extends list filters with free-text `q`. */
export type BudgetPackageSearchQuery = BudgetPackageListQuery &
  Readonly<{
    q?: string;
  }>;

export type SearchBudgetPackagesResult = Readonly<{
  featId: typeof FEAT_25_ID;
  capability: typeof SEARCH_BUDGET_PACKAGE_CAPABILITY;
  searchResults: readonly BudgetPackageListItem[];
  searchStatus: BudgetPackageSearchStatus;
  searchTime: string;
}>;

function nowIso(): string {
  return new Date().toISOString();
}

function matchesText(item: BudgetPackageListItem, needle: string): boolean {
  const haystacks = [
    item.packageId,
    item.budgetId,
    item.generationStatus,
    item.generatedTime ?? "",
    ...Object.entries(item.metadata ?? {}).flatMap(([k, v]) => [
      k,
      String(v ?? ""),
    ]),
  ];
  return haystacks.some((h) => h.toLowerCase().includes(needle));
}

/**
 * Search existing Budget Packages using query / filters.
 * Reuses listBudgetPackages; does not generate or mutate packages.
 */
export function searchBudgetPackages(
  query: BudgetPackageSearchQuery = {},
): SearchBudgetPackagesResult {
  const listed = listBudgetPackages({
    budgetId: query.budgetId,
    packageId: query.packageId,
    generationStatus: query.generationStatus,
  });

  const needle = query.q?.trim().toLowerCase() || undefined;
  const searchResults = needle
    ? listed.packageList.filter((item) => matchesText(item, needle))
    : listed.packageList;

  return {
    featId: FEAT_25_ID,
    capability: SEARCH_BUDGET_PACKAGE_CAPABILITY,
    searchResults,
    searchStatus: "SEARCHED",
    searchTime: nowIso(),
  };
}
