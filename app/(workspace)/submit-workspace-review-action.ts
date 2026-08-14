"use server";

import { mapWorkspaceReviewOutcome } from "@/lib/commercial/action-execution/review-outcome-surface";
import { runWorkspaceReviewAction } from "@/lib/commercial/action-execution/workspace-review-action";

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
