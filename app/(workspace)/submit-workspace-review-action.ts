"use server";

import { completeWorkspaceReviewRecovery } from "@/lib/commercial/action-execution/review-recovery";
import { mapWorkspaceReviewOutcome } from "@/lib/commercial/action-execution/review-outcome-surface";
import { runWorkspaceReviewAction } from "@/lib/commercial/action-execution/workspace-review-action";

if (typeof window !== "undefined") {
  throw new Error("submitWorkspaceReviewAction is server-only");
}

export async function submitWorkspaceReviewAction(
  _prev: unknown,
  formData: FormData,
) {
  const action = runWorkspaceReviewAction(
    String(formData.get("surfaceItemId") ?? ""),
  );
  return {
    ...action,
    outcome: mapWorkspaceReviewOutcome(action),
  };
}

export async function submitWorkspaceReviewRecoveryAction(
  _prev: unknown,
  formData: FormData,
) {
  const surfaceItemId = String(formData.get("surfaceItemId") ?? "");
  completeWorkspaceReviewRecovery(surfaceItemId);
  const action = runWorkspaceReviewAction(surfaceItemId);
  return {
    ...action,
    outcome: mapWorkspaceReviewOutcome(action),
  };
}
