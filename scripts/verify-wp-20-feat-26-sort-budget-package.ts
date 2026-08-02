/**
 * WP-20 / FEAT-26 — Sort Budget Packages verification.
 * Sort query → sortedResults / sortStatus: SORTED / sortTime.
 */
import {
  clearListedBudgetPackages,
  FEAT_26_ID,
  generateBudgetPackage,
  rememberExistingBudgetPackage,
  runBudgetEngine,
  SORT_BUDGET_PACKAGE_CAPABILITY,
  sortBudgetPackages,
  toBudgetReadyState,
} from "../lib/product-engine";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-20 FEAT-26 / Sort Budget Packages ===");

  clearListedBudgetPackages();

  const engineZ = runBudgetEngine({
    quoteId: "quote-wp20-z",
    workspaceId: "ws-wp20",
    companySize: 10,
    budgetTier: "mid",
  });
  const engineA = runBudgetEngine({
    quoteId: "quote-wp20-a",
    workspaceId: "ws-wp20",
    companySize: 11,
    budgetTier: "high",
  });
  const pkgZ = generateBudgetPackage(
    toBudgetReadyState("budget-wp20-zulu", engineZ),
  );
  const pkgA = generateBudgetPackage(
    toBudgetReadyState("budget-wp20-alpha", engineA),
  );
  rememberExistingBudgetPackage(pkgZ);
  rememberExistingBudgetPackage(pkgA);

  const sortedAsc = sortBudgetPackages({
    sortBy: "budgetId",
    sortDir: "asc",
  });
  assert(sortedAsc.featId === FEAT_26_ID, "FEAT-26");
  assert(
    sortedAsc.capability === SORT_BUDGET_PACKAGE_CAPABILITY,
    "SortBudgetPackages",
  );
  assert(sortedAsc.sortedResults.length === 2, "sortedResults count");
  assert(sortedAsc.sortStatus === "SORTED", "sortStatus SORTED");
  assert(
    typeof sortedAsc.sortTime === "string" &&
      sortedAsc.sortTime.includes("T"),
    "sortTime",
  );
  assert(
    sortedAsc.sortedResults[0]?.budgetId === "budget-wp20-alpha",
    "asc first",
  );
  assert(
    sortedAsc.sortedResults[1]?.budgetId === "budget-wp20-zulu",
    "asc second",
  );

  const sortedDesc = sortBudgetPackages({
    sortBy: "budgetId",
    sortDir: "desc",
  });
  assert(
    sortedDesc.sortedResults[0]?.budgetId === "budget-wp20-zulu",
    "desc first",
  );

  const filtered = sortBudgetPackages({
    q: "alpha",
    sortBy: "packageId",
  });
  assert(filtered.sortedResults.length === 1, "reuses search filter");
  assert(
    filtered.sortedResults[0]?.budgetId === "budget-wp20-alpha",
    "filtered+sorted",
  );

  console.log("PASS Sort Budget Packages → sortedResults / SORTED / sortTime");

  clearListedBudgetPackages();
  console.log("PASS FEAT-26 Sort Budget Packages");
  console.log("WP-20 verification complete");
}

main();
