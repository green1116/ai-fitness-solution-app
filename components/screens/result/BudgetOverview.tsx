/**
 * CMP-BUDGET-OVERVIEW — SCR-06 body zone.
 * Investment structure presentation only; no pricing algorithms.
 */
export function BudgetOverview() {
  return (
    <div
      data-cmp="CMP-BUDGET-OVERVIEW"
      data-int-id="INT-RESULT-REVIEW"
      data-action-id="ACT-06-01"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Overview
      </p>
      <dl className="mt-6 grid gap-6 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-slate-500">Investment range</dt>
          <dd className="mt-2 text-base font-semibold text-slate-950">
            Estimate range presented here
          </dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">Category breakdown</dt>
          <dd className="mt-2 text-sm leading-6 text-slate-600">
            Equipment, space, services, and contingency categories.
          </dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">Options</dt>
          <dd className="mt-2 text-sm leading-6 text-slate-600">
            Tier and scope options for this investment view.
          </dd>
        </div>
      </dl>
    </div>
  );
}
