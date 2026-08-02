/**
 * WP-16 / FEAT-22 — List Budget Packages verification.
 * Query / filter context → Package List / List Status / List Time.
 */
import {
  clearListedBudgetPackages,
  FEAT_22_ID,
  generateBudgetPackage,
  LIST_BUDGET_PACKAGE_CAPABILITY,
  listBudgetPackages,
  rememberExistingBudgetPackage,
  runBudgetEngine,
  toBudgetReadyState,
} from "../lib/product-engine";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-16 FEAT-22 / List Budget Packages ===");

  clearListedBudgetPackages();

  const engineA = runBudgetEngine({
    quoteId: "quote-wp16-a",
    workspaceId: "ws-wp16",
    companySize: 20,
    budgetTier: "mid",
  });
  const engineB = runBudgetEngine({
    quoteId: "quote-wp16-b",
    workspaceId: "ws-wp16",
    companySize: 22,
    budgetTier: "high",
  });
  const pkgA = generateBudgetPackage(toBudgetReadyState("budget-wp16-a", engineA));
  const pkgB = generateBudgetPackage(toBudgetReadyState("budget-wp16-b", engineB));
  rememberExistingBudgetPackage(pkgA);
  rememberExistingBudgetPackage(pkgB);
  console.log("PASS Package query / filter context prepared");

  const listed = listBudgetPackages({});
  assert(listed.featId === FEAT_22_ID, "FEAT-22");
  assert(
    listed.capability === LIST_BUDGET_PACKAGE_CAPABILITY,
    "ListBudgetPackages",
  );
  assert(listed.packageList.length === 2, "Package List length");
  assert(listed.listStatus === "LISTED", "List Status");
  assert(
    typeof listed.listTime === "string" && listed.listTime.includes("T"),
    "List Time",
  );
  assert(listed.packageGenerated === false, "No Generate");
  assert(listed.downloaded === false, "No Download");
  assert(listed.shared === false, "No Share");
  assert(listed.tracked === false, "No Track");
  assert(listed.archived === false, "No Archive");
  assert(listed.restored === false, "No Restore");
  assert(listed.deleted === false, "No Delete");
  assert(listed.emailed === false, "No Email");
  assert(listed.zipExported === false, "No ZIP Export");
  assert(listed.notified === false, "No Notification");
  assert(listed.analyticsRecorded === false, "No Analytics");
  console.log("PASS List Budget Packages → List / Status / Time");

  const filtered = listBudgetPackages({ budgetId: "budget-wp16-a" });
  assert(filtered.packageList.length === 1, "filter by budgetId");
  assert(
    filtered.packageList[0]?.packageId === pkgA.packageId,
    "filtered packageId",
  );
  console.log("PASS query / filter context applied");

  clearListedBudgetPackages();
  const empty = listBudgetPackages({});
  assert(empty.packageList.length === 0, "empty catalog lists empty");
  assert(empty.listStatus === "LISTED", "empty still LISTED");
  console.log("PASS empty catalog handled");

  console.log("");
  console.log("PASS FEAT-22 List Budget Packages");
  console.log("WP-16 verification complete");
}

main();
