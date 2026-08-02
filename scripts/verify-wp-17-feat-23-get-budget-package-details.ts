/**
 * WP-17 / FEAT-23 — Get Budget Package Details verification.
 * Package Id → Package Details / Detail Status / Detail Time.
 */
import {
  clearListedBudgetPackages,
  FEAT_23_ID,
  generateBudgetPackage,
  GET_BUDGET_PACKAGE_DETAILS_CAPABILITY,
  getBudgetPackageDetails,
  rememberExistingBudgetPackage,
  runBudgetEngine,
  toBudgetReadyState,
} from "../lib/product-engine";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-17 FEAT-23 / Get Budget Package Details ===");

  clearListedBudgetPackages();

  const engine = runBudgetEngine({
    quoteId: "quote-wp17",
    workspaceId: "ws-wp17",
    companySize: 18,
    budgetTier: "mid",
  });
  const generated = generateBudgetPackage(
    toBudgetReadyState("budget-wp17", engine),
  );
  rememberExistingBudgetPackage(generated);
  console.log("PASS Package Id context prepared");

  const details = getBudgetPackageDetails(generated.packageId);

  assert(details.featId === FEAT_23_ID, "FEAT-23");
  assert(
    details.capability === GET_BUDGET_PACKAGE_DETAILS_CAPABILITY,
    "GetBudgetPackageDetails",
  );
  assert(details.packageId === generated.packageId, "Package Id");
  assert(
    details.packageDetails.packageId === generated.packageId,
    "Package Details packageId",
  );
  assert(
    details.packageDetails.budgetId === "budget-wp17",
    "Package Details budgetId",
  );
  assert(details.detailStatus === "FOUND", "Detail Status");
  assert(
    typeof details.detailTime === "string" && details.detailTime.includes("T"),
    "Detail Time",
  );
  assert(details.packageGenerated === false, "No Generate");
  assert(details.downloaded === false, "No Download");
  assert(details.shared === false, "No Share");
  assert(details.tracked === false, "No Track");
  assert(details.archived === false, "No Archive");
  assert(details.restored === false, "No Restore");
  assert(details.deleted === false, "No Delete");
  assert(details.listed === false, "No List");
  assert(details.analyticsRecorded === false, "No Analytics");
  console.log("PASS Get Budget Package Details → Details / Status / Time");

  let rejectedMissing = false;
  try {
    getBudgetPackageDetails("");
  } catch {
    rejectedMissing = true;
  }
  assert(rejectedMissing, "rejects empty Package Id");

  let rejectedUnknown = false;
  try {
    getBudgetPackageDetails("pkg-does-not-exist");
  } catch {
    rejectedUnknown = true;
  }
  assert(rejectedUnknown, "rejects unknown Package Id");
  console.log("PASS invalid Package Id rejected");

  clearListedBudgetPackages();
  console.log("");
  console.log("PASS FEAT-23 Get Budget Package Details");
  console.log("WP-17 verification complete");
}

main();
