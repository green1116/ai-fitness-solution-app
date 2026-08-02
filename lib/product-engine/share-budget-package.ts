/**
 * FEAT-17 — Share Budget Package
 * Starts share of an existing available Budget Package (no generation / download / email / ZIP).
 */
import {
  assertBudgetPackageAvailable,
  type BudgetPackageAvailable,
} from "./download-budget-package";

export const FEAT_17_ID = "FEAT-17" as const;
export const SHARE_BUDGET_PACKAGE_CAPABILITY = "ShareBudgetPackage" as const;

/** Existing nearest share surface (PD-2.4 ShareSolution / ShareDocument). */
export const BUDGET_PACKAGE_SHARE_API = "/api/download-token" as const;

export type ShareBudgetPackageResult = Readonly<{
  featId: typeof FEAT_17_ID;
  capability: typeof SHARE_BUDGET_PACKAGE_CAPABILITY;
  packageId: string;
  budgetId: string;
  requestUrl: string;
  httpMethod: "GET";
  shareStarted: true;
  httpInvoked: true;
  downloaded: false;
  emailed: false;
  zipExported: false;
  packageGenerated: false;
}>;

function buildShareRequestUrl(budgetId: string, packageId: string): string {
  const url = new URL(BUDGET_PACKAGE_SHARE_API, "http://local.invalid");
  url.searchParams.set("planId", budgetId);
  url.searchParams.set("mode", "budget");
  url.searchParams.set("variant", "sales");
  url.searchParams.set("packageId", packageId);
  return `${url.pathname}${url.search}`;
}

/**
 * Share an existing Budget Package via the existing download-token surface.
 * Does not generate, download, email, or ZIP-export.
 */
export async function shareBudgetPackage(input: {
  available: BudgetPackageAvailable;
  fetchImpl?: typeof fetch;
}): Promise<ShareBudgetPackageResult> {
  assertBudgetPackageAvailable(input.available);

  const budgetId = input.available.packageMetadata.budgetId.trim();
  const packageId = input.available.packageId.trim();
  const requestUrl = buildShareRequestUrl(budgetId, packageId);
  const fetchImpl = input.fetchImpl ?? fetch;
  const response = await fetchImpl(requestUrl, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `ShareBudgetPackage failed (${response.status}) for package ${packageId}`,
    );
  }

  // Consume body so transport completes; share has started.
  await response.json().catch(() => null);

  return {
    featId: FEAT_17_ID,
    capability: SHARE_BUDGET_PACKAGE_CAPABILITY,
    packageId,
    budgetId,
    requestUrl,
    httpMethod: "GET",
    shareStarted: true,
    httpInvoked: true,
    downloaded: false,
    emailed: false,
    zipExported: false,
    packageGenerated: false,
  };
}
