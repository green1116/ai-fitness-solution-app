"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import type { TenantOpsReviewActionResult } from "@/lib/runtime-ops/tenant-ops-action";
import { useWorkspaceOrganizationId } from "./WorkspaceOrganizationProvider";
import { submitTenantOpsRecoveryAction } from "./submit-tenant-ops-recovery-action";
import { submitTenantOpsExecuteAction } from "./submit-tenant-ops-execute-action";

type SubmitTenantOpsReviewAction = (
  prev: TenantOpsReviewActionResult | null,
  formData: FormData,
) => Promise<TenantOpsReviewActionResult>;

export function TenantOpsReviewActionControl({
  itemId,
  stage = "",
  reviewEligible,
  executeEligible,
  recovered = false,
  submitReviewAction,
}: {
  itemId: string;
  /** Server stage — used to unlock EXECUTE after refresh past a local SUCCESS. */
  stage?: string;
  reviewEligible: boolean;
  executeEligible: boolean;
  recovered?: boolean;
  submitReviewAction: SubmitTenantOpsReviewAction;
}) {
  const router = useRouter();
  const organizationId = useWorkspaceOrganizationId();
  const [reviewState, reviewFormAction, reviewPending] = useActionState(
    submitReviewAction,
    null,
  );
  const [recoveryState, recoveryFormAction, recoveryPending] = useActionState(
    submitTenantOpsRecoveryAction,
    null,
  );
  const [executeState, executeFormAction, executePending] = useActionState(
    submitTenantOpsExecuteAction,
    null,
  );

  const showReview = reviewEligible;
  const serverStage = stage.trim().toUpperCase();
  const executeFromStage = executeState?.fromStage?.trim().toUpperCase() ?? "";
  const executeLockedUntilRefresh =
    executeState?.result === "SUCCESS" &&
    executeFromStage.length > 0 &&
    serverStage === executeFromStage;
  const showExecute = executeEligible && !executeLockedUntilRefresh;
  const isRecovered = recovered || recoveryState?.result === "SUCCESS";

  const reviewLabel =
    reviewState?.result === "SUCCESS"
      ? "SUCCESS"
      : reviewState?.result === "BLOCKED"
        ? "BLOCKED"
        : reviewState?.result === "FAILED"
          ? "FAILED"
          : null;

  const showRecover =
    showReview && reviewState?.result === "SUCCESS" && !isRecovered;
  const recoveryLabel = isRecovered
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

  useEffect(() => {
    if (reviewState?.result === "SUCCESS") {
      router.refresh();
    }
  }, [reviewState?.result, router]);

  useEffect(() => {
    if (recoveryState?.result === "SUCCESS") {
      router.refresh();
    }
  }, [recoveryState?.result, router]);

  useEffect(() => {
    if (executeState?.result === "SUCCESS") {
      router.refresh();
    }
  }, [executeState?.result, router]);

  return (
    <div className="mt-2 flex flex-col gap-1">
      {showExecute || executeLabel ? (
        <form action={executeFormAction} className="flex items-center gap-2">
          <input type="hidden" name="itemId" value={itemId} />
          <input type="hidden" name="organizationId" value={organizationId} />
          {showExecute ? (
            <button
              type="submit"
              disabled={executePending || executeLockedUntilRefresh}
              className="rounded border border-sky-700 px-2 py-1 text-xs uppercase tracking-wide text-sky-300 hover:border-sky-500 disabled:opacity-40"
            >
              EXECUTE
            </button>
          ) : null}
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
          <input type="hidden" name="organizationId" value={organizationId} />
          <button
            type="submit"
            disabled={reviewPending}
            className="rounded border border-zinc-700 px-2 py-1 text-xs uppercase tracking-wide text-zinc-200 hover:border-zinc-500 disabled:opacity-40"
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
          <input type="hidden" name="organizationId" value={organizationId} />
          <button
            type="submit"
            disabled={recoveryPending}
            className="rounded border border-emerald-700 px-2 py-1 text-xs uppercase tracking-wide text-emerald-300 hover:border-emerald-500 disabled:opacity-40"
          >
            RECOVER
          </button>
        </form>
      ) : null}
      {recoveryLabel ? (
        <span className="text-xs uppercase tracking-wide text-zinc-400">
          {recoveryLabel}
        </span>
      ) : null}
      {recoveryState?.reason && recoveryState.result === "FAILED" ? (
        <p className="text-xs text-zinc-500">{recoveryState.reason}</p>
      ) : null}
    </div>
  );
}
