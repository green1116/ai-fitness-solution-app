"use client";

import { useActionState } from "react";

import type { TenantOpsReviewActionResult } from "@/lib/runtime-ops/tenant-ops-action";

type SubmitTenantOpsReviewAction = (
  prev: TenantOpsReviewActionResult | null,
  formData: FormData,
) => Promise<TenantOpsReviewActionResult>;

export function TenantOpsReviewActionControl({
  itemId,
  submitReviewAction,
}: {
  itemId: string;
  submitReviewAction: SubmitTenantOpsReviewAction;
}) {
  const [state, formAction] = useActionState(submitReviewAction, null);

  const actionLabel =
    state?.result === "SUCCESS"
      ? "SUCCESS"
      : state?.result === "BLOCKED"
        ? "BLOCKED"
        : state?.result === "FAILED"
          ? "FAILED"
          : null;

  return (
    <div className="mt-2 flex flex-col gap-1">
      <form action={formAction} className="flex items-center gap-2">
        <input type="hidden" name="itemId" value={itemId} />
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
      {state?.reason ? (
        <p className="text-xs text-zinc-500">{state.reason}</p>
      ) : null}
    </div>
  );
}
