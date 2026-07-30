type ResultSummaryProps = Readonly<{
  title: string;
  description: string;
  actionIds: readonly string[];
}>;

/**
 * CMP-RESULT-SUMMARY — result overview zone.
 * Presentation copy only; does not recalculate content.
 */
export function ResultSummary({
  title,
  description,
  actionIds,
}: ResultSummaryProps) {
  return (
    <div
      data-cmp="CMP-RESULT-SUMMARY"
      data-action-ids={actionIds.join(" ")}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Summary
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        {description}
      </p>
    </div>
  );
}
