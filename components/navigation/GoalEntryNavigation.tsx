import Link from "next/link";

import { GOAL_ENTRY_POINTS } from "@/lib/frontend/navigation";

export function GoalEntryNavigation() {
  return (
    <nav data-nav-skeleton="goals" aria-label="Goal entry points">
      <ul className="grid gap-3 sm:grid-cols-2">
        {GOAL_ENTRY_POINTS.map((entry) => (
          <li key={entry.id}>
            <Link
              href={entry.href}
              data-nav-id={entry.id}
              data-action-id={entry.actionId}
              className="block border-b border-slate-200 py-3 text-sm font-semibold text-slate-950 transition-colors hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-950"
            >
              {entry.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
