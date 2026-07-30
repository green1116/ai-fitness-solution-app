/**
 * CMP-TASK-PANEL — SCR-04 task zone.
 * Presentation affordances only; no confirmation scoring or package composition.
 */
export function TaskPanel() {
  return (
    <div data-cmp="CMP-TASK-PANEL">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Current task
      </p>
      <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
        Workspace actions
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Confirm requirements, capture an opportunity, or request a tender package
        when your path reaches that step.
      </p>
      <ul className="mt-6 flex flex-col gap-3">
        <li>
          <button
            type="button"
            data-action-id="ACT-04-03"
            className="text-sm font-semibold text-slate-950 underline underline-offset-4"
          >
            Confirm requirements
          </button>
        </li>
        <li>
          <button
            type="button"
            data-action-id="ACT-04-04"
            className="text-sm font-semibold text-slate-950 underline underline-offset-4"
          >
            Generate tender package
          </button>
        </li>
        <li>
          <button
            type="button"
            data-action-id="ACT-04-05"
            className="text-sm font-semibold text-slate-950 underline underline-offset-4"
          >
            Capture opportunity
          </button>
        </li>
      </ul>
    </div>
  );
}
