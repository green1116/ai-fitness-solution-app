/**
 * FEAT-22 — List Budget Packages
 * Lists existing Budget Packages by query / filter context (no generate / mutate).
 */
import type {
  BudgetPackageGenerationResult,
  BudgetPackageGenerationStatus,
} from "./generate-budget-package";

export const FEAT_22_ID = "FEAT-22" as const;
export const LIST_BUDGET_PACKAGE_CAPABILITY = "ListBudgetPackages" as const;

export const BUDGET_PACKAGE_LIST_STATUSES = ["LISTED"] as const;

export type BudgetPackageListStatus =
  (typeof BUDGET_PACKAGE_LIST_STATUSES)[number];

/** Existing package row available for listing. */
export type BudgetPackageListItem = Readonly<{
  packageId: string;
  budgetId: string;
  generationStatus: BudgetPackageGenerationStatus;
  generatedTime?: string;
  metadata?: Readonly<Record<string, unknown>>;
}>;

/** Package query / filter context. */
export type BudgetPackageListQuery = Readonly<{
  budgetId?: string;
  packageId?: string;
  generationStatus?: BudgetPackageGenerationStatus;
}>;

export type ListBudgetPackagesResult = Readonly<{
  featId: typeof FEAT_22_ID;
  capability: typeof LIST_BUDGET_PACKAGE_CAPABILITY;
  packageList: readonly BudgetPackageListItem[];
  listStatus: BudgetPackageListStatus;
  listTime: string;
  packageGenerated: false;
  downloaded: false;
  shared: false;
  tracked: false;
  archived: false;
  restored: false;
  deleted: false;
  emailed: false;
  zipExported: false;
  notified: false;
  analyticsRecorded: false;
}>;

const existingPackages = new Map<string, BudgetPackageListItem>();

function nowIso(): string {
  return new Date().toISOString();
}

function cloneItem(item: BudgetPackageListItem): BudgetPackageListItem {
  return {
    ...item,
    metadata: item.metadata ? { ...item.metadata } : undefined,
  };
}

/** Map an existing generated package into the listable catalog (does not generate). */
export function rememberExistingBudgetPackage(
  generated: BudgetPackageGenerationResult,
): BudgetPackageListItem {
  const item: BudgetPackageListItem = {
    packageId: generated.packageId,
    budgetId: generated.packageMetadata.budgetId,
    generationStatus: generated.generationStatus,
    generatedTime: generated.generatedTime,
    metadata: { ...generated.packageMetadata.priorMetadata },
  };
  existingPackages.set(item.packageId, item);
  return cloneItem(item);
}

export function clearListedBudgetPackages(): void {
  existingPackages.clear();
}

/** Lookup an existing package by id (read-only catalog access). */
export function findExistingBudgetPackage(
  packageId: string,
): BudgetPackageListItem | undefined {
  const id = packageId.trim();
  if (!id) return undefined;
  const item = existingPackages.get(id);
  return item ? cloneItem(item) : undefined;
}

/** Patch metadata on an existing package (catalog mutate only). */
export function patchExistingBudgetPackageMetadata(
  packageId: string,
  patch: Readonly<Record<string, unknown>>,
): BudgetPackageListItem {
  const id = packageId.trim();
  if (!id) throw new Error("Package Id is required");
  const existing = existingPackages.get(id);
  if (!existing) throw new Error(`Budget Package not found: ${id}`);

  const updated: BudgetPackageListItem = {
    ...existing,
    metadata: {
      ...(existing.metadata ?? {}),
      ...patch,
    },
  };
  existingPackages.set(id, updated);
  return cloneItem(updated);
}

/**
 * List existing Budget Packages using query / filter context.
 * Read-only — does not generate, download, share, track, archive, restore, or delete.
 */
export function listBudgetPackages(
  query: BudgetPackageListQuery = {},
): ListBudgetPackagesResult {
  const budgetId = query.budgetId?.trim() || undefined;
  const packageId = query.packageId?.trim() || undefined;
  const generationStatus = query.generationStatus;

  let rows = [...existingPackages.values()];
  if (budgetId) rows = rows.filter((r) => r.budgetId === budgetId);
  if (packageId) rows = rows.filter((r) => r.packageId === packageId);
  if (generationStatus) {
    rows = rows.filter((r) => r.generationStatus === generationStatus);
  }

  const packageList = rows
    .slice()
    .sort((a, b) => a.packageId.localeCompare(b.packageId))
    .map(cloneItem);

  return {
    featId: FEAT_22_ID,
    capability: LIST_BUDGET_PACKAGE_CAPABILITY,
    packageList,
    listStatus: "LISTED",
    listTime: nowIso(),
    packageGenerated: false,
    downloaded: false,
    shared: false,
    tracked: false,
    archived: false,
    restored: false,
    deleted: false,
    emailed: false,
    zipExported: false,
    notified: false,
    analyticsRecorded: false,
  };
}
