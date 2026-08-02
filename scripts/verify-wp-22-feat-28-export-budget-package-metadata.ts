/**
 * WP-22 / FEAT-28 — Export Budget Package Metadata verification.
 * Export query → exportItems / exportStatus: EXPORTED / exportTime.
 */
import {
  clearListedBudgetPackages,
  EXPORT_BUDGET_PACKAGE_METADATA_CAPABILITY,
  exportBudgetPackageMetadata,
  FEAT_28_ID,
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
  console.log("=== WP-22 FEAT-28 / Export Budget Package Metadata ===");

  clearListedBudgetPackages();

  const engine = runBudgetEngine({
    quoteId: "quote-wp22",
    workspaceId: "ws-wp22",
    companySize: 9,
    budgetTier: "mid",
  });
  const pkg = generateBudgetPackage(
    toBudgetReadyState("budget-wp22", engine),
  );
  rememberExistingBudgetPackage(pkg);
  updateBudgetPackageMetadata({
    packageId: pkg.packageId,
    metadataPatch: { label: "export-me" },
  });

  const exported = exportBudgetPackageMetadata({
    q: "export-me",
    sortBy: "budgetId",
    page: 1,
    pageSize: 10,
  });

  assert(exported.featId === FEAT_28_ID, "FEAT-28");
  assert(
    exported.capability === EXPORT_BUDGET_PACKAGE_METADATA_CAPABILITY,
    "ExportBudgetPackageMetadata",
  );
  assert(exported.exportItems.length === 1, "exportItems count");
  assert(exported.exportStatus === "EXPORTED", "EXPORTED");
  assert(
    typeof exported.exportTime === "string" &&
      exported.exportTime.includes("T"),
    "exportTime",
  );
  assert(
    exported.exportItems[0]?.packageId === pkg.packageId,
    "export packageId",
  );
  assert(exported.exportItems[0]?.budgetId === "budget-wp22", "export budgetId");
  assert(
    exported.exportItems[0]?.metadata.label === "export-me",
    "export metadata",
  );

  const empty = exportBudgetPackageMetadata({ q: "no-hit-xyz" });
  assert(empty.exportItems.length === 0, "empty export");
  assert(empty.exportStatus === "EXPORTED", "empty still EXPORTED");

  console.log(
    "PASS Export Budget Package Metadata → exportItems / EXPORTED / exportTime",
  );

  clearListedBudgetPackages();
  console.log("PASS FEAT-28 Export Budget Package Metadata");
  console.log("WP-22 verification complete");
}

main();
