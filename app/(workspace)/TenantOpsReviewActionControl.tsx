"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import type { TenantOpsReviewActionResult } from "@/lib/runtime-ops/tenant-ops-action";
import { useWorkspaceOrganizationId } from "./WorkspaceOrganizationProvider";
import { submitTenantOpsRecoveryAction } from "./submit-tenant-ops-recovery-action";
import { submitTenantOpsExecuteAction } from "./submit-tenant-ops-execute-action";
import { submitTenantOpsOpenDealAction } from "./submit-tenant-ops-open-deal-action";

type SubmitTenantOpsReviewAction = (
  prev: TenantOpsReviewActionResult | null,
  formData: FormData,
) => Promise<TenantOpsReviewActionResult>;

type FailureAwareState = {
  result?: string;
  failureClass?: string;
  reason?: string;
} | null;

function failedFailureClass(state: FailureAwareState): string | null {
  if (state?.result !== "FAILED") return null;
  return state.failureClass ?? null;
}

function isRetryableFailed(state: FailureAwareState): boolean {
  return state?.result === "FAILED" && state.failureClass === "RETRYABLE";
}

function isTerminalFailed(state: FailureAwareState): boolean {
  return state?.result === "FAILED" && state.failureClass === "TERMINAL";
}

export function TenantOpsReviewActionControl({
  itemId,
  stage = "",
  reviewEligible,
  executeEligible,
  openDealEligible = false,
  recovered = false,
  submitReviewAction,
}: {
  itemId: string;
  /** Server stage — used to unlock EXECUTE after refresh past a local SUCCESS. */
  stage?: string;
  reviewEligible: boolean;
  executeEligible: boolean;
  openDealEligible?: boolean;
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
  const [openDealState, openDealFormAction, openDealPending] = useActionState(
    submitTenantOpsOpenDealAction,
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
  const showOpenDeal =
    openDealEligible && openDealState?.result !== "SUCCESS";
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

  const openDealLabel =
    openDealState?.result === "SUCCESS"
      ? openDealState.reused
        ? "DEAL OPEN (REUSED)"
        : "DEAL OPEN"
      : openDealState?.result === "BLOCKED"
        ? "BLOCKED"
        : openDealState?.result === "FAILED"
          ? "FAILED"
          : null;

  const executeFailureClass = failedFailureClass(executeState);
  const reviewFailureClass = failedFailureClass(reviewState);
  const recoveryFailureClass = failedFailureClass(recoveryState);
  const openDealFailureClass = failedFailureClass(openDealState);

  const executeRetryable = isRetryableFailed(executeState);
  const reviewRetryable = isRetryableFailed(reviewState);
  const recoveryRetryable = isRetryableFailed(recoveryState);
  const openDealRetryable = isRetryableFailed(openDealState);

  const executeTerminal = isTerminalFailed(executeState);
  const reviewTerminal = isTerminalFailed(reviewState);
  const recoveryTerminal = isTerminalFailed(recoveryState);
  const openDealTerminal = isTerminalFailed(openDealState);

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

  useEffect(() => {
    if (openDealState?.result === "SUCCESS") {
      router.refresh();
    }
  }, [openDealState?.result, router]);

  return (
    <div className="mt-2 flex flex-col gap-1">
      {showOpenDeal || openDealLabel ? (
        <form action={openDealFormAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="itemId" value={itemId} />
          <input type="hidden" name="organizationId" value={organizationId} />
          {showOpenDeal && !openDealTerminal ? (
            openDealRetryable ? (
              <button
                type="submit"
                disabled={openDealPending}
                className="rounded border border-amber-700 px-2 py-1 text-xs uppercase tracking-wide text-amber-300 hover:border-amber-500 disabled:opacity-40"
              >
                Retry
              </button>
            ) : (
              <button
                type="submit"
                disabled={openDealPending}
                className="rounded border border-cyan-700 px-2 py-1 text-xs uppercase tracking-wide text-cyan-300 hover:border-cyan-500 disabled:opacity-40"
              >
                OPEN DEAL
              </button>
            )
          ) : null}
          {openDealLabel ? (
            <span className="text-xs uppercase tracking-wide text-zinc-400">
              {openDealLabel}
            </span>
          ) : null}
          {openDealFailureClass ? (
            <span className="text-xs uppercase tracking-wide text-zinc-500">
              {openDealFailureClass}
            </span>
          ) : null}
        </form>
      ) : null}
      {openDealState?.reason ? (
        <p className="text-xs text-zinc-500">{openDealState.reason}</p>
      ) : null}
      {showExecute || executeLabel ? (
        <form action={executeFormAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="itemId" value={itemId} />
          <input type="hidden" name="organizationId" value={organizationId} />
          {showExecute && !executeTerminal ? (
            executeRetryable ? (
              <button
                type="submit"
                disabled={executePending}
                className="rounded border border-amber-700 px-2 py-1 text-xs uppercase tracking-wide text-amber-300 hover:border-amber-500 disabled:opacity-40"
              >
                Retry
              </button>
            ) : (
              <button
                type="submit"
                disabled={executePending || executeLockedUntilRefresh}
                className="rounded border border-sky-700 px-2 py-1 text-xs uppercase tracking-wide text-sky-300 hover:border-sky-500 disabled:opacity-40"
              >
                EXECUTE
              </button>
            )
          ) : null}
          {executeLabel ? (
            <span className="text-xs uppercase tracking-wide text-zinc-400">
              {executeLabel}
            </span>
          ) : null}
          {executeFailureClass ? (
            <span className="text-xs uppercase tracking-wide text-zinc-500">
              {executeFailureClass}
            </span>
          ) : null}
        </form>
      ) : null}
      {executeState?.reason ? (
        <p className="text-xs text-zinc-500">{executeState.reason}</p>
      ) : null}
      {showReview ? (
        <form action={reviewFormAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="itemId" value={itemId} />
          <input type="hidden" name="organizationId" value={organizationId} />
          {!reviewTerminal ? (
            reviewRetryable ? (
              <button
                type="submit"
                disabled={reviewPending}
                className="rounded border border-amber-700 px-2 py-1 text-xs uppercase tracking-wide text-amber-300 hover:border-amber-500 disabled:opacity-40"
              >
                Retry
              </button>
            ) : (
              <button
                type="submit"
                disabled={reviewPending}
                className="rounded border border-zinc-700 px-2 py-1 text-xs uppercase tracking-wide text-zinc-200 hover:border-zinc-500 disabled:opacity-40"
              >
                REVIEW
              </button>
            )
          ) : null}
          {reviewLabel ? (
            <span className="text-xs uppercase tracking-wide text-zinc-400">
              {reviewLabel}
            </span>
          ) : null}
          {reviewFailureClass ? (
            <span className="text-xs uppercase tracking-wide text-zinc-500">
              {reviewFailureClass}
            </span>
          ) : null}
        </form>
      ) : null}
      {showReview && reviewState?.reason ? (
        <p className="text-xs text-zinc-500">{reviewState.reason}</p>
      ) : null}
      {showRecover || recoveryLabel || recoveryRetryable ? (
        <form action={recoveryFormAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="itemId" value={itemId} />
          <input type="hidden" name="organizationId" value={organizationId} />
          {(showRecover || recoveryRetryable) && !recoveryTerminal ? (
            recoveryRetryable ? (
              <button
                type="submit"
                disabled={recoveryPending}
                className="rounded border border-amber-700 px-2 py-1 text-xs uppercase tracking-wide text-amber-300 hover:border-amber-500 disabled:opacity-40"
              >
                Retry
              </button>
            ) : (
              <button
                type="submit"
                disabled={recoveryPending}
                className="rounded border border-emerald-700 px-2 py-1 text-xs uppercase tracking-wide text-emerald-300 hover:border-emerald-500 disabled:opacity-40"
              >
                RECOVER
              </button>
            )
          ) : null}
          {recoveryLabel ? (
            <span className="text-xs uppercase tracking-wide text-zinc-400">
              {recoveryLabel}
            </span>
          ) : null}
          {recoveryFailureClass ? (
            <span className="text-xs uppercase tracking-wide text-zinc-500">
              {recoveryFailureClass}
            </span>
          ) : null}
        </form>
      ) : null}
      {recoveryState?.reason && recoveryState.result === "FAILED" ? (
        <p className="text-xs text-zinc-500">{recoveryState.reason}</p>
      ) : null}
    </div>
  );
}
