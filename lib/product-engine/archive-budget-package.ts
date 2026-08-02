/**
 * FEAT-19 — Archive Budget Package
 * Archives an existing Budget Package (no generate / download / share / delete / restore).
 */
import {
  assertBudgetPackageTrackable,
  toBudgetPackageTrackInput,
  type BudgetPackageTrackInput,
} from "./track-budget-package";
import type { BudgetPackageGenerationResult } from "./generate-budget-package";

export const FEAT_19_ID = "FEAT-19" as const;
export const ARCHIVE_BUDGET_PACKAGE_CAPABILITY =
  "ArchiveBudgetPackage" as const;

export const BUDGET_PACKAGE_ARCHIVE_STATUSES = ["ARCHIVED"] as const;

export type BudgetPackageArchiveStatus =
  (typeof BUDGET_PACKAGE_ARCHIVE_STATUSES)[number];

export type ArchiveBudgetPackageResult = Readonly<{
  featId: typeof FEAT_19_ID;
  capability: typeof ARCHIVE_BUDGET_PACKAGE_CAPABILITY;
  packageId: string;
  archiveCompleted: true;
  archiveStatus: BudgetPackageArchiveStatus;
  archivedTime: string;
  packageGenerated: false;
  downloaded: false;
  shared: false;
  emailed: false;
  zipExported: false;
  deleted: false;
  restored: false;
  notified: false;
  analyticsRecorded: false;
}>;

function nowIso(): string {
  return new Date().toISOString();
}

export function toBudgetPackageArchiveInput(
  generated: BudgetPackageGenerationResult,
): BudgetPackageTrackInput {
  return toBudgetPackageTrackInput(generated);
}

/**
 * Archive an existing Budget Package.
 * Lifecycle archive only — does not delete, restore, generate, download, or share.
 */
export function archiveBudgetPackage(
  input: BudgetPackageTrackInput,
): ArchiveBudgetPackageResult {
  assertBudgetPackageTrackable(input);

  if (input.packageMetadata.priorMetadata?.archiveStatus === "ARCHIVED") {
    throw new Error(
      `Budget Package already archived: ${input.packageId.trim()}`,
    );
  }

  const archivedTime = nowIso();

  return {
    featId: FEAT_19_ID,
    capability: ARCHIVE_BUDGET_PACKAGE_CAPABILITY,
    packageId: input.packageId.trim(),
    archiveCompleted: true,
    archiveStatus: "ARCHIVED",
    archivedTime,
    packageGenerated: false,
    downloaded: false,
    shared: false,
    emailed: false,
    zipExported: false,
    deleted: false,
    restored: false,
    notified: false,
    analyticsRecorded: false,
  };
}
