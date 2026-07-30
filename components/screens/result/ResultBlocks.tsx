const RESULT_BLOCKS = [
  {
    id: "planning",
    label: "Planning",
    description: "Space plan and planning overview for this solution.",
  },
  {
    id: "configuration",
    label: "Configuration",
    description: "Configuration summary for the proposed fitness solution.",
  },
  {
    id: "budget-summary",
    label: "Budget",
    description: "High-level investment summary linked to this solution.",
  },
] as const;

/**
 * CMP-RESULT-BLOCKS — SCR-05 body zone.
 * Labels only; does not define PDF layout or recalculate values.
 */
export function ResultBlocks() {
  return (
    <div data-cmp="CMP-RESULT-BLOCKS">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Result blocks
      </p>
      <ul className="mt-6 grid gap-6 sm:grid-cols-3">
        {RESULT_BLOCKS.map((block) => (
          <li key={block.id} data-result-block={block.id}>
            <h2 className="text-base font-semibold text-slate-950">
              {block.label}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {block.description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
