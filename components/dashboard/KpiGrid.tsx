import type { KpiWidget } from "@/lib/dashboard/widgets/kpi.widget";

export function KpiGrid({ widgets }: { widgets: KpiWidget[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {widgets.map((w) => (
        <div
          key={w.id}
          className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{w.label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {typeof w.value === "number" ? w.value.toLocaleString() : w.value}
            {w.unit ? <span className="ml-1 text-sm font-normal text-zinc-400">{w.unit}</span> : null}
          </p>
          {w.trend ? (
            <p className="mt-1 text-xs text-zinc-500">趋势: {w.trend}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
