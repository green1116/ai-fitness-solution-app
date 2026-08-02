/**
 * FEAT-27 — Paginate Budget Packages
 * Paginates existing Budget Packages (reuses sortBudgetPackages).
 */
import type { BudgetPackageListItem } from "./list-budget-package";
import {
  sortBudgetPackages,
  type BudgetPackageSortQuery,
} from "./sort-budget-package";

export const FEAT_27_ID = "FEAT-27" as const;
export const PAGINATE_BUDGET_PACKAGE_CAPABILITY =
  "PaginateBudgetPackages" as const;

export const BUDGET_PACKAGE_PAGINATION_STATUSES = ["PAGINATED"] as const;

export type BudgetPackagePaginationStatus =
  (typeof BUDGET_PACKAGE_PAGINATION_STATUSES)[number];

/** Pagination query — reuses sort/search/list filters plus page / pageSize. */
export type BudgetPackagePaginationQuery = BudgetPackageSortQuery &
  Readonly<{
    page?: number;
    pageSize?: number;
  }>;

export type BudgetPackagePageInfo = Readonly<{
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}>;

export type PaginateBudgetPackagesResult = Readonly<{
  featId: typeof FEAT_27_ID;
  capability: typeof PAGINATE_BUDGET_PACKAGE_CAPABILITY;
  pagedResults: readonly BudgetPackageListItem[];
  pageInfo: BudgetPackagePageInfo;
  paginationStatus: BudgetPackagePaginationStatus;
  paginationTime: string;
}>;

function nowIso(): string {
  return new Date().toISOString();
}

function normalizePage(page: number | undefined): number {
  if (page === undefined || !Number.isFinite(page)) return 1;
  return Math.max(1, Math.floor(page));
}

function normalizePageSize(pageSize: number | undefined): number {
  if (pageSize === undefined || !Number.isFinite(pageSize)) return 10;
  return Math.max(1, Math.min(100, Math.floor(pageSize)));
}

/**
 * Paginate existing Budget Packages.
 * Reuses sortBudgetPackages; does not generate or mutate packages.
 */
export function paginateBudgetPackages(
  query: BudgetPackagePaginationQuery = {},
): PaginateBudgetPackagesResult {
  const sorted = sortBudgetPackages({
    budgetId: query.budgetId,
    packageId: query.packageId,
    generationStatus: query.generationStatus,
    q: query.q,
    sortBy: query.sortBy,
    sortDir: query.sortDir,
  });

  const page = normalizePage(query.page);
  const pageSize = normalizePageSize(query.pageSize);
  const totalItems = sorted.sortedResults.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pagedResults = sorted.sortedResults.slice(start, start + pageSize);

  return {
    featId: FEAT_27_ID,
    capability: PAGINATE_BUDGET_PACKAGE_CAPABILITY,
    pagedResults,
    pageInfo: {
      page: safePage,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
    paginationStatus: "PAGINATED",
    paginationTime: nowIso(),
  };
}
