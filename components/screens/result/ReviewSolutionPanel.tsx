"use client";

import { useEffect, useState, useTransition } from "react";

import {
  FEAT_13_ID,
  REVIEW_SOLUTION_ACTION_ID,
  REVIEW_SOLUTION_COMMAND,
  REVIEW_SOLUTION_INT_ID,
  runReviewSolutionCommand,
  type SolutionReviewView,
} from "@/lib/frontend/review-solution-command";

type ReviewSolutionPanelProps = Readonly<{
  projectId?: string;
  title: string;
  description: string;
}>;

/**
 * SCR-05 FEAT-13 ReviewSolution host — CMP-RESULT-SUMMARY + review affordance.
 * Loads plan PDF via existing ACT-05-01 binding; does not recalculate results.
 */
export function ReviewSolutionPanel({
  projectId = "",
  title,
  description,
}: ReviewSolutionPanelProps) {
  const cue = projectId.trim();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<SolutionReviewView | null>(null);

  function loadReview() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await runReviewSolutionCommand({
          projectId: cue || undefined,
        });
        setReview(result.review);
      } catch (err) {
        setReview(null);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to review planning solution",
        );
      }
    });
  }

  useEffect(() => {
    if (!cue) return;
    let cancelled = false;
    setError(null);
    startTransition(async () => {
      try {
        const result = await runReviewSolutionCommand({ projectId: cue });
        if (cancelled) return;
        setReview(result.review);
      } catch (err) {
        if (cancelled) return;
        setReview(null);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to review planning solution",
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [cue]);

  return (
    <div
      data-cmp="CMP-RESULT-SUMMARY"
      data-feat={FEAT_13_ID}
      data-int-id={REVIEW_SOLUTION_INT_ID}
      data-action-id={REVIEW_SOLUTION_ACTION_ID}
      data-action-ids={`${REVIEW_SOLUTION_ACTION_ID} ACT-05-02`}
      data-command={REVIEW_SOLUTION_COMMAND}
      data-navigation-only="false"
      data-local-only="false"
      data-review-loaded={review ? "true" : "false"}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Summary
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        {description}
      </p>

      <div className="mt-6">
        <button
          type="button"
          onClick={loadReview}
          disabled={pending}
          data-feat={FEAT_13_ID}
          data-int-id={REVIEW_SOLUTION_INT_ID}
          data-action-id={REVIEW_SOLUTION_ACTION_ID}
          data-command={REVIEW_SOLUTION_COMMAND}
          data-ac="AC-GP01-09"
          className="rounded-md bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Loading solution…" : "Review planning solution"}
        </button>
      </div>

      {pending ? (
        <p className="mt-3 text-sm text-slate-500" data-meta="loading">
          Loading planning solution for review…
        </p>
      ) : null}

      {review ? (
        <div
          className="mt-6 space-y-3 text-sm text-slate-700"
          data-meta="success"
          data-result-visible="true"
        >
          <p className="font-semibold text-emerald-700">{review.statusLabel}</p>
          <dl className="space-y-2">
            <div>
              <dt className="text-slate-500">Project</dt>
              <dd
                className="mt-1 font-medium text-slate-950"
                data-project-id={review.projectId}
              >
                {review.projectId || "Unscoped plan artifact"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Planning</dt>
              <dd className="mt-1" data-review-field="planning">
                {review.planningLabel}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Configuration</dt>
              <dd className="mt-1" data-review-field="configuration">
                {review.configurationLabel}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Artifact</dt>
              <dd className="mt-1" data-review-field="artifact">
                {review.contentType} · {review.byteLength} bytes
              </dd>
            </div>
          </dl>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-red-700" data-meta="error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
