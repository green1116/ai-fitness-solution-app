/**
 * WP-18 / FEAT-24 — Update Budget Package Metadata verification.
 * Package Id + Metadata patch → Update Completed / Update Status / Updated Time.
 */
import {
  clearListedBudgetPackages,
  FEAT_24_ID,
  findExistingBudgetPackage,
  generateBudgetPackage,
  rememberExistingBudgetPackage,
  runBudgetEngine,
  toBudgetReadyState,
  UPDATE_BUDGET_PACKAGE_METADATA_CAPABILITY,
  updateBudgetPackageMetadata,
} from "../lib/product-engine";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-18 FEAT-24 / Update Budget Package Metadata ===");

  clearListedBudgetPackages();

  const engine = runBudgetEngine({
    quoteId: "quote-wp18",
    workspaceId: "ws-wp18",
    companySize: 16,
    budgetTier: "mid",
  });
  const generated = generateBudgetPackage(
    toBudgetReadyState("budget-wp18", engine),
  );
  rememberExistingBudgetPackage(generated);
  console.log("PASS Package Id + Metadata patch context prepared");

  const updated = updateBudgetPackageMetadata({
    packageId: generated.packageId,
    metadataPatch: {
      label: "wp18-label",
      note: "metadata-patch",
    },
  });

  assert(updated.featId === FEAT_24_ID, "FEAT-24");
  assert(
    updated.capability === UPDATE_BUDGET_PACKAGE_METADATA_CAPABILITY,
    "UpdateBudgetPackageMetadata",
  );
  assert(updated.packageId === generated.packageId, "Package Id");
  assert(updated.updateCompleted === true, "Update Completed");
  assert(updated.updateStatus === "UPDATED", "Update Status");
  assert(
    typeof updated.updatedTime === "string" &&
      updated.updatedTime.includes("T"),
    "Updated Time",
  );
  assert(updated.packageGenerated === false, "No Generate");
  assert(updated.downloaded === false, "No Download");
  assert(updated.shared === false, "No Share");
  assert(updated.tracked === false, "No Track");
  assert(updated.archived === false, "No Archive");
  assert(updated.restored === false, "No Restore");
  assert(updated.deleted === false, "No Delete");
  assert(updated.listed === false, "No List");
  assert(updated.detailsFetched === false, "No Details");
  assert(updated.analyticsRecorded === false, "No Analytics");

  const after = findExistingBudgetPackage(generated.packageId);
  assert(after?.metadata?.label === "wp18-label", "patch label applied");
  assert(after?.metadata?.note === "metadata-patch", "patch note applied");
  assert(
    typeof after?.metadata?.metadataUpdatedAt === "string",
    "metadataUpdatedAt stamped",
  );
  console.log("PASS Update Budget Package Metadata → Completed / Status / Time");

  let rejectedEmptyId = false;
  try {
    updateBudgetPackageMetadata({
      packageId: "",
      metadataPatch: { a: 1 },
    });
  } catch {
    rejectedEmptyId = true;
  }
  assert(rejectedEmptyId, "rejects empty Package Id");

  let rejectedEmptyPatch = false;
  try {
    updateBudgetPackageMetadata({
      packageId: generated.packageId,
      metadataPatch: {},
    });
  } catch {
    rejectedEmptyPatch = true;
  }
  assert(rejectedEmptyPatch, "rejects empty Metadata patch");

  let rejectedUnknown = false;
  try {
    updateBudgetPackageMetadata({
      packageId: "pkg-missing",
      metadataPatch: { a: 1 },
    });
  } catch {
    rejectedUnknown = true;
  }
  assert(rejectedUnknown, "rejects unknown Package Id");
  console.log("PASS invalid inputs rejected");

  clearListedBudgetPackages();
  console.log("");
  console.log("PASS FEAT-24 Update Budget Package Metadata");
  console.log("WP-18 verification complete");
}

main();
