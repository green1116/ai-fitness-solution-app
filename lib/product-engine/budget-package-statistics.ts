/**
 * FEAT-29 — Budget Package Statistics
 * Calculates statistics for existing Budget Packages (reuses paginateBudgetPackages).
 */
import {
  paginateBudgetPackages,
  type BudgetPackagePaginationQuery,
} from "./paginate-budget-package";

export const FEAT_29_ID = "FEAT-29" as const;
export const BUDGET_PACKAGE_STATISTICS_CAPABILITY =
  "BudgetPackageStatistics" as const;

export const BUDGET_PACKAGE_STATISTICS_STATUSES = ["CALCULATED"] as const;

export type BudgetPackageStatisticsStatus =
  (typeof BUDGET_PACKAGE_STATISTICS_STATUSES)[number];

/** Statistics query — reuses pagination / sort / search / list filters. */
export type BudgetPackageStatisticsQuery = BudgetPackagePaginationQuery;

export type BudgetPackageStatistics = Readonly<{
  totalCount: number;
  generatedCount: number;
  failedCount: number;
  withMetadataCount: number;
  uniqueBudgetIdCount: number;
}>;

export type BudgetPackageStatisticsResult = Readonly<{
  featId: typeof FEAT_29_ID;
  capability: typeof BUDGET_PACKAGE_STATISTICS_CAPABILITY;
  statistics: BudgetPackageStatistics;
  statisticsStatus: BudgetPackageStatisticsStatus;
  statisticsTime: string;
}>;

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Calculate statistics for existing Budget Packages.
 * Reuses paginateBudgetPackages; does not generate or mutate packages.
 */
export function budgetPackageStatistics(
  query: BudgetPackageStatisticsQuery = {},
): BudgetPackageStatisticsResult {
  // Use a large pageSize so statistics cover the filtered set in one pass.
  const paged = paginateBudgetPackages({
    budgetId: query.budgetId,
    packageId: query.packageId,
    generationStatus: query.generationStatus,
    q: query.q,
    sortBy: query.sortBy,
    sortDir: query.sortDir,
    page: 1,
    pageSize: 100,
  });

  const rows = paged.pagedResults;
  const budgetIds = new Set(rows.map((r) => r.budgetId));

  const statistics: BudgetPackageStatistics = {
    totalCount: paged.pageInfo.totalItems,
    generatedCount: rows.filter((r) => r.generationStatus === "GENERATED")
      .length,
    failedCount: rows.filter((r) => r.generationStatus === "FAILED").length,
    withMetadataCount: rows.filter(
      (r) => r.metadata && Object.keys(r.metadata).length > 0,
    ).length,
    uniqueBudgetIdCount: budgetIds.size,
  };

  return {
    featId: FEAT_29_ID,
    capability: BUDGET_PACKAGE_STATISTICS_CAPABILITY,
    statistics,
    statisticsStatus: "CALCULATED",
    statisticsTime: nowIso(),
  };
}
