/**
 * FEAT-28 — Export Budget Package Metadata
 * Exports metadata for existing Budget Packages (reuses paginateBudgetPackages).
 * In-memory export payload only — no file export.
 */
import type { BudgetPackageListItem } from "./list-budget-package";
import {
  paginateBudgetPackages,
  type BudgetPackagePaginationQuery,
} from "./paginate-budget-package";

export const FEAT_28_ID = "FEAT-28" as const;
export const EXPORT_BUDGET_PACKAGE_METADATA_CAPABILITY =
  "ExportBudgetPackageMetadata" as const;

export const BUDGET_PACKAGE_EXPORT_STATUSES = ["EXPORTED"] as const;

export type BudgetPackageExportStatus =
  (typeof BUDGET_PACKAGE_EXPORT_STATUSES)[number];

/** Export query — reuses pagination / sort / search / list filters. */
export type BudgetPackageExportQuery = BudgetPackagePaginationQuery;

export type BudgetPackageExportItem = Readonly<{
  packageId: string;
  budgetId: string;
  generationStatus: BudgetPackageListItem["generationStatus"];
  generatedTime?: string;
  metadata: Readonly<Record<string, unknown>>;
}>;

export type ExportBudgetPackageMetadataResult = Readonly<{
  featId: typeof FEAT_28_ID;
  capability: typeof EXPORT_BUDGET_PACKAGE_METADATA_CAPABILITY;
  exportItems: readonly BudgetPackageExportItem[];
  exportStatus: BudgetPackageExportStatus;
  exportTime: string;
}>;

function nowIso(): string {
  return new Date().toISOString();
}

function toExportItem(item: BudgetPackageListItem): BudgetPackageExportItem {
  return {
    packageId: item.packageId,
    budgetId: item.budgetId,
    generationStatus: item.generationStatus,
    generatedTime: item.generatedTime,
    metadata: { ...(item.metadata ?? {}) },
  };
}

/**
 * Export metadata for existing Budget Packages.
 * Reuses paginateBudgetPackages; no file write / storage / UI.
 */
export function exportBudgetPackageMetadata(
  query: BudgetPackageExportQuery = {},
): ExportBudgetPackageMetadataResult {
  const paged = paginateBudgetPackages({
    budgetId: query.budgetId,
    packageId: query.packageId,
    generationStatus: query.generationStatus,
    q: query.q,
    sortBy: query.sortBy,
    sortDir: query.sortDir,
    page: query.page,
    pageSize: query.pageSize,
  });

  return {
    featId: FEAT_28_ID,
    capability: EXPORT_BUDGET_PACKAGE_METADATA_CAPABILITY,
    exportItems: paged.pagedResults.map(toExportItem),
    exportStatus: "EXPORTED",
    exportTime: nowIso(),
  };
}
