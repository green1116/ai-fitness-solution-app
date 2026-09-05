"use client";

import { useActionState } from "react";

import type { TenantOpsReviewActionResult } from "@/lib/runtime-ops/tenant-ops-action";
import { submitTenantOpsRecoveryAction } from "./submit-tenant-ops-recovery-action";

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
  const [reviewState, reviewFormAction] = useActionState(
    submitReviewAction,
    null,
  );
  const [recoveryState, recoveryFormAction] = useActionState(
    submitTenantOpsRecoveryAction,
    null,
  );

  const reviewLabel =
    reviewState?.result === "SUCCESS"
      ? "SUCCESS"
      : reviewState?.result === "BLOCKED"
        ? "BLOCKED"
        : reviewState?.result === "FAILED"
          ? "FAILED"
          : null;

  const showRecover = reviewState?.result === "SUCCESS";
  const recoveryLabel =
    recoveryState?.result === "SUCCESS"
      ? "RECOVERED"
      : recoveryState?.result === "FAILED"
        ? "FAILED"
        : null;

  return (
    <div className="mt-2 flex flex-col gap-1">
      <form action={reviewFormAction} className="flex items-center gap-2">
        <input type="hidden" name="itemId" value={itemId} />
        <button
          type="submit"
          className="rounded border border-zinc-700 px-2 py-1 text-xs uppercase tracking-wide text-zinc-200 hover:border-zinc-500"
        >
          REVIEW
        </button>
        {reviewLabel ? (
          <span className="text-xs uppercase tracking-wide text-zinc-400">
            {reviewLabel}
          </span>
        ) : null}
      </form>
      {reviewState?.reason ? (
        <p className="text-xs text-zinc-500">{reviewState.reason}</p>
      ) : null}
      {showRecover ? (
        <form action={recoveryFormAction} className="flex items-center gap-2">
          <input type="hidden" name="itemId" value={itemId} />
          <button
            type="submit"
            className="rounded border border-emerald-700 px-2 py-1 text-xs uppercase tracking-wide text-emerald-300 hover:border-emerald-500"
          >
            RECOVER
          </button>
          {recoveryLabel ? (
            <span className="text-xs uppercase tracking-wide text-zinc-400">
              {recoveryLabel}
            </span>
          ) : null}
        </form>
      ) : null}
      {recoveryState?.reason ? (
        <p className="text-xs text-zinc-500">{recoveryState.reason}</p>
      ) : null}
    </div>
  );
}
