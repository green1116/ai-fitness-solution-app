import Link from "next/link";

import { buildProjectScopedHref } from "@/lib/frontend/navigation";

const OUTCOME_LINKS = [
  {
    id: "OUT-SOLUTION",
    label: "Open solution result",
    href: "/solution" as const,
    actionId: "ACT-04-06" as const,
  },
  {
    id: "OUT-BUDGET",
    label: "Open budget result",
    href: "/budget" as const,
    actionId: "ACT-04-07" as const,
  },
] as const;

type OutcomeLinksProps = Readonly<{
  projectId?: string;
}>;

/**
 * CMP-OUTCOME-LINKS — SCR-04 outcomes zone.
 * Navigates to Result Screens only; does not generate results.
 */
export function OutcomeLinks({ projectId = "" }: OutcomeLinksProps) {
  const cue = projectId.trim();

  return (
    <div data-cmp="CMP-OUTCOME-LINKS" data-int-id="INT-WS-OUTCOME">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Outcomes
      </p>
      <ul className="mt-4 flex flex-wrap gap-4 text-sm">
        {OUTCOME_LINKS.map((entry) => (
          <li key={entry.id}>
            <Link
              href={buildProjectScopedHref(entry.href, cue)}
              data-cmp="CMP-OUTCOME-LINK"
              data-nav-id={entry.id}
              data-action-id={entry.actionId}
              className="font-semibold text-slate-950 underline underline-offset-4"
            >
              {entry.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
