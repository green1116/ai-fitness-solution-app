/**
 * FEAT-18 — Track Budget Package
 * Tracks lifecycle status of an existing Budget Package (no generate / download / share).
 */
import type {
  BudgetPackageGenerationResult,
  BudgetPackageGenerationStatus,
  BudgetPackageMetadata,
} from "./generate-budget-package";

export const FEAT_18_ID = "FEAT-18" as const;
export const TRACK_BUDGET_PACKAGE_CAPABILITY = "TrackBudgetPackage" as const;

/** Lifecycle statuses observed from an existing Budget Package. */
export const BUDGET_PACKAGE_LIFECYCLE_STATUSES = [
  "GENERATED",
  "FAILED",
  "AVAILABLE",
] as const;

export type BudgetPackageLifecycleStatus =
  (typeof BUDGET_PACKAGE_LIFECYCLE_STATUSES)[number];

/** Existing Budget Package input for tracking (does not generate). */
export type BudgetPackageTrackInput = Readonly<{
  packageId: string;
  generationStatus: BudgetPackageGenerationStatus;
  generatedTime?: string;
  packageMetadata: BudgetPackageMetadata;
}>;

export type TrackBudgetPackageResult = Readonly<{
  featId: typeof FEAT_18_ID;
  capability: typeof TRACK_BUDGET_PACKAGE_CAPABILITY;
  packageId: string;
  packageStatus: BudgetPackageLifecycleStatus;
  updatedTime: string;
  packageMetadata: BudgetPackageMetadata;
  packageGenerated: false;
  downloaded: false;
  shared: false;
  emailed: false;
  zipExported: false;
  analyticsRecorded: false;
}>;

function nowIso(): string {
  return new Date().toISOString();
}

export function toBudgetPackageTrackInput(
  generated: BudgetPackageGenerationResult,
): BudgetPackageTrackInput {
  return {
    packageId: generated.packageId,
    generationStatus: generated.generationStatus,
    generatedTime: generated.generatedTime,
    packageMetadata: generated.packageMetadata,
  };
}

export function assertBudgetPackageTrackable(
  input: Readonly<{
    packageId?: string;
    generationStatus?: string;
    packageMetadata?: BudgetPackageMetadata;
  }>,
): asserts input is BudgetPackageTrackInput {
  const packageId = input.packageId?.trim() ?? "";
  if (!packageId) {
    throw new Error("TrackBudgetPackage requires packageId");
  }
  if (
    input.generationStatus !== "GENERATED" &&
    input.generationStatus !== "FAILED"
  ) {
    throw new Error(
      `TrackBudgetPackage requires an existing Budget Package status, got ${input.generationStatus ?? "undefined"}`,
    );
  }
  if (!input.packageMetadata?.budgetId?.trim()) {
    throw new Error("TrackBudgetPackage requires packageMetadata.budgetId");
  }
}

function resolveLifecycleStatus(
  generationStatus: BudgetPackageGenerationStatus,
): BudgetPackageLifecycleStatus {
  if (generationStatus === "FAILED") return "FAILED";
  if (generationStatus === "GENERATED") return "AVAILABLE";
  return generationStatus;
}

/**
 * Track lifecycle status of an existing Budget Package.
 * Observes current package state only — does not generate, download, or share.
 */
export function trackBudgetPackage(
  input: BudgetPackageTrackInput,
): TrackBudgetPackageResult {
  assertBudgetPackageTrackable(input);

  const packageStatus = resolveLifecycleStatus(input.generationStatus);
  const updatedTime = nowIso();

  return {
    featId: FEAT_18_ID,
    capability: TRACK_BUDGET_PACKAGE_CAPABILITY,
    packageId: input.packageId.trim(),
    packageStatus,
    updatedTime,
    packageMetadata: {
      ...input.packageMetadata,
      priorMetadata: {
        ...input.packageMetadata.priorMetadata,
        trackedAt: updatedTime,
        previousGeneratedTime: input.generatedTime ?? null,
        lifecycleStatus: packageStatus,
      },
    },
    packageGenerated: false,
    downloaded: false,
    shared: false,
    emailed: false,
    zipExported: false,
    analyticsRecorded: false,
  };
}
