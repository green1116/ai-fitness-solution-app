/**
 * WP-13 / FEAT-19 — Archive Budget Package verification.
 * Existing Budget Package → Archive Completed / Archive Status / Archived Time.
 */
import {
  ARCHIVE_BUDGET_PACKAGE_CAPABILITY,
  archiveBudgetPackage,
  FEAT_19_ID,
  generateBudgetPackage,
  runBudgetEngine,
  toBudgetPackageArchiveInput,
  toBudgetReadyState,
} from "../lib/product-engine";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-13 FEAT-19 / Archive Budget Package ===");

  const engine = runBudgetEngine({
    quoteId: "quote-wp13",
    workspaceId: "ws-wp13",
    companySize: 28,
    budgetTier: "mid",
  });
  const ready = toBudgetReadyState("budget-wp13", engine);
  const generated = generateBudgetPackage(ready);
  const archiveInput = toBudgetPackageArchiveInput(generated);
  assert(archiveInput.packageId.length > 0, "Budget Package input");
  console.log("PASS Budget Package accepted");

  const archived = archiveBudgetPackage(archiveInput);

  assert(archived.featId === FEAT_19_ID, "FEAT-19");
  assert(
    archived.capability === ARCHIVE_BUDGET_PACKAGE_CAPABILITY,
    "ArchiveBudgetPackage",
  );
  assert(archived.packageId === generated.packageId, "same packageId");
  assert(archived.archiveCompleted === true, "Archive Completed");
  assert(archived.archiveStatus === "ARCHIVED", "Archive Status");
  assert(
    typeof archived.archivedTime === "string" &&
      archived.archivedTime.includes("T"),
    "Archived Time",
  );
  assert(archived.packageGenerated === false, "No Package generation");
  assert(archived.downloaded === false, "No Download");
  assert(archived.shared === false, "No Share");
  assert(archived.emailed === false, "No Email");
  assert(archived.zipExported === false, "No ZIP Export");
  assert(archived.deleted === false, "No Delete");
  assert(archived.restored === false, "No Restore");
  assert(archived.notified === false, "No Notification");
  assert(archived.analyticsRecorded === false, "No Analytics");
  console.log("PASS Archive Budget Package → Completed / Status / Time");

  let rejected = false;
  try {
    archiveBudgetPackage({
      ...archiveInput,
      packageMetadata: {
        ...archiveInput.packageMetadata,
        priorMetadata: {
          ...archiveInput.packageMetadata.priorMetadata,
          archiveStatus: "ARCHIVED",
        },
      },
    });
  } catch {
    rejected = true;
  }
  assert(rejected, "rejects already-archived package");
  console.log("PASS already-archived package rejected");

  console.log("");
  console.log("PASS FEAT-19 Archive Budget Package");
  console.log("WP-13 verification complete");
}

main();
