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
  submitRecoveryAction,
}: {
  surfaceItemId: string;
  submitReviewAction: SubmitWorkspaceReviewAction;
  submitRecoveryAction: SubmitWorkspaceReviewAction;
}) {
  const [reviewState, reviewFormAction] = useActionState(
    submitReviewAction,
    null,
  );
  const [recoveryState, recoveryFormAction] = useActionState(
    submitRecoveryAction,
    null,
  );

  const state = recoveryState ?? reviewState;
  const actionLabel =
    state?.result === "SUCCESS"
      ? "SUCCESS"
      : state?.result === "BLOCKED"
        ? "BLOCKED"
        : state?.result === "FAILED"
          ? "FAILED"
          : null;
  const showRecover =
    state?.result === "SUCCESS" &&
    state.outcome.outcome === "SHOWN" &&
    state.outcome.reviewStatus === "ACTION_REQUIRED";

  return (
    <div className="mt-2 flex flex-col gap-1">
      <form action={reviewFormAction} className="flex items-center gap-2">
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
      </form>
      {state?.result === "SUCCESS" && state.outcome.outcome === "SHOWN" ? (
        <p className="text-xs text-zinc-500">
          {state.outcome.reviewStatus} · {state.outcome.reviewReason}
        </p>
      ) : state?.result === "SUCCESS" && state.outcome.outcome === "EMPTY" ? (
        <p className="text-xs text-zinc-600">No review outcome</p>
      ) : null}
      {showRecover ? (
        <form action={recoveryFormAction}>
          <input type="hidden" name="surfaceItemId" value={surfaceItemId} />
          <button
            type="submit"
            className="rounded border border-emerald-700 px-2 py-1 text-xs uppercase tracking-wide text-emerald-300 hover:border-emerald-500"
          >
            RECOVER
          </button>
        </form>
      ) : null}
    </div>
  );
}
