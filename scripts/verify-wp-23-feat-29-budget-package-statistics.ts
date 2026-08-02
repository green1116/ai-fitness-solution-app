/**
 * WP-23 / FEAT-29 — Budget Package Statistics verification.
 * Statistics query → statistics / statisticsStatus: CALCULATED / statisticsTime.
 */
import {
  BUDGET_PACKAGE_STATISTICS_CAPABILITY,
  budgetPackageStatistics,
  clearListedBudgetPackages,
  FEAT_29_ID,
  generateBudgetPackage,
  rememberExistingBudgetPackage,
  runBudgetEngine,
  toBudgetReadyState,
  updateBudgetPackageMetadata,
} from "../lib/product-engine";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-23 FEAT-29 / Budget Package Statistics ===");

  clearListedBudgetPackages();

  const engineA = runBudgetEngine({
    quoteId: "quote-wp23-a",
    workspaceId: "ws-wp23",
    companySize: 8,
    budgetTier: "mid",
  });
  const engineB = runBudgetEngine({
    quoteId: "quote-wp23-b",
    workspaceId: "ws-wp23",
    companySize: 9,
    budgetTier: "high",
  });
  const pkgA = generateBudgetPackage(
    toBudgetReadyState("budget-wp23-a", engineA),
  );
  const pkgB = generateBudgetPackage(
    toBudgetReadyState("budget-wp23-b", engineB),
  );
  rememberExistingBudgetPackage(pkgA);
  rememberExistingBudgetPackage(pkgB);
  updateBudgetPackageMetadata({
    packageId: pkgA.packageId,
    metadataPatch: { label: "stats-a" },
  });

  const stats = budgetPackageStatistics({});
  assert(stats.featId === FEAT_29_ID, "FEAT-29");
  assert(
    stats.capability === BUDGET_PACKAGE_STATISTICS_CAPABILITY,
    "BudgetPackageStatistics",
  );
  assert(stats.statisticsStatus === "CALCULATED", "CALCULATED");
  assert(
    typeof stats.statisticsTime === "string" &&
      stats.statisticsTime.includes("T"),
    "statisticsTime",
  );
  assert(stats.statistics.totalCount === 2, "totalCount");
  assert(stats.statistics.generatedCount === 2, "generatedCount");
  assert(stats.statistics.failedCount === 0, "failedCount");
  assert(stats.statistics.withMetadataCount >= 1, "withMetadataCount");
  assert(stats.statistics.uniqueBudgetIdCount === 2, "uniqueBudgetIdCount");

  const filtered = budgetPackageStatistics({ budgetId: "budget-wp23-a" });
  assert(filtered.statistics.totalCount === 1, "filtered totalCount");
  assert(
    filtered.statistics.uniqueBudgetIdCount === 1,
    "filtered uniqueBudgetIdCount",
  );

  console.log(
    "PASS Budget Package Statistics → statistics / CALCULATED / statisticsTime",
  );

  clearListedBudgetPackages();
  console.log("PASS FEAT-29 Budget Package Statistics");
  console.log("WP-23 verification complete");
}

main();
