/**
 * WP-14 / FEAT-20 — Restore Budget Package verification.
 * Archived Budget Package → Restore Completed / Restore Status / Restored Time.
 */
import {
  archiveBudgetPackage,
  FEAT_20_ID,
  generateBudgetPackage,
  RESTORE_BUDGET_PACKAGE_CAPABILITY,
  restoreBudgetPackage,
  runBudgetEngine,
  toArchivedBudgetPackage,
  toBudgetPackageArchiveInput,
  toBudgetReadyState,
} from "../lib/product-engine";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-14 FEAT-20 / Restore Budget Package ===");

  const engine = runBudgetEngine({
    quoteId: "quote-wp14",
    workspaceId: "ws-wp14",
    companySize: 26,
    budgetTier: "mid",
  });
  const ready = toBudgetReadyState("budget-wp14", engine);
  const generated = generateBudgetPackage(ready);
  const archived = archiveBudgetPackage(toBudgetPackageArchiveInput(generated));
  const archivedInput = toArchivedBudgetPackage(archived);
  assert(archivedInput.archiveStatus === "ARCHIVED", "Archived Budget Package");
  console.log("PASS Archived Budget Package accepted");

  const restored = restoreBudgetPackage(archivedInput);

  assert(restored.featId === FEAT_20_ID, "FEAT-20");
  assert(
    restored.capability === RESTORE_BUDGET_PACKAGE_CAPABILITY,
    "RestoreBudgetPackage",
  );
  assert(restored.packageId === archived.packageId, "same packageId");
  assert(restored.restoreCompleted === true, "Restore Completed");
  assert(restored.restoreStatus === "RESTORED", "Restore Status");
  assert(
    typeof restored.restoredTime === "string" &&
      restored.restoredTime.includes("T"),
    "Restored Time",
  );
  assert(restored.packageGenerated === false, "No Package generation");
  assert(restored.downloaded === false, "No Download");
  assert(restored.shared === false, "No Share");
  assert(restored.emailed === false, "No Email");
  assert(restored.zipExported === false, "No ZIP Export");
  assert(restored.deleted === false, "No Delete");
  assert(restored.archived === false, "No Archive");
  assert(restored.notified === false, "No Notification");
  assert(restored.analyticsRecorded === false, "No Analytics");
  console.log("PASS Restore Budget Package → Completed / Status / Time");

  let rejected = false;
  try {
    restoreBudgetPackage({
      packageId: "pkg-not-archived",
      archiveStatus: "AVAILABLE" as "ARCHIVED",
    });
  } catch {
    rejected = true;
  }
  assert(rejected, "rejects non-archived package");
  console.log("PASS non-archived package rejected");

  console.log("");
  console.log("PASS FEAT-20 Restore Budget Package");
  console.log("WP-14 verification complete");
}

main();
