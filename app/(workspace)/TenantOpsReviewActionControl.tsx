"use client";

import { useActionState } from "react";

import type { TenantOpsReviewActionResult } from "@/lib/runtime-ops/tenant-ops-action";
import {
  isTenantOpsExecuteEligible,
} from "@/lib/runtime-ops/tenant-ops-execute";
import { deriveTenantReviewEligible } from "@/lib/runtime-ops/tenant-ops-backlog";
import { submitTenantOpsRecoveryAction } from "./submit-tenant-ops-recovery-action";
import { submitTenantOpsExecuteAction } from "./submit-tenant-ops-execute-action";

type SubmitTenantOpsReviewAction = (
  prev: TenantOpsReviewActionResult | null,
  formData: FormData,
) => Promise<TenantOpsReviewActionResult>;

export function TenantOpsReviewActionControl({
  itemId,
  stage,
  submitReviewAction,
}: {
  itemId: string;
  stage: string;
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
  const [executeState, executeFormAction] = useActionState(
    submitTenantOpsExecuteAction,
    null,
  );

  const showReview = deriveTenantReviewEligible(stage);
  const showExecute = isTenantOpsExecuteEligible(stage);

  const reviewLabel =
    reviewState?.result === "SUCCESS"
      ? "SUCCESS"
      : reviewState?.result === "BLOCKED"
        ? "BLOCKED"
        : reviewState?.result === "FAILED"
          ? "FAILED"
          : null;

  const showRecover = showReview && reviewState?.result === "SUCCESS";
  const recoveryLabel =
    recoveryState?.result === "SUCCESS"
      ? "RECOVERED"
      : recoveryState?.result === "FAILED"
        ? "FAILED"
        : null;

  const executeLabel =
    executeState?.result === "SUCCESS"
      ? "SUCCESS"
      : executeState?.result === "BLOCKED"
        ? "BLOCKED"
        : executeState?.result === "FAILED"
          ? "FAILED"
          : null;

  return (
    <div className="mt-2 flex flex-col gap-1">
      {showExecute ? (
        <form action={executeFormAction} className="flex items-center gap-2">
          <input type="hidden" name="itemId" value={itemId} />
          <button
            type="submit"
            className="rounded border border-sky-700 px-2 py-1 text-xs uppercase tracking-wide text-sky-300 hover:border-sky-500"
          >
            EXECUTE
          </button>
          {executeLabel ? (
            <span className="text-xs uppercase tracking-wide text-zinc-400">
              {executeLabel}
            </span>
          ) : null}
        </form>
      ) : null}
      {executeState?.reason ? (
        <p className="text-xs text-zinc-500">{executeState.reason}</p>
      ) : null}
      {showReview ? (
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
      ) : null}
      {showReview && reviewState?.reason ? (
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
