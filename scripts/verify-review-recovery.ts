/**
 * ACTION_REQUIRED recovery overlay — focused verification.
 * Does not mutate frozen ESCS-4 / EWER / EWXR REVIEW.
 */
import {
  clearWorkspaceReviewRecovery,
  completeWorkspaceReviewRecovery,
  executeControlledAction,
  getActionExecutionRequests,
  isWorkspaceReviewRecovered,
  listWorkspaceReviewSurfaceItemIds,
  mapWorkspaceReviewOutcome,
  runWorkspaceReviewAction,
} from "../lib/commercial/action-execution";
import { getActionIntents } from "../lib/commercial/action-intent";
import { getCustomerSuccessReview } from "../lib/commercial/customer-success";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== ACTION_REQUIRED recovery ===\n");
  clearWorkspaceReviewRecovery();

  const reviewIds = listWorkspaceReviewSurfaceItemIds();
  assert(reviewIds.length > 0, "REVIEW item");
  const surfaceItemId = reviewIds[0]!;
  const success = runWorkspaceReviewAction(surfaceItemId);
  assert(success.result === "SUCCESS", "REVIEW SUCCESS");
  const shown = mapWorkspaceReviewOutcome(success);
  assert(shown.reviewStatus === "ACTION_REQUIRED", "ACTION_REQUIRED before recover");
  assert(shown.reviewReason === "action-required-recover", "recover reason");
  const escsBefore = getCustomerSuccessReview().fingerprint;
  console.log("PASS before recover");

  const first = completeWorkspaceReviewRecovery(surfaceItemId);
  assert(first.ok && first.recovered, "recover ok");
  assert(first.fingerprint && first.fingerprint.length === 64, "persist fingerprint");
  assert(isWorkspaceReviewRecovered(surfaceItemId), "persisted");
  const second = completeWorkspaceReviewRecovery(surfaceItemId);
  assert(second.ok && second.fingerprint === first.fingerprint, "idempotent");
  console.log("PASS persist + idempotent");

  const reread = mapWorkspaceReviewOutcome(runWorkspaceReviewAction(surfaceItemId));
  assert(reread.reviewStatus !== "ACTION_REQUIRED", "reread not ACTION_REQUIRED");
  assert(reread.reviewStatus === "STABLE", "reread STABLE");
  assert(reread.reviewReason === "recovered", "reread recovered");
  assert(getCustomerSuccessReview().fingerprint === escsBefore, "ESCS-4 unchanged");
  const intent = getActionIntents().records.find(
    (row) => row.surfaceItemId === surfaceItemId,
  );
  assert(intent, "intent");
  const request = getActionExecutionRequests().records.find(
    (row) => row.intentId === intent.id,
  );
  assert(request, "request");
  const ewer = executeControlledAction(request);
  assert(ewer.result === "SUCCESS", "EWER REVIEW unchanged");
  assert(ewer.reviewStatus === "ACTION_REQUIRED", "EWER still reads ESCS ACTION_REQUIRED");
  console.log("PASS reread + frozen REVIEW/ESCS/EWER");

  const missing = completeWorkspaceReviewRecovery("");
  assert(!missing.ok && missing.reason === "surface-item-missing", "empty rejected");
  console.log("PASS invalid recover");

  console.log("\n=== RECOVERY VERDICT ===");
  console.log("STATUS: PASS");
}

main();
