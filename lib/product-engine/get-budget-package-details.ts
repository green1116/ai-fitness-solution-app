/**
 * FEAT-23 — Get Budget Package Details
 * Returns details for an existing Budget Package by Package Id (read-only).
 */
import {
  findExistingBudgetPackage,
  type BudgetPackageListItem,
} from "./list-budget-package";

export const FEAT_23_ID = "FEAT-23" as const;
export const GET_BUDGET_PACKAGE_DETAILS_CAPABILITY =
  "GetBudgetPackageDetails" as const;

export const BUDGET_PACKAGE_DETAIL_STATUSES = ["FOUND"] as const;

export type BudgetPackageDetailStatus =
  (typeof BUDGET_PACKAGE_DETAIL_STATUSES)[number];

export type BudgetPackageDetails = BudgetPackageListItem;

export type GetBudgetPackageDetailsResult = Readonly<{
  featId: typeof FEAT_23_ID;
  capability: typeof GET_BUDGET_PACKAGE_DETAILS_CAPABILITY;
  packageId: string;
  packageDetails: BudgetPackageDetails;
  detailStatus: BudgetPackageDetailStatus;
  detailTime: string;
  packageGenerated: false;
  downloaded: false;
  shared: false;
  tracked: false;
  archived: false;
  restored: false;
  deleted: false;
  listed: false;
  analyticsRecorded: false;
}>;

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Get details for an existing Budget Package by Package Id.
 * Read-only — does not generate, list, download, share, or mutate lifecycle.
 */
export function getBudgetPackageDetails(
  packageId: string,
): GetBudgetPackageDetailsResult {
  const id = packageId.trim();
  if (!id) {
    throw new Error("GetBudgetPackageDetails requires Package Id");
  }

  const found = findExistingBudgetPackage(id);
  if (!found) {
    throw new Error(`Budget Package not found: ${id}`);
  }

  return {
    featId: FEAT_23_ID,
    capability: GET_BUDGET_PACKAGE_DETAILS_CAPABILITY,
    packageId: id,
    packageDetails: found,
    detailStatus: "FOUND",
    detailTime: nowIso(),
    packageGenerated: false,
    downloaded: false,
    shared: false,
    tracked: false,
    archived: false,
    restored: false,
    deleted: false,
    listed: false,
    analyticsRecorded: false,
  };
}
