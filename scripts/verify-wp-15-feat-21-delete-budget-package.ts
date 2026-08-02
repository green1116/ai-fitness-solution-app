/**
 * WP-15 / FEAT-21 — Delete Budget Package verification.
 * Existing Budget Package → Delete Completed / Delete Status / Deleted Time.
 */
import {
  DELETE_BUDGET_PACKAGE_CAPABILITY,
  deleteBudgetPackage,
  FEAT_21_ID,
  generateBudgetPackage,
  runBudgetEngine,
  toBudgetPackageDeleteInput,
  toBudgetReadyState,
} from "../lib/product-engine";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-15 FEAT-21 / Delete Budget Package ===");

  const engine = runBudgetEngine({
    quoteId: "quote-wp15",
    workspaceId: "ws-wp15",
    companySize: 24,
    budgetTier: "mid",
  });
  const ready = toBudgetReadyState("budget-wp15", engine);
  const generated = generateBudgetPackage(ready);
  const deleteInput = toBudgetPackageDeleteInput(generated);
  assert(deleteInput.packageId.length > 0, "Existing Budget Package");
  console.log("PASS Existing Budget Package accepted");

  const deleted = deleteBudgetPackage(deleteInput);

  assert(deleted.featId === FEAT_21_ID, "FEAT-21");
  assert(
    deleted.capability === DELETE_BUDGET_PACKAGE_CAPABILITY,
    "DeleteBudgetPackage",
  );
  assert(deleted.packageId === generated.packageId, "same packageId");
  assert(deleted.deleteCompleted === true, "Delete Completed");
  assert(deleted.deleteStatus === "DELETED", "Delete Status");
  assert(
    typeof deleted.deletedTime === "string" &&
      deleted.deletedTime.includes("T"),
    "Deleted Time",
  );
  assert(deleted.packageGenerated === false, "No Package generation");
  assert(deleted.downloaded === false, "No Download");
  assert(deleted.shared === false, "No Share");
  assert(deleted.emailed === false, "No Email");
  assert(deleted.zipExported === false, "No ZIP Export");
  assert(deleted.archived === false, "No Archive");
  assert(deleted.restored === false, "No Restore");
  assert(deleted.notified === false, "No Notification");
  assert(deleted.analyticsRecorded === false, "No Analytics");
  console.log("PASS Delete Budget Package → Completed / Status / Time");

  let rejected = false;
  try {
    deleteBudgetPackage({
      ...deleteInput,
      packageMetadata: {
        ...deleteInput.packageMetadata,
        priorMetadata: {
          ...deleteInput.packageMetadata.priorMetadata,
          deleteStatus: "DELETED",
        },
      },
    });
  } catch {
    rejected = true;
  }
  assert(rejected, "rejects already-deleted package");
  console.log("PASS already-deleted package rejected");

  console.log("");
  console.log("PASS FEAT-21 Delete Budget Package");
  console.log("WP-15 verification complete");
}

main();
