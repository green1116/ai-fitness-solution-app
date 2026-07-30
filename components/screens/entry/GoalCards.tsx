import Link from "next/link";

const GOAL_CARDS = [
  {
    id: "GOAL-BUILDER",
    label: "Enterprise Builder",
    description: "Start enterprise fitness planning",
    href: "/builder",
    actionId: "ACT-01-03",
  },
  {
    id: "GOAL-TENDER",
    label: "Tender Intelligence",
    description: "Start a tender workflow",
    href: "/tender",
    actionId: "ACT-01-04",
  },
  {
    id: "GOAL-SALES",
    label: "Sales Center",
    description: "Enter the AI Workspace for sales work",
    href: "/workspace",
    actionId: "ACT-01-05",
  },
] as const;

/**
 * CMP-GOAL-CARD ×3 — SCR-01 goal entry zone (PD-3.4 CR-03).
 */
export function GoalCards() {
  return (
    <div data-cmp="CMP-GOAL-CARD-SET" aria-label="Business goals">
      <h2 className="text-lg font-semibold tracking-tight text-slate-950">
        Choose a business goal
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {GOAL_CARDS.map((goal) => (
          <li key={goal.id}>
            <Link
              href={goal.href}
              data-cmp="CMP-GOAL-CARD"
              data-int-id="INT-ENTRY-GOAL"
              data-nav-id={goal.id}
              data-action-id={goal.actionId}
              className="block h-full border-b border-slate-200 pb-4 transition-colors hover:border-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-950"
            >
              <p className="text-base font-semibold text-slate-950">
                {goal.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {goal.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
