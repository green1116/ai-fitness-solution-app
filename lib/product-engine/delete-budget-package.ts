/**
 * FEAT-21 — Delete Budget Package
 * Deletes an existing Budget Package (no generate / download / share / archive / restore).
 */
import {
  assertBudgetPackageTrackable,
  toBudgetPackageTrackInput,
  type BudgetPackageTrackInput,
} from "./track-budget-package";
import type { BudgetPackageGenerationResult } from "./generate-budget-package";

export const FEAT_21_ID = "FEAT-21" as const;
export const DELETE_BUDGET_PACKAGE_CAPABILITY =
  "DeleteBudgetPackage" as const;

export const BUDGET_PACKAGE_DELETE_STATUSES = ["DELETED"] as const;

export type BudgetPackageDeleteStatus =
  (typeof BUDGET_PACKAGE_DELETE_STATUSES)[number];

export type DeleteBudgetPackageResult = Readonly<{
  featId: typeof FEAT_21_ID;
  capability: typeof DELETE_BUDGET_PACKAGE_CAPABILITY;
  packageId: string;
  deleteCompleted: true;
  deleteStatus: BudgetPackageDeleteStatus;
  deletedTime: string;
  packageGenerated: false;
  downloaded: false;
  shared: false;
  emailed: false;
  zipExported: false;
  archived: false;
  restored: false;
  notified: false;
  analyticsRecorded: false;
}>;

function nowIso(): string {
  return new Date().toISOString();
}

export function toBudgetPackageDeleteInput(
  generated: BudgetPackageGenerationResult,
): BudgetPackageTrackInput {
  return toBudgetPackageTrackInput(generated);
}

/**
 * Delete an existing Budget Package.
 * Lifecycle delete only — does not archive, restore, generate, download, or share.
 */
export function deleteBudgetPackage(
  input: BudgetPackageTrackInput,
): DeleteBudgetPackageResult {
  assertBudgetPackageTrackable(input);

  if (input.packageMetadata.priorMetadata?.deleteStatus === "DELETED") {
    throw new Error(
      `Budget Package already deleted: ${input.packageId.trim()}`,
    );
  }

  const deletedTime = nowIso();

  return {
    featId: FEAT_21_ID,
    capability: DELETE_BUDGET_PACKAGE_CAPABILITY,
    packageId: input.packageId.trim(),
    deleteCompleted: true,
    deleteStatus: "DELETED",
    deletedTime,
    packageGenerated: false,
    downloaded: false,
    shared: false,
    emailed: false,
    zipExported: false,
    archived: false,
    restored: false,
    notified: false,
    analyticsRecorded: false,
  };
}
