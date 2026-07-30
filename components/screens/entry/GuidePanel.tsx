type GuidePanelProps = Readonly<{
  title: string;
  description: string;
  actionId?: "ACT-02-01";
}>;

/**
 * CMP-GUIDE-PANEL — intake guide zone.
 * INT-INTAKE-START is SCR-02 only (ACT-02-01).
 */
export function GuidePanel({ title, description, actionId }: GuidePanelProps) {
  return (
    <div
      data-cmp="CMP-GUIDE-PANEL"
      {...(actionId
        ? {
            "data-int-id": "INT-INTAKE-START",
            "data-action-id": actionId,
          }
        : {})}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Guide
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
