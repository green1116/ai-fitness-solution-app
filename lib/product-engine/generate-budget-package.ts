/**
 * FEAT-15 — Generate Budget Package
 * Packages an existing Budget Ready state from the Budget Engine (no recalculation).
 */
import type { BudgetEngineResult } from "./budget.engine";
import type { BudgetStructure } from "./types";

export const FEAT_15_ID = "FEAT-15" as const;
export const GENERATE_BUDGET_PACKAGE_CAPABILITY =
  "GenerateBudgetPackage" as const;

export const BUDGET_PACKAGE_GENERATION_STATUSES = [
  "GENERATED",
  "FAILED",
] as const;

export type BudgetPackageGenerationStatus =
  (typeof BUDGET_PACKAGE_GENERATION_STATUSES)[number];

/** Existing Budget Ready input — structure already produced by Budget Engine. */
export type BudgetReadyState = Readonly<{
  budgetId: string;
  status: "READY";
  structure: BudgetStructure;
  syncedStatus?: string;
  metadata?: Readonly<Record<string, unknown>>;
}>;

export type BudgetPackageMetadata = Readonly<{
  featId: typeof FEAT_15_ID;
  capability: typeof GENERATE_BUDGET_PACKAGE_CAPABILITY;
  budgetId: string;
  currency: string;
  totalMin: number;
  totalMax: number;
  itemCount: number;
  syncedStatus: string;
  source: "budget-engine-ready";
  assumptions: readonly string[];
  items: BudgetStructure["items"];
  priorMetadata: Readonly<Record<string, unknown>>;
}>;

export type BudgetPackageGenerationResult = Readonly<{
  packageId: string;
  generationStatus: Extract<BudgetPackageGenerationStatus, "GENERATED">;
  generatedTime: string;
  packageMetadata: BudgetPackageMetadata;
}>;

function nowIso(): string {
  return new Date().toISOString();
}

function createPackageId(budgetId: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `bpkg_${budgetId}_${Date.now().toString(36)}_${rand}`;
}

/**
 * Map an existing Budget Engine result into Budget Ready (no recalculation).
 */
export function toBudgetReadyState(
  budgetId: string,
  engine: BudgetEngineResult,
  metadata?: Readonly<Record<string, unknown>>,
): BudgetReadyState {
  const id = budgetId.trim();
  if (!id) throw new Error("budgetId is required for Budget Ready");
  return {
    budgetId: id,
    status: "READY",
    structure: engine.structure,
    syncedStatus: engine.syncedStatus,
    metadata: metadata ? { ...metadata } : undefined,
  };
}

export function assertBudgetReady(
  input: Readonly<{
    budgetId?: string;
    status?: string;
    structure?: BudgetStructure;
  }>,
): asserts input is BudgetReadyState {
  const budgetId = input.budgetId?.trim() ?? "";
  if (!budgetId) throw new Error("Budget Ready requires budgetId");
  if (input.status !== "READY") {
    throw new Error(
      `GenerateBudgetPackage requires Budget Ready (status=READY), got ${input.status ?? "undefined"}`,
    );
  }
  if (!input.structure) {
    throw new Error("Budget Ready requires existing Budget Engine structure");
  }
  if (
    !Number.isFinite(input.structure.totalMin) ||
    !Number.isFinite(input.structure.totalMax)
  ) {
    throw new Error("Budget Ready structure totals are invalid");
  }
}

/**
 * Generate a Budget Package from an existing Budget Ready state.
 * Reuses Budget Engine structure already present on the ready state —
 * does not recalculate budget.
 */
export function generateBudgetPackage(
  ready: BudgetReadyState,
): BudgetPackageGenerationResult {
  assertBudgetReady(ready);

  const generatedTime = nowIso();
  const packageId = createPackageId(ready.budgetId);
  const packageMetadata: BudgetPackageMetadata = {
    featId: FEAT_15_ID,
    capability: GENERATE_BUDGET_PACKAGE_CAPABILITY,
    budgetId: ready.budgetId,
    currency: ready.structure.currency,
    totalMin: ready.structure.totalMin,
    totalMax: ready.structure.totalMax,
    itemCount: ready.structure.items.length,
    syncedStatus: ready.syncedStatus ?? "synced",
    source: "budget-engine-ready",
    assumptions: [...ready.structure.assumptions],
    items: ready.structure.items.map((item) => ({ ...item })),
    priorMetadata: { ...(ready.metadata ?? {}) },
  };

  return {
    packageId,
    generationStatus: "GENERATED",
    generatedTime,
    packageMetadata,
  };
}
