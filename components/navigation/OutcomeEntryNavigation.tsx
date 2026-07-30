import Link from "next/link";

import { OUTCOME_ENTRY_POINTS } from "@/lib/frontend/navigation";

export function OutcomeEntryNavigation() {
  return (
    <nav data-nav-skeleton="outcomes" aria-label="Workspace outcome entry points">
      <ul className="flex flex-wrap gap-4 text-sm">
        {OUTCOME_ENTRY_POINTS.map((entry) => (
          <li key={entry.id}>
            <Link
              href={entry.href}
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
