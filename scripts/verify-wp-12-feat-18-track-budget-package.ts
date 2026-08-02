/**
 * WP-12 / FEAT-18 — Track Budget Package verification.
 * Existing Budget Package → Package Status / Updated Time / Package Metadata.
 */
import {
  FEAT_18_ID,
  generateBudgetPackage,
  runBudgetEngine,
  toBudgetPackageTrackInput,
  toBudgetReadyState,
  TRACK_BUDGET_PACKAGE_CAPABILITY,
  trackBudgetPackage,
} from "../lib/product-engine";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-12 FEAT-18 / Track Budget Package ===");

  const engine = runBudgetEngine({
    quoteId: "quote-wp12",
    workspaceId: "ws-wp12",
    companySize: 30,
    budgetTier: "mid",
  });
  const ready = toBudgetReadyState("budget-wp12", engine);
  const generated = generateBudgetPackage(ready);
  const trackInput = toBudgetPackageTrackInput(generated);
  assert(trackInput.packageId.length > 0, "Budget Package input");
  console.log("PASS Budget Package accepted");

  const tracked = trackBudgetPackage(trackInput);

  assert(tracked.featId === FEAT_18_ID, "FEAT-18");
  assert(
    tracked.capability === TRACK_BUDGET_PACKAGE_CAPABILITY,
    "TrackBudgetPackage",
  );
  assert(tracked.packageId === generated.packageId, "same packageId");
  assert(
    tracked.packageStatus === "AVAILABLE" ||
      tracked.packageStatus === "GENERATED" ||
      tracked.packageStatus === "FAILED",
    `Package Status=${tracked.packageStatus}`,
  );
  assert(tracked.packageStatus === "AVAILABLE", "GENERATED maps to AVAILABLE");
  assert(
    typeof tracked.updatedTime === "string" && tracked.updatedTime.includes("T"),
    "Updated Time",
  );
  assert(
    tracked.packageMetadata.budgetId === "budget-wp12",
    "Package Metadata budgetId",
  );
  assert(
    tracked.packageMetadata.currency === engine.structure.currency,
    "Package Metadata currency",
  );
  assert(
    tracked.packageMetadata.priorMetadata.lifecycleStatus === "AVAILABLE",
    "metadata lifecycle cue",
  );
  assert(tracked.packageGenerated === false, "No Package generation");
  assert(tracked.downloaded === false, "No Download");
  assert(tracked.shared === false, "No Share");
  assert(tracked.emailed === false, "No Email");
  assert(tracked.zipExported === false, "No ZIP Export");
  assert(tracked.analyticsRecorded === false, "No Analytics");
  console.log("PASS Track Budget Package → Status / Updated Time / Metadata");

  let rejected = false;
  try {
    trackBudgetPackage({
      ...trackInput,
      packageId: "",
    });
  } catch {
    rejected = true;
  }
  assert(rejected, "rejects missing packageId");
  console.log("PASS invalid package rejected");

  console.log("");
  console.log("PASS FEAT-18 Track Budget Package");
  console.log("WP-12 verification complete");
}

main();
