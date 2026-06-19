import type { PortalKpiSnapshot } from "../shared/portal-types";

interface DashboardKpiCardsProps {
  kpis: PortalKpiSnapshot;
}

export function DashboardKpiCards({ kpis }: DashboardKpiCardsProps) {
  const items = [
    { label: "Workspaces", value: kpis.workspaces },
    { label: "Quotes", value: kpis.quotes },
    { label: "Workflows", value: kpis.workflows },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <section
          key={item.label}
          className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm"
        >
          <p className="text-sm text-zinc-400">{item.label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
          <p className="mt-2 text-xs text-zinc-500">P1 mock KPI · wired in P3+</p>
        </section>
      ))}
    </div>
  );
}
