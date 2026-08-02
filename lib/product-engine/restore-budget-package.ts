/**
 * FEAT-20 — Restore Budget Package
 * Restores an archived Budget Package (no generate / download / share / archive / delete).
 */
import type { ArchiveBudgetPackageResult } from "./archive-budget-package";

export const FEAT_20_ID = "FEAT-20" as const;
export const RESTORE_BUDGET_PACKAGE_CAPABILITY =
  "RestoreBudgetPackage" as const;

export const BUDGET_PACKAGE_RESTORE_STATUSES = ["RESTORED"] as const;

export type BudgetPackageRestoreStatus =
  (typeof BUDGET_PACKAGE_RESTORE_STATUSES)[number];

/** Archived Budget Package input — must already be archived (WP-13). */
export type ArchivedBudgetPackage = Readonly<{
  packageId: string;
  archiveStatus: "ARCHIVED";
  archivedTime?: string;
}>;

export type RestoreBudgetPackageResult = Readonly<{
  featId: typeof FEAT_20_ID;
  capability: typeof RESTORE_BUDGET_PACKAGE_CAPABILITY;
  packageId: string;
  restoreCompleted: true;
  restoreStatus: BudgetPackageRestoreStatus;
  restoredTime: string;
  packageGenerated: false;
  downloaded: false;
  shared: false;
  emailed: false;
  zipExported: false;
  deleted: false;
  archived: false;
  notified: false;
  analyticsRecorded: false;
}>;

function nowIso(): string {
  return new Date().toISOString();
}

export function toArchivedBudgetPackage(
  archived: ArchiveBudgetPackageResult,
): ArchivedBudgetPackage {
  if (!archived.archiveCompleted || archived.archiveStatus !== "ARCHIVED") {
    throw new Error("Restore requires an archived Budget Package");
  }
  return {
    packageId: archived.packageId,
    archiveStatus: "ARCHIVED",
    archivedTime: archived.archivedTime,
  };
}

export function assertArchivedBudgetPackage(
  input: Readonly<{
    packageId?: string;
    archiveStatus?: string;
  }>,
): asserts input is ArchivedBudgetPackage {
  const packageId = input.packageId?.trim() ?? "";
  if (!packageId) {
    throw new Error("RestoreBudgetPackage requires packageId");
  }
  if (input.archiveStatus !== "ARCHIVED") {
    throw new Error(
      `RestoreBudgetPackage requires Archived Budget Package, got ${input.archiveStatus ?? "undefined"}`,
    );
  }
}

/**
 * Restore an archived Budget Package.
 * Lifecycle restore only — does not archive, delete, generate, download, or share.
 */
export function restoreBudgetPackage(
  input: ArchivedBudgetPackage,
): RestoreBudgetPackageResult {
  assertArchivedBudgetPackage(input);

  const restoredTime = nowIso();

  return {
    featId: FEAT_20_ID,
    capability: RESTORE_BUDGET_PACKAGE_CAPABILITY,
    packageId: input.packageId.trim(),
    restoreCompleted: true,
    restoreStatus: "RESTORED",
    restoredTime,
    packageGenerated: false,
    downloaded: false,
    shared: false,
    emailed: false,
    zipExported: false,
    deleted: false,
    archived: false,
    notified: false,
    analyticsRecorded: false,
  };
}
