/**
 * FEAT-24 — Update Budget Package Metadata
 * Updates metadata for an existing Budget Package (no generate / lifecycle mutate).
 */
import { patchExistingBudgetPackageMetadata } from "./list-budget-package";

export const FEAT_24_ID = "FEAT-24" as const;
export const UPDATE_BUDGET_PACKAGE_METADATA_CAPABILITY =
  "UpdateBudgetPackageMetadata" as const;

export const BUDGET_PACKAGE_UPDATE_STATUSES = ["UPDATED"] as const;

export type BudgetPackageUpdateStatus =
  (typeof BUDGET_PACKAGE_UPDATE_STATUSES)[number];

export type BudgetPackageMetadataPatch = Readonly<Record<string, unknown>>;

export type UpdateBudgetPackageMetadataResult = Readonly<{
  featId: typeof FEAT_24_ID;
  capability: typeof UPDATE_BUDGET_PACKAGE_METADATA_CAPABILITY;
  packageId: string;
  updateCompleted: true;
  updateStatus: BudgetPackageUpdateStatus;
  updatedTime: string;
  packageGenerated: false;
  downloaded: false;
  shared: false;
  tracked: false;
  archived: false;
  restored: false;
  deleted: false;
  listed: false;
  detailsFetched: false;
  analyticsRecorded: false;
}>;

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Update metadata for an existing Budget Package.
 * Applies metadata patch only — does not generate or change lifecycle actions.
 */
export function updateBudgetPackageMetadata(input: {
  packageId: string;
  metadataPatch: BudgetPackageMetadataPatch;
}): UpdateBudgetPackageMetadataResult {
  const packageId = input.packageId.trim();
  if (!packageId) {
    throw new Error("UpdateBudgetPackageMetadata requires Package Id");
  }
  if (
    !input.metadataPatch ||
    typeof input.metadataPatch !== "object" ||
    Array.isArray(input.metadataPatch)
  ) {
    throw new Error("UpdateBudgetPackageMetadata requires Metadata patch");
  }
  if (Object.keys(input.metadataPatch).length < 1) {
    throw new Error("UpdateBudgetPackageMetadata requires a non-empty Metadata patch");
  }

  const updatedTime = nowIso();
  patchExistingBudgetPackageMetadata(packageId, {
    ...input.metadataPatch,
    metadataUpdatedAt: updatedTime,
  });

  return {
    featId: FEAT_24_ID,
    capability: UPDATE_BUDGET_PACKAGE_METADATA_CAPABILITY,
    packageId,
    updateCompleted: true,
    updateStatus: "UPDATED",
    updatedTime,
    packageGenerated: false,
    downloaded: false,
    shared: false,
    tracked: false,
    archived: false,
    restored: false,
    deleted: false,
    listed: false,
    detailsFetched: false,
    analyticsRecorded: false,
  };
}
