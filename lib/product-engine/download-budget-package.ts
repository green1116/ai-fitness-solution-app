/**
 * FEAT-16 — Download Budget Package
 * Starts download of an existing available Budget Package (no generation / share / ZIP).
 */
import type { BudgetPackageGenerationResult } from "./generate-budget-package";

export const FEAT_16_ID = "FEAT-16" as const;
export const DOWNLOAD_BUDGET_PACKAGE_CAPABILITY =
  "DownloadBudgetPackage" as const;

/** Existing surface reused from DownloadBudget binding (PD-2.4). */
export const BUDGET_PACKAGE_DOWNLOAD_API = "/api/v80/pdf?type=budget" as const;

/**
 * Budget Package Available — already generated (WP-9); download does not regenerate.
 */
export type BudgetPackageAvailable = Readonly<{
  packageId: string;
  generationStatus: "GENERATED";
  packageMetadata: Readonly<{
    budgetId: string;
  }>;
}>;

export type DownloadBudgetPackageResult = Readonly<{
  featId: typeof FEAT_16_ID;
  capability: typeof DOWNLOAD_BUDGET_PACKAGE_CAPABILITY;
  packageId: string;
  budgetId: string;
  requestUrl: string;
  httpMethod: "GET";
  downloadStarted: true;
  httpInvoked: true;
  shared: false;
  emailed: false;
  zipExported: false;
  packageGenerated: false;
}>;

export function toBudgetPackageAvailable(
  generated: BudgetPackageGenerationResult,
): BudgetPackageAvailable {
  if (generated.generationStatus !== "GENERATED") {
    throw new Error("Budget Package is not available for download");
  }
  if (!generated.packageId.trim()) {
    throw new Error("Budget Package Available requires packageId");
  }
  if (!generated.packageMetadata.budgetId.trim()) {
    throw new Error("Budget Package Available requires budgetId");
  }
  return {
    packageId: generated.packageId,
    generationStatus: "GENERATED",
    packageMetadata: { budgetId: generated.packageMetadata.budgetId },
  };
}

export function assertBudgetPackageAvailable(
  input: Readonly<{
    packageId?: string;
    generationStatus?: string;
    packageMetadata?: Readonly<{ budgetId?: string }>;
  }>,
): asserts input is BudgetPackageAvailable {
  const packageId = input.packageId?.trim() ?? "";
  if (!packageId) {
    throw new Error("DownloadBudgetPackage requires available packageId");
  }
  if (input.generationStatus !== "GENERATED") {
    throw new Error(
      `DownloadBudgetPackage requires Budget Package Available (GENERATED), got ${input.generationStatus ?? "undefined"}`,
    );
  }
  const budgetId = input.packageMetadata?.budgetId?.trim() ?? "";
  if (!budgetId) {
    throw new Error("DownloadBudgetPackage requires packageMetadata.budgetId");
  }
}

function buildDownloadRequestUrl(budgetId: string): string {
  const url = new URL(BUDGET_PACKAGE_DOWNLOAD_API, "http://local.invalid");
  url.searchParams.set("budgetId", budgetId);
  url.searchParams.set("projectId", budgetId);
  return `${url.pathname}${url.search}`;
}

/**
 * Download an existing Budget Package via the existing budget PDF surface.
 * Does not generate, share, email, or ZIP-export.
 */
export async function downloadBudgetPackage(input: {
  available: BudgetPackageAvailable;
  fetchImpl?: typeof fetch;
}): Promise<DownloadBudgetPackageResult> {
  assertBudgetPackageAvailable(input.available);

  const budgetId = input.available.packageMetadata.budgetId.trim();
  const requestUrl = buildDownloadRequestUrl(budgetId);
  const fetchImpl = input.fetchImpl ?? fetch;
  const response = await fetchImpl(requestUrl, {
    method: "GET",
    headers: { Accept: "application/pdf, application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `DownloadBudgetPackage failed (${response.status}) for package ${input.available.packageId}`,
    );
  }

  // Consume body so transport completes; download has started.
  await response.arrayBuffer().catch(() => null);

  return {
    featId: FEAT_16_ID,
    capability: DOWNLOAD_BUDGET_PACKAGE_CAPABILITY,
    packageId: input.available.packageId,
    budgetId,
    requestUrl,
    httpMethod: "GET",
    downloadStarted: true,
    httpInvoked: true,
    shared: false,
    emailed: false,
    zipExported: false,
    packageGenerated: false,
  };
}
