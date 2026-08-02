"use client";

import Link from "next/link";
import { useState, useTransition, type MouseEvent } from "react";

import { buildProjectScopedHref } from "@/lib/frontend/navigation";
import {
  FEAT_13_ACTION_ID,
  FEAT_13_COMMAND,
  FEAT_13_ID,
  FEAT_13_INT_ID,
  runOpenSolutionResultCommand,
} from "@/lib/frontend/open-solution-result-command";

const BUDGET_OUTCOME = {
  id: "OUT-BUDGET",
  label: "Open budget result",
  href: "/budget" as const,
  actionId: "ACT-04-07" as const,
} as const;

type OutcomeLinksProps = Readonly<{
  projectId?: string;
}>;

/**
 * CMP-OUTCOME-LINKS — SCR-04 outcomes zone.
 * FEAT-13: OpenSolutionResult via ACT-04-06 API+NAV (HTTP then navigate).
 * Budget link remains presentation NAV for later FEAT-14 work.
 */
export function OutcomeLinks({ projectId = "" }: OutcomeLinksProps) {
  const cue = projectId.trim();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const solutionHref = buildProjectScopedHref("/solution", cue);
  const budgetHref = buildProjectScopedHref(BUDGET_OUTCOME.href, cue);

  function onOpenSolution(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await runOpenSolutionResultCommand({
          projectId: cue || undefined,
        });
        if (typeof window !== "undefined") {
          window.location.assign(result.navigateHref);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to open solution result",
        );
      }
    });
  }

  return (
    <div data-cmp="CMP-OUTCOME-LINKS" data-int-id={FEAT_13_INT_ID}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Outcomes
      </p>
      <ul className="mt-4 flex flex-wrap gap-4 text-sm">
        <li>
          <Link
            href={solutionHref}
            onClick={onOpenSolution}
            aria-disabled={pending}
            data-cmp="CMP-OUTCOME-LINK"
            data-nav-id="OUT-SOLUTION"
            data-feat={FEAT_13_ID}
            data-int-id={FEAT_13_INT_ID}
            data-action-id={FEAT_13_ACTION_ID}
            data-command={FEAT_13_COMMAND}
            data-navigate-to="/solution"
            data-navigation-only="false"
            data-local-only="false"
            data-ac="AC-GP01-08"
            className={`font-semibold text-slate-950 underline underline-offset-4 ${
              pending ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {pending ? "Opening solution…" : "Open solution result"}
          </Link>
        </li>
        <li>
          <Link
            href={budgetHref}
            data-cmp="CMP-OUTCOME-LINK"
            data-nav-id={BUDGET_OUTCOME.id}
            data-action-id={BUDGET_OUTCOME.actionId}
            className="font-semibold text-slate-950 underline underline-offset-4"
          >
            {BUDGET_OUTCOME.label}
          </Link>
        </li>
      </ul>

      {error ? (
        <p className="mt-3 text-sm text-red-700" data-meta="error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
