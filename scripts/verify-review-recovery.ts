/**
 * ACTION_REQUIRED recovery overlay — focused verification.
 * Does not mutate frozen ESCS-4 / EWER / EWXR REVIEW.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  clearWorkspaceReviewRecovery,
  completeWorkspaceReviewRecovery,
  ensureWorkspaceReviewRecoveryLoaded,
  executeControlledAction,
  getActionExecutionRequests,
  isWorkspaceReviewRecovered,
  listWorkspaceReviewSurfaceItemIds,
  mapWorkspaceReviewOutcome,
  runWorkspaceReviewAction,
} from "../lib/commercial/action-execution";
import { getActionIntents } from "../lib/commercial/action-intent";
import { getCustomerSuccessReview } from "../lib/commercial/customer-success";
import {
  runWithTenantContext,
  type TenantContext,
} from "../lib/tenancy/tenant.context";

const ORG_A: TenantContext = {
  organizationId: "verify-recovery-org-a",
  userId: "verify-recovery-user-a",
  traceId: "verify-review-recovery",
};
const ORG_B: TenantContext = {
  organizationId: "verify-recovery-org-b",
  userId: "verify-recovery-user-b",
  traceId: "verify-review-recovery",
};

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function verifyDurabilityRead(): Promise<void> {
  await ensureWorkspaceReviewRecoveryLoaded();
  const reviewIds = listWorkspaceReviewSurfaceItemIds();
  assert(reviewIds.length > 0, "REVIEW item");
  const surfaceItemId = reviewIds[0]!;
  assert(isWorkspaceReviewRecovered(surfaceItemId), "new process loaded recovery");
  const reread = mapWorkspaceReviewOutcome(runWorkspaceReviewAction(surfaceItemId));
  assert(reread.reviewStatus === "STABLE", "new process STABLE");
  assert(reread.reviewReason === "recovered", "new process recovered");
  console.log("PASS durability child STABLE");
}

async function main() {
  if (process.env.VERIFY_RECOVERY_DURABILITY_CHILD === "1") {
    await runWithTenantContext(ORG_A, () => verifyDurabilityRead());
    return;
  }

  console.log("=== ACTION_REQUIRED recovery ===\n");
  await runWithTenantContext(ORG_A, () => clearWorkspaceReviewRecovery());
  await runWithTenantContext(ORG_B, () => clearWorkspaceReviewRecovery());

  const reviewIds = listWorkspaceReviewSurfaceItemIds();
  assert(reviewIds.length > 0, "REVIEW item");
  const surfaceItemId = reviewIds[0]!;

  await runWithTenantContext(ORG_A, async () => {
    const success = runWorkspaceReviewAction(surfaceItemId);
    assert(success.result === "SUCCESS", "REVIEW SUCCESS");
    const shown = mapWorkspaceReviewOutcome(success);
    assert(shown.reviewStatus === "ACTION_REQUIRED", "ACTION_REQUIRED before recover");
    assert(shown.reviewReason === "action-required-recover", "recover reason");
    const escsBefore = getCustomerSuccessReview().fingerprint;
    console.log("PASS before recover");

    const first = await completeWorkspaceReviewRecovery(surfaceItemId);
    assert(first.ok && first.recovered, "recover ok");
    assert(first.fingerprint && first.fingerprint.length === 64, "persist fingerprint");
    assert(isWorkspaceReviewRecovered(surfaceItemId), "persisted");
    const second = await completeWorkspaceReviewRecovery(surfaceItemId);
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
  });

  const child = spawnSync(
    process.execPath,
    [
      path.join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs"),
      "scripts/verify-review-recovery.ts",
    ],
    {
      env: { ...process.env, VERIFY_RECOVERY_DURABILITY_CHILD: "1" },
      encoding: "utf8",
    },
  );
  if (child.status !== 0) {
    process.stderr.write(child.stdout);
    process.stderr.write(child.stderr);
    throw new Error(`ASSERT: durability child exit ${child.status}`);
  }
  process.stdout.write(child.stdout);
  console.log("PASS durability new process STABLE");

  await runWithTenantContext(ORG_B, async () => {
    await ensureWorkspaceReviewRecoveryLoaded();
    assert(!isWorkspaceReviewRecovered(surfaceItemId), "org B not recovered");
    const other = mapWorkspaceReviewOutcome(runWorkspaceReviewAction(surfaceItemId));
    assert(other.reviewStatus === "ACTION_REQUIRED", "org B still ACTION_REQUIRED");
  });
  await runWithTenantContext(ORG_A, async () => {
    await ensureWorkspaceReviewRecoveryLoaded();
    assert(isWorkspaceReviewRecovered(surfaceItemId), "org A still recovered");
  });
  console.log("PASS tenant isolation org A != org B");

  const missing = await runWithTenantContext(ORG_A, () =>
    completeWorkspaceReviewRecovery(""),
  );
  assert(!missing.ok && missing.reason === "surface-item-missing", "empty rejected");
  const unauth = await completeWorkspaceReviewRecovery(surfaceItemId);
  assert(!unauth.ok && unauth.reason === "auth-required", "no tenant rejected");
  console.log("PASS invalid recover");

  console.log("\n=== RECOVERY VERDICT ===");
  console.log("STATUS: PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
