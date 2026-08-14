"use client";

import { useActionState } from "react";

import { submitWorkspaceReviewAction } from "./submit-workspace-review-action";

export function WorkspaceReviewActionControl({
  surfaceItemId,
}: {
  surfaceItemId: string;
}) {
  const [state, formAction] = useActionState(
    submitWorkspaceReviewAction,
    null,
  );

  return (
    <form action={formAction} className="mt-2 flex items-center gap-2">
      <input type="hidden" name="surfaceItemId" value={surfaceItemId} />
      <button
        type="submit"
        className="rounded border border-zinc-700 px-2 py-1 text-xs uppercase tracking-wide text-zinc-200 hover:border-zinc-500"
      >
        REVIEW
      </button>
      {state ? (
        <span className="text-xs uppercase tracking-wide text-zinc-400">
          {state.result === "SUCCESS"
            ? "SUCCESS"
            : state.result === "BLOCKED"
              ? "BLOCKED"
              : "FAILED"}
        </span>
      ) : null}
    </form>
  );
}
