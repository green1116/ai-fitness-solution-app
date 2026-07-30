import Link from "next/link";

import {
  CONTINUITY_ENTRY_POINTS,
  buildContinuityHref,
} from "@/lib/frontend/navigation";

type ContinuityEntryNavigationProps = Readonly<{
  projectId?: string;
}>;

export function ContinuityEntryNavigation({
  projectId,
}: ContinuityEntryNavigationProps) {
  return (
    <nav data-nav-skeleton="continuity" aria-label="Continuity entry points">
      <ul className="flex flex-wrap gap-4 text-sm">
        {CONTINUITY_ENTRY_POINTS.map((entry) => (
          <li key={entry.id}>
            <Link
              href={buildContinuityHref(entry.path, projectId)}
              data-nav-id={entry.id}
              data-action-id={entry.actionId}
              className="font-semibold text-slate-700 underline underline-offset-4 transition-colors hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-950"
            >
              {entry.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
