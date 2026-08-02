"use client";

import Link from "next/link";
import { useState, useTransition, type MouseEvent } from "react";

import { buildProjectScopedHref } from "@/lib/frontend/navigation";
import type { PresentationRoutePath } from "@/lib/frontend/presentation-routes";
import {
  CONTINUE_TO_BUDGET_ACTION_ID,
  CONTINUE_TO_BUDGET_COMMAND,
  CONTINUE_TO_BUDGET_INT_ID,
  FEAT_14_ID,
  runContinueToBudgetCommand,
} from "@/lib/frontend/continue-to-budget-command";

type ForwardLink = Readonly<{
  id: string;
  label: string;
  href: PresentationRoutePath;
  actionId: string;
}>;

type ForwardGroupProps = Readonly<{
  links: readonly ForwardLink[];
  projectId?: string;
}>;

/**
 * CMP-FORWARD-GROUP — allowed next-screen links from Results.
 * FEAT-14: ContinueToBudget via ACT-05-05 API+NAV (HTTP then navigate).
 * Other forward links remain presentation NAV.
 */
export function ForwardGroup({ links, projectId = "" }: ForwardGroupProps) {
  const cue = projectId.trim();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onContinueToBudget(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await runContinueToBudgetCommand({
          projectId: cue || undefined,
        });
        if (typeof window !== "undefined") {
          window.location.assign(result.navigateHref);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to continue to budget",
        );
      }
    });
  }

  return (
    <div data-cmp="CMP-FORWARD-GROUP" data-int-id={CONTINUE_TO_BUDGET_INT_ID}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Forward
      </p>
      <ul className="mt-4 flex flex-wrap gap-4 text-sm">
        {links.map((link) => {
          const href = buildProjectScopedHref(link.href, cue);
          const isContinueToBudget =
            link.actionId === CONTINUE_TO_BUDGET_ACTION_ID;

          if (isContinueToBudget) {
            return (
              <li key={link.id}>
                <Link
                  href={href}
                  onClick={onContinueToBudget}
                  aria-disabled={pending}
                  data-int-id={CONTINUE_TO_BUDGET_INT_ID}
                  data-action-id={CONTINUE_TO_BUDGET_ACTION_ID}
                  data-nav-id={link.id}
                  data-feat={FEAT_14_ID}
                  data-command={CONTINUE_TO_BUDGET_COMMAND}
                  data-navigate-to="/budget"
                  data-navigation-only="false"
                  data-local-only="false"
                  data-ac="AC-GP01-10"
                  className={`font-semibold text-slate-950 underline underline-offset-4 ${
                    pending ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  {pending ? "Continuing to budget…" : link.label}
                </Link>
              </li>
            );
          }

          return (
            <li key={link.id}>
              <Link
                href={href}
                data-int-id={CONTINUE_TO_BUDGET_INT_ID}
                data-action-id={link.actionId}
                data-nav-id={link.id}
                className="font-semibold text-slate-950 underline underline-offset-4"
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {error ? (
        <p className="mt-3 text-sm text-red-700" data-meta="error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
