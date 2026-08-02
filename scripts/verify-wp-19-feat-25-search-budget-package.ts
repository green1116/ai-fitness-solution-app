/**
 * WP-19 / FEAT-25 — Search Budget Packages verification.
 * Search query / filters → Search Results / Search Status / Search Time.
 */
import {
  clearListedBudgetPackages,
  FEAT_25_ID,
  generateBudgetPackage,
  rememberExistingBudgetPackage,
  runBudgetEngine,
  SEARCH_BUDGET_PACKAGE_CAPABILITY,
  searchBudgetPackages,
  toBudgetReadyState,
  updateBudgetPackageMetadata,
} from "../lib/product-engine";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-19 FEAT-25 / Search Budget Packages ===");

  clearListedBudgetPackages();

  const engineA = runBudgetEngine({
    quoteId: "quote-wp19-a",
    workspaceId: "ws-wp19",
    companySize: 12,
    budgetTier: "mid",
  });
  const engineB = runBudgetEngine({
    quoteId: "quote-wp19-b",
    workspaceId: "ws-wp19",
    companySize: 14,
    budgetTier: "high",
  });
  const pkgA = generateBudgetPackage(
    toBudgetReadyState("budget-wp19-alpha", engineA),
  );
  const pkgB = generateBudgetPackage(
    toBudgetReadyState("budget-wp19-beta", engineB),
  );
  rememberExistingBudgetPackage(pkgA);
  rememberExistingBudgetPackage(pkgB);
  updateBudgetPackageMetadata({
    packageId: pkgA.packageId,
    metadataPatch: { label: "alpha-special" },
  });
  console.log("PASS Search query / filters context prepared");

  const all = searchBudgetPackages({});
  assert(all.featId === FEAT_25_ID, "FEAT-25");
  assert(
    all.capability === SEARCH_BUDGET_PACKAGE_CAPABILITY,
    "SearchBudgetPackages",
  );
  assert(all.searchResults.length === 2, "Search Results count");
  assert(all.searchStatus === "SEARCHED", "Search Status");
  assert(
    typeof all.searchTime === "string" && all.searchTime.includes("T"),
    "Search Time",
  );
  console.log("PASS Search Budget Packages → Results / Status / Time");

  const byBudget = searchBudgetPackages({ budgetId: "budget-wp19-beta" });
  assert(byBudget.searchResults.length === 1, "filter budgetId");
  assert(
    byBudget.searchResults[0]?.budgetId === "budget-wp19-beta",
    "filtered row",
  );

  const byText = searchBudgetPackages({ q: "alpha-special" });
  assert(byText.searchResults.length === 1, "text search");
  assert(
    byText.searchResults[0]?.packageId === pkgA.packageId,
    "text hit package",
  );

  const miss = searchBudgetPackages({ q: "no-such-token-xyz" });
  assert(miss.searchResults.length === 0, "empty miss");
  assert(miss.searchStatus === "SEARCHED", "miss still SEARCHED");
  console.log("PASS search query / filters applied");

  clearListedBudgetPackages();
  console.log("");
  console.log("PASS FEAT-25 Search Budget Packages");
  console.log("WP-19 verification complete");
}

main();
