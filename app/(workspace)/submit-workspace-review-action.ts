"use server";

import { runWorkspaceReviewAction } from "@/lib/commercial/action-execution/workspace-review-action";

export async function submitWorkspaceReviewAction(
  _prev: unknown,
  formData: FormData,
) {
  return runWorkspaceReviewAction(String(formData.get("surfaceItemId") ?? ""));
}
