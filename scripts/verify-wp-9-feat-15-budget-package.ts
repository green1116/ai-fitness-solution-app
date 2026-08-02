/**
 * WP-9 / FEAT-15 — Generate Budget Package verification.
 * Budget Ready → package metadata via existing Budget Engine (no recalculation).
 */
import {
  assertBudgetReady,
  FEAT_15_ID,
  GENERATE_BUDGET_PACKAGE_CAPABILITY,
  generateBudgetPackage,
  runBudgetEngine,
  toBudgetReadyState,
  type BudgetReadyState,
} from "../lib/product-engine";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-9 FEAT-15 / Generate Budget Package ===");

  const engine = runBudgetEngine({
    quoteId: "quote-wp9",
    workspaceId: "ws-wp9",
    companySize: 50,
    budgetTier: "mid",
  });
  const ready = toBudgetReadyState("budget-wp9", engine, {
    projectId: "proj-wp9",
  });
  assert(ready.status === "READY", "Budget Ready status");
  assertBudgetReady(ready);
  console.log("PASS Budget Ready state from existing Budget Engine result");

  const frozenStructure = JSON.stringify(ready.structure);
  const pkg = generateBudgetPackage(ready);

  assert(typeof pkg.packageId === "string" && pkg.packageId.length > 0, "Package Id");
  assert(pkg.generationStatus === "GENERATED", "Generation Status");
  assert(
    typeof pkg.generatedTime === "string" && pkg.generatedTime.includes("T"),
    "Generated Time",
  );
  assert(pkg.packageMetadata.featId === FEAT_15_ID, "metadata featId");
  assert(
    pkg.packageMetadata.capability === GENERATE_BUDGET_PACKAGE_CAPABILITY,
    "metadata capability",
  );
  assert(pkg.packageMetadata.budgetId === "budget-wp9", "metadata budgetId");
  assert(pkg.packageMetadata.source === "budget-engine-ready", "source");
  assert(
    pkg.packageMetadata.totalMin === engine.structure.totalMin,
    "reuses engine totalMin (no recalc drift)",
  );
  assert(
    pkg.packageMetadata.totalMax === engine.structure.totalMax,
    "reuses engine totalMax (no recalc drift)",
  );
  assert(
    JSON.stringify(ready.structure) === frozenStructure,
    "ready structure unchanged (no budget recalculation)",
  );
  console.log("PASS Generate Budget Package outputs Package Id / Status / Time / Metadata");

  let rejected = false;
  try {
    generateBudgetPackage({
      ...ready,
      status: "DRAFT",
    } as unknown as BudgetReadyState);
  } catch {
    rejected = true;
  }
  assert(rejected, "rejects non-READY budget");
  console.log("PASS non-Ready budget rejected");

  console.log("");
  console.log("PASS FEAT-15 Generate Budget Package");
  console.log("WP-9 verification complete");
}

main();
