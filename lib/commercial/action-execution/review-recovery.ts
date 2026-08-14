/**
 * Workspace ACTION_REQUIRED recovery overlay.
 * Does not mutate frozen ESCS-4 / EWER / EWXR REVIEW.
 */

import { createHash } from "node:crypto";

import { getActionIntents } from "../action-intent/action-intent";
import { getCustomerSuccessReview } from "../customer-success/customer-success-review";

const recovered = new Map<string, string>();

function completionFingerprint(surfaceItemId: string, customerId: string): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        surfaceItemId,
        customerId,
        recovered: true,
      }),
    )
    .digest("hex");
}

export function isWorkspaceReviewRecovered(surfaceItemId: string): boolean {
  return recovered.has(surfaceItemId.trim());
}

export function clearWorkspaceReviewRecovery(): void {
  recovered.clear();
}

export function completeWorkspaceReviewRecovery(surfaceItemId: string): {
  ok: boolean;
  recovered: boolean;
  surfaceItemId: string;
  customerId: string | null;
  fingerprint: string | null;
  reason: string;
} {
  const id = surfaceItemId.trim();
  if (!id) {
    return {
      ok: false,
      recovered: false,
      surfaceItemId: id,
      customerId: null,
      fingerprint: null,
      reason: "surface-item-missing",
    };
  }

  const existing = recovered.get(id);
  if (existing) {
    const customerId =
      getActionIntents().records.find((row) => row.surfaceItemId === id)
        ?.customerId ?? null;
    return {
      ok: true,
      recovered: true,
      surfaceItemId: id,
      customerId,
      fingerprint: existing,
      reason: "already-recovered",
    };
  }

  const customerId =
    getActionIntents().records.find((row) => row.surfaceItemId === id)
      ?.customerId ?? null;
  const review = customerId
    ? getCustomerSuccessReview().records.find(
        (row) => row.customerId === customerId,
      )
    : undefined;

  if (!review || review.reviewStatus !== "ACTION_REQUIRED") {
    return {
      ok: false,
      recovered: false,
      surfaceItemId: id,
      customerId,
      fingerprint: null,
      reason: "not-action-required",
    };
  }

  const fingerprint = completionFingerprint(id, customerId!);
  recovered.set(id, fingerprint);
  return {
    ok: true,
    recovered: true,
    surfaceItemId: id,
    customerId,
    fingerprint,
    reason: "recovered",
  };
}
