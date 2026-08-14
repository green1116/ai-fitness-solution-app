"use client";

import { useActionState } from "react";

type ReviewActionResult = "SUCCESS" | "BLOCKED" | "FAILED";
type ReviewOutcomeKind = "SHOWN" | "EMPTY" | "BLOCKED" | "FAILED";

type ReviewActionState = {
  result: ReviewActionResult;
  outcome: {
    outcome: ReviewOutcomeKind;
    reviewStatus: string | null;
    reviewReason: string | null;
  };
};

type SubmitWorkspaceReviewAction = (
  prev: ReviewActionState | null,
  formData: FormData,
) => Promise<ReviewActionState>;

export function WorkspaceReviewActionControl({
  surfaceItemId,
  submitReviewAction,
}: {
  surfaceItemId: string;
  submitReviewAction: SubmitWorkspaceReviewAction;
}) {
  const [state, formAction] = useActionState(
    submitReviewAction,
    null,
  );

  const actionLabel =
    state?.result === "SUCCESS"
      ? "SUCCESS"
      : state?.result === "BLOCKED"
        ? "BLOCKED"
        : state?.result === "FAILED"
          ? "FAILED"
          : null;

  return (
    <form action={formAction} className="mt-2 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input type="hidden" name="surfaceItemId" value={surfaceItemId} />
        <button
          type="submit"
          className="rounded border border-zinc-700 px-2 py-1 text-xs uppercase tracking-wide text-zinc-200 hover:border-zinc-500"
        >
          REVIEW
        </button>
        {actionLabel ? (
          <span className="text-xs uppercase tracking-wide text-zinc-400">
            {actionLabel}
          </span>
        ) : null}
      </div>
      {state?.result === "SUCCESS" && state.outcome.outcome === "SHOWN" ? (
        <p className="text-xs text-zinc-500">
          {state.outcome.reviewStatus} · {state.outcome.reviewReason}
        </p>
      ) : state?.result === "SUCCESS" && state.outcome.outcome === "EMPTY" ? (
        <p className="text-xs text-zinc-600">No review outcome</p>
      ) : null}
    </form>
  );
}
