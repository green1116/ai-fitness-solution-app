/**
 * CMP-INPUT-PLANNING — SCR-02 capture zone.
 * Collects presentation fields only; no feasibility or pricing validation.
 */
export function PlanningInputs() {
  return (
    <div data-cmp="CMP-INPUT-PLANNING" data-action-id="ACT-02-02">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Planning inputs
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Company size
          <input
            name="companySize"
            className="mt-1.5 w-full border-b border-slate-300 bg-transparent px-0 py-2 text-slate-950 outline-none focus:border-slate-950"
            placeholder="e.g. 200–500"
            autoComplete="off"
          />
        </label>
        <label className="block text-sm text-slate-700">
          Location
          <input
            name="location"
            className="mt-1.5 w-full border-b border-slate-300 bg-transparent px-0 py-2 text-slate-950 outline-none focus:border-slate-950"
            placeholder="City / region"
            autoComplete="off"
          />
        </label>
        <label className="block text-sm text-slate-700">
          Space
          <input
            name="space"
            className="mt-1.5 w-full border-b border-slate-300 bg-transparent px-0 py-2 text-slate-950 outline-none focus:border-slate-950"
            placeholder="Available area"
            autoComplete="off"
          />
        </label>
        <label className="block text-sm text-slate-700">
          Budget
          <input
            name="budget"
            className="mt-1.5 w-full border-b border-slate-300 bg-transparent px-0 py-2 text-slate-950 outline-none focus:border-slate-950"
            placeholder="Investment range"
            autoComplete="off"
          />
        </label>
        <label className="block text-sm text-slate-700 sm:col-span-2">
          Goals
          <input
            name="goals"
            className="mt-1.5 w-full border-b border-slate-300 bg-transparent px-0 py-2 text-slate-950 outline-none focus:border-slate-950"
            placeholder="Planning goals"
            autoComplete="off"
          />
        </label>
      </div>
    </div>
  );
}
